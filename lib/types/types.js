'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _unexpectedHtmllike = require('unexpected-htmllike');

var _unexpectedHtmllike2 = _interopRequireDefault(_unexpectedHtmllike);

var _unexpectedHtmllikeReactrenderedAdapter = require('unexpected-htmllike-reactrendered-adapter');

var _unexpectedHtmllikeReactrenderedAdapter2 = _interopRequireDefault(_unexpectedHtmllikeReactrenderedAdapter);

var _unexpectedHtmllikeJsxAdapter = require('unexpected-htmllike-jsx-adapter');

var _unexpectedHtmllikeJsxAdapter2 = _interopRequireDefault(_unexpectedHtmllikeJsxAdapter);

var _unexpectedHtmllikeTestrendererAdapter = require('unexpected-htmllike-testrenderer-adapter');

var _unexpectedHtmllikeTestrendererAdapter2 = _interopRequireDefault(_unexpectedHtmllikeTestrendererAdapter);

var _unexpectedHtmllikeRawAdapter = require('unexpected-htmllike-raw-adapter');

var _unexpectedHtmllikeRawAdapter2 = _interopRequireDefault(_unexpectedHtmllikeRawAdapter);

var _testRendererTypeWrapper = require('./test-renderer-type-wrapper');

var TestRendererTypeWrapper = _interopRequireWildcard(_testRendererTypeWrapper);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installInto(expect) {

    var renderedReactElementAdapter = new _unexpectedHtmllikeReactrenderedAdapter2.default({ convertToString: true, concatTextContent: true });
    var htmlLikeRenderedReactElement = (0, _unexpectedHtmllike2.default)(renderedReactElementAdapter);
    var reactElementAdapter = new _unexpectedHtmllikeJsxAdapter2.default({ convertToString: true, concatTextContent: true });
    var htmlLikeReactElement = (0, _unexpectedHtmllike2.default)(reactElementAdapter);
    var testRendererAdapter = new _unexpectedHtmllikeTestrendererAdapter2.default({ convertToString: true, concatTextContent: true });
    var htmlLikeTestRenderer = (0, _unexpectedHtmllike2.default)(testRendererAdapter);
    var rawAdapter = new _unexpectedHtmllikeRawAdapter2.default({ convertToString: true, concatTextContent: true });
    var htmlLikeRaw = (0, _unexpectedHtmllike2.default)(rawAdapter);

    expect.addType({

        name: 'RenderedReactElement',

        identify: function identify(value) {
            return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null && (value._reactInternalInstance || value._reactInternalComponent) && (typeof value.setState === 'function' || _typeof(value.updater) === 'object' /* stateless components */);
        },
        inspect: function inspect(value, depth, output, _inspect) {
            var data = _reactRenderHook2.default.findComponent(value);
            return htmlLikeRenderedReactElement.inspect(data, depth, output, _inspect);
        }
    });

    expect.addType({
        name: 'RenderedReactElementData',

        identify: function identify(value) {

            return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null && value.element && value.data && value.data.type && value.data.nodeType;
        },
        inspect: function inspect(value, depth, output, _inspect2) {
            return htmlLikeRenderedReactElement.inspect(value, depth, output, _inspect2);
        }
    });

    expect.addType({
        name: 'ReactElement',

        identify: function identify(value) {
            return _react2.default.isValidElement(value) || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null && (typeof value.type === 'function' || typeof value.type === 'string') && typeof value.hasOwnProperty === 'function' && value.hasOwnProperty('props') && value.hasOwnProperty('ref') && value.hasOwnProperty('key');
        },

        inspect: function inspect(value, depth, output, _inspect3) {

            return htmlLikeReactElement.inspect(value, depth, output, _inspect3);
        }
    });

    expect.addType({

        name: 'ReactModule',

        identify: function identify(value) {

            return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null && typeof value.hasOwnProperty === 'function' && value.hasOwnProperty('createClass') && value.hasOwnProperty('createElement') && value.hasOwnProperty('cloneElement') && value.hasOwnProperty('createFactory') && value.hasOwnProperty('isValidElement') && value.hasOwnProperty('PropTypes');
        },
        inspect: function inspect(value, depth, output) {
            output.text('<<ReactModule>>');
        }
    });

    expect.addType({
        name: 'ReactShallowRenderer',
        base: 'object',
        identify: function identify(value) {
            return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null && typeof value.getRenderOutput === 'function';
        },

        inspect: function inspect(value, depth, output, _inspect4) {
            output.append(_inspect4(value.getRenderOutput()));
        }
    });

    expect.addType({
        name: 'ReactTestRenderer',
        base: 'object',
        identify: function identify(value) {
            return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && typeof value.hasOwnProperty === 'function' && value.hasOwnProperty('_component') && typeof value.toJSON === 'function' && typeof value.unmount === 'function' && typeof value.update === 'function' && typeof value.getInstance === 'function';
        },

        inspect: function inspect(value, depth, output, _inspect5) {
            output.append(_inspect5(TestRendererTypeWrapper.getTestRendererOutputWrapper(value)));
        }
    });

    expect.addType({
        name: 'ReactTestRendererOutput',
        base: 'object',
        identify: function identify(value) {
            return TestRendererTypeWrapper.isTestRendererOutputWrapper(value);
        },

        inspect: function inspect(value, depth, output, _inspect6) {
            return htmlLikeTestRenderer.inspect(TestRendererTypeWrapper.getRendererOutputJson(value), depth, output, _inspect6);
        }
    });

    expect.addType({
        name: 'RawReactTestRendererJson',
        base: 'object',
        identify: function identify(value) {
            return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.props && value.children && value.type;
        }
    });

    expect.addType({
        name: 'ReactRawObjectElement',
        base: 'RawReactTestRendererJson',
        identify: function identify(value) {
            return rawAdapter.isRawElement(value);
        },

        inspect: function inspect(value, depth, output, _inspect7) {
            return htmlLikeRaw.inspect(value, depth, output, _inspect7);
        }
    });
}

exports.default = { installInto: installInto };