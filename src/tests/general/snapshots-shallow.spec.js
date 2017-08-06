'use strict';
import Unexpected from 'unexpected';
import UnexpectedSinon from 'unexpected-sinon';
// Note: These are imported later than the others, so that jasmine is mocked for the jest-matchers, but
// unexpected does not think it's running under jasmine
import mockJasmine from '../helpers/mock-jasmine';
import JestMatchers from 'jest-matchers';
import UnexpectedReact from '../../jest'

import ClickCounter from '../components/ClickCounter';
import fs from 'fs';
import mockFs from 'mock-fs';
import Module from 'module';

import path from 'path';
import Promise from 'bluebird';

import React from 'react';
import PropTypes from 'prop-types';
import { createRenderer } from 'react-test-renderer/shallow';
import Sinon from 'sinon';
import { injectLoader } from '../../helpers/snapshotLoader';
import functionFixtures from '../fixtures/functions';
import { injectStateHooks } from '../../helpers/snapshots';

function loadSnapshotMock(snapshotPath) {
  const snapModule = new Module(snapshotPath, null);
  snapModule.load(snapshotPath);
  return snapModule.exports;
}

injectLoader(loadSnapshotMock);


const expect = Unexpected.clone()
  .use(UnexpectedReact)
  .use(UnexpectedSinon);

expect.output.preferredWidth = 80;

Promise.promisifyAll(fs);

const fixtures = {};


describe('snapshots', function () {
  
  const PATH_TO_TESTS = '/path/to/tests';
  let state, removeUncheckedKeysStub;
  let renderer;
  
  before(function () {
    return fs.readdirAsync(path.join(__dirname, '../fixtures'))
      .then(dirList => {
        return Promise.all(dirList.map(entry => {
          return fs.readFileAsync(path.join(__dirname, '../fixtures', entry))
            .then(data => {
              fixtures[path.basename(entry, '.snapshot')] = data.toString('utf-8');
            });
        }));
      })
  });
  
  beforeEach(function () {
    renderer = createRenderer();
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
      [PATH_TO_TESTS + '/__snapshots__/multipleclasses.spec.unexpected-snap']: fixtures.multipleclasses
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
    if (options.updatev20) {
        state.snapshotState._updateSnapshot = options.updatev20;
    }
    JestMatchers.setState(state);
  }
  
  
  
  it('passes a single test snapshot', function () {
    
    initState({
      testPath: 'single.spec.js',
      testName: 'single test name'
    });
    
    renderer.render(<ClickCounter />);
    
    expect(renderer, 'to match snapshot');
    expect(fs.writeFileSync, 'was not called')
  });
  
  it('fails on a snapshot that doesn`t match', function () {
    initState({
      testPath: 'single.spec.js',
      testName: 'single test name'
    });
    renderer.render(<ClickCounter />);
    expect(
      () => expect(renderer, 'with event click', 'to match snapshot'),
      'to throw',
      [
        'expected',
        '<button onClick={function bound onClick() { /* native code */ }}>',
        '  Clicked 1 times',
        '</button>',
        'with event click to match snapshot',
        '',
        '<button onClick={function bound onClick() { /* native code */ }}>',
        '  Clicked 1 times // -Clicked 1 times',
        '                  // +Clicked 0 times',
        '</button>'
      ].join('\n')
    );
  });
  
  it('fails when an extra class is provided', function () {
    
    initState({
      testPath: 'multipleclasses.spec.js',
      testName: 'multiple classes'
    });
  
    renderer.render(<ClickCounter className="one four three two"/>);
  
    expect(
      () => expect(renderer, 'to match snapshot'),
      'to throw',
      [
        'expected <button .../> to match snapshot',
        '',
        '<button className="one four three two" // extra class \'four\'',
        '   onClick={function bound onClick() { /* native code */ }}>',
        '  Clicked 0 times',
        '</button>'
      ].join('\n')
    );
  });
  
  it('fails when an extra attribute is provided', function () {
    
    initState({
      testPath: 'multipleclasses.spec.js',
      testName: 'multiple classes'
    });
    
    renderer.render(<ClickCounter className="one three two" ariaLabel="test"/>);
    
    expect(
      () => expect(renderer, 'to match snapshot'),
      'to throw',
      [
        'expected <button .../> to match snapshot',
        '',
        '<button className="one three two"',
        '   onClick={function bound onClick() { /* native code */ }}',
        '   ariaLabel="test" // ariaLabel should be removed',
        '>',
        '  Clicked 0 times',
        '</button>'
      ].join('\n')
    );
  });
  
  it('passes with `to satisfy snapshot` when an extra class is provided', function () {
  
    initState({
      testPath: 'multipleclasses.spec.js',
      testName: 'multiple classes'
    });
  
    renderer.render(<ClickCounter className="one four three two"/>);
  
    expect(renderer, 'to satisfy snapshot');
  });
  
  it('passes with `to satisfy snapshot` when an extra attribute is provided', function () {
    
    initState({
      testPath: 'multipleclasses.spec.js',
      testName: 'multiple classes'
    });
    
    renderer.render(<ClickCounter className="one three two" ariaLabel="test"/>);
    
    expect(renderer, 'to satisfy snapshot');
  });
  
  describe('when update is true and the snapshot doesn`t match', function () {
    
    let snapshotPath;
    beforeEach(function () {
      initState({
        testPath: 'single.spec.js',
        testName: 'single test name',
        update: true
      });
      renderer.render(<ClickCounter />);
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
  

  describe('when update for jest v20 is `all` and the snapshot doesn`t match', function () {
      let snapshotPath;
      beforeEach(function () {
          initState({
              testPath: 'single.spec.js',
              testName: 'single test name',
              updatev20: 'all'
          });
          renderer.render(<ClickCounter />);
          snapshotPath = path.join(PATH_TO_TESTS, '__snapshots__/single.spec.unexpected-snap');
          expect(renderer, 'with event click', 'to match snapshot');
      });

      it('increments `updated`', function () {

          expect(state, 'to satisfy', {
              snapshotState: {
                  updated: 1,
                  added: 0,
                  _updateSnapshot: 'all'
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

    describe('when update for jest v20 is `new` and the snapshot doesn`t match', function () {
        let snapshotPath;
        beforeEach(function () {
            initState({
                testPath: 'single.spec.js',
                testName: 'single test name',
                updatev20: 'new'
            });
            renderer.render(<ClickCounter />);
            snapshotPath = path.join(PATH_TO_TESTS, '__snapshots__/single.spec.unexpected-snap');
            expect(() => expect(renderer, 'with event click', 'to match snapshot'), 'to throw');
        });

        it('does not increment `updated`', function () {

            expect(state, 'to satisfy', {
                snapshotState: {
                    updated: 0,
                    added: 0,
                    unmatched: 1,
                    _updateSnapshot: 'new'
                }
            });
        });

        it('does not write a new snapshot', function () {
            expect(fs.writeFileSync, 'to have calls satisfying', []);
        });

    });

    describe('when update for jest v20 is `new` and the snapshot is for a new test', function () {
        let snapshotPath;
        beforeEach(function () {
            initState({
                testPath: 'single.spec.js',
                testName: 'new test name',
                updatev20: 'new'
            });
            renderer.render(<ClickCounter />);
            snapshotPath = path.join(PATH_TO_TESTS, '__snapshots__/single.spec.unexpected-snap');
            expect(renderer, 'with event click', 'to match snapshot');
        });

        it('increments `added`', function () {

            expect(state, 'to satisfy', {
                snapshotState: {
                    updated: 0,
                    added: 1,
                    unmatched: 0,
                    _updateSnapshot: 'new'
                }
            });
        });

        it('writes the new snapshot', function () {
            expect(fs.writeFileSync, 'to have calls satisfying', [
                [
                    snapshotPath,
                    expect.it('to match', /exports\[`new test name 1`]/)
                ]
            ]);
        });

        it('writes the correct snapshot', function () {
            const snapshot = loadSnapshotMock(snapshotPath);
            expect(snapshot, 'to satisfy', {
                'new test name 1': {
                    type: 'button',
                    children: [ 'Clicked ', '1', ' times' ]
                }
            });
        });

    });

    describe('when update for jest v20 is `none` and the snapshot is for a new test', function () {
        let snapshotPath;
        beforeEach(function () {
            initState({
                testPath: 'single.spec.js',
                testName: 'new test name',
                updatev20: 'none'
            });
            renderer.render(<ClickCounter />);
            snapshotPath = path.join(PATH_TO_TESTS, '__snapshots__/single.spec.unexpected-snap');
            expect(() => expect(renderer, 'with event click', 'to match snapshot'), 'to throw',
                [
                    'expected',
                    '<button onClick={function bound onClick() { /* native code */ }}>',
                    '  Clicked 1 times',
                    '</button>',
                    'with event click to match snapshot',
                    '',
                    'No snapshot available, but running with `--ci`'
                ].join('\n'));
        });

        it('increments `unmatched`', function () {

            expect(state, 'to satisfy', {
                snapshotState: {
                    updated: 0,
                    added: 0,
                    unmatched: 1,
                    _updateSnapshot: 'none'
                }
            });
        });

        it('does not write the new snapshot', function () {
            expect(fs.writeFileSync, 'to have calls satisfying', []);
        });
    });

    describe('when update for jest v20 is `new` and the snapshot is for a existing test', function () {
        let snapshotPath;
        beforeEach(function () {
            initState({
                testPath: 'single.spec.js',
                testName: 'single test name',
                updatev20: 'new'
            });
            renderer.render(<ClickCounter />);
            snapshotPath = path.join(PATH_TO_TESTS, '__snapshots__/single.spec.unexpected-snap');
            expect(state.snapshotState.getUncheckedCount(), 'to equal', 0);
            expect(renderer, 'to match snapshot');
        });

        it('increments `matched`', function () {

            expect(state, 'to satisfy', {
                snapshotState: {
                    updated: 0,
                    added: 0,
                    matched: 1,
                    _updateSnapshot: 'new'
                }
            });
        });

        it('does not write the new snapshot', function () {
            expect(fs.writeFileSync, 'to have calls satisfying', []);
        });

        it('leaves unchecked as 1', function () {
           expect(state.snapshotState.getUncheckedCount(), 'to equal', 1);
        });

        it('reduces unchecked to 0 after checking the second snapshot', function () {
            expect(renderer, 'with event', 'click', 'to match snapshot');
            expect(state.snapshotState.getUncheckedCount(), 'to equal', 0);
        });
    });

  describe('with functions', function () {
    it('compares with a snapshot with a normal function', function () {
      
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      renderer.render(<ClickCounter onMouseDown={functionFixtures.anonymous()} />);
      expect(renderer, 'to match snapshot');
      
      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      // Rerender, with a new instance of the anonymous function
      renderer.render(<ClickCounter onMouseDown={functionFixtures.anonymous()} />);
      expect(renderer, 'to match snapshot');
    });
    
    it('compares with a snapshot with a bound function', function () {
      
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      renderer.render(<ClickCounter onMouseDown={functionFixtures.boundContentArgs()} />);
      expect(renderer, 'to match snapshot');
      
      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      // Rerender, with a new instance of the function
      renderer.render(<ClickCounter onMouseDown={functionFixtures.boundContentArgs()} />);
      expect(renderer, 'to match snapshot');
    });
    
    it('fails with a snapshot with a normal function when the expected is bound', function () {
      
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      renderer.render(<ClickCounter onMouseDown={functionFixtures.boundContentArgs()} />);
      // Create the snapshot with the bound function
      expect(renderer, 'to match snapshot');
      
      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      // Rerender, with a different unbound function
      renderer.render(<ClickCounter onMouseDown={functionFixtures.namedContentArgs()} />);
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
});
