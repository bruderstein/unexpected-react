/*
 * A note about these tests:
 *
 * These tests are specifically only testing that the correct calls are being made
  * to unexpected-htmllike, and that the output is correctly returned.
  * They also test the integration with the unexpected-htmllike-rendered-react-adapter
  * There are many, many more cases for specific diffing cases in the tests for
  * `unexpected-htmllike`
 */

const EmulateDom = require( '../testHelpers/emulateDom');

const Unexpected = require('unexpected');
const UnexpectedReact = require('../unexpected-react');

const React = require('react/addons');

const TestUtils = React.addons.TestUtils;

const expect = Unexpected.clone()
    .use(UnexpectedReact);

expect.output.preferredWidth = 80;

class CustomComp extends React.Component {

    constructor() {
        super();
        this.state = {
            clickCount: 0
        };
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        event.preventDefault();  // Used to check that we get the event properly
        this.setState({
            clickCount: this.state.clickCount + 1
        });
    }

    render() {
        let children = null;
        if (this.props.childCount) {
            children = [];
            for(let i = 1; i <= this.props.childCount; ++i) {
                children.push(<span key={i} className={'' + i}>{null}{i}</span>);
            }
        }
        // If onClick was passed, add it as a prop, otherwise, leave it undefined
        const extraProps = {};
        if (this.props.useEvents) {
            extraProps.onClick = this.onClick;
            extraProps['data-click-count'] = this.state.clickCount;
        }

        return (
            <div
                className={this.props.className}
                {...extraProps}
            >
                {children}
            </div>
        );
    }
}

class WrapperComp extends React.Component {
    render() {
        return <CustomComp {...this.props} />;
    }
}

describe('unexpected-react (deep rendering)', () => {

    beforeEach(() => {
        UnexpectedReact.clearAll();
    });

    describe('identify', () => {

        it('identifies a rendered component', () => {

            const component = TestUtils.renderIntoDocument(<div className="foo" />);
            expect(component, 'to be a', 'RenderedReactElement');
        });

    });

    describe('ReactModule', () => {
        it('identifies React correctly', () => {

            expect(React, 'to be a', 'ReactModule');
        });

        it('determines that the global hook has been installed', () => {

            expect(React, 'to have been injected');
        });
    });


    describe('inspect', () => {

        it('inspects a rendered native element', () => {

            const component = TestUtils.renderIntoDocument(<div className="foo" />);
            expect(expect.inspect(component).toString(), 'to equal',
                '<div className="foo" />');
        });

        it('inspects a rendered native element with a string child', () => {

            const component = TestUtils.renderIntoDocument(<div className="foo">content</div>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<div className="foo">content</div>');
        });

        it('inspects a rendered native element with a numeric child', () => {

            const component = TestUtils.renderIntoDocument(<div className="foo">{42}</div>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<div className="foo">42</div>');
        });



        it('inspects a rendered native element with children', () => {

            const component = TestUtils.renderIntoDocument(<div className="foo"><span className="child1" /></div>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<div className="foo"><span className="child1" /></div>');
        });

        it('inspects a rendered native element with children and content', () => {

            const component = TestUtils.renderIntoDocument(
                <div className="foo">
                    <span className="child1">child content 1</span>
                    <span className="child2">child content 2</span>
                </div>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<div className="foo">\n' +
                '  <span className="child1">child content 1</span>\n' +
                '  <span className="child2">child content 2</span>\n' +
                '</div>');
        });

        it('inspects a rendered custom component', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" />);
            expect(expect.inspect(component).toString(), 'to equal',
                '<CustomComp className="bar"><div className="bar" /></CustomComp>');
        });

        it('inspects a rendered custom component with a child custom component element', () => {

            const component = TestUtils.renderIntoDocument(<WrapperComp className="bar" />);
            expect(expect.inspect(component).toString(), 'to equal',
            '<WrapperComp className="bar">\n' +
            '  <CustomComp className="bar"><div className="bar" /></CustomComp>\n' +
            '</WrapperComp>');
        });

    });

    describe('to have rendered', () => {

        it('matches a rendered simple component', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" />);
            return expect(component, 'to have rendered', <CustomComp className="bar"><div className="bar" /></CustomComp>);
        });

        it('matches a rendered deeper component', () => {

            const component = TestUtils.renderIntoDocument(<WrapperComp className="bar" />);
            return expect(component, 'to have rendered',
                <WrapperComp className="bar">
                    <CustomComp className="bar">
                        <div className="bar" />
                    </CustomComp>
                </WrapperComp>);
        });

        it('matches an a component with many children', () => {

            const component = TestUtils.renderIntoDocument(<WrapperComp className="bar" childCount={3} />);
            return expect(component, 'to have rendered',
                <WrapperComp className="bar" childCount={3}>
                        <div className="bar">
                            <span className="1">1</span>
                            <span className="2">2</span>
                            <span className="3">3</span>
                        </div>
                </WrapperComp>);
        });

        it('identifies a wrapper', () => {
            const component = TestUtils.renderIntoDocument(<WrapperComp className="bar" childCount={3} />);
            return expect(component, 'to have rendered',
                <WrapperComp className="bar" childCount={3}>
                        <span className="1">1</span>
                        <span className="2">2</span>
                        <span className="3">3</span>
                </WrapperComp>);
        });

        it('updates on change', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" useEvents={true} />);
            TestUtils.Simulate.click(React.findDOMNode(component));

            return expect(component, 'to have rendered',
                    <div className="bar" data-click-count={1} />
            );
        });

        it('matches an expect.it assertion on a prop', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" />);

            return expect(component, 'to have rendered',
                <div className={ expect.it('to match', /bar/) } />
            );
        });

        it('highlights a difference with an expect.it assertion on a prop', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" />);

            return expect(expect(component, 'to have rendered',
                <div className={ expect.it('to match', /foo/) } />
            ), 'to be rejected with',
                'expected <CustomComp className="bar"><div className="bar" /></CustomComp>\n' +
                'to have rendered <div className={expect.it(\'to match\', /foo/)} />\n' +
                '\n' +
                '<CustomComp className="bar">\n' +
                '  <div className="bar" // expected \'bar\' to match /foo/\n' +
                '  />\n' +
                '</CustomComp>');
        });

        it('highlights a difference with an expect.it assertion on content', () =>  {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={1} />);
            return expect(() => expect(component, 'to have rendered',
                <div>
                    <span>{ expect.it('to match', /[a-z]/) }</span>
                </div>
                ), 'to error',
                'expected\n' +
                '<CustomComp className="bar" childCount={1}>\n' +
                '  <div className="bar"><span className="1">1</span></div>\n' +
                '</CustomComp>\n' +
                'to have rendered <div><span>{expect.it(\'to match\', /[a-z]/)}</span></div>\n' +
                '\n' +
                '<CustomComp className="bar" childCount={1}>\n' +
                '  <div className="bar">\n' +
                '    <span className="1">\n' +
                "      1 // expected '1' to match /[a-z]/\n" +
                '    </span>\n' +
                '  </div>\n' +
                '</CustomComp>');
        });
    });
});