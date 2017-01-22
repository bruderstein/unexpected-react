'use strict';

var _jsWriter = require('js-writer');

var _jsWriter2 = _interopRequireDefault(_jsWriter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installInto(expect) {

  expect.addAssertion('<function> to satisfy <jest-snapshot-function>', function (expect, subject, value) {
    expect((0, _jsWriter2.default)(subject), 'to equal', (0, _jsWriter2.default)(value));
  });

  expect.addAssertion('<function> to equal <jest-snapshot-function>', function (expect, subject, value) {
    expect((0, _jsWriter2.default)(subject), 'to equal', (0, _jsWriter2.default)(value));
  });
}

module.exports = { installInto: installInto };