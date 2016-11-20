import fs from 'fs'
import matchers from 'jest-matchers';
import mkdirp from 'mkdirp';
import path from 'path';
import React from 'react';
import RawAdapter from 'unexpected-htmllike-raw-adapter';

class UnexpectedSnapshotState {
  
  constructor() {
    this._files = {};
  }
  
  getSnapshot(testPath, testName) {
    let snapshot = this._files[testPath];
    if (!snapshot) {
      const snapshotPath = getSnapshotPath(testPath);
      let content = null;
      try {
        if (fs.statSync(snapshotPath).isFile()) {
          content = require(snapshotPath);
        }
      } catch (e) {
        content = null;
      }
      
      snapshot = this._files[testPath] = {
        allTests: content || {}
      }
    }
    
    return snapshot.allTests[testName] || null;
  }
  
  saveSnapshot(testPath, testName, tree) {
    
    const snapshotPath = getSnapshotPath(testPath);
    const snapshot = this._files[testPath];
    snapshot.allTests[testName] = tree;
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
      return 'exports[`' + test + '`] = ' + JSON.stringify(snapshot.allTests[test]) +';';
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

function compareSnapshot(expect, flags, subject) {
  
  const state = matchers.getState();
  
  if (!state.unexpectedSnapshot) {
    state.unexpectedSnapshot = new UnexpectedSnapshotState();
  }
  
  const snapshot = state.unexpectedSnapshot.getSnapshot(state.testPath, state.currentTestName);
  if (snapshot === null) {
    // Write and save
    state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName, subject);
    state.snapshotState.added++;
  } else {
    expect.withError(() => {
      expect.errorMode = 'nested';
      expect(subject, 'to have rendered', rawAdapter.convertJson(snapshot));
    }, function (err) {
      if (state.snapshotState.update === true) {
        state.snapshotState.updated++;
        state.unexpectedSnapshot.saveSnapshot(state.testPath, state.currentTestName, subject);
      } else {
        state.snapshotState.unmatched++;
      }
      expect.fail(err);
    });
  }
}

export { compareSnapshot }
