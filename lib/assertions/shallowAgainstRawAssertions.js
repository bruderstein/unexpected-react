'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.installAsAlternative = exports.installInto = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _unexpectedHtmllikeJsxAdapter = require('unexpected-htmllike-jsx-adapter');

var _unexpectedHtmllikeJsxAdapter2 = _interopRequireDefault(_unexpectedHtmllikeJsxAdapter);

var _unexpectedHtmllikeRawAdapter = require('unexpected-htmllike-raw-adapter');

var _unexpectedHtmllikeRawAdapter2 = _interopRequireDefault(_unexpectedHtmllikeRawAdapter);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _AssertionGenerator = require('./AssertionGenerator');

var _AssertionGenerator2 = _interopRequireDefault(_AssertionGenerator);

var _shallowAssertions = require('./shallowAssertions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getOptions(expect) {
  return {
    ActualAdapter: _unexpectedHtmllikeJsxAdapter2.default,
    QueryAdapter: _unexpectedHtmllikeJsxAdapter2.default,
    ExpectedAdapter: _unexpectedHtmllikeRawAdapter2.default,
    actualTypeName: 'ReactShallowRenderer',
    queryTypeName: 'ReactElement',
    expectedTypeName: 'ReactRawObjectElement',
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
    triggerEvent: _shallowAssertions.triggerEvent.bind(expect)
  };
}

function installInto(expect) {
  var assertionGenerator = new _AssertionGenerator2.default(getOptions(expect));
  assertionGenerator.installInto(expect);
  return assertionGenerator;
}

function installAsAlternative(expect, mainAssertionGenerator) {
  var generatorOptions = getOptions(expect);
  var assertionGenerator = new _AssertionGenerator2.default(_extends({ mainAssertionGenerator: mainAssertionGenerator }, generatorOptions));
  assertionGenerator.installAlternativeExpected(expect);
}

exports.installInto = installInto;
exports.installAsAlternative = installAsAlternative;