/*
 * This is a set of "normal" tests for some sample component
 * They are meant to demonstrate the use, but also be a check that everything works
 * in the context of a normal project, how people will/should use it
 *
 * These tests should never break, without breaking other more specific tests somewhere else
 */

const EmulateDom = require( '../testHelpers/emulateDom');

const Unexpected = require('unexpected');
const UnexpectedReact = require('../unexpected-react');

const React = require('react/addons');

const TestUtils = React.addons.TestUtils;

const Select = require('./components/Select');
const SelectOption = require('./components/SelectOption');

const expect = Unexpected.clone()
    .use(UnexpectedReact);


describe('Select', () => {

    let component;
    beforeEach(() => {

        const options = [
            { label: 'one', value: 1 },
            { label: 'two', value: 2 },
            { label: 'three', value: 3 }
        ];
        component = TestUtils.renderIntoDocument(<Select options={options} />)
    });

    it('should render a div.Select', () => {

        return expect(component, 'to have rendered', <div className="Select"/>);
    });

    it('should not show any options initially', () => {

        return expect(component, 'not to contain', <SelectOption />);
    });

    it('should show the menu when clicked', () => {

        TestUtils.Simulate.click(React.findDOMNode(component));
        return expect(component, 'to have rendered',
            <div>
                <SelectOption />
                <SelectOption />
                <SelectOption />
            </div>);
    });

    it('renders the options', () => {

        TestUtils.Simulate.click(React.findDOMNode(component));
        return expect(component, 'to have rendered',
            <div>
                <li>one</li>
                <li>two</li>
                <li>three</li>
            </div>);
    });


    it('renders a particular option', () => {

        TestUtils.Simulate.click(React.findDOMNode(component));

        return expect(component, 'to contain',
            <li id={ expect.it('to match', /unique_[0-9]+/) }>two</li>
        );
    });

    it('renders a particular option', () => {

        TestUtils.Simulate.click(React.findDOMNode(component));

        return expect(component, 'to contain',
            <li>{ expect.it('to match', /th/) }</li>
        );
    });
});

