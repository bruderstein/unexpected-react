'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.triggerEvent = exports.installInto = undefined;

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _unexpectedHtmllike = require('unexpected-htmllike');

var _unexpectedHtmllike2 = _interopRequireDefault(_unexpectedHtmllike);

var _unexpectedHtmllikeReactrenderedAdapter = require('unexpected-htmllike-reactrendered-adapter');

var _unexpectedHtmllikeReactrenderedAdapter2 = _interopRequireDefault(_unexpectedHtmllikeReactrenderedAdapter);

var _unexpectedHtmllikeJsxAdapter = require('unexpected-htmllike-jsx-adapter');

var _unexpectedHtmllikeJsxAdapter2 = _interopRequireDefault(_unexpectedHtmllikeJsxAdapter);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _reactDom = require('react-dom');

var _AssertionGenerator = require('./AssertionGenerator');

var _AssertionGenerator2 = _interopRequireDefault(_AssertionGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkAttached(expect) {
  if (!_reactRenderHook2.default.isAttached) {
    expect.errorMode = 'bubble';
    expect.fail(function (output) {
      return output.error('The global rendering hook is not attached').nl().text('This probably means React was required before unexpected-react. Check that unexpected-react is required first');
    });
  }
}

function triggerEvent(expect, component, target, eventName, eventArgs) {
  var componentData = void 0;
  if (component && component.element && component.data && component.data.type && component.data.nodeType) {
    componentData = component;
  } else {
    componentData = _reactRenderHook2.default.findComponent(component);
  }
  var targetDOM = (0, _reactDom.findDOMNode)(componentData.element.getPublicInstance());
  if (target) {
    targetDOM = (0, _reactDom.findDOMNode)(target.element.getPublicInstance());
  }
  if (typeof _reactAddonsTestUtils2.default.Simulate[eventName] !== 'function') {

    return expect.fail({
      diff: function diff(output) {
        return output.error('Event ').text("'" + eventName + "'").error(' is not supported by TestUtils.Simulate');
      }
    });
  }
  _reactAddonsTestUtils2.default.Simulate[eventName](targetDOM, eventArgs);
}

function installInto(expect) {

  var assertionGenerator = new _AssertionGenerator2.default({
    ActualAdapter: _unexpectedHtmllikeReactrenderedAdapter2.default,
    QueryAdapter: _unexpectedHtmllikeJsxAdapter2.default,
    ExpectedAdapter: _unexpectedHtmllikeJsxAdapter2.default,
    actualTypeName: 'RenderedReactElement',
    queryTypeName: 'ReactElement',
    expectedTypeName: 'ReactElement',
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
    triggerEvent: triggerEvent.bind(null, expect),
    canTriggerEventsOnOutputType: true
  });
  assertionGenerator.installInto(expect);

  expect.addAssertion('<ReactModule> to have been injected', function (expect) {
    checkAttached(expect);
  });
}

exports.installInto = installInto;
exports.triggerEvent = triggerEvent;