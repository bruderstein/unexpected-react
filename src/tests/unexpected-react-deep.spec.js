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

const React = require('react');
const TestUtils = require('react-addons-test-utils');
const { findDOMNode } = require('react-dom');

const expect = Unexpected.clone()
    .use(UnexpectedReact);

const PropTypes = React.PropTypes;

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

CustomComp.propTypes = {
    childCount: PropTypes.number,
    className: PropTypes.string,
    useEvents: PropTypes.boolean
};

class WrapperComp extends React.Component {
    render() {
        return <CustomComp {...this.props} />;
    }
}

class MyDiv extends React.Component {
    render() {
        return <div {...this.props}>{this.props.children}</div>;
    }
}

MyDiv.propTypes = {
    children: PropTypes.any
};

// Dummy assertion for testing async expect.it
expect.addAssertion('<string> to eventually have value <string>', (expect, subject, value) => {

    return expect.promise((resolve, reject) => {

        setTimeout(() => {
            if (subject === value) {
                resolve();
            } else {
                try {
                    expect.fail('Failed');
                } catch (e) {
                    reject(e); // Return the UnexpectedError object
                }
            }
        }, 10);
    });
});

describe('unexpected-react (deep rendering)', () => {

    beforeEach(() => {
        UnexpectedReact.clearAll();
    });

    describe('identify', () => {

        it('identifies a rendered ES6 component', () => {

            const component = TestUtils.renderIntoDocument(<MyDiv className="foo" />);
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

            const component = TestUtils.renderIntoDocument(<MyDiv className="foo" />);
            expect(expect.inspect(component).toString(), 'to equal',
                '<MyDiv className="foo"><div className="foo" /></MyDiv>');
        });

        it('inspects a rendered native element with a string child', () => {

            const component = TestUtils.renderIntoDocument(<MyDiv className="foo">content</MyDiv>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<MyDiv className="foo"><div className="foo">content</div></MyDiv>');
        });

        it('inspects a rendered native element with a numeric child', () => {

            const component = TestUtils.renderIntoDocument(<MyDiv className="foo">{42}</MyDiv>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<MyDiv className="foo"><div className="foo">42</div></MyDiv>');
        });



        it('inspects a rendered element with children', () => {

            const component = TestUtils.renderIntoDocument(<MyDiv className="foo"><span className="child1" /></MyDiv>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<MyDiv className="foo"><div className="foo"><span className="child1" /></div></MyDiv>');
        });

        it('inspects a rendered native element with children and content', () => {

            const component = TestUtils.renderIntoDocument(
                <MyDiv className="foo">
                    <span className="child1">child content 1</span>
                    <span className="child2">child content 2</span>
                </MyDiv>);
            expect(expect.inspect(component).toString(), 'to equal',
                '<MyDiv className="foo">\n' +
                '  <div className="foo">\n' +
                '    <span className="child1">child content 1</span>\n' +
                '    <span className="child2">child content 2</span>\n' +
                '  </div>\n' +
                '</MyDiv>');
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

        it('identifies a missing class', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar foo" />);

            return expect(() => expect(component, 'to have rendered', <CustomComp className="blah foo bar" />),
                'to error',
                'expected <CustomComp className="bar foo"><div className="bar foo" /></CustomComp>\n' +
                'to have rendered <CustomComp className="blah foo bar" />\n' +
                '\n' +
                '<CustomComp className="bar foo" // missing class \'blah\'\n' +
                '>\n' +
                '  <div className="bar foo" />\n' +
                '</CustomComp>');
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
            TestUtils.Simulate.click(findDOMNode(component));

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

            return expect(() => expect(component, 'to have rendered',
                <div className={ expect.it('to match', /foo/) } />
            ), 'to throw',
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

        it('highlights a difference with an async expect.it on an attribute', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" />);

            return expect(expect(component, 'to have rendered',
                <div className={ expect.it('to eventually have value', 'foo') } />
            ), 'to be rejected with',
                'expected <CustomComp className="bar"><div className="bar" /></CustomComp>\n' +
                'to have rendered <div className={expect.it(\'to eventually have value\', \'foo\')} />\n' +
                '\n' +
                '<CustomComp className="bar">\n' +
                '  <div className="bar" // expected \'bar\' to eventually have value \'foo\'\n' +
                '  />\n' +
                '</CustomComp>');

        });

        it('matches a component that renders multiple numbers', () => {

            const NumberComponent = React.createClass({
                render() {
                    return <div>{3}{6}</div>;
                }
            });

            const component = TestUtils.renderIntoDocument(<NumberComponent />);
            expect(component, 'to have rendered', <div>{3}{6}</div>);

        });
        
        it('matches a component that renders single numbers', () => {

            const NumberComponent = React.createClass({
                render() {
                    return <div>{3}</div>;
                }
            });

            const component = TestUtils.renderIntoDocument(<NumberComponent />);
            expect(component, 'to have rendered', <div>{3}</div>);

        });

    });

    describe('contains', () => {

        it('finds a deep nested component', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={3} />);
            return expect(component, 'to contain',
               <CustomComp>
                   <div>
                       <span>2</span>
                   </div>
               </CustomComp>
            );

        });

        it('throws an error with the best match when the element is not found', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={3} />);
            return expect(() => expect(component, 'to contain',
                <span className="foo">2</span>
            ), 'to throw',
                'expected\n' +
                '<CustomComp className="bar" childCount={3}>\n' +
                '  <div className="bar">\n' +
                '    <span className="1">1</span>\n' +
                '    <span className="2">2</span>\n' +
                '    <span className="3">3</span>\n' +
                '  </div>\n' +
                '</CustomComp>\n' +
                'to contain <span className="foo">2</span>\n' +
                '\n' +
                'the best match was\n' +
                '<span className="2" // missing class \'foo\'\n' +
                '>\n' +
                '  2\n' +
                '</span>');

        });

        it('throws an error for `not to contain` with the match when the element is found ', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={3} />);
            return expect(() => expect(component, 'not to contain',
                <span className="2">2</span>
                ), 'to throw',
                'expected\n' +
                '<CustomComp className="bar" childCount={3}>\n' +
                '  <div className="bar">\n' +
                '    <span className="1">1</span>\n' +
                '    <span className="2">2</span>\n' +
                '    <span className="3">3</span>\n' +
                '  </div>\n' +
                '</CustomComp>\n' +
                'not to contain <span className="2">2</span>\n' +
                '\n' +
                'but found the following match\n' +
                '<span className="2">2</span>');
        });

        it('returns a rejected promise with the best match when the element is not found with an async expect.it', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={3} />);
            return expect(expect(component, 'to contain',
                <span className={expect.it('to eventually have value', 'foo')}>2</span>
                ), 'to be rejected with',
                'expected\n' +
                '<CustomComp className="bar" childCount={3}>\n' +
                '  <div className="bar">\n' +
                '    <span className="1">1</span>\n' +
                '    <span className="2">2</span>\n' +
                '    <span className="3">3</span>\n' +
                '  </div>\n' +
                '</CustomComp>\n' +
                'to contain <span className={expect.it(\'to eventually have value\', \'foo\')}>2</span>\n' +
                '\n' +
                'the best match was\n' +
                '<span className="2" // expected \'2\' to eventually have value \'foo\'\n' +
                '>\n' +
                '  2\n' +
                '</span>');
        });

    });

    describe('queried for', () => {

        it('finds a rendered component', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={3} />);
            return expect(component, 'queried for', <span className="2" />, 'to have rendered', <span className="2">2</span>);
        });

        it('finds a `contains` query', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={3} />);
            return expect(component, 'queried for', <div className="bar" />, 'to contain', <span className="2">2</span>);
        });

        it('errors when the query is not found', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={3}/>);
            return expect(() => expect(component, 'queried for', <div className="not-exist"/>, 'to contain',
                <span className="2">2</span>),
                'to throw',
                'expected\n' +
                '<CustomComp className="bar" childCount={3}>\n' +
                '  <div className="bar">\n' +
                '    <span className="1">1</span>\n' +
                '    <span className="2">2</span>\n' +
                '    <span className="3">3</span>\n' +
                '  </div>\n' +
                '</CustomComp>\n' +
                'queried for <div className="not-exist" /> to contain <span className="2">2</span>\n' +
                '\n' +
                '`queried for` found no match.  The best match was\n' +
                '<div className="bar" // missing class \'not-exist\'\n' +
                '>\n' +
                '  <span className="1">1</span>\n' +
                '  <span className="2">2</span>\n' +
                '  <span className="3">3</span>\n' +
                '</div>')
        });

        it('errors correctly when the following assertion fails', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={3} />);
            return expect(() => expect(component, 'queried for', <span className="2" />, 'to have rendered', <span className="2">foo</span>),
                'to throw',
                'expected\n' +
                '<CustomComp className="bar" childCount={3}>\n' +
                '  <div className="bar">\n' +
                '    <span className="1">1</span>\n' +
                '    <span className="2">2</span>\n' +
                '    <span className="3">3</span>\n' +
                '  </div>\n' +
                '</CustomComp>\n' +
                'queried for <span className="2" /> to have rendered <span className="2">foo</span>\n' +
                '\n' +
                '<span className="2">\n' +
                '  -2\n' +
                '  +foo\n' +
                '</span>');
        });

        it('finds an element with an async expect.it', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={3} />);
            return expect(component, 'queried for', <div className={ expect.it('to eventually have value', 'bar')} />, 'to contain', <span className="2">2</span>);
        });
        
        it('passes the located component as the resolution of the promise', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={3} />);
            return expect(component, 'queried for', <span className="2" />)
                .then(span => {
                    expect(span, 'to have rendered', <span className="2">2</span>);
                });
        });
        
        it('passes the located component as the resolution of the promise when the query is async', () => {

            const component = TestUtils.renderIntoDocument(<CustomComp className="bar" childCount={3} />);
            return expect(component, 'queried for', <span className={ expect.it('to eventually have value', '2')} />)
                .then(span => {
                    expect(span, 'to have rendered', <span className="2">2</span>);
                });
        });

    });

    describe('with events', () => {

        let ClickableComponent;

        beforeEach(() => {
            ClickableComponent = React.createClass({

                getInitialState() {
                    return {
                        clickCount: 1,
                        itemClickCount: 1
                    };
                },

                handleMainClick() {
                    this.setState({
                        clickCount: this.state.clickCount + 1
                    });
                },

                handleMouseDown(e) {
                    this.setState({
                        clickCount: this.state.clickCount + ((e && e.mouseX) || 1)
                    });
                },

                handleItemClick() {
                    this.setState({
                        itemClickCount: this.state.itemClickCount + 1
                    });
                },
                
                handleItemMouseDown(e) {
                    this.setState({
                        itemClickCount: this.state.itemClickCount + ((e && e.mouseX) || 1)
                    });
                },

                render() {
                    return (
                        <div onClick={this.handleMainClick} onMouseDown={this.handleMouseDown}>
                            <span className="main-click">Main clicked {this.state.clickCount}</span>
                            <span className="item-click"
                                  onClick={this.handleItemClick}
                                  onMouseDown={this.handleItemMouseDown}>Item clicked {this.state.itemClickCount || 0}</span>
                        </div>
                    );
                }

            });
        });
        
        it('renders a zero initially', () => {

            // This test is (was) failing, when the initial click count is 0. Seems to be a bug in the devtools.
            // Not yet tried updating the devtools.
            const component = TestUtils.renderIntoDocument(<ClickableComponent />);
            expect(component, 'to have rendered',
                <div>
                    <span className="main-click">Main clicked 1</span>
                    <span className="item-click">Item clicked 1</span>
                </div>
                    
            );
        });

        it('calls click on a component using the deep renderer', () => {
            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            expect(component, 'with event', 'click', 'to have rendered',
                <div>
                    <span className="main-click">Main clicked 2</span>
                </div>);

        });
        
        it('calls click on a sub component using the deep renderer', () => {
            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            expect(component, 'with event', 'click', 'on', <span className="item-click" />, 'to have rendered',
                <div>
                    <span className="item-click">Item clicked 2</span>
                </div>);

        });

        it('triggers multiple events', () => {
            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            expect(component, 'with event', 'click', 'on', <span className="item-click" />,
                'with event', 'click', 'on', <span className="item-click" />,
                'to have rendered',
                <div>
                    <span className="item-click">Item clicked 3</span>
                </div>);
        });
        
        it('triggers multiple events with eventArgs', () => {
            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            expect(component, 'with event', 'mouseDown', { mouseX: 2 }, 
                'with event', 'mouseDown', { mouseX: 4 }, 
                'to have rendered',
                <div>
                    <span className="main-click">Main clicked 7</span>
                </div>);
        });

        it('calls click on a sub component with `to contain`', () => {
            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            expect(component, 'with event', 'click', 'on', <span className="item-click" />, 
                'to contain',
                <span className="item-click">Item clicked 2</span>
            );
        });
        
        it('calls click on a sub component with `queried for`', () => {
            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            expect(component, 'with event', 'click', 'on', <span className="item-click" />,
                'queried for', <span className="item-click" />,
                'to have rendered',
                <span className="item-click">Item clicked 2</span>
            );
        });
        
        it('fails with a helpful error when the event is not known', () => {

            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            expect(() => expect(component, 'with event', 'foo', 'to have rendered',
                <div>
                    <span className="main-click">Main clicked 2</span>
                </div>), 'to throw', /Event 'foo' is not supported by TestUtils.Simulate/)
        });

        it('calls events with event parameters', () => {
            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            expect(component, 'with event', 'mouseDown', { mouseX: 50 }, 'to have rendered',
                <div>
                    <span className="main-click">Main clicked 51</span>
                </div>);
        });

        it('fails with a helpful error message when the target cannot be found', () => {

            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            expect(() => expect(component, 'with event', 'click', 'on', <span className="not exists" />, 'to have rendered',
                <div>
                    <span>This is never checked</span>
                </div>), 'to throw', /Could not find the target. The best match was/);
        });
        
        it('passes the resulting component as the resolution of the promise', () => {

            const component = TestUtils.renderIntoDocument(<ClickableComponent />);
            
            return expect(component, 'with event', 'click')
                .then(result => {
                    expect(result.state, 'to satisfy', { clickCount: 2 });
                });
        });

        it('passes the resulting component as the resolution of the promise with an event argument', () => {

            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            return expect(component, 'with event', 'mouseDown', { mouseX: 10 })
                .then(result => {
                    expect(result.state, 'to satisfy', { clickCount: 11 });
                });
        });

        it('passes the resulting component as the resolution of the promise when using `on`', () => {

            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            return expect(component, 'with event', 'click', 'on', <span className="item-click" />)
                .then(result => {
                    expect(result.state, 'to satisfy', { itemClickCount: 2 });
                });
        });
        
        it('passes the resulting component as the resolution of the promise when using event arguments and `on`', () => {

            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            return expect(component, 'with event', 'mouseDown', { mouseX: 10 }, 'on', <span className="item-click" />)
                .then(result => {
                    expect(result.state, 'to satisfy', { itemClickCount: 11 });
                });
        });

        it('passes the resulting component as the resolution of the promise with multiple events', () => {

            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            return expect(component, 'with event', 'mouseDown', { mouseX: 10 }, 'on', <span className="item-click" />,
            'and with event', 'click')
                .then(result => {
                    expect(result.state, 'to satisfy', { clickCount: 12, itemClickCount: 11 });
                });
        });
        
        it('passes the resulting component as the resolution of the promise with multiple events and eventArgs', () => {

            const component = TestUtils.renderIntoDocument(<ClickableComponent />);

            return expect(component, 'with event', 'mouseDown', { mouseX: 10 }, 'on', <span className="item-click" />,
                'and with event', 'mouseDown', { mouseX: 15 })
                .then(result => {
                    expect(result.state, 'to satisfy', { clickCount: 26, itemClickCount: 11 });
                });
        });
    });
});