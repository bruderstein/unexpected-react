'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.triggerEvent = exports.installAsAlternative = exports.installInto = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _unexpectedHtmllikeRawAdapter = require('unexpected-htmllike-raw-adapter');

var _unexpectedHtmllikeRawAdapter2 = _interopRequireDefault(_unexpectedHtmllikeRawAdapter);

var _unexpectedHtmllikeTestrendererAdapter = require('unexpected-htmllike-testrenderer-adapter');

var _unexpectedHtmllikeTestrendererAdapter2 = _interopRequireDefault(_unexpectedHtmllikeTestrendererAdapter);

var _testRendererTypeWrapper = require('../types/test-renderer-type-wrapper');

var TestRendererTypeWrapper = _interopRequireWildcard(_testRendererTypeWrapper);

var _AssertionGenerator = require('./AssertionGenerator');

var _AssertionGenerator2 = _interopRequireDefault(_AssertionGenerator);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function triggerEvent(expect, renderer, target, eventName, eventArgs) {

  if (!target) {
    target = renderer.toJSON();
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

function getOptions(expect) {
  return {
    ActualAdapter: _unexpectedHtmllikeTestrendererAdapter2.default,
    ExpectedAdapter: _unexpectedHtmllikeRawAdapter2.default,
    actualTypeName: 'ReactTestRenderer',
    expectedTypeName: 'ReactRawObjectElement',
    getRenderOutput: function getRenderOutput(renderer) {
      return TestRendererTypeWrapper.getTestRendererOutputWrapper(renderer);
    },
    actualRenderOutputType: 'ReactTestRendererOutput',
    getDiffInputFromRenderOutput: function getDiffInputFromRenderOutput(renderOutput) {
      return TestRendererTypeWrapper.getRendererOutputJson(renderOutput);
    },
    rewrapResult: function rewrapResult(renderer, target) {
      return TestRendererTypeWrapper.rewrapResult(renderer, target);
    },
    triggerEvent: triggerEvent.bind(expect)
  };
}

function installInto(expect) {
  var assertionGenerator = new _AssertionGenerator2.default(getOptions(expect));
  assertionGenerator.installInto(expect);
}

function installAsAlternative(expect, mainAssertionGenerator) {
  var generatorOptions = getOptions(expect);
  var assertionGenerator = new _AssertionGenerator2.default(_extends({ mainAssertionGenerator: mainAssertionGenerator }, generatorOptions));
  assertionGenerator.installAlternativeExpected(expect);
}

exports.installInto = installInto;
exports.installAsAlternative = installAsAlternative;
exports.triggerEvent = triggerEvent;