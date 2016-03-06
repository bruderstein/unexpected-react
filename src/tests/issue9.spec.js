const EmulateDom = require( '../testHelpers/emulateDom');

const Unexpected = require('unexpected');
const UnexpectedReact = require('../unexpected-react');

const React = require('react/addons');

const TestUtils = React.addons.TestUtils;

const expect = Unexpected
    .clone()
    .use(UnexpectedReact);

expect.output.preferredWidth = 80;

/**
 * This is a regression test for bruderstein/unexpected-react#9
 * Unit tests for the issue added in unexpected-htmllike
 */

class LiElement extends React.Component {
    render () {
        return <li>{this.props.name}</li>;
    }
}

LiElement.propTypes = {
    name: React.PropTypes.string
};

class UlElement extends React.Component {
    render () {
        return (
            <ul>
                { this.props.items.map(i => <LiElement key={i.id} name={i.name} />) }
            </ul>
        );
    }
}

UlElement.propTypes = {
    items: React.PropTypes.array
};


describe('Test', function () {
    const items = [
        { id: 0, name: 'Banana' },
        { id: 1, name: 'Chocolate' },
        { id: 2, name: 'Mustard' }
    ];

    it('should render liElement', function () {
        let component = TestUtils.renderIntoDocument(
            <UlElement items={items} />
        );

        return expect(() => expect(component, 'to have rendered with all children', (
            <ul>
                <li>{items[0].name}</li>
                <li>{items[2].name}</li>
                <li>{items[1].name}</li>
            </ul>
        )), 'to error',
            'expected\n' +
            '<UlElement items={[\n' +
            "  { id: 0, name: 'Banana' },\n" +
        "  { id: 1, name: 'Chocolate' },\n" +
        "  { id: 2, name: 'Mustard' }\n" +
        ']}>\n' +
        '  <ul>\n' +
        '    <LiElement name="Banana"><li>Banana</li></LiElement>\n' +
        '    <LiElement name="Chocolate"><li>Chocolate</li></LiElement>\n' +
        '    <LiElement name="Mustard"><li>Mustard</li></LiElement>\n' +
        '  </ul>\n' +
        '</UlElement>\n' +
        'to have rendered with all children <ul><li>Banana</li><li>Mustard</li><li>Chocolate</li></ul>\n' +
        '\n' +
        '<UlElement items={[\n' +
        "  { id: 0, name: 'Banana' },\n" +
        "  { id: 1, name: 'Chocolate' },\n" +
        "  { id: 2, name: 'Mustard' }\n" +
        ']}>\n' +
        '  <ul>\n' +
        '    <LiElement name="Banana">\n' +
        '      <li>Banana</li>\n' +
        '    </LiElement>\n' +
        '    <LiElement name="Chocolate">\n' +
        '      <li>\n' +
        '        -Chocolate\n' +
        '        +Mustard\n' +
        '      </li>\n' +
        '    </LiElement>\n' +
        '    <LiElement name="Mustard">\n' +
        '      <li>\n' +
        '        -Mustard\n' +
        '        +Chocolate\n' +
        '      </li>\n' +
        '    </LiElement>\n' +
        '  </ul>\n' +
        '</UlElement>');
    });
});