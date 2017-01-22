'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.triggerEvent = exports.installInto = undefined;

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _unexpectedHtmllikeJsxAdapter = require('unexpected-htmllike-jsx-adapter');

var _unexpectedHtmllikeJsxAdapter2 = _interopRequireDefault(_unexpectedHtmllikeJsxAdapter);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _AssertionGenerator = require('./AssertionGenerator');

var _AssertionGenerator2 = _interopRequireDefault(_AssertionGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function triggerEvent(expect, renderer, target, eventName, eventArgs) {

  if (!target) {
    target = renderer.getRenderOutput();
  }

  var handlerPropName = 'on' + eventName[0].toUpperCase() + eventName.substr(1);
  var handler = target.props[handlerPropName];
  if (typeof handler !== 'function') {
    return expect.fail({
      diff: function diff(output) {
        return output.error('No handler function prop ').text("'" + handlerPropName + "'").error(' on the target element');
      }
    });
  }
  handler(eventArgs);
  return renderer;
}

function installInto(expect) {

  var assertionGenerator = new _AssertionGenerator2.default({
    ActualAdapter: _unexpectedHtmllikeJsxAdapter2.default,
    QueryAdapter: _unexpectedHtmllikeJsxAdapter2.default,
    ExpectedAdapter: _unexpectedHtmllikeJsxAdapter2.default,
    actualTypeName: 'ReactShallowRenderer',
    queryTypeName: 'ReactElement',
    expectedTypeName: 'ReactElement',
    getRenderOutput: function getRenderOutput(renderer) {
      return renderer.getRenderOutput();
    },
    actualRenderOutputType: 'ReactElement',
    getDiffInputFromRenderOutput: function getDiffInputFromRenderOutput(renderOutput) {
      return renderOutput;
    },
    rewrapResult: function rewrapResult(renderer, target) {
      return target;
    },
    triggerEvent: triggerEvent.bind(null, expect)
  });
  assertionGenerator.installInto(expect);

  // We can convert ReactElements to a renderer by rendering them - but we only do it for `with event`
  expect.addAssertion('<ReactElement> with event <string> <assertion?>', function (expect, subject, eventName) {
    var renderer = _reactAddonsTestUtils2.default.createRenderer();
    renderer.render(subject);
    return expect.apply(expect, [renderer, 'with event'].concat(Array.prototype.slice.call(arguments, 2)));
  });

  expect.addAssertion('<ReactElement> with event <string> <object> <assertion?>', function (expect, subject, eventName, eventArgs) {
    var renderer = _reactAddonsTestUtils2.default.createRenderer();
    renderer.render(subject);
    return expect.apply(expect, [renderer, 'with event'].concat(Array.prototype.slice.call(arguments, 2)));
  });

  return assertionGenerator;
}

exports.installInto = installInto;
exports.triggerEvent = triggerEvent;