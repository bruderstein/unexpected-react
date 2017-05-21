'use strict';

var _snapshots = require('../helpers/snapshots');

var _testRendererAgainstRawAssertions = require('./testRendererAgainstRawAssertions');

var _unexpectedHtmllikeTestrendererAdapter = require('unexpected-htmllike-testrenderer-adapter');

var _unexpectedHtmllikeTestrendererAdapter2 = _interopRequireDefault(_unexpectedHtmllikeTestrendererAdapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installInto(expect) {

  var reactTestAdapter = new _unexpectedHtmllikeTestrendererAdapter2.default({ convertToString: true, concatStringContent: true });

  expect.addAssertion('<ReactTestRenderer> to match snapshot', function (expect, subject) {
    (0, _snapshots.compareSnapshot)(expect, {}, reactTestAdapter, subject, subject.toJSON());
  });

  expect.addAssertion('<ReactTestRendererPendingEvent> to match snapshot', function (expect, subject) {
    (0, _testRendererAgainstRawAssertions.triggerEvent)(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
    expect.errorMode = 'bubble';
    expect(subject.renderer, 'to match snapshot');
  });

  expect.addAssertion('<ReactTestRenderer> to satisfy snapshot', function (expect, subject) {
    (0, _snapshots.compareSnapshot)(expect, { satisfy: true }, reactTestAdapter, subject, subject.toJSON());
  });

  expect.addAssertion('<ReactTestRendererPendingEvent> to satisfy snapshot', function (expect, subject) {
    (0, _testRendererAgainstRawAssertions.triggerEvent)(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
    expect.errorMode = 'bubble';
    expect(subject.renderer, 'to satisfy snapshot');
  });
}

module.exports = { installInto: installInto };