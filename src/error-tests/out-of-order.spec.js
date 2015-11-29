
/* These tests check that the right error message appears when requiring the modules in the wrong order
 * These tests can therefore not be run in conjunction with the other tests, and must be run separately
 */

const EmulateDom = require( '../testHelpers/emulateDom');

const React = require('react/addons');
const TestUtils = React.addons.TestUtils;

const Unexpected = require('unexpected');
const UnexpectedReact = require('../unexpected-react');

const expect = Unexpected.clone()
    .use(UnexpectedReact);

const TestComp = React.createClass({
    render() {
        return <div>dummy</div>;
    }
});

const EXPECTED_ERROR_MESSAGE = `The global rendering hook is not attached
This probably means React was required before unexpected-react. Check that unexpected-react is required first`;

describe('unexpected-react included after react', () => {

    it('throws the message when asserting `React to have been injected`', () => {

        expect(() => expect(React, 'to have been injected'), 'to error', EXPECTED_ERROR_MESSAGE);
    });

    describe('with `to have rendered`', () => {

        it('throws a helpful error message', () => {
            var component = TestUtils.renderIntoDocument(<TestComp />);

            expect(() => expect(component, 'to have rendered', <div>dummy</div>), 'to error', EXPECTED_ERROR_MESSAGE);
        });
    });

    describe('with `to contain`', () => {

        it('throws a helpful error message', () => {
            var component = TestUtils.renderIntoDocument(<TestComp />);

            expect(() => expect(component, 'to contain', <div>dummy</div>), 'to error', EXPECTED_ERROR_MESSAGE);
        });
    });
});
