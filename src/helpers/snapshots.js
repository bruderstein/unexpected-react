import fs from 'fs'
import matchers from 'jest-matchers';
import jsWriter from 'js-writer';
import mkdirp from 'mkdirp';
import path from 'path';
import React from 'react';
import RawAdapter from 'unexpected-htmllike-raw-adapter';
import { loadSnapshot } from './snapshotLoader';

class UnexpectedSnapshotState {
  
  constructor() {
    this._files = {};
  }
  
  getSnapshot(testPath, testName) {
    let snapshot = this._files[testPath];
    if (!snapshot) {
      const snapshotPath = getSnapshotPath(testPath);
      let content = loadSnapshot(snapshotPath);
      
      snapshot = this._files[testPath] = {
        testCounter: {},
        allTests: content || {}
      }
    }
    const count = (snapshot.testCounter[testName] || 0) + 1;
    snapshot.testCounter[testName] = count;
    return snapshot.allTests[testName + ' ' + count] || null;
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
  testPathParsed.base = testPathParsed.name + '.unexpected.snap.js';
  
  return path.format(testPathParsed);
}

const rawAdapter = new RawAdapter({ convertToString: true, concatTextContent: true });

function compareSnapshot(expect, flags, subjectAdapter, subjectRenderer, subjectOutput) {
  
  const state = matchers.getState();
  
  if (!state.unexpectedSnapshot) {
    state.unexpectedSnapshot = new UnexpectedSnapshotState();
  }

  const snapshot = state.unexpectedSnapshot.getSnapshot(state.testPath, state.currentTestName);
  if (snapshot === null) {
    // Write and save
    state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName, rawAdapter.convertFromOther(subjectAdapter, subjectOutput));
    state.snapshotState.added++;
  } else {
    expect.withError(() => {
      expect.errorMode = 'nested';
      expect(subjectRenderer, 'to have rendered', rawAdapter.convertJson(snapshot));
    }, function (err) {
      if (state.snapshotState.update === true) {
        state.snapshotState.updated++;
        state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName, rawAdapter.convertFromOther(subjectAdapter, subjectOutput));
      } else {
        state.snapshotState.unmatched++;
        expect.fail(err);
      }
    });
  }
}

export { compareSnapshot }
