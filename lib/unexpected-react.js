'use strict';

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _types = require('./types/types');

var _types2 = _interopRequireDefault(_types);

var _deepAssertions = require('./assertions/deepAssertions');

var deepAssertions = _interopRequireWildcard(_deepAssertions);

var _shallowAssertions = require('./assertions/shallowAssertions');

var shallowAssertions = _interopRequireWildcard(_shallowAssertions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    name: 'unexpected-react',

    installInto: function installInto(expect) {

        expect.installPlugin(require('magicpen-prism'));

        _types2.default.installInto(expect);
        shallowAssertions.installInto(expect);
        deepAssertions.installInto(expect);
    },
    clearAll: function clearAll() {
        _reactRenderHook2.default.clearAll();
    }
};