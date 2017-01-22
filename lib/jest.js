'use strict';

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _types = require('./types/types');

var _types2 = _interopRequireDefault(_types);

var _deepAssertions = require('./assertions/deepAssertions');

var deepAssertions = _interopRequireWildcard(_deepAssertions);

var _deepAgainstRawAssertions = require('./assertions/deepAgainstRawAssertions');

var deepAgainstRawAssertions = _interopRequireWildcard(_deepAgainstRawAssertions);

var _shallowAssertions = require('./assertions/shallowAssertions');

var shallowAssertions = _interopRequireWildcard(_shallowAssertions);

var _shallowAgainstRawAssertions = require('./assertions/shallowAgainstRawAssertions');

var shallowAgainstRawAssertions = _interopRequireWildcard(_shallowAgainstRawAssertions);

var _jestSnapshotStandardRendererAssertions = require('./assertions/jestSnapshotStandardRendererAssertions');

var jestSnapshotStandardRendererAssertions = _interopRequireWildcard(_jestSnapshotStandardRendererAssertions);

var _snapshotFunctionType = require('./assertions/snapshotFunctionType');

var snapshotFunctionType = _interopRequireWildcard(_snapshotFunctionType);

var _snapshotFunctionAssertions = require('./assertions/snapshotFunctionAssertions');

var snapshotFunctionAssertions = _interopRequireWildcard(_snapshotFunctionAssertions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  name: 'unexpected-react',

  installInto: function installInto(expect) {

    expect.installPlugin(require('magicpen-prism'));

    _types2.default.installInto(expect);
    var mainAssertionGenerator = shallowAssertions.installInto(expect);
    shallowAgainstRawAssertions.installAsAlternative(expect, mainAssertionGenerator);

    var deepMainAssertionGenerator = deepAssertions.installInto(expect);
    deepAgainstRawAssertions.installAsAlternative(expect, deepMainAssertionGenerator);
    jestSnapshotStandardRendererAssertions.installInto(expect);
    snapshotFunctionType.installInto(expect);
    snapshotFunctionAssertions.installInto(expect);
  },
  clearAll: function clearAll() {
    _reactRenderHook2.default.clearAll();
  }
};