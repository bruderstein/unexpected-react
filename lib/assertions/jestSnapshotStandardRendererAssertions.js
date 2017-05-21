'use strict';

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _unexpectedHtmllikeRawAdapter = require('unexpected-htmllike-raw-adapter');

var _unexpectedHtmllikeRawAdapter2 = _interopRequireDefault(_unexpectedHtmllikeRawAdapter);

var _unexpectedHtmllikeJsxAdapter = require('unexpected-htmllike-jsx-adapter');

var _unexpectedHtmllikeJsxAdapter2 = _interopRequireDefault(_unexpectedHtmllikeJsxAdapter);

var _unexpectedHtmllikeReactrenderedAdapter = require('unexpected-htmllike-reactrendered-adapter');

var _unexpectedHtmllikeReactrenderedAdapter2 = _interopRequireDefault(_unexpectedHtmllikeReactrenderedAdapter);

var _shallowAssertions = require('./shallowAssertions');

var _deepAssertions = require('./deepAssertions');

var _snapshots = require('../helpers/snapshots');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installInto(expect) {

  var rawAdapter = new _unexpectedHtmllikeRawAdapter2.default({ convertToString: true, concatTextContent: true });
  var shallowAdapter = new _unexpectedHtmllikeJsxAdapter2.default({ convertToString: true });
  var renderedReactAdapter = new _unexpectedHtmllikeReactrenderedAdapter2.default({ convertToString: true, concatTextContent: true });
  expect.addAssertion('<ReactShallowRenderer> to match snapshot', function (expect, subject) {
    (0, _snapshots.compareSnapshot)(expect, this.flags, shallowAdapter, subject, subject.getRenderOutput());
  });

  expect.addAssertion('<ReactShallowRendererPendingEvent> to match snapshot', function (expect, subject) {
    (0, _shallowAssertions.triggerEvent)(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
    expect(subject.renderer, 'to match snapshot');
  });

  expect.addAssertion('<RenderedReactElement> to match snapshot', function (expect, subject) {
    (0, _snapshots.compareSnapshot)(expect, this.flags, renderedReactAdapter, subject, _reactRenderHook2.default.findComponent(subject));
  });

  expect.addAssertion('<RenderedReactElementPendingEvent> to match snapshot', function (expect, subject) {
    (0, _deepAssertions.triggerEvent)(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
    expect(subject.renderer, 'to match snapshot');
  });

  expect.addAssertion('<ReactShallowRenderer> to satisfy snapshot', function (expect, subject) {
    (0, _snapshots.compareSnapshot)(expect, { satisfy: true }, shallowAdapter, subject, subject.getRenderOutput());
  });

  expect.addAssertion('<ReactShallowRendererPendingEvent> to satisfy snapshot', function (expect, subject) {
    (0, _shallowAssertions.triggerEvent)(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
    expect(subject.renderer, 'to satisfy snapshot');
  });

  expect.addAssertion('<RenderedReactElement> to satisfy snapshot', function (expect, subject) {
    (0, _snapshots.compareSnapshot)(expect, { satisfy: true }, renderedReactAdapter, subject, _reactRenderHook2.default.findComponent(subject));
  });

  expect.addAssertion('<RenderedReactElementPendingEvent> to satisfy snapshot', function (expect, subject) {
    (0, _deepAssertions.triggerEvent)(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
    expect(subject.renderer, 'to satisfy snapshot');
  });
}

module.exports = { installInto: installInto };