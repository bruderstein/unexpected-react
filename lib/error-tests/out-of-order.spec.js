
/* These tests check that the right error message appears when requiring the modules in the wrong order
 * These tests can therefore not be run in conjunction with the other tests, and must be run separately
 */

'use strict';

var EmulateDom = require('../testHelpers/emulateDom');

var React = require('react');
var TestUtils = require('react-addons-test-utils');

var Unexpected = require('unexpected');
var UnexpectedReact = require('../unexpected-react');

var expect = Unexpected.clone().use(UnexpectedReact);

var TestComp = React.createClass({
    displayName: 'TestComp',

    render: function render() {
        return React.createElement(
            'div',
            null,
            'dummy'
        );
    }
});

var EXPECTED_ERROR_MESSAGE = 'The global rendering hook is not attached\nThis probably means React was required before unexpected-react. Check that unexpected-react is required first';

describe('unexpected-react included after react', function () {

    it('throws the message when asserting `React to have been injected`', function () {

        expect(function () {
            return expect(React, 'to have been injected');
        }, 'to error', EXPECTED_ERROR_MESSAGE);
    });

    describe('with `to have rendered`', function () {

        it('throws a helpful error message', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(TestComp, null));

            expect(function () {
                return expect(component, 'to have rendered', React.createElement(
                    'div',
                    null,
                    'dummy'
                ));
            }, 'to error', EXPECTED_ERROR_MESSAGE);
        });
    });

    describe('with `to contain`', function () {

        it('throws a helpful error message', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(TestComp, null));

            expect(function () {
                return expect(component, 'to contain', React.createElement(
                    'div',
                    null,
                    'dummy'
                ));
            }, 'to error', EXPECTED_ERROR_MESSAGE);
        });
    });
});
//# sourceMappingURL=out-of-order.spec.js.map