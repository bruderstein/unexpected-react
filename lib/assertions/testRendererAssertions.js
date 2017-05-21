'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.installInto = undefined;

var _unexpectedHtmllikeJsxAdapter = require('unexpected-htmllike-jsx-adapter');

var _unexpectedHtmllikeJsxAdapter2 = _interopRequireDefault(_unexpectedHtmllikeJsxAdapter);

var _unexpectedHtmllikeTestrendererAdapter = require('unexpected-htmllike-testrenderer-adapter');

var _unexpectedHtmllikeTestrendererAdapter2 = _interopRequireDefault(_unexpectedHtmllikeTestrendererAdapter);

var _testRendererTypeWrapper = require('../types/test-renderer-type-wrapper');

var TestRendererTypeWrapper = _interopRequireWildcard(_testRendererTypeWrapper);

var _AssertionGenerator = require('./AssertionGenerator');

var _AssertionGenerator2 = _interopRequireDefault(_AssertionGenerator);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installInto(expect) {

  function triggerEvent(renderer, target, eventName, eventArgs) {

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

  var assertionGenerator = new _AssertionGenerator2.default({
    ActualAdapter: _unexpectedHtmllikeTestrendererAdapter2.default,
    QueryAdapter: _unexpectedHtmllikeJsxAdapter2.default,
    ExpectedAdapter: _unexpectedHtmllikeJsxAdapter2.default,
    actualTypeName: 'ReactTestRenderer',
    queryTypeName: 'ReactElement',
    expectedTypeName: 'ReactElement',
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
    triggerEvent: triggerEvent
  });
  assertionGenerator.installInto(expect);

  return assertionGenerator;
}

exports.installInto = installInto;