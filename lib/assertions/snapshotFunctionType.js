'use strict';

function installInto(expect) {

  expect.addType({
    name: 'jest-snapshot-function',
    base: 'function',
    identify: function identify(value) {
      return typeof value === 'function' && value._isRawDeserializedFunction === true;
    }
  });
}

module.exports = { installInto: installInto };