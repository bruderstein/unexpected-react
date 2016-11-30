'use strict';
import Unexpected from 'unexpected';
import UnexpectedSinon from 'unexpected-sinon';
// Note: These are imported later than the others, so that jasmine is mocked for the jest-matchers, but
// unexpected does not think it's running under jasmine
import mockJasmine from '../helpers/mock-jasmine';
import JestMatchers from 'jest-matchers';
import UnexpectedReact from '../../jest'
import '../helpers/emulateDom'

import ClickCounter from '../components/ClickCounter';
import TwoClickCounters from '../components/TwoClickCounters';
import fs from 'fs';
import mockFs from 'mock-fs';
import Module from 'module';

import path from 'path';
import Promise from 'bluebird';

import React, { PropTypes } from 'react';
import TestUtils from 'react-addons-test-utils';
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
  
  before(function () {
    const dirList = fs.readdirSync(path.join(__dirname, '../fixtures'));
    dirList.map(entry => {
      const data = fs.readFileSync(path.join(__dirname, '../fixtures', entry));
      fixtures[path.basename(entry, '.snapshot')] = data.toString('utf-8');
    });
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
      [PATH_TO_TESTS + '/__snapshots__/twoclicks.spec.unexpected-snap']: fixtures.twoclicks,
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
      testPath: 'twoclicks.spec.js',
      testName: 'two counters'
    });
    
    const component = TestUtils.renderIntoDocument(<TwoClickCounters />);
    
    expect(component, 'to match snapshot');
    expect(fs.writeFileSync, 'was not called')
  });
  
  it('fails on a snapshot that doesn`t match', function () {
    initState({
      testPath: 'twoclicks.spec.js',
      testName: 'two counters'
    });
    
    const component = TestUtils.renderIntoDocument(<TwoClickCounters />);
    expect(
      () => expect(component, 'with event click', 'on', <ClickCounter className="one" />, 'to match snapshot'),
      'to throw',
      [
        'expected',
        '<TwoClickCounters>',
        '  <div>',
        '    <ClickCounter className="one">',
        '      <button className="one" onClick={function bound onClick() { /* native code */ }}>',
        '        Clicked 1 times',
        '      </button>',
        '    </ClickCounter>',
        '    <ClickCounter className="two">',
        '      <button className="two" onClick={function bound onClick() { /* native code */ }}>',
        '        Clicked 0 times',
        '      </button>',
        '    </ClickCounter>',
        '  </div>',
        '</TwoClickCounters>',
        'with event \'click\' on <ClickCounter className="one" /> to match snapshot',
        '',
        '<TwoClickCounters>',
        '  <div>',
        '    <ClickCounter className="one">',
        '      <button className="one" onClick={function bound onClick() { /* native code */ }}>',
        '        Clicked 1 times // -Clicked 1 times',
        '                        // +Clicked 0 times',
        '      </button>',
        '    </ClickCounter>',
        '    <ClickCounter className="two">',
        '      <button className="two" onClick={function bound onClick() { /* native code */ }}>',
        '        Clicked 0 times',
        '      </button>',
        '    </ClickCounter>',
        '  </div>',
        '</TwoClickCounters>'
      ].join('\n')
    );
  });

  describe('when update is true and the snapshot doesn`t match', function () {

    let snapshotPath, component;
    beforeEach(function () {
      initState({
        testPath: 'twoclicks.spec.js',
        testName: 'two counters',
        update: true
      });
      component = TestUtils.renderIntoDocument(<TwoClickCounters />);
      snapshotPath = path.join(PATH_TO_TESTS, '__snapshots__/twoclicks.spec.unexpected-snap');
      expect(component, 'with event click', 'on', <ClickCounter className="one" />, 'to match snapshot');
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
          expect.it('to match', /exports\[`two counters 1`]/)
        ]
      ]);
    });

    it('writes the correct snapshot', function () {
      const snapshot = loadSnapshotMock(snapshotPath);
      expect(snapshot, 'to satisfy', {
        'two counters 1': {
          type: 'TwoClickCounters',
          children: [  { type: 'div', children: [ { type: 'ClickCounter' }, { type: 'ClickCounter' } ] } ]
        }
      });
    });
  });

  describe('with functions', function () {
    let component;
    it('compares with a snapshot with a normal function', function () {

      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      component = TestUtils.renderIntoDocument(<ClickCounter onMouseDown={functionFixtures.anonymous()} />);
      expect(component, 'to match snapshot');

      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      // Rerender, with a new instance of the anonymous function
      component = TestUtils.renderIntoDocument(<ClickCounter onMouseDown={functionFixtures.anonymous()} />);
      expect(component, 'to match snapshot');
    });

    it('compares with a snapshot with a bound function', function () {

      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      component = TestUtils.renderIntoDocument(<ClickCounter onMouseDown={functionFixtures.boundContentArgs()} />);
      expect(component, 'to match snapshot');

      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      // Rerender, with a new instance of the function
      component = TestUtils.renderIntoDocument(<ClickCounter onMouseDown={functionFixtures.boundContentArgs()} />);
      expect(component, 'to match snapshot');
    });

    it('fails with a snapshot with a normal function when the expected is bound', function () {

      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      component = TestUtils.renderIntoDocument(<ClickCounter onMouseDown={functionFixtures.boundContentArgs()} />);
      // Create the snapshot with the bound function
      expect(component, 'to match snapshot');

      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions',
      });
      // Rerender, with a different unbound function
      component = TestUtils.renderIntoDocument(<ClickCounter onMouseDown={functionFixtures.namedContentArgs()} />);
      expect(
        () => expect(component, 'to match snapshot'),
        'to throw',
        [
          'expected',
          '<ClickCounter onMouseDown={function doStuff(a, b) { return a + b; }}>',
          '  <button onClick={function bound onClick() { /* native code */ }}',
          '     onMouseDown={function doStuff(a, b) { return a + b; }}>',
          '    Clicked 0 times',
          '  </button>',
          '</ClickCounter>',
          'to match snapshot',
          '',
          '<ClickCounter',
          '   onMouseDown={function doStuff(a, b) { return a + b; }} // expected function doStuff(a, b) { return a + b; }',
          '                                                          // to satisfy function bound3() { /* bound - native code */ }',
          '                                                          //',
          '                                                          // -function doStuff(a, b) { return a + b; }',
          '                                                          // +function bound3() { /* bound - native code */ }',
          '>',
          '  <button onClick={function bound onClick() { /* native code */ }}',
          '     onMouseDown={function doStuff(a, b) { return a + b; }} // expected function doStuff(a, b) { return a + b; }',
          '                                                            // to satisfy function bound3() { /* bound - native code */ }',
          '                                                            //',
          '                                                            // -function doStuff(a, b) { return a + b; }',
          '                                                            // +function bound3() { /* bound - native code */ }',
          '  >',
          '    Clicked 0 times',
          '  </button>',
          '</ClickCounter>'
        ].join('\n')
      );
    });
  });
});
