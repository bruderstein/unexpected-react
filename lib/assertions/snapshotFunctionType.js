'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _snapshots = require('../helpers/snapshots');

function installInto(expect) {

  expect.addType({
    name: 'jest-snapshot-function',
    base: 'object',
    identify: function identify(value) {
      return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.$functype === _snapshots.FUNCTION_ID;
    },
    inspect: function inspect(value, depth, output) {
      return output.clone().text('function ').cyan(value.name).text('(').text(value.args).text(') { /* function body */ }');
    }
  });
}

module.exports = { installInto: installInto };