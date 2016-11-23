'use strict';
import ClickCounter from '../components/ClickCounter';
import fs from 'fs';
import mockFs from 'mock-fs';
import Module from 'module';

import path from 'path';
import Promise from 'bluebird';

import React, { PropTypes } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import Sinon from 'sinon';
import { injectLoader } from '../../helpers/snapshotLoader';
import Unexpected from 'unexpected';
import UnexpectedSinon from 'unexpected-sinon';

// Note: These are imported later than the others, so that jasmine is mocked for the jest-matchers, but
// unexpected does not think it's running under jasmine
import mockJasmine from '../helpers/mock-jasmine';
import JestMatchers from 'jest-matchers';
import UnexpectedReactTest from '../../test-renderer-jest'

function loadSnapshotMock(snapshotPath) {
  const snapModule = new Module(snapshotPath, null);
  snapModule.load(snapshotPath);
  return snapModule.exports;
}

injectLoader(loadSnapshotMock);


const expect = Unexpected.clone()
  .use(UnexpectedReactTest)
  .use(UnexpectedSinon);

expect.output.preferredWidth = 80;

Promise.promisifyAll(fs);

const fixtures = {};


describe('snapshots', function () {

  const PATH_TO_TESTS = '/path/to/tests';
  let state;

  before(function () {
    return fs.readdirAsync(path.join(__dirname, 'fixtures'))
      .then(dirList => {
        return Promise.all(dirList.map(entry => {
          return fs.readFileAsync(path.join(__dirname, 'fixtures', entry))
            .then(data => {
              fixtures[path.basename(entry, '.snapshot')] = data.toString('utf-8');
            });
        }));
      })
  });

  beforeEach(function () {
    state = {
      testPath: '/tmp/changeme.js',
      currentTestName: 'foo',
      snapshotState: {
        added: 0,
        updated: 0,
        unmatched: 0,
        update: undefined
      }
    };
    JestMatchers.setState(state);
    Sinon.spy(fs, 'writeFileSync');
  });
  
  afterEach(function () {
    fs.writeFileSync.restore();
  });
  beforeEach(function () {
    mockFs({
      [PATH_TO_TESTS + '/__snapshots__/single.spec.unexpected.snap.js']: fixtures.single,
      [PATH_TO_TESTS + '/__snapshots__/multitests.spec.unexpected.snap.js']: fixtures.multiple
    });
  });
  
  afterEach(function () {
    mockFs.restore();
  });
  
  
  function initState(options) {
    state.testPath = path.join(PATH_TO_TESTS, options.testPath);
    state.currentTestName = options.testName;
    state.unexpectedSnapshot = null;
    if (options.update) {
      state.snapshotState.update = options.update;
    }
    JestMatchers.setState(state);
  }
  
  it('passes a single test snapshot', function () {
    
    initState({
      testPath: 'single.spec.js',
      testName: 'single test name'
    });
    
    const renderer = ReactTestRenderer.create(<ClickCounter />);
    
    expect(renderer, 'to match snapshot');
    expect(fs.writeFileSync, 'was not called')
  });
  
  it('passes multiple test snapshots', function () {
    
    initState({
      testPath: 'single.spec.js',
      testName: 'single test name'
    });
    const renderer = ReactTestRenderer.create(<ClickCounter />);
    
    expect(renderer, 'to match snapshot');
    expect(renderer, 'with event', 'click', 'to match snapshot');
    expect(fs.writeFileSync, 'was not called')
  });
  
  describe('for an unknown test', function () {
    
    let snapshotPath;
    beforeEach(function () {
      
      initState({
        testPath: 'single.spec.js',
        testName: 'a new test'
      });
      const renderer = ReactTestRenderer.create(<ClickCounter />);
      
      snapshotPath = path.join(PATH_TO_TESTS, '__snapshots__/single.spec.unexpected.snap.js');
      expect(renderer, 'to match snapshot');
    });
    
    it('writes a new snapshot', function () {
      
      // Confirm we wrote the file with the old and new entries
      expect(fs.writeFileSync, 'to have a call satisfying', [
        snapshotPath,
        expect.it('to match', /exports\[`a new test 1`]/)
          .and('to match', /exports\[`single test name 1`]/)
      ]);
    });
    
    it('creates the correct snapshot', function () {
      // Confirm it is parseable and contains the right thing
      const newSnapshot = loadSnapshotMock(snapshotPath);
      expect(newSnapshot['a new test 1'], 'to satisfy', {
        type: 'button',
        children: ['Clicked ', '0', ' times']
      });
    });
    
    it('increments the added count in the state', function () {
      expect(state, 'to satisfy', {
        snapshotState: {
          added: 1
        }
      });
    });
    
  });
  
  it('fails on a snapshot that doesn`t match', function () {
    initState({
      testPath: 'single.spec.js',
      testName: 'single test name'
    });
    const renderer = ReactTestRenderer.create(<ClickCounter />);
    expect(
      () => expect(renderer, 'with event click', 'to match snapshot'),
      'to throw',
      [
        'expected',
        '<button onClick={function bound onClick() { /* native code */ }}>',
        '  Clicked 1 times',
        '</button>',
        "with event 'click' to match snapshot",
        '',
        '<button onClick={function bound onClick() { /* native code */ }}>',
        '  Clicked 1 times // -Clicked 1 times',
        '                  // +Clicked 0 times',
        '</button>'
      ].join('\n')
    );
  });
  
  it('increments `unmatched` when a snapshot doesn`t match', function () {
    initState({
      testPath: 'single.spec.js',
      testName: 'single test name'
    });
    const renderer = ReactTestRenderer.create(<ClickCounter />);
    expect(
      () => expect(renderer, 'with event click', 'to match snapshot'),
      'to throw');
    expect(state, 'to satisfy', {
      snapshotState: {
        unmatched: 1
      }
    });
  });
  
  describe('when update is true and the snapshot matches', function () {
  
    beforeEach(function () {
      initState({
        testPath: 'single.spec.js',
        testName: 'single test name',
        update: true
      });
      const renderer = ReactTestRenderer.create(<ClickCounter />);
      expect(renderer, 'to match snapshot');
    });
    
    it('does not increment `updated` or `added`', function () {
      
      expect(state, 'to satisfy', {
        snapshotState: {
          updated: 0,
          added: 0,
          update: true
        }
      });
    });
  });
  
  describe('when update is true and the snapshot doesn`t match', function () {
    
    let snapshotPath;
    beforeEach(function () {
      initState({
        testPath: 'single.spec.js',
        testName: 'single test name',
        update: true
      });
      const renderer = ReactTestRenderer.create(<ClickCounter />);
      snapshotPath = path.join(PATH_TO_TESTS, '__snapshots__/single.spec.unexpected.snap.js');
      expect(renderer, 'with event click', 'to match snapshot');
    });
  
    it('increments `updated`', function () {
    
      expect(state, 'to satisfy', {
        snapshotState: {
          updated: 1,
          added: 0,
          update: true
        }
      });
    });
    
    it('writes the new snapshot', function () {
      expect(fs.writeFileSync, 'to have calls satisfying', [
        [
          snapshotPath,
          expect.it('to match', /exports\[`single test name 1`]/)
        ]
      ]);
    });
    
    it('writes the correct snapshot', function () {
      const snapshot = loadSnapshotMock(snapshotPath);
      expect(snapshot, 'to satisfy', {
        'single test name 1': {
          type: 'button',
          children: [ 'Clicked ', '1', ' times' ]
        }
      });
    });
    
  });
  
});

