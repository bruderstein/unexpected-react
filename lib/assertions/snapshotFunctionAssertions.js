'use strict';

var _snapshots = require('../helpers/snapshots');

function installInto(expect) {

  expect.addAssertion('<function> to satisfy <jest-snapshot-function>', function (expect, subject, value) {
    expect(functionToString(subject), 'to equal', snapshotFunctionToString(value));
  });

  expect.addAssertion('<function> to equal <jest-snapshot-function>', function (expect, subject, value) {
    expect(functionToString(subject), 'to equal', snapshotFunctionToString(value));
  });

  function functionToString(func) {
    return 'function ' + func.name + '(' + (0, _snapshots.getFunctionArgs)(func) + ') { /* function body */ }';
  }

  function snapshotFunctionToString(func) {
    return 'function ' + func.name + '(' + func.args + ') { /* function body */ }';
  }
}

module.exports = { installInto: installInto };