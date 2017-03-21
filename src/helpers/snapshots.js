import fs from 'fs'
import matchers from 'jest-matchers';
import jestSnapshot from 'jest-snapshot';
import jsWriter from 'js-writer';
import mkdirp from 'mkdirp';
import path from 'path';
import React from 'react';
import RawAdapter from 'unexpected-htmllike-raw-adapter';
import { loadSnapshot } from './snapshotLoader';


// Serializable "unique" ID
const FUNCTION_ID = "$FUNC$bc*(!CDKRRz195123$";
const FUNC_ARGS_REGEX = /function [^(]*\(([^)]*)\)/;

function getFunctionArgs(func) {
  const match = FUNC_ARGS_REGEX.exec(func.toString());
  if (match) {
    return match[1].split(',').map(arg => arg.trim()).join(', ');
  }
  return '';
}

const writerOptions = {
  handlers: {
    'function': function (func) {
      const functionDefinition = {
        $functype: FUNCTION_ID,
        name: func.name || '',
        args: getFunctionArgs(func)
      };
      return JSON.stringify(functionDefinition)
    }
  }
};

class UnexpectedSnapshotState {
  
  constructor(snapshotState) {
    const files = {};
    this._files = files;
    
  }
  
  getSnapshot(testPath, testName, expect) {
    let snapshot = this._files[testPath];
    if (!snapshot) {
      const snapshotPath = getSnapshotPath(testPath);
      let content = loadSnapshot(snapshotPath);
      let contentOutput = {};
      if (content) {
        Object.keys(content).reduce((agg, testKey) => {
          agg[testKey] = expect.output.clone().annotationBlock(function () {
            this.append(expect.inspect(rawAdapter.deserialize(content[testKey])));
          }).toString();
          return agg;
        }, contentOutput)
      }
      
      snapshot = this._files[testPath] = {
        testCounter: {},
        uncheckedKeys: (content && new Set(Object.keys(content))) || new Set(),
        allTests: content || {},
        contentOutput: contentOutput,
        failedTests: new Set()
      }
    }
    const count = (snapshot.testCounter[testName] || 0) + 1;
    snapshot.testCounter[testName] = count;
    
    const keyName = testName + ' ' + count;
    snapshot.uncheckedKeys.delete(keyName);
    return snapshot.allTests[keyName] || null;
  }
  
  saveSnapshot(testPath, testName, tree, expect) {
    
    const snapshotPath = getSnapshotPath(testPath);
    const snapshot = this._files[testPath];
    
    // If we've been passed a new tree, update the current snapshot
    // Otherwise, we're just saving the file
    if (tree) {
      const count = snapshot.testCounter[testName] || 1;
  
      snapshot.allTests[testName + ' ' + count] = tree;
      snapshot.contentOutput[testName + ' ' + count] = expect.output.clone().annotationBlock(function () {
        this.append(expect.inspect(tree));
      }).toString();
    }
    const dir = path.dirname(snapshotPath);
    let exists;
    try {
      exists = fs.statSync(dir).isDirectory();
    } catch (e) {
      exists = false;
    }
    if (!exists) {
      mkdirp.sync(dir);
    }
    const fileContent = Object.keys(snapshot.allTests).map(test => {
      const display = snapshot.contentOutput[test] || '// Display unavailable (this is probably a bug in unexpected-react, please report it!)';
      return `/////////////////// ${test} ///////////////////\n\n${display}\n\nexports[\`${test}\`] = ${jsWriter(snapshot.allTests[test], writerOptions)};\n// ===========================================================================\n`;
    }).join('\n\n');
    fs.writeFileSync(snapshotPath, fileContent);
  }
  
  markTestAsFailed(testPath, testName) {
    const snapshot = this._files[testPath];
    snapshot.failedTests.add(testName);
  }
}

function getSnapshotPath(testPath) {
  const testPathParsed = path.parse(testPath);
  testPathParsed.dir = path.join(testPathParsed.dir, '__snapshots__');
  testPathParsed.base = testPathParsed.name + '.unexpected-snap';
  
  return path.format(testPathParsed);
}

const rawAdapter = new RawAdapter({ convertToString: true, concatTextContent: true });

function compareSnapshot(expect, flags, subjectAdapter, subjectRenderer, subjectOutput) {
  
  const state = matchers.getState();
  
  if (!state.unexpectedSnapshot) {
    state.unexpectedSnapshot = new UnexpectedSnapshotState(state.snapshotState);
  }

  const snapshot = state.unexpectedSnapshot.getSnapshot(state.testPath, state.currentTestName, expect);
  if (snapshot === null) {
    // Write and save
    state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName, rawAdapter.serialize(subjectAdapter, subjectOutput), expect);
    state.snapshotState.added++;
  } else {
    expect.withError(() => {
      if (flags.satisfy) {
        expect(subjectRenderer, 'to have rendered', rawAdapter.deserialize(snapshot));
      } else {
        expect(subjectRenderer, 'to have rendered with all children with all wrappers with all classes with all attributes', rawAdapter.deserialize(snapshot));
      }
      state.snapshotState.matched = (state.snapshotState.matched || 0) + 1;
    }, function (err) {
      state.unexpectedSnapshot.markTestAsFailed(state.testPath, state.currentTestName);
      if (state.snapshotState.update === true) {
        state.snapshotState.updated++;
        state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName, rawAdapter.serialize(subjectAdapter, subjectOutput), expect);
      } else {
        state.snapshotState.unmatched++;
        expect.fail(err);
      }
    });
  }
}

function injectStateHooks() {
  const state = matchers.getState();
  const snapshotState = state && state.snapshotState;
  if (snapshotState) {
    const originalRemoveUncheckedKeys = snapshotState.removeUncheckedKeys;
    
    snapshotState.removeUncheckedKeys = function () {
      const state = matchers.getState();
      let isDirty = false;
      const snapshot = state.unexpectedSnapshot && state.unexpectedSnapshot._files[state.testPath];
      if (snapshot && snapshot.uncheckedKeys.size) {
        snapshot.uncheckedKeys.forEach(key => {
          const testName = /(.*)\s[0-9]+$/.exec(key)[1];
          
          if (!snapshot.failedTests.has(testName)) {
            isDirty = true;
            delete snapshot.allTests[key]
          }
        });
      }
      
      if (!snapshot || Object.keys(snapshot.allTests).length === 0) {
        const snapshotPath = getSnapshotPath(state.testPath);
        try {
          if (fs.statSync(snapshotPath).isFile()) {
            fs.unlinkSync(getSnapshotPath(state.testPath));
          }
        } catch (e) {
          // We're ignoring file-not-found exceptions, and errors deleting
        }
        
        if (state.unexpectedSnapshot) {
          delete state.unexpectedSnapshot._files[state.testPath];
        }
      } else if (isDirty) {
        state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName);
      }
      originalRemoveUncheckedKeys.call(snapshotState);
    };
  }
}

// When this module is required, Jest is already started, and the hooks can be added
injectStateHooks();

export {
  compareSnapshot,
  injectStateHooks, // This is exported for testing purposes, and is not normally needed
  FUNCTION_ID,
  writerOptions,
  getFunctionArgs
}
