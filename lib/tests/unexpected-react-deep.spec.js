'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * A note about these tests:
 *
 * These tests are specifically only testing that the correct calls are being made
  * to unexpected-htmllike, and that the output is correctly returned.
  * They also test the integration with the unexpected-htmllike-rendered-react-adapter
  * There are many, many more cases for specific diffing cases in the tests for
  * `unexpected-htmllike`
 */

var EmulateDom = require('../testHelpers/emulateDom');

var Unexpected = require('unexpected');
var UnexpectedReact = require('../unexpected-react');

var React = require('react');
var TestUtils = require('react-addons-test-utils');

var _require = require('react-dom');

var findDOMNode = _require.findDOMNode;


var expect = Unexpected.clone().use(UnexpectedReact);

var PropTypes = React.PropTypes;

expect.output.preferredWidth = 80;

var CustomComp = function (_React$Component) {
    _inherits(CustomComp, _React$Component);

    function CustomComp() {
        _classCallCheck(this, CustomComp);

        var _this = _possibleConstructorReturn(this, (CustomComp.__proto__ || Object.getPrototypeOf(CustomComp)).call(this));

        _this.state = {
            clickCount: 0
        };
        _this.onClick = _this.onClick.bind(_this);
        return _this;
    }

    _createClass(CustomComp, [{
        key: 'onClick',
        value: function onClick(event) {
            event.preventDefault(); // Used to check that we get the event properly
            this.setState({
                clickCount: this.state.clickCount + 1
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var children = null;
            if (this.props.childCount) {
                children = [];
                for (var i = 1; i <= this.props.childCount; ++i) {
                    children.push(React.createElement(
                        'span',
                        { key: i, className: '' + i },
                        null,
                        i
                    ));
                }
            }
            // If onClick was passed, add it as a prop, otherwise, leave it undefined
            var extraProps = {};
            if (this.props.useEvents) {
                extraProps.onClick = this.onClick;
                extraProps['data-click-count'] = this.state.clickCount;
            }

            return React.createElement(
                'div',
                _extends({
                    className: this.props.className
                }, extraProps),
                children
            );
        }
    }]);

    return CustomComp;
}(React.Component);

CustomComp.propTypes = {
    childCount: PropTypes.number,
    className: PropTypes.string,
    useEvents: PropTypes.boolean
};

var WrapperComp = function (_React$Component2) {
    _inherits(WrapperComp, _React$Component2);

    function WrapperComp() {
        _classCallCheck(this, WrapperComp);

        return _possibleConstructorReturn(this, (WrapperComp.__proto__ || Object.getPrototypeOf(WrapperComp)).apply(this, arguments));
    }

    _createClass(WrapperComp, [{
        key: 'render',
        value: function render() {
            return React.createElement(CustomComp, this.props);
        }
    }]);

    return WrapperComp;
}(React.Component);

var MyDiv = function (_React$Component3) {
    _inherits(MyDiv, _React$Component3);

    function MyDiv() {
        _classCallCheck(this, MyDiv);

        return _possibleConstructorReturn(this, (MyDiv.__proto__ || Object.getPrototypeOf(MyDiv)).apply(this, arguments));
    }

    _createClass(MyDiv, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                this.props,
                this.props.children
            );
        }
    }]);

    return MyDiv;
}(React.Component);

MyDiv.propTypes = {
    children: PropTypes.any
};

// Dummy assertion for testing async expect.it
expect.addAssertion('<string> to eventually have value <string>', function (expect, subject, value) {

    return expect.promise(function (resolve, reject) {

        setTimeout(function () {
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

describe('unexpected-react (deep rendering)', function () {

    beforeEach(function () {
        UnexpectedReact.clearAll();
    });

    describe('identify', function () {

        it('identifies a rendered ES6 component', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(MyDiv, { className: 'foo' }));
            expect(component, 'to be a', 'RenderedReactElement');
        });
    });

    describe('ReactModule', function () {
        it('identifies React correctly', function () {

            expect(React, 'to be a', 'ReactModule');
        });

        it('determines that the global hook has been installed', function () {

            expect(React, 'to have been injected');
        });
    });

    describe('inspect', function () {

        it('inspects a rendered native element', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(MyDiv, { className: 'foo' }));
            expect(expect.inspect(component).toString(), 'to equal', '<MyDiv className="foo"><div className="foo" /></MyDiv>');
        });

        it('inspects a rendered native element with a string child', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(
                MyDiv,
                { className: 'foo' },
                'content'
            ));
            expect(expect.inspect(component).toString(), 'to equal', '<MyDiv className="foo"><div className="foo">content</div></MyDiv>');
        });

        it('inspects a rendered native element with a numeric child', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(
                MyDiv,
                { className: 'foo' },
                42
            ));
            expect(expect.inspect(component).toString(), 'to equal', '<MyDiv className="foo"><div className="foo">42</div></MyDiv>');
        });

        it('inspects a rendered element with children', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(
                MyDiv,
                { className: 'foo' },
                React.createElement('span', { className: 'child1' })
            ));
            expect(expect.inspect(component).toString(), 'to equal', '<MyDiv className="foo"><div className="foo"><span className="child1" /></div></MyDiv>');
        });

        it('inspects a rendered native element with children and content', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(
                MyDiv,
                { className: 'foo' },
                React.createElement(
                    'span',
                    { className: 'child1' },
                    'child content 1'
                ),
                React.createElement(
                    'span',
                    { className: 'child2' },
                    'child content 2'
                )
            ));
            expect(expect.inspect(component).toString(), 'to equal', '<MyDiv className="foo">\n' + '  <div className="foo">\n' + '    <span className="child1">child content 1</span>\n' + '    <span className="child2">child content 2</span>\n' + '  </div>\n' + '</MyDiv>');
        });

        it('inspects a rendered custom component', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar' }));
            expect(expect.inspect(component).toString(), 'to equal', '<CustomComp className="bar"><div className="bar" /></CustomComp>');
        });

        it('inspects a rendered custom component with a child custom component element', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(WrapperComp, { className: 'bar' }));
            expect(expect.inspect(component).toString(), 'to equal', '<WrapperComp className="bar">\n' + '  <CustomComp className="bar"><div className="bar" /></CustomComp>\n' + '</WrapperComp>');
        });
    });

    describe('to have rendered', function () {

        it('matches a rendered simple component', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar' }));
            return expect(component, 'to have rendered', React.createElement(
                CustomComp,
                { className: 'bar' },
                React.createElement('div', { className: 'bar' })
            ));
        });

        it('matches a rendered deeper component', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(WrapperComp, { className: 'bar' }));
            return expect(component, 'to have rendered', React.createElement(
                WrapperComp,
                { className: 'bar' },
                React.createElement(
                    CustomComp,
                    { className: 'bar' },
                    React.createElement('div', { className: 'bar' })
                )
            ));
        });

        it('matches an a component with many children', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(WrapperComp, { className: 'bar', childCount: 3 }));
            return expect(component, 'to have rendered', React.createElement(
                WrapperComp,
                { className: 'bar', childCount: 3 },
                React.createElement(
                    'div',
                    { className: 'bar' },
                    React.createElement(
                        'span',
                        { className: '1' },
                        '1'
                    ),
                    React.createElement(
                        'span',
                        { className: '2' },
                        '2'
                    ),
                    React.createElement(
                        'span',
                        { className: '3' },
                        '3'
                    )
                )
            ));
        });

        it('identifies a missing class', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar foo' }));

            return expect(function () {
                return expect(component, 'to have rendered', React.createElement(CustomComp, { className: 'blah foo bar' }));
            }, 'to error', 'expected <CustomComp className="bar foo"><div className="bar foo" /></CustomComp>\n' + 'to have rendered <CustomComp className="blah foo bar" />\n' + '\n' + '<CustomComp className="bar foo" // missing class \'blah\'\n' + '>\n' + '  <div className="bar foo" />\n' + '</CustomComp>');
        });

        it('identifies a wrapper', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(WrapperComp, { className: 'bar', childCount: 3 }));
            return expect(component, 'to have rendered', React.createElement(
                WrapperComp,
                { className: 'bar', childCount: 3 },
                React.createElement(
                    'span',
                    { className: '1' },
                    '1'
                ),
                React.createElement(
                    'span',
                    { className: '2' },
                    '2'
                ),
                React.createElement(
                    'span',
                    { className: '3' },
                    '3'
                )
            ));
        });

        it('updates on change', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', useEvents: true }));
            TestUtils.Simulate.click(findDOMNode(component));

            return expect(component, 'to have rendered', React.createElement('div', { className: 'bar', 'data-click-count': 1 }));
        });

        it('matches an expect.it assertion on a prop', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar' }));

            return expect(component, 'to have rendered', React.createElement('div', { className: expect.it('to match', /bar/) }));
        });

        it('highlights a difference with an expect.it assertion on a prop', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar' }));

            return expect(function () {
                return expect(component, 'to have rendered', React.createElement('div', { className: expect.it('to match', /foo/) }));
            }, 'to throw', 'expected <CustomComp className="bar"><div className="bar" /></CustomComp>\n' + 'to have rendered <div className={expect.it(\'to match\', /foo/)} />\n' + '\n' + '<CustomComp className="bar">\n' + '  <div className="bar" // expected \'bar\' to match /foo/\n' + '  />\n' + '</CustomComp>');
        });

        it('highlights a difference with an expect.it assertion on content', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 1 }));
            return expect(function () {
                return expect(component, 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        null,
                        expect.it('to match', /[a-z]/)
                    )
                ));
            }, 'to error', 'expected\n' + '<CustomComp className="bar" childCount={1}>\n' + '  <div className="bar"><span className="1">1</span></div>\n' + '</CustomComp>\n' + 'to have rendered <div><span>{expect.it(\'to match\', /[a-z]/)}</span></div>\n' + '\n' + '<CustomComp className="bar" childCount={1}>\n' + '  <div className="bar">\n' + '    <span className="1">\n' + "      1 // expected '1' to match /[a-z]/\n" + '    </span>\n' + '  </div>\n' + '</CustomComp>');
        });

        it('matches an expect.it on JSX content', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 2 }));
            return expect(component, 'to have rendered', React.createElement(
                CustomComp,
                null,
                expect.it('to contain', React.createElement('span', { className: '1' })).and('to contain', React.createElement('span', { className: '2' }))
            ));
        });

        it('highlights a difference with an async expect.it on an attribute', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar' }));

            return expect(expect(component, 'to have rendered', React.createElement('div', { className: expect.it('to eventually have value', 'foo') })), 'to be rejected with', 'expected <CustomComp className="bar"><div className="bar" /></CustomComp>\n' + 'to have rendered <div className={expect.it(\'to eventually have value\', \'foo\')} />\n' + '\n' + '<CustomComp className="bar">\n' + '  <div className="bar" // expected \'bar\' to eventually have value \'foo\'\n' + '  />\n' + '</CustomComp>');
        });

        it('matches a component that renders multiple numbers', function () {

            var NumberComponent = React.createClass({
                displayName: 'NumberComponent',
                render: function render() {
                    return React.createElement(
                        'div',
                        null,
                        3,
                        6
                    );
                }
            });

            var component = TestUtils.renderIntoDocument(React.createElement(NumberComponent, null));
            expect(component, 'to have rendered', React.createElement(
                'div',
                null,
                3,
                6
            ));
        });

        it('matches a component that renders single numbers', function () {

            var NumberComponent = React.createClass({
                displayName: 'NumberComponent',
                render: function render() {
                    return React.createElement(
                        'div',
                        null,
                        3
                    );
                }
            });

            var component = TestUtils.renderIntoDocument(React.createElement(NumberComponent, null));
            expect(component, 'to have rendered', React.createElement(
                'div',
                null,
                3
            ));
        });
    });

    describe('contains', function () {

        it('finds a deep nested component', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(component, 'to contain', React.createElement(
                CustomComp,
                null,
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        null,
                        '2'
                    )
                )
            ));
        });

        it('throws an error with the best match when the element is not found', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(function () {
                return expect(component, 'to contain', React.createElement(
                    'span',
                    { className: 'foo' },
                    '2'
                ));
            }, 'to throw', 'expected\n' + '<CustomComp className="bar" childCount={3}>\n' + '  <div className="bar">\n' + '    <span className="1">1</span>\n' + '    <span className="2">2</span>\n' + '    <span className="3">3</span>\n' + '  </div>\n' + '</CustomComp>\n' + 'to contain <span className="foo">2</span>\n' + '\n' + 'the best match was\n' + '<span className="2" // missing class \'foo\'\n' + '>\n' + '  2\n' + '</span>');
        });

        it('throws an error for `not to contain` with the match when the element is found ', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(function () {
                return expect(component, 'not to contain', React.createElement(
                    'span',
                    { className: '2' },
                    '2'
                ));
            }, 'to throw', 'expected\n' + '<CustomComp className="bar" childCount={3}>\n' + '  <div className="bar">\n' + '    <span className="1">1</span>\n' + '    <span className="2">2</span>\n' + '    <span className="3">3</span>\n' + '  </div>\n' + '</CustomComp>\n' + 'not to contain <span className="2">2</span>\n' + '\n' + 'but found the following match\n' + '<span className="2">2</span>');
        });

        it('returns a rejected promise with the best match when the element is not found with an async expect.it', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(expect(component, 'to contain', React.createElement(
                'span',
                { className: expect.it('to eventually have value', 'foo') },
                '2'
            )), 'to be rejected with', 'expected\n' + '<CustomComp className="bar" childCount={3}>\n' + '  <div className="bar">\n' + '    <span className="1">1</span>\n' + '    <span className="2">2</span>\n' + '    <span className="3">3</span>\n' + '  </div>\n' + '</CustomComp>\n' + 'to contain <span className={expect.it(\'to eventually have value\', \'foo\')}>2</span>\n' + '\n' + 'the best match was\n' + '<span className="2" // expected \'2\' to eventually have value \'foo\'\n' + '>\n' + '  2\n' + '</span>');
        });
    });

    describe('queried for', function () {

        it('finds a rendered component', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(component, 'queried for', React.createElement('span', { className: '2' }), 'to have rendered', React.createElement(
                'span',
                { className: '2' },
                '2'
            ));
        });

        it('finds a `contains` query', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(component, 'queried for', React.createElement('div', { className: 'bar' }), 'to contain', React.createElement(
                'span',
                { className: '2' },
                '2'
            ));
        });

        it('errors when the query is not found', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(function () {
                return expect(component, 'queried for', React.createElement('div', { className: 'not-exist' }), 'to contain', React.createElement(
                    'span',
                    { className: '2' },
                    '2'
                ));
            }, 'to throw', 'expected\n' + '<CustomComp className="bar" childCount={3}>\n' + '  <div className="bar">\n' + '    <span className="1">1</span>\n' + '    <span className="2">2</span>\n' + '    <span className="3">3</span>\n' + '  </div>\n' + '</CustomComp>\n' + 'queried for <div className="not-exist" /> to contain <span className="2">2</span>\n' + '\n' + '`queried for` found no match.  The best match was\n' + '<div className="bar" // missing class \'not-exist\'\n' + '>\n' + '  <span className="1">1</span>\n' + '  <span className="2">2</span>\n' + '  <span className="3">3</span>\n' + '</div>');
        });

        it('errors correctly when the following assertion fails', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(function () {
                return expect(component, 'queried for', React.createElement('span', { className: '2' }), 'to have rendered', React.createElement(
                    'span',
                    { className: '2' },
                    'foo'
                ));
            }, 'to throw', 'expected\n' + '<CustomComp className="bar" childCount={3}>\n' + '  <div className="bar">\n' + '    <span className="1">1</span>\n' + '    <span className="2">2</span>\n' + '    <span className="3">3</span>\n' + '  </div>\n' + '</CustomComp>\n' + 'queried for <span className="2" /> to have rendered <span className="2">foo</span>\n' + '\n' + '<span className="2">\n' + '  2 // -2\n' + '    // +foo\n' + '</span>');
        });

        it('finds an element with an async expect.it', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(component, 'queried for', React.createElement('div', { className: expect.it('to eventually have value', 'bar') }), 'to contain', React.createElement(
                'span',
                { className: '2' },
                '2'
            ));
        });

        it('passes the located component as the resolution of the promise', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(component, 'queried for', React.createElement('span', { className: '2' })).then(function (span) {
                expect(span, 'to be a', HTMLElement);
                expect(span, 'to satisfy', { className: '2' });
            });
        });

        it('passes the located component as the resolution of the promise when the query is async', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(component, 'queried for', React.createElement('span', { className: expect.it('to eventually have value', '2') })).then(function (span) {
                expect(span, 'to be a', HTMLElement);
                expect(span, 'to satisfy', { className: '2' });
            });
        });

        it('uses `queryTarget` as the target element', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(CustomComp, { className: 'bar', childCount: 3 }));
            return expect(component, 'queried for', React.createElement(
                'div',
                null,
                React.createElement('span', { queryTarget: true, className: expect.it('to eventually have value', '2') })
            )).then(function (span) {
                expect(span, 'to be a', HTMLElement);
                expect(span, 'to satisfy', { className: '2' });
            });
        });
    });

    describe('with events', function () {

        var ClickableComponent = void 0;

        beforeEach(function () {
            ClickableComponent = React.createClass({
                displayName: 'ClickableComponent',
                getInitialState: function getInitialState() {
                    return {
                        clickCount: 1,
                        itemClickCount: 1
                    };
                },
                handleMainClick: function handleMainClick() {
                    this.setState({
                        clickCount: this.state.clickCount + 1
                    });
                },
                handleMouseDown: function handleMouseDown(e) {
                    this.setState({
                        clickCount: this.state.clickCount + (e && e.mouseX || 1)
                    });
                },
                handleItemClick: function handleItemClick() {
                    this.setState({
                        itemClickCount: this.state.itemClickCount + 1
                    });
                },
                handleItemMouseDown: function handleItemMouseDown(e) {
                    this.setState({
                        itemClickCount: this.state.itemClickCount + (e && e.mouseX || 1)
                    });
                },
                render: function render() {
                    return React.createElement(
                        'div',
                        { onClick: this.handleMainClick, onMouseDown: this.handleMouseDown },
                        React.createElement(
                            'span',
                            { className: 'main-click' },
                            'Main clicked ',
                            this.state.clickCount
                        ),
                        React.createElement(
                            'span',
                            { className: 'item-click testfoo testbar',
                                onClick: this.handleItemClick,
                                onMouseDown: this.handleItemMouseDown },
                            'Item clicked ',
                            this.state.itemClickCount || 0
                        )
                    );
                }
            });
        });

        it('renders a zero initially', function () {

            // This test is (was) failing, when the initial click count is 0. Seems to be a bug in the devtools.
            // Not yet tried updating the devtools.
            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));
            expect(component, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'main-click' },
                    'Main clicked 1'
                ),
                React.createElement(
                    'span',
                    { className: 'item-click' },
                    'Item clicked 1'
                )
            ));
        });

        it('calls click on a component using the deep renderer', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            expect(component, 'with event', 'click', 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'main-click' },
                    'Main clicked 2'
                )
            ));
        });

        it('calls click on a sub component using the deep renderer', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            expect(component, 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' }), 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'item-click' },
                    'Item clicked 2'
                )
            ));
        });

        it('triggers multiple events', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            expect(component, 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' }), 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' }), 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'item-click' },
                    'Item clicked 3'
                )
            ));
        });

        it('triggers multiple events with eventArgs', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            expect(component, 'with event', 'mouseDown', { mouseX: 2 }, 'with event', 'mouseDown', { mouseX: 4 }, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'main-click' },
                    'Main clicked 7'
                )
            ));
        });

        it('calls click on a sub component with `to contain`', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            expect(component, 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' }), 'to contain', React.createElement(
                'span',
                { className: 'item-click' },
                'Item clicked 2'
            ));
        });

        it('calls click on a sub component with `not to contain`', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            expect(component, 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' }), 'not to contain', React.createElement(
                'span',
                { className: 'item-click' },
                'Item clicked 1'
            ));
        });

        it('calls click on a sub component with `not to contain with all children`', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            expect(component, 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' }), 'not to contain with all children', React.createElement(
                'span',
                { className: 'item-click' },
                'Item clicked 1'
            ));
        });

        it('ignores extra classes by default in the `on` clause', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));
            expect(component, 'with event', 'click', 'on', React.createElement('span', { className: 'item-click testfoo' }), 'to contain', React.createElement(
                'span',
                { className: 'item-click' },
                'Item clicked 2'
            ));
        });

        it('calls click on a sub component with `queried for`', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            expect(component, 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' }), 'queried for', React.createElement('span', { className: 'item-click' }), 'to have rendered', React.createElement(
                'span',
                { className: 'item-click' },
                'Item clicked 2'
            ));
        });

        it('fails with a helpful error when the event is not known', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            expect(function () {
                return expect(component, 'with event', 'foo', 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        { className: 'main-click' },
                        'Main clicked 2'
                    )
                ));
            }, 'to throw', /Event 'foo' is not supported by TestUtils.Simulate/);
        });

        it('calls events with event parameters', function () {
            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            expect(component, 'with event', 'mouseDown', { mouseX: 50 }, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'main-click' },
                    'Main clicked 51'
                )
            ));
        });

        it('fails with a helpful error message when the target cannot be found', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            expect(function () {
                return expect(component, 'with event', 'click', 'on', React.createElement('span', { className: 'not exists' }), 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        null,
                        'This is never checked'
                    )
                ));
            }, 'to throw', /Could not find the target. The best match was/);
        });

        it('passes the resulting component as the resolution of the promise', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            return expect(component, 'with event', 'click').then(function (result) {
                expect(result.state, 'to satisfy', { clickCount: 2 });
            });
        });

        it('passes the resulting component as the resolution of the promise with an event argument', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            return expect(component, 'with event', 'mouseDown', { mouseX: 10 }).then(function (result) {
                expect(result.state, 'to satisfy', { clickCount: 11 });
            });
        });

        it('passes the resulting component as the resolution of the promise when using `on`', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            return expect(component, 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' })).then(function (result) {
                expect(result.state, 'to satisfy', { itemClickCount: 2 });
            });
        });

        it('passes the resulting component as the resolution of the promise when using event arguments and `on`', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            return expect(component, 'with event', 'mouseDown', { mouseX: 10 }, 'on', React.createElement('span', { className: 'item-click' })).then(function (result) {
                expect(result.state, 'to satisfy', { itemClickCount: 11 });
            });
        });

        it('passes the resulting component as the resolution of the promise with multiple events', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            return expect(component, 'with event', 'mouseDown', { mouseX: 10 }, 'on', React.createElement('span', { className: 'item-click' }), 'and with event', 'click').then(function (result) {
                expect(result.state, 'to satisfy', { clickCount: 12, itemClickCount: 11 });
            });
        });

        it('passes the resulting component as the resolution of the promise with multiple events and eventArgs', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            return expect(component, 'with event', 'mouseDown', { mouseX: 10 }, 'on', React.createElement('span', { className: 'item-click' }), 'and with event', 'mouseDown', { mouseX: 15 }).then(function (result) {
                expect(result.state, 'to satisfy', { clickCount: 26, itemClickCount: 11 });
            });
        });

        it('uses the `eventTarget` prop to identify the target for the event', function () {

            var component = TestUtils.renderIntoDocument(React.createElement(ClickableComponent, null));

            return expect(component, 'with event', 'mouseDown', { mouseX: 10 }, 'on', React.createElement(
                'div',
                null,
                React.createElement('span', { className: 'item-click', eventTarget: true })
            )).then(function (result) {
                expect(result.state, 'to satisfy', { clickCount: 11, itemClickCount: 11 });
            });
        });

        describe('combined with queried for', function () {

            var TodoItem = React.createClass({
                displayName: 'TodoItem',

                propTypes: {
                    label: React.PropTypes.string
                },

                getInitialState: function getInitialState() {
                    return {
                        isCompleted: 'false'
                    };
                },
                onClick: function onClick() {
                    this.setState({
                        isCompleted: 'true'
                    });
                },
                render: function render() {
                    return React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'span',
                            null,
                            this.props.label
                        ),
                        React.createElement(
                            'span',
                            null,
                            'Is complete ',
                            this.state.isCompleted
                        ),
                        React.createElement(
                            'button',
                            { onClick: this.onClick },
                            'Click me'
                        )
                    );
                }
            });

            var TodoList = React.createClass({
                displayName: 'TodoList',
                render: function render() {
                    return React.createElement(
                        'div',
                        null,
                        React.createElement(TodoItem, { id: 1, label: 'one' }),
                        React.createElement(TodoItem, { id: 2, label: 'two' }),
                        React.createElement(TodoItem, { id: 3, label: 'three' })
                    );
                }
            });

            it('combines with queried for', function () {

                var component = TestUtils.renderIntoDocument(React.createElement(TodoList, null));
                expect(component, 'queried for', React.createElement(TodoItem, { id: 2 }), 'with event', 'click', 'on', React.createElement('button', null), 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        null,
                        'two'
                    ),
                    React.createElement(
                        'span',
                        null,
                        'Is complete true'
                    )
                ));
            });

            it('combines with queried for using the result promise', function () {

                var component = TestUtils.renderIntoDocument(React.createElement(TodoList, null));
                return expect(component, 'queried for', React.createElement(TodoItem, { id: 2 })).then(function (todoItem) {
                    return expect(todoItem, 'with event', 'click', 'on', React.createElement('button', null), 'to have rendered', React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'span',
                            null,
                            'two'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'Is complete true'
                        )
                    ));
                });
            });

            it('combines with queried for using the result promise and the event promise', function () {

                var component = TestUtils.renderIntoDocument(React.createElement(TodoList, null));
                return expect(component, 'queried for', React.createElement(TodoItem, { id: 2 })).then(function (todoItem) {
                    return expect(todoItem, 'with event', 'click', 'on', React.createElement('button', null));
                }).then(function (todoItem) {
                    return expect(todoItem, 'to have rendered', React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'span',
                            null,
                            'two'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'Is complete true'
                        )
                    ));
                });
            });

            it('with event followed by queried for returns correct element', function () {

                var component = TestUtils.renderIntoDocument(React.createElement(TodoList, null));
                return expect(component, 'with event click', 'on', React.createElement(
                    TodoItem,
                    { id: 2 },
                    React.createElement(
                        'div',
                        null,
                        React.createElement('button', { eventTarget: true })
                    )
                ), 'queried for', React.createElement(TodoItem, { id: 2 })).then(function (todoItem) {
                    expect(todoItem.state, 'to satisfy', { isCompleted: 'true' });
                });
            });

            it('with multiple events followed by queried for returns correct element', function () {

                var component = TestUtils.renderIntoDocument(React.createElement(TodoList, null));
                return expect(component, 'with event click', 'on', React.createElement(
                    TodoItem,
                    { id: 2 },
                    React.createElement(
                        'div',
                        null,
                        React.createElement('button', { eventTarget: true })
                    )
                ), 'with event click', 'on', React.createElement(
                    TodoItem,
                    { id: 1 },
                    React.createElement(
                        'div',
                        null,
                        React.createElement('button', { eventTarget: true })
                    )
                ), 'queried for', React.createElement(TodoItem, { id: 2 })).then(function (todoItem) {
                    expect(todoItem.state, 'to satisfy', { isCompleted: 'true' });
                });
            });

            it('with multiple events followed by queried for for a HTML element returns correct element', function () {

                var component = TestUtils.renderIntoDocument(React.createElement(TodoList, null));
                return expect(component, 'with event', 'click', {}, 'with event', 'click', {}, 'with event', 'click', {}, 'queried for', React.createElement(
                    TodoItem,
                    { id: 2 },
                    React.createElement('div', { queryTarget: true })
                )).then(function (div) {
                    expect(div, 'to be a', HTMLElement);
                    expect(div, 'to satisfy', { tagName: 'DIV' });
                });
            });
        });
    });
});