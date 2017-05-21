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

        expect.addAssertion('<ReactTestRenderer|ReactTestRendererOutput> to (match|satisfy) snapshot', function (expect) {

            expect.errorMode = 'bubble';
            expect.fail({
                message: function message(output) {
                    return output.text('To use the ').error('`to ').error(this.flags.match ? 'match' : 'satisfy').error(' snapshot`').text(' assertion with the test renderer, require unexpected-react as `require(\'unexpected-react/test-rendered-jest\');`');
                }
            });
        });

        expect.addAssertion(['<ReactElement|ReactShallowRenderer|RenderedReactElement|ReactShallowRendererPendingEvent|RenderedReactElementPendingEvent> to match snapshot', '<ReactElement|ReactShallowRenderer|RenderedReactElement|ReactShallowRendererPendingEvent|RenderedReactElementPendingEvent> to satisfy snapshot'], function (expect) {
            var _this = this;

            expect.errorMode = 'bubble';
            expect.fail({
                message: function message(output) {
                    return output.text('To use the `').error(_this.testDescription).text('` assertion with the shallow and full DOM renderers, require unexpected-react as `require(\'unexpected-react/jest\');`');
                },
                diff: function diff(output) {
                    return output;
                }
            });
        });
    },
    clearAll: function clearAll() {
        _reactRenderHook2.default.clearAll();
    }
};