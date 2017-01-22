'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Unexpected = require('unexpected');
var UnexpectedReact = require('../../unexpected-react');

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var Immutable = require('immutable');

var PropTypes = React.PropTypes;

var expect = Unexpected.clone().installPlugin(UnexpectedReact);

var ES5Component = React.createClass({
    displayName: 'ES5Component',
    render: function render() {
        return null;
    }
});

function createNoNameComponent() {
    return React.createClass({
        displayName: '',
        render: function render() {
            return null;
        }
    });
}

var NoNameComponent = createNoNameComponent();

var ClassComponent = function (_React$Component) {
    _inherits(ClassComponent, _React$Component);

    function ClassComponent() {
        _classCallCheck(this, ClassComponent);

        return _possibleConstructorReturn(this, (ClassComponent.__proto__ || Object.getPrototypeOf(ClassComponent)).apply(this, arguments));
    }

    _createClass(ClassComponent, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'class-component' },
                this.props.content
            );
        }
    }]);

    return ClassComponent;
}(React.Component);

ClassComponent.propTypes = {
    content: PropTypes.any
};

var MyDiv = function (_React$Component2) {
    _inherits(MyDiv, _React$Component2);

    function MyDiv() {
        _classCallCheck(this, MyDiv);

        return _possibleConstructorReturn(this, (MyDiv.__proto__ || Object.getPrototypeOf(MyDiv)).apply(this, arguments));
    }

    _createClass(MyDiv, [{
        key: 'render',
        value: function render() {
            return React.createElement('div', this.props);
        }
    }]);

    return MyDiv;
}(React.Component);

var FunctionComp = function FunctionComp(props) {
    return React.createElement('div', props);
};

var versionParts = React.version.split('.');
var isReact014 = parseFloat(versionParts[0] + '.' + versionParts[1]) >= 0.14;

//expect.outputFormat('text');

expect.addAssertion('<any> to inspect as <string>', function (expect, subject, value) {
    expect.errorMode = 'bubble';
    expect(expect.inspect(subject).toString(), 'to equal', value);
});

expect.addAssertion('<any> to inspect as <regexp>', function (expect, subject, value) {
    expect.errorMode = 'bubble';
    expect(expect.inspect(subject).toString(), 'to match', value);
});

expect.addAssertion('<string> to eventually equal <string>', function (expect, subject, value) {

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

// The tests assume a narrow terminal
expect.output.preferredWidth = 80;

describe('unexpected-react-shallow', function () {

    var renderer, renderer2;

    beforeEach(function () {
        renderer = TestUtils.createRenderer();
        renderer2 = TestUtils.createRenderer();
    });

    it('identifies a ReactElement', function () {
        renderer.render(React.createElement(MyDiv, null));
        var element = renderer.getRenderOutput();

        expect(element, 'to be a', 'ReactElement');
    });

    if (isReact014) {
        it('identifies a pure function component', function () {

            renderer.render(React.createElement(FunctionComp, null));
            var element = renderer.getRenderOutput();

            expect(element, 'to be a', 'ReactElement');
        });
    }

    it('identifies a ShallowRenderer', function () {

        expect(renderer, 'to be a', 'ReactShallowRenderer');
    });

    describe('inspect', function () {

        it('outputs a tag element with no props', function () {

            renderer.render(React.createElement(MyDiv, null));
            expect(renderer, 'to inspect as', '<div />');
        });

        it('outputs a tag element with string  props', function () {

            renderer.render(React.createElement(MyDiv, { className: 'test' }));
            expect(renderer, 'to inspect as', '<div className="test" />');
        });

        it('outputs a tag element with number props', function () {

            renderer.render(React.createElement(MyDiv, { id: 42 }));
            expect(function () {
                return expect(renderer, 'to equal', 1);
            }, 'to throw', 'expected <div id={42} /> to equal 1');
        });

        it('outputs a tag element with boolean props', function () {

            renderer.render(React.createElement(MyDiv, { disabled: true }));
            expect(function () {
                return expect(renderer, 'to equal', 1);
            }, 'to throw', 'expected <div disabled={true} /> to equal 1');
        });

        it('outputs a tag element with null props', function () {

            renderer.render(React.createElement(MyDiv, { className: null }));
            expect(function () {
                return expect(renderer, 'to equal', 1);
            }, 'to throw', 'expected <div className={null} /> to equal 1');
        });

        it('outputs a tag element and skips an undefined prop', function () {

            renderer.render(React.createElement(MyDiv, { className: undefined }));
            expect(function () {
                return expect(renderer, 'to equal', 1);
            }, 'to throw', 'expected <div /> to equal 1');
        });

        it('outputs a tag element with an object prop', function () {

            var obj = { some: 'prop' };
            renderer.render(React.createElement(MyDiv, { className: obj }));
            expect(renderer.getRenderOutput(), 'to inspect as', '<div className={{ some: \'prop\' }} />');
        });

        it('outputs a tag element with an function prop', function () {

            var fn = function fn(a, b) {
                return a + b;
            };
            renderer.render(React.createElement(MyDiv, { onClick: fn }));
            expect(renderer, 'to inspect as', /<div onClick=\{function (fn)?\(a, b\) \{[^}]+}}( |\n)?\/>/m);
        });

        it('outputs a tag with a single string child', function () {

            renderer.render(React.createElement(
                MyDiv,
                { className: 'test' },
                'some content'
            ));
            expect(renderer, 'to inspect as', '<div className="test">some content</div>');
        });

        it('outputs an ES5 createClass component props and no children', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ES5Component,
                    { className: 'test' },
                    'some content'
                )
            ));

            expect(renderer, 'to inspect as', '<div><ES5Component className="test">some content</ES5Component></div>');
        });

        it('outputs an ES5 class component props and children', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { className: 'test' },
                    'some content'
                )
            ));

            expect(renderer, 'to inspect as', '<div><ClassComponent className="test">some content</ClassComponent></div>');
        });

        it('outputs a set of deep nested components', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { className: 'test' },
                    React.createElement(
                        ClassComponent,
                        { some: 1, more: true, props: 'yeah' },
                        'some content'
                    ),
                    React.createElement(
                        ClassComponent,
                        { some: 1, more: true, props: 'yeah' },
                        'some different content'
                    )
                )
            ));

            expect(renderer, 'to inspect as', '<div>\n' + '  <ClassComponent className="test">\n' + '    <ClassComponent some={1} more={true} props="yeah">some content</ClassComponent>\n' + '    <ClassComponent some={1} more={true} props="yeah">some different content</ClassComponent>\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('outputs a directly created custom ReactElement', function () {

            expect(React.createElement(ClassComponent, { className: 'foo' }), 'to inspect as', '<ClassComponent className="foo" />');
        });

        it('outputs a directly created native ReactElement', function () {

            expect(React.createElement('div', { className: 'foo' }), 'to inspect as', '<div className="foo" />');
        });

        it('outputs a directly created inline element (React 0.14)', function () {

            var inlineElement = {
                type: 'div',
                props: {
                    className: 'foo'
                },
                key: null,
                ref: null
            };

            expect(inlineElement, 'to inspect as', '<div className="foo" />');
        });

        /* This test is disabled. There's something with the way babel(possibly) is
         * converting the NoNameComponent - the name is coming out as 'Constructor'
         * Wallaby.js runs it fine (although wallaby.js has other issues with displayNames not appearing
         * via the babel transform for createClass, and only appearing if displayName is explicitely set.
         *
        it('outputs a component with no-display-name', function () {
             expect(() => expect(<NoNameComponent className="foo" />, 'to equal', 1), 'to throw',
                'expected <no-display-name className="foo" /> to equal 1');
        });
         */
    });

    describe('diff', function () {

        it('diffs within simple text content inside native element', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                'Some simple content'
            ));
            var expected = React.createElement(
                'div',
                null,
                'Different content'
            );

            return expect(function () {
                return expect(renderer, 'to have rendered', expected);
            }, 'to throw', 'expected <div>Some simple content</div>\n' + 'to have rendered <div>Different content</div>\n' + '\n' + '<div>\n' + '  Some simple content // -Some simple content\n' + '                      // +Different content\n' + '</div>');
        });

        it('shows changed props within a simple native element', function () {

            renderer.render(React.createElement(
                MyDiv,
                { className: 'actual' },
                'Some simple content'
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered', React.createElement(
                    'div',
                    { className: 'expected' },
                    'Some simple content'
                ));
            }, 'to throw', 'expected <div className="actual">Some simple content</div>\n' + 'to have rendered <div className="expected">Some simple content</div>\n' + '\n' + '<div className="actual" // missing class \'expected\'\n' + '>\n' + '  Some simple content\n' + '</div>');
        });

        it('shows missing props within a simple native element', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                'Some simple content'
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered', React.createElement(
                    'div',
                    { className: 'expected', id: '123' },
                    'Some simple content'
                ));
            }, 'to throw', 'expected <div>Some simple content</div>\n' + 'to have rendered <div className="expected" id="123">Some simple content</div>\n' + '\n' + '<div // missing className="expected"\n' + '   // missing id="123"\n' + '>\n' + '  Some simple content\n' + '</div>');
        });

        it('ignores extra props within a simple native element', function () {

            renderer.render(React.createElement(
                MyDiv,
                { id: '123', className: 'extra' },
                'Some simple content'
            ));

            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                { id: '123' },
                'Some simple content'
            ));
        });

        it('does not ignore extra props when using `exactly`', function () {

            renderer.render(React.createElement(
                MyDiv,
                { id: '123', className: 'extra' },
                'Some simple content'
            ));
            return expect(function () {
                return expect(renderer, 'to have exactly rendered', React.createElement(
                    'div',
                    { id: '123' },
                    'Some simple content'
                ));
            }, 'to throw', 'expected <div id="123" className="extra">Some simple content</div>\n' + 'to have exactly rendered <div id="123">Some simple content</div>\n' + '\n' + '<div id="123" className="extra" // className should be removed\n' + '>\n' + '  Some simple content\n' + '</div>');
        });

        it('matches props on a custom component', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { test: true, className: 'foo' },
                    React.createElement(
                        'span',
                        { className: 'bar' },
                        'foo'
                    )
                )
            ));

            return expect(renderer, 'to have exactly rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    { className: 'foo', test: true },
                    React.createElement(
                        'span',
                        { className: 'bar' },
                        'foo'
                    )
                )
            ));
        });

        it('matches className in a different order with different spacing', function () {

            renderer.render(React.createElement(MyDiv, { className: 'two one  three ' }));

            return expect(renderer, 'to have rendered', React.createElement('div', { className: 'one two three' }));
        });

        it('matches content rendered as a number', function () {

            renderer.render(React.createElement(ClassComponent, { content: 0 }));
            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                { className: 'class-component' },
                0
            ));
        });

        it('matches content as undefined', function () {

            renderer.render(React.createElement(ClassComponent, { content: undefined }));
            return expect(renderer, 'to have rendered', React.createElement('div', { className: 'class-component' }));
        });

        it('matches content as null', function () {

            renderer.render(React.createElement(ClassComponent, { content: null }));
            return expect(renderer, 'to have rendered', React.createElement('div', { className: 'class-component' }));
        });

        it('highlights diffs on a nested custom component', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { test: true, className: 'foo' },
                    React.createElement(
                        'span',
                        { className: 'bar' },
                        'foo'
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have exactly rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        ClassComponent,
                        { className: 'foo', test: false },
                        React.createElement(
                            'span',
                            { className: 'bar' },
                            'foo'
                        )
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <ClassComponent test={true} className="foo"><span className="bar">foo</span></ClassComponent>\n' + '</div>\n' + 'to have exactly rendered\n' + '<div>\n' + '  <ClassComponent className="foo" test={false}><span className="bar">foo</span></ClassComponent>\n' + '</div>\n' + '\n' + '<div>\n' + '  <ClassComponent test={true} // expected true to equal false\n' + '     className="foo">\n' + '    <span className="bar">foo</span>\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('ignores extra props on a nested custom component when not using `exactly`', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { test: true, className: 'foo', extraProp: 'boo!' },
                    React.createElement(
                        'span',
                        { className: 'bar' },
                        'foo'
                    )
                )
            ));

            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    { className: 'foo', test: true },
                    React.createElement(
                        'span',
                        { className: 'bar' },
                        'foo'
                    )
                )
            ));
        });
        it('highlights extra props on a nested custom component when using `exactly`', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { test: true, className: 'foo', extraProp: 'boo!' },
                    React.createElement(
                        'span',
                        { className: 'bar' },
                        'foo'
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have exactly rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        ClassComponent,
                        { className: 'foo', test: true },
                        React.createElement(
                            'span',
                            { className: 'bar' },
                            'foo'
                        )
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <ClassComponent test={true} className="foo" extraProp="boo!">\n' + '    <span className="bar">foo</span>\n' + '  </ClassComponent>\n' + '</div>\n' + 'to have exactly rendered\n' + '<div>\n' + '  <ClassComponent className="foo" test={true}><span className="bar">foo</span></ClassComponent>\n' + '</div>\n' + '\n' + '<div>\n' + '  <ClassComponent test={true} className="foo" extraProp="boo!" // extraProp should be removed\n' + '  >\n' + '    <span className="bar">foo</span>\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('matches array of children in a custom component', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { test: true, className: 'foo' },
                    React.createElement(
                        'span',
                        { className: 'one' },
                        '1'
                    ),
                    React.createElement(
                        'span',
                        { className: 'two' },
                        '2'
                    )
                )
            ));

            return expect(renderer, 'to have exactly rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    { className: 'foo', test: true },
                    React.createElement(
                        'span',
                        { className: 'one' },
                        '1'
                    ),
                    React.createElement(
                        'span',
                        { className: 'two' },
                        '2'
                    )
                )
            ));
        });

        it('highlights a removed item in an array of children in a custom component', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { test: true, className: 'foo' },
                    React.createElement(
                        'span',
                        { className: 'one' },
                        '1'
                    ),
                    React.createElement(
                        'span',
                        { className: 'three' },
                        '3'
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have exactly rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        ClassComponent,
                        { className: 'foo', test: true },
                        React.createElement(
                            'span',
                            { className: 'one' },
                            '1'
                        ),
                        React.createElement(
                            'span',
                            { className: 'two' },
                            '2'
                        ),
                        React.createElement(
                            'span',
                            { className: 'three' },
                            '3'
                        )
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <ClassComponent test={true} className="foo">\n' + '    <span className="one">1</span><span className="three">3</span>\n' + '  </ClassComponent>\n' + '</div>\n' + 'to have exactly rendered\n' + '<div>\n' + '  <ClassComponent className="foo" test={true}>\n' + '    <span className="one">1</span>\n' + '    <span className="two">2</span>\n' + '    <span className="three">3</span>\n' + '  </ClassComponent>\n' + '</div>\n' + '\n' + '<div>\n' + '  <ClassComponent test={true} className="foo">\n' + '    <span className="one">1</span>\n' + '    // missing <span className="two">2</span>\n' + '    <span className="three">3</span>\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('highlights an added item in an array of children in a custom component', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { test: true, className: 'foo' },
                    React.createElement(
                        'span',
                        { key: '1', className: 'one' },
                        '1'
                    ),
                    React.createElement(
                        'span',
                        { key: '3', className: 'three' },
                        '3'
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have exactly rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        ClassComponent,
                        { className: 'foo', test: true },
                        React.createElement(
                            'span',
                            { key: '1', className: 'one' },
                            '1'
                        ),
                        React.createElement(
                            'span',
                            { key: '2', className: 'two' },
                            '2'
                        ),
                        React.createElement(
                            'span',
                            { key: '3', className: 'three' },
                            '3'
                        )
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <ClassComponent test={true} className="foo">\n' + '    <span className="one">1</span><span className="three">3</span>\n' + '  </ClassComponent>\n' + '</div>\n' + 'to have exactly rendered\n' + '<div>\n' + '  <ClassComponent className="foo" test={true}>\n' + '    <span className="one">1</span>\n' + '    <span className="two">2</span>\n' + '    <span className="three">3</span>\n' + '  </ClassComponent>\n' + '</div>\n' + '\n' + '<div>\n' + '  <ClassComponent test={true} className="foo">\n' + '    <span className="one">1</span>\n' + '    // missing <span className="two">2</span>\n' + '    <span className="three">3</span>\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('matches immutable array of children in a custom component', function () {

            var items = new Immutable.List([React.createElement(
                'span',
                { key: '1', className: 'one' },
                '1'
            ), React.createElement(
                'span',
                { key: '2', className: 'two' },
                '2'
            )]);

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { test: true, className: 'foo' },
                    items.map(function (item) {
                        return item;
                    })
                )
            ));

            return expect(renderer, 'to have exactly rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    { className: 'foo', test: true },
                    React.createElement(
                        'span',
                        { key: '1', className: 'one' },
                        '1'
                    ),
                    React.createElement(
                        'span',
                        { key: '2', className: 'two' },
                        '2'
                    )
                )
            ));
        });

        it('accepts added children at the end of an array when not using `exactly`', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { test: true, className: 'foo' },
                    React.createElement(
                        'span',
                        { className: 'one' },
                        '1'
                    ),
                    React.createElement(
                        'span',
                        { className: 'two' },
                        '2'
                    ),
                    React.createElement(
                        'span',
                        { className: 'three' },
                        '3'
                    )
                )
            ));

            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    { className: 'foo', test: true },
                    React.createElement(
                        'span',
                        { className: 'one' },
                        '1'
                    ),
                    React.createElement(
                        'span',
                        { className: 'two' },
                        '2'
                    )
                )
            ));
        });

        it('accepts added children in the middle of an array when not using `exactly`', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { test: true, className: 'foo' },
                    React.createElement(
                        'span',
                        { className: 'one' },
                        '1'
                    ),
                    React.createElement(
                        'span',
                        { className: 'two' },
                        '2'
                    ),
                    React.createElement(
                        'span',
                        { className: 'three' },
                        '3'
                    )
                )
            ));

            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    { className: 'foo', test: true },
                    React.createElement(
                        'span',
                        { className: 'one' },
                        '1'
                    ),
                    React.createElement(
                        'span',
                        { className: 'three' },
                        '3'
                    )
                )
            ));
        });

        it('highlights different typed children', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    { test: true, className: 'foo' },
                    React.createElement(ClassComponent, { child: true })
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        ClassComponent,
                        { className: 'foo', test: true },
                        React.createElement(ES5Component, { child: true })
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <ClassComponent test={true} className="foo"><ClassComponent child={true} /></ClassComponent>\n' + '</div>\n' + 'to have rendered\n' + '<div>\n' + '  <ClassComponent className="foo" test={true}><ES5Component child={true} /></ClassComponent>\n' + '</div>\n' + '\n' + '<div>\n' + '  <ClassComponent test={true} className="foo">\n' + '    <ClassComponent // should be <ES5Component\n' + '       child={true}/>\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('matches matching objects as props deeply not be reference', function () {

            var objectA = { some: 'prop', arr: [1, 2, 3] };
            var objectB = { some: 'prop', arr: [1, 2, 3] };

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(ClassComponent, { test: objectA })
            ));

            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(ClassComponent, { test: objectB })
            ));
        });

        it('highlights different objects as props deeply not be reference', function () {

            var objectA = { some: 'prop', arr: [1, 2, 3] };
            var objectB = { some: 'prop', arr: [1, 2, 4] };

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(ClassComponent, { test: objectA })
            ));

            // I don't understand the '...' here. This may change, it looks like an issue with inspect(),
            // or possibly just my understanding (or lack of), of how inspect() chooses the depth
            return expect(function () {
                return expect(renderer, 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(ClassComponent, { test: objectB })
                ));
            }, 'to throw', "expected <div><ClassComponent test={{ some: 'prop', arr: ... }} /></div>\n" + "to have rendered <div><ClassComponent test={{ some: 'prop', arr: [ 1, 2, 4 ] }} /></div>\n" + '\n' + '<div>\n' + '  <ClassComponent\n' + "     test={{ some: 'prop', arr: [ 1, 2, 3 ] }} // expected { some: 'prop', arr: [ 1, 2, 3 ] }\n" + "                                               // to satisfy { some: 'prop', arr: [ 1, 2, 4 ] }\n" + '                                               //\n' + '                                               // {\n' + "                                               //   some: 'prop',\n" + '                                               //   arr: [\n' + '                                               //     1,\n' + '                                               //     2,\n' + '                                               //     3 // should equal 4\n' + '                                               //   ]\n' + '                                               // }\n' + '  />\n' + '</div>');
        });

        it('matches a multi-text child', function () {

            var content = 'test';
            var content2 = 'test';
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some text ',
                    content
                )
            ));

            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some text ',
                    content2
                )
            ));
        });

        it('matches a multi-text child to a single text child without exactly', function () {

            var content = 'test';
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some text ',
                    content
                )
            ));

            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some text test'
                )
            ));
        });

        it('matches a multi-text child including a number to a single text child without exactly', function () {

            var content = 5;
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some ',
                    content,
                    ' value'
                )
            ));

            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some 5 value'
                )
            ));
        });

        it('matches a multi-text child including a null to a single text child without exactly', function () {

            var content = null;
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some ',
                    content,
                    ' value'
                )
            ));

            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some  value'
                )
            ));
        });

        it('matches a multi-text child including an undefined to a single text child without exactly', function () {

            var content = undefined;
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some ',
                    content,
                    ' value'
                )
            ));

            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some  value'
                )
            ));
        });

        it('matches a multi-text child including a boolean to a single text child without exactly', function () {

            var content = true;
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some ',
                    content,
                    ' value'
                )
            ));

            // An inline boolean is converted to null, so this "just works"
            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some  value'
                )
            ));
        });

        it('highlights string break-down changes in a multi-text child with `exactly`', function () {

            var content = 'test';
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some text ',
                    content
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have exactly rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        ClassComponent,
                        null,
                        'some text test'
                    )
                ));
            }, 'to throw', 'expected <div><ClassComponent>some text test</ClassComponent></div>\n' + 'to have exactly rendered <div><ClassComponent>some text test</ClassComponent></div>\n' + '\n' + '<div>\n' + '  <ClassComponent>\n' + '    some text  // -some text \n' + '               // +some text test\n' + '    test // should be removed\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('highlights changed in a multi-text child', function () {

            var content = 'foo';
            var content2 = 'bar';
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some text ',
                    content
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        ClassComponent,
                        null,
                        'some text ',
                        content2
                    )
                ));
            }, 'to throw', 'expected <div><ClassComponent>some text foo</ClassComponent></div>\n' + 'to have rendered <div><ClassComponent>some text bar</ClassComponent></div>\n' + '\n' + '<div>\n' + '  <ClassComponent>\n' + '    some text foo // -some text foo\n' + '                  // +some text bar\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('matches a mixed content child', function () {

            var content = React.createElement(ES5Component, { foo: 'bar' });
            var content2 = React.createElement(ES5Component, { foo: 'bar' });

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some text ',
                    content
                )
            ));

            return expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some text ',
                    content2
                )
            ));
        });

        it('highlights changes in a mixed content child', function () {

            var content = React.createElement(ES5Component, { foo: 'bar' });
            var content2 = React.createElement(ES5Component, { foo: 'blah' });

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some text ',
                    content
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        ClassComponent,
                        null,
                        'some text ',
                        content2
                    )
                ));
            }, 'to throw', 'expected <div><ClassComponent>some text <ES5Component foo="bar" /></ClassComponent></div>\n' + 'to have rendered <div><ClassComponent>some text <ES5Component foo="blah" /></ClassComponent></div>\n' + '\n' + '<div>\n' + '  <ClassComponent>\n' + '    some text \n' + '    <ES5Component foo="bar" // expected \'bar\' to equal \'blah\'\n' + '                            //\n' + '                            // -bar\n' + '                            // +blah\n' + '    />\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('highlights removals in multi-string content', function () {
            var content = 'test';

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    'some text'
                )
            ));
            return expect(function () {
                return expect(renderer, 'to have exactly rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        ClassComponent,
                        null,
                        'some text ',
                        content
                    )
                ));
            }, 'to throw', 'expected <div><ClassComponent>some text</ClassComponent></div>\n' + 'to have exactly rendered <div><ClassComponent>some text test</ClassComponent></div>\n' + '\n' + '<div>\n' + '  <ClassComponent>\n' + '    some text // -some text\n' + '              // +some text \n' + '    // missing test\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('highlights removals in complex content with exactly', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    React.createElement('div', { className: 'one' }),
                    React.createElement(ES5Component, { className: 'three' }),
                    React.createElement(
                        'span',
                        null,
                        'foo'
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have exactly rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        ClassComponent,
                        null,
                        React.createElement('div', { className: 'one' }),
                        React.createElement(
                            'span',
                            null,
                            'foo'
                        )
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <ClassComponent>\n' + '    <div className="one" /><ES5Component className="three" /><span>foo</span>\n' + '  </ClassComponent>\n' + '</div>\n' + 'to have exactly rendered <div><ClassComponent><div className="one" /><span>foo</span></ClassComponent></div>\n' + '\n' + '<div>\n' + '  <ClassComponent>\n' + '    <div className="one" />\n' + '    <ES5Component className="three" /> // should be removed\n' + '    <span>foo</span>\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('highlights removals in complex content with `with all children`', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    React.createElement('div', { className: 'one' }),
                    React.createElement(ES5Component, { className: 'three' }),
                    React.createElement(
                        'span',
                        null,
                        'foo'
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered with all children', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        ClassComponent,
                        null,
                        React.createElement('div', { className: 'one' }),
                        React.createElement(
                            'span',
                            null,
                            'foo'
                        )
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <ClassComponent>\n' + '    <div className="one" /><ES5Component className="three" /><span>foo</span>\n' + '  </ClassComponent>\n' + '</div>\n' + 'to have rendered with all children <div><ClassComponent><div className="one" /><span>foo</span></ClassComponent></div>\n' + '\n' + '<div>\n' + '  <ClassComponent>\n' + '    <div className="one" />\n' + '    <ES5Component className="three" /> // should be removed\n' + '    <span>foo</span>\n' + '  </ClassComponent>\n' + '</div>');
        });

        it('highlights the block removal for deep children', function () {
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'ul',
                    null,
                    React.createElement(
                        'li',
                        { key: '1' },
                        'one'
                    ),
                    React.createElement(
                        'li',
                        { key: '2' },
                        'two'
                    ),
                    React.createElement(
                        'li',
                        { key: '3' },
                        'three'
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered with all children', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'ul',
                        null,
                        React.createElement(
                            'li',
                            { key: '1' },
                            'one'
                        ),
                        React.createElement(
                            'li',
                            { key: '2' },
                            'two'
                        )
                    )
                ));
            }, 'to throw', 'expected <div><ul><li>one</li><li>two</li><li>three</li></ul></div>\n' + 'to have rendered with all children <div><ul><li>one</li><li>two</li></ul></div>\n' + '\n' + '<div>\n' + '  <ul>\n' + '    <li>one</li>\n' + '    <li>two</li>\n' + '    <li>three</li> // should be removed\n' + '  </ul>\n' + '</div>');
        });

        it('highlights the block removal when mixing hardcoded elements add generated lists', function () {
            var numbers = [React.createElement(
                'span',
                { key: '1' },
                'one'
            ), React.createElement(
                'span',
                { key: '2' },
                'two'
            ), React.createElement(
                'span',
                { key: '3' },
                'three'
            )];

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'h1',
                    null,
                    'My numbers'
                ),
                numbers
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered with all children', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'h1',
                        null,
                        'My numbers'
                    ),
                    React.createElement(
                        'span',
                        { key: '1' },
                        'one'
                    ),
                    React.createElement(
                        'span',
                        { key: '2' },
                        'two'
                    )
                ));
            }, 'to throw', 'expected <div><h1>My numbers</h1><span>one</span><span>two</span><span>three</span></div>\n' + 'to have rendered with all children <div><h1>My numbers</h1><span>one</span><span>two</span></div>\n' + '\n' + '<div>\n' + '  <h1>My numbers</h1>\n' + '  <span>one</span>\n' + '  <span>two</span>\n' + '  <span>three</span> // should be removed\n' + '</div>');
        });

        it('identifies when a string element should be a real element', function () {

            renderer.render(React.createElement(
                MyDiv,
                { className: 'outer' },
                React.createElement(
                    'span',
                    null,
                    '123'
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered with all wrappers', React.createElement(
                    'div',
                    { className: 'outer' },
                    '123'
                ));
            }, 'to throw', 'expected <div className="outer"><span>123</span></div>\n' + 'to have rendered with all wrappers <div className="outer">123</div>\n' + '\n' + '<div className="outer">\n' + '  <span> // wrapper should be removed\n' + '    123\n' + '  </span> // wrapper should be removed\n' + '</div>');
        });

        it('identifies when a number element should be a real element', function () {

            renderer.render(React.createElement(
                MyDiv,
                { className: 'outer' },
                React.createElement(
                    'span',
                    null,
                    123
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered with all wrappers', React.createElement(
                    'div',
                    { className: 'outer' },
                    123
                ));
            }, 'to throw', 'expected <div className="outer"><span>123</span></div>\n' + 'to have rendered with all wrappers <div className="outer">123</div>\n' + '\n' + '<div className="outer">\n' + '  <span> // wrapper should be removed\n' + '    123\n' + '  </span> // wrapper should be removed\n' + '</div>');
        });

        it('identifies when a real element should be a string element', function () {

            renderer.render(React.createElement(
                MyDiv,
                { className: 'outer' },
                '123'
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered', React.createElement(
                    'div',
                    { className: 'outer' },
                    React.createElement(
                        'span',
                        null,
                        '123'
                    )
                ));
            }, 'to throw', 'expected <div className="outer">123</div>\n' + 'to have rendered <div className="outer"><span>123</span></div>\n' + '\n' + '<div className="outer">\n' + '  123 // should be <span>123</span>\n' + '</div>');
        });

        it('identifies when a real element should be a number element', function () {

            renderer.render(React.createElement(
                MyDiv,
                { className: 'outer' },
                123
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered', React.createElement(
                    'div',
                    { className: 'outer' },
                    React.createElement(
                        'span',
                        null,
                        '123'
                    )
                ));
            }, 'to throw', 'expected <div className="outer">123</div>\n' + 'to have rendered <div className="outer"><span>123</span></div>\n' + '\n' + '<div className="outer">\n' + '  123 // should be <span>123</span>\n' + '</div>');
        });

        it('ignores components that render null in an array when using `with all children`', function () {

            var RenderNull = React.createClass({
                displayName: 'RenderNull',


                render: function render() {

                    var children = [React.createElement(
                        'span',
                        { key: '1' },
                        'one'
                    ), null, React.createElement(
                        'span',
                        { key: '2' },
                        'two'
                    )];
                    return React.createElement(
                        'div',
                        { className: 'something' },
                        children
                    );
                }
            });
            renderer.render(React.createElement(RenderNull, null));
            return expect(renderer, 'to have rendered with all children', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    null,
                    'one'
                ),
                React.createElement(
                    'span',
                    null,
                    'two'
                )
            ));
        });

        it('ignores null children when using `with all children`', function () {

            var RenderNull = React.createClass({
                displayName: 'RenderNull',


                render: function render() {

                    return React.createElement(
                        'div',
                        null,
                        null
                    );
                }
            });
            renderer.render(React.createElement(RenderNull, null));

            return expect(renderer, 'to have rendered with all children', React.createElement('div', null));
        });

        it("highlights when an element renders children when it shouldn't when using `with all children`", function () {

            var RenderNull = React.createClass({
                displayName: 'RenderNull',


                render: function render() {

                    return React.createElement(
                        'div',
                        null,
                        React.createElement('span', null)
                    );
                }
            });
            renderer.render(React.createElement(RenderNull, null));

            return expect(function () {
                return expect(renderer, 'to have rendered with all children', React.createElement('div', null));
            }, 'to throw', 'expected <div><span /></div> to have rendered with all children <div />\n' + '\n' + '<div>\n' + '  <span /> // should be removed\n' + '</div>');
        });
    });

    describe('`to equal`', function () {

        it('matches renderer output to a component tree', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(ClassComponent, { className: 'foo' })
            ));
            return expect(renderer.getRenderOutput(), 'to equal', React.createElement(
                'div',
                null,
                React.createElement(ClassComponent, { className: 'foo' })
            ));
        });

        it('outputs a diff when the expected is different', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(ClassComponent, { className: 'foo' })
            ));

            return expect(function () {
                return expect(renderer.getRenderOutput(), 'to equal', React.createElement(
                    'div',
                    null,
                    React.createElement(ClassComponent, { className: 'foobar' })
                ));
            }, 'to throw', 'expected <div><ClassComponent className="foo" /></div>\n' + 'to equal <div><ClassComponent className="foobar" /></div>\n' + '\n' + '<div>\n' + '  <ClassComponent className="foo" // expected \'foo\' to equal \'foobar\'\n' + '                                  //\n' + '                                  // -foo\n' + '                                  // +foobar\n' + '  />\n' + '</div>');
        });
    });

    describe('contains', function () {

        it('finds an match at the top level', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(ClassComponent, { className: 'foo' })
            ));
            return expect(renderer, 'to contain', React.createElement(
                'div',
                null,
                React.createElement(ClassComponent, { className: 'foo' })
            ));
        });

        it('finds a match at a deeper level', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'foo' })
                )
            ));
            return expect(renderer, 'to contain', React.createElement(ClassComponent, { className: 'foo' }));
        });

        it('finds a string content', function () {
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'some content one'
                ),
                React.createElement(
                    'span',
                    null,
                    'some content two'
                )
            ));
            return expect(renderer, 'to contain', 'some content two');
        });

        it('does not find a string that does not exist', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'some content one'
                ),
                React.createElement(
                    'span',
                    null,
                    'some content two'
                )
            ));
            return expect(function () {
                return expect(renderer, 'to contain', 'some content three');
            }, 'to throw', 'expected <div><span>some content one</span><span>some content two</span></div>\n' + "to contain 'some content three'\n" + '\n' + 'the best match was\n' + 'some content one // -some content one\n' + '                 // +some content three');
        });

        it('does not find a partial string', function () {

            // To do this now, you can use an `expect.it(...)` block
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'some content one'
                ),
                React.createElement(
                    'span',
                    null,
                    'some content two'
                )
            ));
            return expect(function () {
                return expect(renderer, 'to contain', 'some content');
            }, 'to throw', 'expected <div><span>some content one</span><span>some content two</span></div>\n' + "to contain 'some content'\n" + '\n' + 'the best match was\n' + 'some content one // -some content one\n' + '                 // +some content');
        });

        it('finds a multi-part string', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'button clicked ',
                    5,
                    ' times'
                )
            ));
            return expect(renderer, 'to contain', 'button clicked 5 times');
        });

        it('does not find a multi-part string when `exactly` is used', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'button clicked ',
                    5,
                    ' times'
                )
            ));
            return expect(function () {
                return expect(renderer, 'to contain exactly', 'button clicked 5 times');
            }, 'to throw', 'expected <div><span>button clicked 5 times</span></div>\n' + "to contain exactly 'button clicked 5 times'\n" + '\n' + 'the best match was\n' + 'button clicked  // -button clicked \n' + '                // +button clicked 5 times');
        });

        it('does not find a part of a multi-part string', function () {

            // See the 'does not find a partial string' test above
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'button clicked ',
                    5,
                    ' times'
                )
            ));

            return expect(function () {
                return expect(renderer, 'to contain', 'button clicked ');
            }, 'to throw', 'expected <div><span>button clicked 5 times</span></div>\n' + "to contain 'button clicked '\n" + '\n' + 'the best match was\n' + 'button clicked 5 times // -button clicked 5 times\n' + '                       // +button clicked ');
        });

        it('finds part of a multi-part string when exactly is used', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'button clicked ',
                    5,
                    ' times'
                )
            ));
            return expect(renderer, 'to contain exactly', 'button clicked ');
        });

        it('finds a match in an array of children', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'nested'
                ),
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'bar' }),
                    React.createElement(ClassComponent, { className: 'foo' }),
                    React.createElement(ClassComponent, { className: 'cheese' })
                )
            ));
            return expect(renderer, 'to contain', React.createElement(ClassComponent, { className: 'foo' }));
        });

        it('does not find a match when it does not exist', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'nested'
                ),
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'bar' }),
                    React.createElement(ClassComponent, { className: 'foo' }),
                    React.createElement(ClassComponent, { className: 'cheese' })
                )
            ));

            return expect(function () {
                return expect(renderer, 'to contain', React.createElement(ClassComponent, { className: 'notexists' }));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <span>nested</span>\n' + '  <span>\n' + '    <ClassComponent className="bar" />\n' + '    <ClassComponent className="foo" />\n' + '    <ClassComponent className="cheese" />\n' + '  </span>\n' + '</div>\n' + 'to contain <ClassComponent className="notexists" />\n' + '\n' + 'the best match was\n' + '<ClassComponent className="bar" // missing class \'notexists\'\n' + '/>');
        });

        it('does not find a match when the children of a candidate match are different', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'nested'
                ),
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'bar' }),
                    React.createElement(ClassComponent, { className: 'foo' }),
                    React.createElement(
                        ClassComponent,
                        { className: 'candidate' },
                        React.createElement(
                            'span',
                            null,
                            'something else'
                        )
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to contain', React.createElement(
                    ClassComponent,
                    { className: 'candidate' },
                    React.createElement(
                        'span',
                        null,
                        'cheese'
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <span>nested</span>\n' + '  <span>\n' + '    <ClassComponent className="bar" />\n' + '    <ClassComponent className="foo" />\n' + '    <ClassComponent className="candidate"><span>something else</span></ClassComponent>\n' + '  </span>\n' + '</div>\n' + 'to contain <ClassComponent className="candidate"><span>cheese</span></ClassComponent>\n' + '\n' + 'the best match was\n' + '<ClassComponent className="candidate">\n' + '  <span>\n' + '    something else // -something else\n' + '                   // +cheese\n' + '  </span>\n' + '</ClassComponent>');
        });

        it('finds the match when there are extra children in the render, but `exactly` is not used', function () {
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'nested'
                ),
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'bar' }),
                    React.createElement(ClassComponent, { className: 'foo' }),
                    React.createElement(
                        ClassComponent,
                        { className: 'candidate' },
                        React.createElement(
                            'span',
                            null,
                            'one'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'two'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'three'
                        )
                    )
                )
            ));

            return expect(renderer, 'to contain', React.createElement(
                ClassComponent,
                { className: 'candidate' },
                React.createElement(
                    'span',
                    null,
                    'one'
                ),
                React.createElement(
                    'span',
                    null,
                    'three'
                )
            ));
        });

        it('finds the match when there are extra props in the render, but `exactly` is not used', function () {
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'nested'
                ),
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'bar' }),
                    React.createElement(ClassComponent, { className: 'foo' }),
                    React.createElement(ClassComponent, { className: 'candidate', id: '123' })
                )
            ));

            return expect(renderer, 'to contain', React.createElement(ClassComponent, { className: 'candidate' }));
        });

        it('does not find a match when there are extra props in the render, and `exactly` is used', function () {
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'nested'
                ),
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'bar' }),
                    React.createElement(ClassComponent, { className: 'foo' }),
                    React.createElement(ClassComponent, { className: 'candidate', id: '123' })
                )
            ));

            return expect(function () {
                return expect(renderer, 'to contain exactly', React.createElement(ClassComponent, { className: 'candidate' }));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <span>nested</span>\n' + '  <span>\n' + '    <ClassComponent className="bar" />\n' + '    <ClassComponent className="foo" />\n' + '    <ClassComponent className="candidate" id="123" />\n' + '  </span>\n' + '</div>\n' + 'to contain exactly <ClassComponent className="candidate" />\n' + '\n' + 'the best match was\n' + '<ClassComponent className="candidate" id="123" // id should be removed\n' + '/>');
        });

        it('does not find a match when there are extra children in the render, and `exactly` is used', function () {
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'nested'
                ),
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'bar' }),
                    React.createElement(ClassComponent, { className: 'foo' }),
                    React.createElement(
                        ClassComponent,
                        { className: 'candidate' },
                        React.createElement(
                            'span',
                            null,
                            'one'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'two'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'three'
                        )
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to contain exactly', React.createElement(
                    ClassComponent,
                    { className: 'candidate' },
                    React.createElement(
                        'span',
                        null,
                        'one'
                    ),
                    React.createElement(
                        'span',
                        null,
                        'three'
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <span>nested</span>\n' + '  <span>\n' + '    <ClassComponent className="bar" />\n' + '    <ClassComponent className="foo" />\n' + '    <ClassComponent className="candidate">\n' + '      <span>one</span><span>two</span><span>three</span>\n' + '    </ClassComponent>\n' + '  </span>\n' + '</div>\n' + 'to contain exactly <ClassComponent className="candidate"><span>one</span><span>three</span></ClassComponent>\n' + '\n' + 'the best match was\n' + '<ClassComponent className="candidate">\n' + '  <span>one</span>\n' + '  <span>two</span> // should be removed\n' + '  <span>three</span>\n' + '</ClassComponent>');
        });

        it('does not find a match when there are extra children in the render, and `with all children` is used', function () {
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'nested'
                ),
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'bar' }),
                    React.createElement(ClassComponent, { className: 'foo' }),
                    React.createElement(
                        ClassComponent,
                        { className: 'candidate' },
                        React.createElement(
                            'span',
                            null,
                            'one'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'two'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'three'
                        )
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to contain with all children', React.createElement(
                    ClassComponent,
                    { className: 'candidate' },
                    React.createElement(
                        'span',
                        null,
                        'one'
                    ),
                    React.createElement(
                        'span',
                        null,
                        'three'
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <span>nested</span>\n' + '  <span>\n' + '    <ClassComponent className="bar" />\n' + '    <ClassComponent className="foo" />\n' + '    <ClassComponent className="candidate">\n' + '      <span>one</span><span>two</span><span>three</span>\n' + '    </ClassComponent>\n' + '  </span>\n' + '</div>\n' + 'to contain with all children <ClassComponent className="candidate"><span>one</span><span>three</span></ClassComponent>\n' + '\n' + 'the best match was\n' + '<ClassComponent className="candidate">\n' + '  <span>one</span>\n' + '  <span>two</span> // should be removed\n' + '  <span>three</span>\n' + '</ClassComponent>');
        });

        it('finds a match when the render contains children, but the expected does not, and `exactly` is not used', function () {
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'nested'
                ),
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'bar' }),
                    React.createElement(ClassComponent, { className: 'foo' }),
                    React.createElement(
                        ClassComponent,
                        { className: 'candidate' },
                        React.createElement(
                            'span',
                            null,
                            'one'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'two'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'three'
                        )
                    )
                )
            ));

            return expect(renderer, 'to contain', React.createElement(ClassComponent, { className: 'candidate' }));
        });

        it('does not find a match when the render contains children, but the expected does not, and `exactly` is used', function () {
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'nested'
                ),
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'bar' }),
                    React.createElement(ClassComponent, { className: 'foo' }),
                    React.createElement(
                        ClassComponent,
                        { className: 'candidate' },
                        React.createElement(
                            'span',
                            null,
                            'one'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'two'
                        ),
                        React.createElement(
                            'span',
                            null,
                            'three'
                        )
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to contain exactly', React.createElement(ClassComponent, { className: 'candidate' }));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <span>nested</span>\n' + '  <span>\n' + '    <ClassComponent className="bar" />\n' + '    <ClassComponent className="foo" />\n' + '    <ClassComponent className="candidate">\n' + '      <span>one</span><span>two</span><span>three</span>\n' + '    </ClassComponent>\n' + '  </span>\n' + '</div>\n' + 'to contain exactly <ClassComponent className="candidate" />\n' + '\n' + 'the best match was\n' + '<ClassComponent className="bar" // expected \'bar\' to equal \'candidate\'\n' + '                                //\n' + '                                // -bar\n' + '                                // +candidate\n' + '/>');
        });

        it('does not find a match if the expected has children, but the candidate match does not', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'nested'
                ),
                React.createElement(
                    'span',
                    null,
                    React.createElement(ClassComponent, { className: 'bar' }),
                    React.createElement(ClassComponent, { className: 'candidate' })
                )
            ));

            return expect(function () {
                return expect(renderer, 'to contain', React.createElement(
                    ClassComponent,
                    { className: 'candidate' },
                    React.createElement(
                        'span',
                        null,
                        'foo'
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <span>nested</span>\n' + '  <span>\n' + '    <ClassComponent className="bar" /><ClassComponent className="candidate" />\n' + '  </span>\n' + '</div>\n' + 'to contain <ClassComponent className="candidate"><span>foo</span></ClassComponent>\n' + '\n' + 'the best match was\n' + '<ClassComponent className="candidate">\n' + '  // missing <span>foo</span>\n' + '</ClassComponent>');
        });

        it('matches even with removals in complex content without `exactly`', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    React.createElement(MyDiv, { className: 'one' }),
                    React.createElement(ES5Component, { className: 'three' }),
                    React.createElement(
                        'span',
                        null,
                        'foo'
                    )
                )
            ));

            return expect(renderer, 'to contain', React.createElement(
                ClassComponent,
                null,
                React.createElement(MyDiv, { className: 'one' }),
                React.createElement(
                    'span',
                    null,
                    'foo'
                )
            ));
        });

        it('does not match with a removal and an addition in complex content with `exactly`', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    ClassComponent,
                    null,
                    React.createElement('div', { className: 'one' }),
                    React.createElement(ES5Component, { className: 'three' }),
                    React.createElement(
                        'span',
                        null,
                        'foo'
                    )
                )
            ));

            return expect(function () {
                return expect(renderer, 'to contain exactly', React.createElement(
                    ClassComponent,
                    null,
                    React.createElement('div', { className: 'one' }),
                    React.createElement(ClassComponent, { className: 'three' }),
                    React.createElement(
                        'span',
                        null,
                        'foo'
                    )
                ));
            }, 'to throw', 'expected\n' + '<div>\n' + '  <ClassComponent>\n' + '    <div className="one" /><ES5Component className="three" /><span>foo</span>\n' + '  </ClassComponent>\n' + '</div>\n' + 'to contain exactly\n' + '<ClassComponent>\n' + '  <div className="one" /><ClassComponent className="three" /><span>foo</span>\n' + '</ClassComponent>\n' + '\n' + 'the best match was\n' + '<ClassComponent>\n' + '  <div className="one" />\n' + '  <ES5Component // should be <ClassComponent\n' + '     className="three"/>\n' + '  <span>foo</span>\n' + '</ClassComponent>');
        });
    });

    describe('not contains', function () {

        beforeEach(function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement('span', { id: 'foo', className: 'extra' })
            ));
        });

        it('passes when the content is not found', function () {

            return expect(renderer, 'not to contain', React.createElement('span', { id: 'bar' }));
        });

        it('outputs the match found when content is found', function () {

            return expect(function () {
                return expect(renderer, 'not to contain', React.createElement('span', { id: 'foo' }));
            }, 'to throw', 'expected <div><span id="foo" className="extra" /></div>\n' + 'not to contain <span id="foo" />\n' + '\n' + 'but found the following match\n' + '<span id="foo" className="extra" />');
        });
    });

    describe('to satisfy', function () {

        describe('renderOutput', function () {

            it('should satisfy a matching output', function () {

                renderer.render(React.createElement(
                    MyDiv,
                    null,
                    React.createElement(
                        'span',
                        { className: 'one' },
                        'foo'
                    ),
                    React.createElement(
                        'span',
                        { className: 'two' },
                        'bar'
                    )
                ));

                return expect(renderer.getRenderOutput(), 'to satisfy', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        null,
                        'foo'
                    ),
                    React.createElement(
                        'span',
                        null,
                        'bar'
                    )
                ));
            });
        });
    });

    describe('with expect.it', function () {

        it('throws when expect.it fails', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'some Text'
                )
            ));

            return expect(function () {
                return expect(renderer, 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        null,
                        expect.it('to match', /a-z /)
                    )
                ));
            }, 'to throw', 'expected <div><span>some Text</span></div>\n' + 'to have rendered <div><span>{expect.it(\'to match\', /a-z /)}</span></div>\n' + '\n' + '<div>\n' + '  <span>\n' + '    some Text // expected \'some Text\' to match /a-z /\n' + '  </span>\n' + '</div>');
        });

        it('returns a rejected promise when expect.it is async and fails', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'some Text'
                )
            ));

            return expect(expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    null,
                    expect.it('to eventually equal', 'something different')
                )
            )), 'to be rejected with', 'expected <div><span>some Text</span></div>\n' + 'to have rendered <div><span>{expect.it(\'to eventually equal\', \'something different\')}</span></div>\n' + '\n' + '<div>\n' + '  <span>\n' + '    some Text // expected \'some Text\' to eventually equal \'something different\'\n' + '  </span>\n' + '</div>');
        });

        it('returns a resolved promise when expect.it is async and passes', function () {

            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'some Text'
                )
            ));

            return expect(expect(renderer, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    null,
                    expect.it('to eventually equal', 'some Text')
                )
            )), 'to be fulfilled');
        });

        it('returns a resolved promise when expect.it is async and passes for `contains`', function () {
            renderer.render(React.createElement(
                MyDiv,
                null,
                React.createElement(
                    'span',
                    null,
                    'some Text'
                )
            ));
            expect(renderer, 'to contain', React.createElement(
                'span',
                null,
                expect.it('to eventually equal', 'some Text')
            ));

            return expect(expect(renderer, 'to contain', React.createElement(
                'span',
                null,
                expect.it('to eventually equal', 'some Text')
            )), 'to be fulfilled');
        });
    });

    describe('queried for', function () {

        it('finds an element in a tree', function () {

            renderer.render(React.createElement(
                MyDiv,
                { className: 'foo' },
                React.createElement(
                    MyDiv,
                    { className: 'bar' },
                    React.createElement(
                        'span',
                        null,
                        'bar'
                    )
                ),
                React.createElement(
                    MyDiv,
                    { className: 'baz' },
                    React.createElement(
                        'span',
                        null,
                        'baz'
                    )
                )
            ));

            expect(renderer.getRenderOutput(), 'queried for', React.createElement(MyDiv, { className: 'bar' }), 'to have rendered', React.createElement(
                MyDiv,
                { className: 'bar' },
                React.createElement(
                    'span',
                    null,
                    'bar'
                )
            ));
        });

        it('using the renderer finds an element in a tree', function () {

            renderer.render(React.createElement(
                MyDiv,
                { className: 'foo' },
                React.createElement(
                    MyDiv,
                    { className: 'bar' },
                    React.createElement(
                        'span',
                        null,
                        'bar'
                    )
                ),
                React.createElement(
                    MyDiv,
                    { className: 'baz' },
                    React.createElement(
                        'span',
                        null,
                        'baz'
                    )
                )
            ));

            expect(renderer, 'queried for', React.createElement(MyDiv, { className: 'bar' }), 'to have rendered', React.createElement(
                MyDiv,
                { className: 'bar' },
                React.createElement(
                    'span',
                    null,
                    'bar'
                )
            ));
        });

        it('errors when no component is found', function () {

            renderer.render(React.createElement(
                MyDiv,
                { className: 'foo' },
                React.createElement(
                    MyDiv,
                    { className: 'bar' },
                    React.createElement(
                        'span',
                        null,
                        'bar'
                    )
                ),
                React.createElement(
                    MyDiv,
                    { className: 'baz' },
                    React.createElement(
                        'span',
                        null,
                        'baz'
                    )
                )
            ));

            expect(function () {
                return expect(renderer, 'queried for', React.createElement(MyDiv, { className: 'not exists' }), 'to have rendered', React.createElement(
                    MyDiv,
                    { className: 'bar' },
                    React.createElement(
                        'span',
                        null,
                        'bar'
                    )
                ));
            }, 'to throw', 'expected\n' + '<div className="foo">\n' + '  <MyDiv className="bar"><span>bar</span></MyDiv>\n' + '  <MyDiv className="baz"><span>baz</span></MyDiv>\n' + '</div>\n' + 'queried for <MyDiv className="not exists" /> to have rendered <MyDiv className="bar"><span>bar</span></MyDiv>\n' + '\n' + '`queried for` found no match.  The best match was\n' + '<MyDiv className="bar" // missing classes \'not exists\'\n' + '>\n' + '  <span>bar</span>\n' + '</MyDiv>');
        });

        it('locates with an async expect.it', function () {

            renderer.render(React.createElement(
                MyDiv,
                { className: 'foo' },
                React.createElement(
                    MyDiv,
                    { className: 'bar' },
                    React.createElement(
                        'span',
                        null,
                        'bar'
                    )
                ),
                React.createElement(
                    MyDiv,
                    { className: 'baz' },
                    React.createElement(
                        'span',
                        null,
                        'baz'
                    )
                )
            ));

            return expect(renderer, 'queried for', React.createElement(MyDiv, { className: expect.it('to eventually equal', 'bar') }), 'to have rendered', React.createElement(
                MyDiv,
                { className: 'bar' },
                React.createElement(
                    'span',
                    null,
                    'bar'
                )
            ));
        });

        it('passes the component as the resolution of the promise', function () {
            renderer.render(React.createElement(
                MyDiv,
                { className: 'foo' },
                React.createElement(
                    MyDiv,
                    { className: 'bar' },
                    React.createElement(
                        'span',
                        null,
                        'bar'
                    )
                ),
                React.createElement(
                    MyDiv,
                    { className: 'baz' },
                    React.createElement(
                        'span',
                        null,
                        'baz'
                    )
                )
            ));
            return expect(renderer, 'queried for', React.createElement(MyDiv, { className: 'bar' })).then(function (element) {
                expect(element.props, 'to satisfy', {
                    className: 'bar'
                });
            });
        });

        it('passes the `queryTarget` forward as the target of the query', function () {
            renderer.render(React.createElement(
                MyDiv,
                { className: 'foo' },
                React.createElement(
                    MyDiv,
                    { className: 'bar' },
                    React.createElement(
                        'span',
                        null,
                        'bar'
                    )
                ),
                React.createElement(
                    MyDiv,
                    { className: 'baz' },
                    React.createElement(
                        'span',
                        null,
                        'baz'
                    )
                )
            ));
            expect(renderer, 'queried for', React.createElement(
                MyDiv,
                { className: 'bar' },
                React.createElement('span', { queryTarget: true })
            ), 'to have exactly rendered', React.createElement(
                'span',
                null,
                'bar'
            ));
        });
    });

    describe('with events', function () {

        var ClickableComponent = void 0;

        beforeEach(function () {
            ClickableComponent = React.createClass({
                displayName: 'ClickableComponent',
                getInitialState: function getInitialState() {
                    return {
                        clickCount: 0,
                        itemClickCount: 0
                    };
                },
                handleMainClick: function handleMainClick() {
                    this.setState({
                        clickCount: this.state.clickCount + 1
                    });
                },
                handleItemClick: function handleItemClick(e) {
                    this.setState({
                        itemClickCount: this.state.itemClickCount + (e && e.increment || 1)
                    });
                },
                handleAliensLanded: function handleAliensLanded(args) {
                    this.setState({
                        clickCount: this.state.clickCount + (args && args.increment || 10)
                    });
                },
                render: function render() {
                    return React.createElement(
                        'div',
                        { onClick: this.handleMainClick, onAliensLanded: this.handleAliensLanded },
                        React.createElement(
                            'span',
                            { className: 'main-click' },
                            'Main clicked ',
                            this.state.clickCount
                        ),
                        React.createElement(
                            'span',
                            { className: 'item-click testfoo testbar',
                                onClick: this.handleItemClick },
                            'Item clicked ',
                            this.state.itemClickCount
                        )
                    );
                }
            });
        });

        it('calls click on a component', function () {
            renderer.render(React.createElement(ClickableComponent, null));

            expect(renderer, 'with event', 'click', 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'main-click' },
                    'Main clicked 1'
                )
            ));
        });

        it('calls click on a part of a component', function () {
            renderer.render(React.createElement(ClickableComponent, null));

            expect(renderer, 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' }), 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'item-click' },
                    'Item clicked 1'
                )
            ));
        });

        it('errors with a helpful error message when the event is not known', function () {
            renderer.render(React.createElement(ClickableComponent, null));
            var textExpect = expect.clone();
            textExpect.outputFormat('text');

            expect(function () {
                return textExpect(renderer, 'with event', 'foo', 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        { className: 'item-click' },
                        'Item clicked 1'
                    )
                ));
            }, 'to throw', /No handler function prop 'onFoo' on the target element/);
        });

        it('calls non-standard events', function () {
            renderer.render(React.createElement(ClickableComponent, null));

            expect(renderer, 'with event', 'aliensLanded', 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'main-click' },
                    'Main clicked 10'
                )
            ));
        });

        it('calls events with event parameters', function () {
            renderer.render(React.createElement(ClickableComponent, null));

            expect(renderer, 'with event', 'aliensLanded', { increment: 1000 }, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'main-click' },
                    'Main clicked 1000'
                )
            ));
        });

        it('calls events with event parameters with `to contain`', function () {
            renderer.render(React.createElement(ClickableComponent, null));

            expect(renderer, 'with event', 'aliensLanded', { increment: 1000 }, 'to contain', React.createElement(
                'span',
                { className: 'main-click' },
                'Main clicked 1000'
            ));
        });

        it('calls events with event parameters with `not to contain`', function () {
            renderer.render(React.createElement(ClickableComponent, null));

            expect(renderer, 'with event', 'aliensLanded', { increment: 1000 }, 'not to contain', React.createElement(
                'span',
                { className: 'main-click' },
                'Does not exist'
            ));
        });

        it('calls events with event parameters with `to contain with all children`', function () {
            renderer.render(React.createElement(ClickableComponent, null));

            expect(renderer, 'with event', 'aliensLanded', { increment: 1000 }, 'to contain with all children', React.createElement(
                'span',
                { className: 'main-click' },
                'Main clicked 1000'
            ));
        });

        it('calls events with event parameters with `queried for`', function () {
            renderer.render(React.createElement(ClickableComponent, null));

            expect(renderer, 'with event', 'aliensLanded', { increment: 1000 }, 'queried for', React.createElement('span', { className: 'main-click' }), 'to have rendered', React.createElement(
                'span',
                { className: 'main-click' },
                'Main clicked 1000'
            ));
        });

        it('errors with a helpful error message when the event target cannot be found', function () {

            renderer.render(React.createElement(ClickableComponent, null));

            expect(function () {
                return expect(renderer, 'with event', 'aliensLanded', { increment: 1000 }, 'on', React.createElement('span', { className: 'not-exists' }), 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        { className: 'main-click' },
                        'Main clicked 1000'
                    )
                ));
            }, 'to throw', 'expected\n' + '<div onClick={function bound handleMainClick() { /* native code */ }}\n' + '   onAliensLanded={function bound handleAliensLanded() { /* native code */ }}>\n' + '  <span className="main-click">Main clicked 0</span>\n' + '  <span className="item-click testfoo testbar"\n' + '     onClick={function bound handleItemClick() { /* native code */ }}>\n' + '    Item clicked 0\n' + '  </span>\n' + '</div>\n' + 'with event \'aliensLanded\', { increment: 1000 } on <span className="not-exists" /> to have rendered <div><span className="main-click">Main clicked 1000</span></div>\n' + '\n' + 'Could not find the target for the event. The best match was\n' + '\n' + '<span className="main-click" // missing class \'not-exists\'\n' + '>\n' + '  Main clicked 0\n' + '</span>');
        });

        it('triggers events on raw components without a renderer', function () {

            expect(React.createElement(ClickableComponent, null), 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' }), 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'item-click' },
                    'Item clicked 1'
                )
            ));
        });

        it('allows concatenating the event with the `with event`', function () {

            expect(React.createElement(ClickableComponent, null), 'with event click', 'on', React.createElement('span', { className: 'item-click' }), 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'item-click' },
                    'Item clicked 1'
                )
            ));
        });

        it('allows triggering multiple events', function () {

            expect(React.createElement(ClickableComponent, null), 'with event click', 'on', React.createElement('span', { className: 'item-click' }), 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' }), 'with event', 'click', 'on', React.createElement('span', { className: 'item-click' }), 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'item-click' },
                    'Item clicked 3'
                )
            ));
        });

        it('allows triggering multiple events with `and` and event args', function () {

            expect(React.createElement(ClickableComponent, null), 'with event aliensLanded', { increment: 2 }, 'and with event aliensLanded', { increment: 4 }, 'and with event aliensLanded', { increment: 8 }, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'main-click' },
                    'Main clicked 14'
                )
            ));
        });

        it('triggers events with arguments on raw components without a renderer', function () {

            expect(React.createElement(ClickableComponent, null), 'with event', 'aliensLanded', { increment: 42 }, 'to have rendered', React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    { className: 'main-click' },
                    'Main clicked 42'
                )
            ));
        });

        it('passes the renderer with the event triggered as the fulfillment of the promise', function () {

            expect(React.createElement(ClickableComponent, null), 'with event', 'click').then(function (renderer) {
                expect(renderer, 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        { className: 'main-click' },
                        'Main clicked 1'
                    )
                ));
            });
        });

        it('passes the renderer with the event triggered as the fulfillment of the promise with event args', function () {

            expect(React.createElement(ClickableComponent, null), 'with event', 'aliensLanded', { increment: 5 }).then(function (renderer) {
                expect(renderer.getRenderOutput(), 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        { className: 'main-click' },
                        'Main clicked 5'
                    )
                ));
            });
        });

        it('passes the renderer with the event triggered as the fulfillment of the promise with event args and `on`', function () {

            expect(React.createElement(ClickableComponent, null), 'with event', 'click', { increment: 5 }, 'on', React.createElement('span', { className: 'item-click' })).then(function (renderer) {
                // Using getRenderOutput() here to validate that the renderer and not the pending event wrapper is forwarded
                expect(renderer.getRenderOutput(), 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        { className: 'item-click' },
                        'Item clicked 5'
                    )
                ));
            });
        });

        it('passes the renderer with the event triggered as the fulfillment of the promise with multiple events', function () {

            return expect(React.createElement(ClickableComponent, null), 'with event', 'click', { increment: 5 }, 'on', React.createElement('span', { className: 'item-click' }), 'and with event', 'aliensLanded', { increment: 7 }).then(function (renderer) {
                // Using getRenderOutput() here to validate that the renderer and not the pending event wrapper is forwarded
                expect(renderer.getRenderOutput(), 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        { className: 'main-click' },
                        'Main clicked 7'
                    ),
                    React.createElement(
                        'span',
                        { className: 'item-click' },
                        'Item clicked 5'
                    )
                ));
            });
        });

        it('uses `eventTarget` prop to call an event on a sub component', function () {

            return expect(React.createElement(ClickableComponent, null), 'with event', 'click', { increment: 5 }, 'on', React.createElement(
                'div',
                null,
                React.createElement('span', { className: 'item-click', eventTarget: true })
            ), 'with event', 'aliensLanded', { increment: 7 }).then(function (renderer) {
                // Using getRenderOutput() here to validate that the renderer and not the pending event wrapper is forwarded
                expect(renderer.getRenderOutput(), 'to have rendered', React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'span',
                        { className: 'main-click' },
                        'Main clicked 7'
                    ),
                    React.createElement(
                        'span',
                        { className: 'item-click' },
                        'Item clicked 5'
                    )
                ));
            });
        });
    });
});