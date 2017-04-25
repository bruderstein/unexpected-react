'use strict';
import ClickCounter from '../components/ClickCounter';
import fs from 'fs';
import mockFs from 'mock-fs';
import Module from 'module';

import path from 'path';
import Promise from 'bluebird';

import React from 'react';
import PropTypes from 'prop-types';
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
import functionFixtures from '../fixtures/functions';
import { injectStateHooks } from '../../helpers/snapshots';

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
  let state, removeUncheckedKeysStub;

  before(function (done) {
    fs.readdirAsync(path.join(__dirname, '../fixtures'))
      .then(dirList => {
        return Promise.all(dirList.map(entry => {
          return fs.readFileAsync(path.join(__dirname, '../fixtures', entry))
            .then(data => {
              fixtures[path.basename(entry, '.snapshot')] = data.toString('utf-8');
            });
        }));
      }).then(() => done())
      .catch(e => done(e));
  });

  beforeEach(function () {
    removeUncheckedKeysStub = Sinon.stub();
    state = {
      testPath: '/tmp/changeme.js',
      currentTestName: 'foo',
      snapshotState: {
        added: 0,
        updated: 0,
        unmatched: 0,
        update: undefined,
        removeUncheckedKeys: removeUncheckedKeysStub
      }
    };
    JestMatchers.setState(state);
    Sinon.spy(fs, 'writeFileSync');
    injectStateHooks();
  });
  
  afterEach(function () {
    fs.writeFileSync.restore();
  });
  beforeEach(function () {
    mockFs({
      [PATH_TO_TESTS + '/__snapshots__/single.spec.unexpected-snap']: fixtures.single,
      [PATH_TO_TESTS + '/__snapshots__/multiple.spec.unexpected-snap']: fixtures.multiple,
      [PATH_TO_TESTS + '/__snapshots__/multipleclasses.spec.unexpected-snap']: fixtures.multipleclasses,
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
  
  it('updates the `matched` count', function () {
    
    initState({
      testPath: 'single.spec.js',
      testName: 'single test name'
    });
    
    const renderer = ReactTestRenderer.create(<ClickCounter />);
    
    expect(renderer, 'to match snapshot');
    expect(state.snapshotState, 'to satisfy', {
      matched: 1
    });
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
      
      snapshotPath = path.join(PATH_TO_TESTS, '__snapshots__/single.spec.unexpected-snap');
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

    it('writes a new snapshot comment', function () {

      // Confirm we wrote the file with the old and new entries
      expect(fs.writeFileSync, 'to have a call satisfying', [
        snapshotPath,
        expect.it('to match', /\/\/ <button onClick={/)
            .and('to match', /\/\/ <\/button>/)
            .and('not to match', /\/\/\s*children:/)
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
  
  it('matches classes in the wrong order', function () {
    initState({
      testPath: 'multipleclasses.spec.js',
      testName: 'multiple classes'
    });
    
    const renderer = ReactTestRenderer.create(<ClickCounter className="three two one" />);
    expect(renderer, 'to match snapshot');
  });
  
  it('diffs missing classes', function () {
    initState({
      testPath: 'multipleclasses.spec.js',
      testName: 'multiple classes'
    });
    
    const renderer = ReactTestRenderer.create(<ClickCounter className="three one" />);
    expect(() => expect(renderer, 'to match snapshot'), 'to throw',
    [
      'expected <button .../> to match snapshot',
      '',
      '<button className="three one" // missing class \'two\'',
      '   onClick={function bound onClick() { /* native code */ }}>',
      '  Clicked 0 times',
      '</button>'
    ].join('\n'))
  });
  
  it('diffs extra classes', function () {
    initState({
      testPath: 'multipleclasses.spec.js',
      testName: 'multiple classes'
    });
    
    const renderer = ReactTestRenderer.create(<ClickCounter className="three two one four" />);
    expect(() => expect(renderer, 'to match snapshot'), 'to throw',
      [
        'expected <button .../> to match snapshot',
        '',
        '<button className="three two one four" // extra class \'four\'',
        '   onClick={function bound onClick() { /* native code */ }}>',
        '  Clicked 0 times',
        '</button>'
      ].join('\n'))
  });
  
  it('diffs extra attributes', function () {
    initState({
      testPath: 'multipleclasses.spec.js',
      testName: 'multiple classes'
    });
  
    const renderer = ReactTestRenderer.create(<ClickCounter className="three two one" ariaLabel="testextra" />);
    expect(() => expect(renderer, 'to match snapshot'), 'to throw',
      [
        'expected <button .../> to match snapshot',
        '',
        '<button className="three two one"',
        '   onClick={function bound onClick() { /* native code */ }}',
        '   ariaLabel="testextra" // ariaLabel should be removed',
        '>',
        '  Clicked 0 times',
        '</button>'
      ].join('\n'))
  });
  
  it('allows extra attributes with `to satisfy snapshot`', function () {
    initState({
      testPath: 'multipleclasses.spec.js',
      testName: 'multiple classes'
    });
  
    const renderer = ReactTestRenderer.create(<ClickCounter className="three two one" ariaLabel="testextra" />);
    expect(renderer, 'to satisfy snapshot');
    
  });
  
  it('allows extra classes with `to satisfy snapshot`', function () {
    initState({
      testPath: 'multipleclasses.spec.js',
      testName: 'multiple classes'
    });
    
    const renderer = ReactTestRenderer.create(<ClickCounter className="three two one four" />);
    expect(renderer, 'to satisfy snapshot');
  });
  
  it('allows extra classes with `to satisfy snapshot` after event ', function () {
    initState({
      testPath: 'multipleclasses.spec.js',
      testName: 'multiple classes click'
    });
    
    const renderer = ReactTestRenderer.create(<ClickCounter className="three two one four" />);
    expect(renderer, 'with event click', 'to satisfy snapshot');
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
    
    it('increments `matched`', function () {
      
      expect(state, 'to satisfy', {
        snapshotState: {
          updated: 0,
          added: 0,
          matched: 1,
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
      snapshotPath = path.join(PATH_TO_TESTS, '__snapshots__/single.spec.unexpected-snap');
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

    it('writes the new snapshot comment', function () {
      expect(fs.writeFileSync, 'to have calls satisfying', [
        [
          snapshotPath,
          expect.it('to match', /\/\/ <button onClick={/)
              .and('to match', /\/\/ <\/button>/)
              .and('not to match', /\/\/\s*children:/)
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
  
  describe('with functions', function () {
    it('compares with a snapshot with a normal function', function () {
  
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      let renderer = ReactTestRenderer.create(<ClickCounter onMouseDown={functionFixtures.anonymous()} />);
      expect(renderer, 'to match snapshot');
      
      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      // Rerender, with a new instance of the anonymous function
      renderer = ReactTestRenderer.create(<ClickCounter onMouseDown={functionFixtures.anonymous()} />);
      expect(renderer, 'to match snapshot');
    });
  
    it('compares with a snapshot with a bound function', function () {
    
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      let renderer = ReactTestRenderer.create(<ClickCounter onMouseDown={functionFixtures.boundContentArgs()} />);
      expect(renderer, 'to match snapshot');
    
      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      // Rerender, with a new instance of the function
      renderer = ReactTestRenderer.create(<ClickCounter onMouseDown={functionFixtures.boundContentArgs()} />);
      expect(renderer, 'to match snapshot');
    });
  
    it('fails with a snapshot with a normal function when the expected is bound', function () {
    
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      let renderer = ReactTestRenderer.create(<ClickCounter onMouseDown={functionFixtures.boundContentArgs()} />);
      // Create the snapshot with the bound function
      expect(renderer, 'to match snapshot');
    
      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      // Rerender, with a different unbound function
      renderer = ReactTestRenderer.create(<ClickCounter onMouseDown={functionFixtures.namedContentArgs()} />);
      expect(
        () => expect(renderer, 'to match snapshot'),
        'to throw',
        [
          'expected <button .../> to match snapshot',
          '',
          '<button onClick={function bound onClick() { /* native code */ }}',
          '   onMouseDown={function doStuff(a, b) { /* ... */ }} // expected',
          '                                                      // function doStuff(a, b) {',
          '                                                      //   // comment',
          '                                                      //   return a + b;',
          '                                                      // }',
          '                                                      // to satisfy function bound bound3() { /* function body */ }',
          '                                                      //',
          '                                                      // -function doStuff(a, b) { /* function body */ }',
          '                                                      // +function bound bound3() { /* function body */ }',
          '>',
          '  Clicked 0 times',
          '</button>'
        ].join('\n')
      );
    });
  });
  
  describe('removing unused keys', function () {
    
    it('removes the unused snapshot file when removeUnusedKeys is called', function () {
      initState({
        testPath: 'single.spec.js',
        testName: 'single test name',
        update: true
      });
      Sinon.spy(fs, 'unlinkSync');
      
      try {
        // removeUncheckedKeys is called by Jest when update is true
        state.snapshotState.removeUncheckedKeys();
        expect(fs.unlinkSync, 'to have calls satisfying', [
          [path.join(PATH_TO_TESTS, '__snapshots__/single.spec.unexpected-snap')]
        ]);
      } finally {
        fs.unlinkSync.restore();
      }
      
    });
    
    it('removes the unused keys of a test where only some are used', function () {
  
      initState({
        testPath: 'multiple.spec.js',
        testName: 'multi test two',
        update: true
      });
      
      const renderer = ReactTestRenderer.create(<ClickCounter />);
      expect(renderer, 'with event click', 'to match snapshot');
  
      const originalSnapshot = loadSnapshotMock(path.join(PATH_TO_TESTS, '__snapshots__/multiple.spec.unexpected-snap'));
      
      state.snapshotState.removeUncheckedKeys();
      const newSnapshot = loadSnapshotMock(path.join(PATH_TO_TESTS, '__snapshots__/multiple.spec.unexpected-snap'));
  
      expect(Object.keys(originalSnapshot), 'to equal', [ 'multi test one 1', 'multi test two 1', 'multi test two 2' ]);
      expect(Object.keys(newSnapshot), 'to equal', [ 'multi test two 1']);
    });
    
    it('calls the original removeUncheckedKeys', function () {
      initState({
        testPath: 'multiple.spec.js',
        testName: 'multi test two',
        update: true
      });
  
      const renderer = ReactTestRenderer.create(<ClickCounter />);
      expect(renderer, 'with event click', 'to match snapshot');
  
      state.snapshotState.removeUncheckedKeys();
      
      expect(removeUncheckedKeysStub, 'to have calls satisfying', [
        { args: [], 'this': state.snapshotState }
      ]);
    });
  });
  
  it('leaves snapshots of tests that failed', function () {
  
    initState({
      testPath: 'multiple.spec.js',
      testName: 'multi test two'
    });
  
    const renderer = ReactTestRenderer.create(<ClickCounter />);
    expect(
      () => expect(renderer, 'to match snapshot'),
      'to throw');
  
    const originalSnapshot = loadSnapshotMock(path.join(PATH_TO_TESTS, '__snapshots__/multiple.spec.unexpected-snap'));
  
    state.snapshotState.removeUncheckedKeys();
    const newSnapshot = loadSnapshotMock(path.join(PATH_TO_TESTS, '__snapshots__/multiple.spec.unexpected-snap'));
  
    expect(Object.keys(originalSnapshot), 'to equal', [ 'multi test one 1', 'multi test two 1', 'multi test two 2' ]);
    expect(Object.keys(newSnapshot), 'to equal', [ 'multi test two 1', 'multi test two 2' ]);
  });
  
  it('removes a file if there are no snapshots', function () {
  
    initState({
      testPath: 'multiple.spec.js',
      testName: 'multi test two'
    });
    Sinon.spy(fs, 'unlinkSync');
    try {
      state.snapshotState.removeUncheckedKeys();
      expect(fs.unlinkSync, 'to have calls satisfying', function () {
        fs.unlinkSync(path.join(PATH_TO_TESTS, '__snapshots__/multiple.spec.unexpected-snap'));
      });
    } finally {
      fs.unlinkSync.restore();
    }
  });

  it('shows an error message if the JSON is asserted on directly', function () {

      const renderer = ReactTestRenderer.create(<ClickCounter />);
      expect(() => expect(renderer.toJSON(), 'to match snapshot'), 'to throw',
          [
              'To assert snapshots, use the testRenderer directly, not the result of `.toJSON()`',
              'e.g.',
              '  const testRenderer = ReactTestRenderer.create(<MyComponent />);',
              '  expect(testRenderer, \'to match snapshot\');'
          ].join('\n'));
  });
});


