'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.triggerEvent = exports.installAsAlternative = exports.installInto = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _unexpectedHtmllike = require('unexpected-htmllike');

var _unexpectedHtmllike2 = _interopRequireDefault(_unexpectedHtmllike);

var _unexpectedHtmllikeReactrenderedAdapter = require('unexpected-htmllike-reactrendered-adapter');

var _unexpectedHtmllikeReactrenderedAdapter2 = _interopRequireDefault(_unexpectedHtmllikeReactrenderedAdapter);

var _unexpectedHtmllikeJsxAdapter = require('unexpected-htmllike-jsx-adapter');

var _unexpectedHtmllikeJsxAdapter2 = _interopRequireDefault(_unexpectedHtmllikeJsxAdapter);

var _unexpectedHtmllikeRawAdapter = require('unexpected-htmllike-raw-adapter');

var _unexpectedHtmllikeRawAdapter2 = _interopRequireDefault(_unexpectedHtmllikeRawAdapter);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _AssertionGenerator = require('./AssertionGenerator');

var _AssertionGenerator2 = _interopRequireDefault(_AssertionGenerator);

var _deepAssertions = require('./deepAssertions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkAttached(expect) {
  if (!_reactRenderHook2.default.isAttached) {
    expect.errorMode = 'bubble';
    expect.fail(function (output) {
      return output.error('The global rendering hook is not attached').nl().text('This probably means React was required before unexpected-react. Check that unexpected-react is required first');
    });
  }
}

function getOptions(expect) {

  return {
    ActualAdapter: _unexpectedHtmllikeReactrenderedAdapter2.default,
    QueryAdapter: _unexpectedHtmllikeJsxAdapter2.default,
    ExpectedAdapter: _unexpectedHtmllikeRawAdapter2.default,
    actualTypeName: 'RenderedReactElement',
    queryTypeName: 'ReactElement',
    expectedTypeName: 'ReactRawObjectElement',
    getRenderOutput: function getRenderOutput(component) {
      if (component && component.element && component.data && component.data.type && component.data.nodeType) {
        // The component is already the data node
        // This can happen when mixing events and queried for
        return component;
      }
      checkAttached(expect);
      return _reactRenderHook2.default.findComponent(component);
    },
    actualRenderOutputType: 'RenderedReactElementData',
    getDiffInputFromRenderOutput: function getDiffInputFromRenderOutput(renderOutput) {
      return renderOutput;
    },
    rewrapResult: function rewrapResult(renderer, target) {
      return target;
    },
    wrapResultForReturn: function wrapResultForReturn(component, target) {
      return target && target.element.getPublicInstance() || component;
    },
    triggerEvent: _deepAssertions.triggerEvent.bind(null, expect),
    canTriggerEventsOnOutputType: true
  };
}

function installInto(expect) {
  var assertionGenerator = new _AssertionGenerator2.default(getOptions(expect));
  assertionGenerator.installInto(expect);

  expect.addAssertion('<ReactModule> to have been injected', function (expect) {
    checkAttached(expect);
  });

  return assertionGenerator;
}

function installAsAlternative(expect, mainAssertionGenerator) {
  var generatorOptions = getOptions(expect);
  var assertionGenerator = new _AssertionGenerator2.default(_extends({ mainAssertionGenerator: mainAssertionGenerator }, generatorOptions));
  assertionGenerator.installAlternativeExpected(expect);
}

exports.installInto = installInto;
exports.installAsAlternative = installAsAlternative;
exports.triggerEvent = _deepAssertions.triggerEvent;