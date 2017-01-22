'use strict';

var _types = require('./types/types');

var _types2 = _interopRequireDefault(_types);

var _testRendererAssertions = require('./assertions/testRendererAssertions');

var testRendererAssertions = _interopRequireWildcard(_testRendererAssertions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  name: 'unexpected-react-test-renderer',

  installInto: function installInto(expect) {

    expect.installPlugin(require('magicpen-prism'));

    _types2.default.installInto(expect);
    testRendererAssertions.installInto(expect);
  },
  clearAll: function clearAll() {
    // No-op. Left in so that tests can easily use either interface
  }
};