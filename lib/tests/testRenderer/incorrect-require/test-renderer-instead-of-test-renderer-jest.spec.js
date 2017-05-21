'use strict';

var _unexpected = require('unexpected');

var _unexpected2 = _interopRequireDefault(_unexpected);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactTestRenderer = require('react-test-renderer');

var _reactTestRenderer2 = _interopRequireDefault(_reactTestRenderer);

var _testRenderer = require('../../../test-renderer');

var _testRenderer2 = _interopRequireDefault(_testRenderer);

var _ClickCounter = require('../../components/ClickCounter');

var _ClickCounter2 = _interopRequireDefault(_ClickCounter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _unexpected2.default.clone().installPlugin(_testRenderer2.default);

expect.output.preferredWidth = 80;

describe('test-renderer-instead-of-test-renderer-jest', function () {

    it('shows a helpful error message when asserting using `to match snapshot`', function () {
        var testRenderer = _reactTestRenderer2.default.create(_react2.default.createElement(_ClickCounter2.default, null));
        expect(function () {
            return expect(testRenderer, 'to match snapshot');
        }, 'to throw', 'To use the `to match snapshot` assertion with the test renderer, require unexpected-react as `require(\'unexpected-react/test-renderer-jest\');`');
    });

    it('shows a helpful error message when asserting using `to satisfy snapshot`', function () {
        var testRenderer = _reactTestRenderer2.default.create(_react2.default.createElement(_ClickCounter2.default, null));
        expect(function () {
            return expect(testRenderer, 'to satisfy snapshot');
        }, 'to throw', 'To use the `to satisfy snapshot` assertion with the test renderer, require unexpected-react as `require(\'unexpected-react/test-renderer-jest\');`');
    });

    it('shows a helpful error message when asserting using `to match snapshot` and the JSON output', function () {
        var testRenderer = _reactTestRenderer2.default.create(_react2.default.createElement(_ClickCounter2.default, null));
        expect(function () {
            return expect(testRenderer.toJSON(), 'to match snapshot');
        }, 'to throw', ['To use the `to match snapshot` assertion with the test renderer, require unexpected-react as `require(\'unexpected-react/test-renderer-jest\');`', '', 'Also, don\'t pass the JSON, pass the test renderer directly'].join('\n'));
    });
});