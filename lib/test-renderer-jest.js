'use strict';

var _types = require('./types/types');

var _types2 = _interopRequireDefault(_types);

var _testRendererAssertions = require('./assertions/testRendererAssertions');

var testRendererAssertions = _interopRequireWildcard(_testRendererAssertions);

var _testRendererAgainstRawAssertions = require('./assertions/testRendererAgainstRawAssertions');

var testRendererAgainstRawAssertions = _interopRequireWildcard(_testRendererAgainstRawAssertions);

var _jestSnapshotTestRendererAssertions = require('./assertions/jestSnapshotTestRendererAssertions');

var jestSnapshotAssertions = _interopRequireWildcard(_jestSnapshotTestRendererAssertions);

var _snapshotFunctionType = require('./assertions/snapshotFunctionType');

var snapshotFunctionType = _interopRequireWildcard(_snapshotFunctionType);

var _snapshotFunctionAssertions = require('./assertions/snapshotFunctionAssertions');

var snapshotFunctionAssertions = _interopRequireWildcard(_snapshotFunctionAssertions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
    name: 'unexpected-react-test-renderer',

    installInto: function installInto(expect) {

        expect.installPlugin(require('magicpen-prism'));

        _types2.default.installInto(expect);

        // This is a bit of a hack. The AssertionGenerator generates a type for context to add the pending event,
        // and this type must be re-used when adding further assertions with a different expected type
        // - in this case that's the RawAdapter type rather than the ReactElement type.

        // It works, but it's ugly.  It would be nicer to split the AssertionGenerator out further
        // such that this could be less ugly - not sure how that would look though.

        // This /may/ be solved by the upcoming (possibly already existing!) expect.context interface.
        // When that's available, we won't need the intermediate type for pending events, and we can just
        // add the pending event to the context and have the main assertions handle it.

        // But we can't rely on that yet, I don't think

        var mainAssertionGenerator = testRendererAssertions.installInto(expect);
        testRendererAgainstRawAssertions.installAsAlternative(expect, mainAssertionGenerator);

        jestSnapshotAssertions.installInto(expect);
        snapshotFunctionType.installInto(expect);
        snapshotFunctionAssertions.installInto(expect);

        expect.addAssertion('<RawReactTestRendererJson> to match snapshot', function (expect, subject) {
            expect.errorMode = 'bubble';
            expect.fail({
                message: function message(output) {
                    return output.text('To assert snapshots, use the testRenderer directly, not the result of `.toJSON()`').nl().i().text('e.g.').nl().i().text('  const testRenderer = ReactTestRenderer.create(<MyComponent />);').nl().i().text('  expect(testRenderer, \'to match snapshot\');');
                }
            });
        });
    },
    clearAll: function clearAll() {
        // No-op. Left in so that tests can easily use either interface
    }
};