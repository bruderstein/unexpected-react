import fs from 'fs'
import matchers from 'jest-matchers';
import jsWriter from 'js-writer';
import mkdirp from 'mkdirp';
import path from 'path';
import React from 'react';
import RawAdapter from 'unexpected-htmllike-raw-adapter';
import { loadSnapshot } from './snapshotLoader';

class UnexpectedSnapshotState {
  
  constructor(snapshotState) {
    const files = {};
    this._files = files;
    
  }
  
  getSnapshot(testPath, testName) {
    let snapshot = this._files[testPath];
    if (!snapshot) {
      const snapshotPath = getSnapshotPath(testPath);
      let content = loadSnapshot(snapshotPath);
      
      snapshot = this._files[testPath] = {
        testCounter: {},
        uncheckedKeys: (content && new Set(Object.keys(content))) || new Set(),
        allTests: content || {}
      }
    }
    const count = (snapshot.testCounter[testName] || 0) + 1;
    snapshot.testCounter[testName] = count;
    
    const keyName = testName + ' ' + count;
    snapshot.uncheckedKeys.delete(keyName);
    return snapshot.allTests[keyName] || null;
  }
  
  saveSnapshot(testPath, testName, tree) {
    
    const snapshotPath = getSnapshotPath(testPath);
    const snapshot = this._files[testPath];
    const count = snapshot.testCounter[testName] || 1;
    
    snapshot.allTests[testName + ' ' + count] = tree;
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
      return 'exports[`' + test + '`] = ' + jsWriter(snapshot.allTests[test]) + ';';
    }).join('\n\n');
    fs.writeFileSync(snapshotPath, fileContent);
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

  const snapshot = state.unexpectedSnapshot.getSnapshot(state.testPath, state.currentTestName);
  if (snapshot === null) {
    // Write and save
    state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName, rawAdapter.serialize(subjectAdapter, subjectOutput));
    state.snapshotState.added++;
  } else {
    expect.withError(() => {
      expect(subjectRenderer, 'to have rendered', rawAdapter.deserialize(snapshot));
      state.snapshotState.matched = (state.snapshotState.matched || 0) + 1;
    }, function (err) {
      if (state.snapshotState.update === true) {
        state.snapshotState.updated++;
        state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName, rawAdapter.serialize(subjectAdapter, subjectOutput));
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
        isDirty = true;
        snapshot.uncheckedKeys.forEach(key => {
          delete snapshot.allTests[key]
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
        
        if (state.unexpectedSnapshot)
        delete state.unexpectedSnapshot._files[state.testPath];
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
  injectStateHooks // This is exported for testing purposes, and is not normally needed
}
