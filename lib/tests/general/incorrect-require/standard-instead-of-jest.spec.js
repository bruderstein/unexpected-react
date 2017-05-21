'use strict';

var _emulateDom = require('../../helpers/emulateDom');

var _emulateDom2 = _interopRequireDefault(_emulateDom);

var _unexpected = require('unexpected');

var _unexpected2 = _interopRequireDefault(_unexpected);

var _unexpectedReact = require('../../../unexpected-react');

var _unexpectedReact2 = _interopRequireDefault(_unexpectedReact);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _testUtils = require('react-dom/test-utils');

var _testUtils2 = _interopRequireDefault(_testUtils);

var _ClickCounter = require('../../components/ClickCounter');

var _ClickCounter2 = _interopRequireDefault(_ClickCounter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var expect = _unexpected2.default.clone().use(_unexpectedReact2.default);

describe('standard-instead-of-jest', function () {

    it('shows a helpful error message when asserting using `to match snapshot`', function () {
        expect(function () {
            return expect(_react2.default.createElement(_ClickCounter2.default, null), 'to match snapshot');
        }, 'to throw', ['To use the `to match snapshot` assertion with the shallow and full DOM renderers, require unexpected-react as `require(\'unexpected-react/jest\');`', '', ''].join('\n'));
    });

    it('shows a helpful error message when asserting using `to satisfy snapshot`', function () {
        expect(function () {
            return expect(_react2.default.createElement(_ClickCounter2.default, null), 'to satisfy snapshot');
        }, 'to throw', ['To use the `to satisfy snapshot` assertion with the shallow and full DOM renderers, require unexpected-react as `require(\'unexpected-react/jest\');`', '', ''].join('\n'));
    });

    it('shows a helpful error message after shallow rendering when asserting using `to match snapshot`', function () {
        expect(function () {
            return expect(_react2.default.createElement(_ClickCounter2.default, null), 'when rendered', 'to match snapshot');
        }, 'to throw', ['expected <ClickCounter /> when rendered', 'To use the `to match snapshot` assertion with the shallow and full DOM renderers, require unexpected-react as `require(\'unexpected-react/jest\');`', '', ''].join('\n'));
    });

    it('shows a helpful error message when asserting using `to satisfy snapshot`', function () {
        expect(function () {
            return expect(_react2.default.createElement(_ClickCounter2.default, null), 'when rendered', 'to satisfy snapshot');
        }, 'to throw', ['expected <ClickCounter /> when rendered', 'To use the `to satisfy snapshot` assertion with the shallow and full DOM renderers, require unexpected-react as `require(\'unexpected-react/jest\');`', '', ''].join('\n'));
    });
});