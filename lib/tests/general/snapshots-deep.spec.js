'use strict';

var _unexpected = require('unexpected');

var _unexpected2 = _interopRequireDefault(_unexpected);

var _unexpectedSinon = require('unexpected-sinon');

var _unexpectedSinon2 = _interopRequireDefault(_unexpectedSinon);

var _mockJasmine = require('../helpers/mock-jasmine');

var _mockJasmine2 = _interopRequireDefault(_mockJasmine);

var _jestMatchers = require('jest-matchers');

var _jestMatchers2 = _interopRequireDefault(_jestMatchers);

var _jest = require('../../jest');

var _jest2 = _interopRequireDefault(_jest);

require('../helpers/emulateDom');

var _ClickCounter = require('../components/ClickCounter');

var _ClickCounter2 = _interopRequireDefault(_ClickCounter);

var _TwoClickCounters = require('../components/TwoClickCounters');

var _TwoClickCounters2 = _interopRequireDefault(_TwoClickCounters);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mockFs2 = require('mock-fs');

var _mockFs3 = _interopRequireDefault(_mockFs2);

var _module = require('module');

var _module2 = _interopRequireDefault(_module);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _snapshotLoader = require('../../helpers/snapshotLoader');

var _functions = require('../fixtures/functions');

var _functions2 = _interopRequireDefault(_functions);

var _snapshots = require('../../helpers/snapshots');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
// Note: These are imported later than the others, so that jasmine is mocked for the jest-matchers, but
// unexpected does not think it's running under jasmine


function loadSnapshotMock(snapshotPath) {
  var snapModule = new _module2.default(snapshotPath, null);
  snapModule.load(snapshotPath);
  return snapModule.exports;
}

(0, _snapshotLoader.injectLoader)(loadSnapshotMock);

var expect = _unexpected2.default.clone().use(_jest2.default).use(_unexpectedSinon2.default);

expect.output.preferredWidth = 80;

_bluebird2.default.promisifyAll(_fs2.default);

var fixtures = {};

describe('snapshots', function () {

  var PATH_TO_TESTS = '/path/to/tests';
  var state = void 0,
      removeUncheckedKeysStub = void 0;

  before(function () {
    var dirList = _fs2.default.readdirSync(_path2.default.join(__dirname, '../fixtures'));
    dirList.map(function (entry) {
      var data = _fs2.default.readFileSync(_path2.default.join(__dirname, '../fixtures', entry));
      fixtures[_path2.default.basename(entry, '.snapshot')] = data.toString('utf-8');
    });
  });

  beforeEach(function () {
    removeUncheckedKeysStub = _sinon2.default.stub();
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
    _jestMatchers2.default.setState(state);
    _sinon2.default.spy(_fs2.default, 'writeFileSync');
    (0, _snapshots.injectStateHooks)();
  });

  afterEach(function () {
    _fs2.default.writeFileSync.restore();
  });
  beforeEach(function () {
    (0, _mockFs3.default)(_defineProperty({}, PATH_TO_TESTS + '/__snapshots__/twoclicks.spec.unexpected-snap', fixtures.twoclicks));
  });

  afterEach(function () {
    _mockFs3.default.restore();
  });

  function initState(options) {
    state.testPath = _path2.default.join(PATH_TO_TESTS, options.testPath);
    state.currentTestName = options.testName;
    state.unexpectedSnapshot = null;
    if (options.update) {
      state.snapshotState.update = options.update;
    }
    _jestMatchers2.default.setState(state);
  }

  it('passes a single test snapshot', function () {

    initState({
      testPath: 'twoclicks.spec.js',
      testName: 'two counters'
    });

    var component = _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_TwoClickCounters2.default, null));

    expect(component, 'to match snapshot');
    expect(_fs2.default.writeFileSync, 'was not called');
  });

  it('fails on a snapshot that doesn`t match', function () {
    initState({
      testPath: 'twoclicks.spec.js',
      testName: 'two counters'
    });

    var component = _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_TwoClickCounters2.default, null));
    expect(function () {
      return expect(component, 'with event click', 'on', _react2.default.createElement(_ClickCounter2.default, { className: 'one' }), 'to match snapshot');
    }, 'to throw', ['expected', '<TwoClickCounters>', '  <div>', '    <ClickCounter className="one">', '      <button className="one" onClick={function bound onClick() { /* native code */ }}>', '        Clicked 1 times', '      </button>', '    </ClickCounter>', '    <ClickCounter className="two">', '      <button className="two" onClick={function bound onClick() { /* native code */ }}>', '        Clicked 0 times', '      </button>', '    </ClickCounter>', '  </div>', '</TwoClickCounters>', 'with event \'click\' on <ClickCounter className="one" /> to match snapshot', '', '<TwoClickCounters>', '  <div>', '    <ClickCounter className="one">', '      <button className="one" onClick={function bound onClick() { /* native code */ }}>', '        Clicked 1 times // -Clicked 1 times', '                        // +Clicked 0 times', '      </button>', '    </ClickCounter>', '    <ClickCounter className="two">', '      <button className="two" onClick={function bound onClick() { /* native code */ }}>', '        Clicked 0 times', '      </button>', '    </ClickCounter>', '  </div>', '</TwoClickCounters>'].join('\n'));
  });

  describe('when update is true and the snapshot doesn`t match', function () {

    var snapshotPath = void 0,
        component = void 0;
    beforeEach(function () {
      initState({
        testPath: 'twoclicks.spec.js',
        testName: 'two counters',
        update: true
      });
      component = _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_TwoClickCounters2.default, null));
      snapshotPath = _path2.default.join(PATH_TO_TESTS, '__snapshots__/twoclicks.spec.unexpected-snap');
      expect(component, 'with event click', 'on', _react2.default.createElement(_ClickCounter2.default, { className: 'one' }), 'to match snapshot');
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
      expect(_fs2.default.writeFileSync, 'to have calls satisfying', [[snapshotPath, expect.it('to match', /exports\[`two counters 1`]/)]]);
    });

    it('writes the correct snapshot', function () {
      var snapshot = loadSnapshotMock(snapshotPath);
      expect(snapshot, 'to satisfy', {
        'two counters 1': {
          type: 'TwoClickCounters',
          children: [{ type: 'div', children: [{ type: 'ClickCounter' }, { type: 'ClickCounter' }] }]
        }
      });
    });
  });

  describe('with functions', function () {
    var component = void 0;
    it('compares with a snapshot with a normal function', function () {

      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions'
      });
      component = _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_ClickCounter2.default, { onMouseDown: _functions2.default.anonymous() }));
      expect(component, 'to match snapshot');

      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions'
      });
      // Rerender, with a new instance of the anonymous function
      component = _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_ClickCounter2.default, { onMouseDown: _functions2.default.anonymous() }));
      expect(component, 'to match snapshot');
    });

    it('compares with a snapshot with a bound function', function () {

      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions'
      });
      component = _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_ClickCounter2.default, { onMouseDown: _functions2.default.boundContentArgs() }));
      expect(component, 'to match snapshot');

      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions'
      });
      // Rerender, with a new instance of the function
      component = _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_ClickCounter2.default, { onMouseDown: _functions2.default.boundContentArgs() }));
      expect(component, 'to match snapshot');
    });

    it('fails with a snapshot with a normal function when the expected is bound', function () {

      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions'
      });
      component = _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_ClickCounter2.default, { onMouseDown: _functions2.default.boundContentArgs() }));
      // Create the snapshot with the bound function
      expect(component, 'to match snapshot');

      // Now reset state back such that it actually tests the snapshot
      initState({
        testPath: 'withFunctions.spec.js',
        testName: 'with functions'
      });
      // Rerender, with a different unbound function
      component = _reactAddonsTestUtils2.default.renderIntoDocument(_react2.default.createElement(_ClickCounter2.default, { onMouseDown: _functions2.default.namedContentArgs() }));
      expect(function () {
        return expect(component, 'to match snapshot');
      }, 'to throw', ['expected', '<ClickCounter onMouseDown={function doStuff(a, b) { return a + b; }}>', '  <button onClick={function bound onClick() { /* native code */ }}', '     onMouseDown={function doStuff(a, b) { return a + b; }}>', '    Clicked 0 times', '  </button>', '</ClickCounter>', 'to match snapshot', '', '<ClickCounter', '   onMouseDown={function doStuff(a, b) { return a + b; }} // expected function doStuff(a, b) { return a + b; }', '                                                          // to satisfy function bound3() { /* bound - native code */ }', '                                                          //', '                                                          // -function doStuff(a, b) { return a + b; }', '                                                          // +function bound3() { /* bound - native code */ }', '>', '  <button onClick={function bound onClick() { /* native code */ }}', '     onMouseDown={function doStuff(a, b) { return a + b; }} // expected function doStuff(a, b) { return a + b; }', '                                                            // to satisfy function bound3() { /* bound - native code */ }', '                                                            //', '                                                            // -function doStuff(a, b) { return a + b; }', '                                                            // +function bound3() { /* bound - native code */ }', '  >', '    Clicked 0 times', '  </button>', '</ClickCounter>'].join('\n'));
    });
  });
});