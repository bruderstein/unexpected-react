import { FUNCTION_ID } from '../helpers/snapshots';

function installInto(expect) {

  expect.addType({
    name: 'jest-snapshot-function',
    base: 'object',
    identify: function (value) {
      return value && typeof value === 'object' && value.$functype === FUNCTION_ID;
    },
    inspect: function (value, depth, output) {
      return output.clone().text('function ').cyan(value.name).text('(').text(value.args).text(') { /* function body */ }')
    }
  });
}

module.exports = { installInto };
