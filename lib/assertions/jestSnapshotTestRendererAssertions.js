'use strict';

var _snapshots = require('../helpers/snapshots');

var _testRendererAgainstRawAssertions = require('./testRendererAgainstRawAssertions');

var _unexpectedHtmllikeTestrendererAdapter = require('unexpected-htmllike-testrenderer-adapter');

var _unexpectedHtmllikeTestrendererAdapter2 = _interopRequireDefault(_unexpectedHtmllikeTestrendererAdapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installInto(expect) {

  var reactTestAdapter = new _unexpectedHtmllikeTestrendererAdapter2.default({ convertToString: true, concatStringContent: true });

  expect.addAssertion('<ReactTestRenderer> to [exactly] match snapshot [with all children] [with all wrappers]', function (expect, subject) {
    (0, _snapshots.compareSnapshot)(expect, this.flags, reactTestAdapter, subject, subject.toJSON());
  });

  expect.addAssertion('<ReactTestRendererPendingEvent> to [exactly] match snapshot [with all children] [with all wrappers]', function (expect, subject) {
    (0, _testRendererAgainstRawAssertions.triggerEvent)(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
    expect.errorMode = 'bubble';
    expect(subject.renderer, 'to [exactly] match snapshot [with all children] [with all wrappers]');
  });
}

module.exports = { installInto: installInto };