'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.triggerEvent = exports.installInto = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _unexpectedHtmllike = require('unexpected-htmllike');

var _unexpectedHtmllike2 = _interopRequireDefault(_unexpectedHtmllike);

var _unexpectedHtmllikeReactrenderedAdapter = require('unexpected-htmllike-reactrendered-adapter');

var _unexpectedHtmllikeReactrenderedAdapter2 = _interopRequireDefault(_unexpectedHtmllikeReactrenderedAdapter);

var _unexpectedHtmllikeJsxAdapter = require('unexpected-htmllike-jsx-adapter');

var _unexpectedHtmllikeJsxAdapter2 = _interopRequireDefault(_unexpectedHtmllikeJsxAdapter);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _testUtils = require('react-dom/test-utils');

var _testUtils2 = _interopRequireDefault(_testUtils);

var _reactDom = require('react-dom');

var _AssertionGenerator = require('./AssertionGenerator');

var _AssertionGenerator2 = _interopRequireDefault(_AssertionGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function checkAttached(expect) {
    if (!_reactRenderHook2.default.isAttached) {
        expect.errorMode = 'bubble';
        expect.fail(function (output) {
            return output.error('The global rendering hook is not attached').nl().text('This probably means React was required before unexpected-react. Check that unexpected-react is required first');
        });
    }
}

function triggerEvent(expect, component, target, eventName, eventArgs) {
    var componentData = void 0;
    if (component && component.element && component.data && component.data.type && component.data.nodeType) {
        componentData = component;
    } else {
        componentData = _reactRenderHook2.default.findComponent(component);
    }
    var targetDOM = (0, _reactDom.findDOMNode)(componentData.element.getPublicInstance());
    if (target) {
        targetDOM = (0, _reactDom.findDOMNode)(target.element.getPublicInstance());
    }
    if (typeof _testUtils2.default.Simulate[eventName] !== 'function') {

        return expect.fail({
            diff: function diff(output) {
                return output.error('Event ').text("'" + eventName + "'").error(' is not supported by TestUtils.Simulate');
            }
        });
    }
    _testUtils2.default.Simulate[eventName](targetDOM, eventArgs);
}

function installInto(expect) {

    var assertionGenerator = new _AssertionGenerator2.default({
        ActualAdapter: _unexpectedHtmllikeReactrenderedAdapter2.default,
        QueryAdapter: _unexpectedHtmllikeJsxAdapter2.default,
        ExpectedAdapter: _unexpectedHtmllikeJsxAdapter2.default,
        actualTypeName: 'RenderedReactElement',
        queryTypeName: 'ReactElement',
        expectedTypeName: 'ReactElement',
        getRenderOutput: function getRenderOutput(component) {
            if (component && component.element && component.data && component.data.type && component.data.nodeType) {
                // The component is already the data node
                // This can happen when mixing events and queried for
                return component;
            }
            checkAttached(expect);
            return _reactRenderHook2.default.findComponent(component);
        },
        actualRenderOutputType: 'RenderedReactElementData',
        getDiffInputFromRenderOutput: function getDiffInputFromRenderOutput(renderOutput) {
            return renderOutput;
        },
        rewrapResult: function rewrapResult(renderer, target) {
            return target;
        },
        wrapResultForReturn: function wrapResultForReturn(component, target) {
            return target && target.element.getPublicInstance() || component;
        },
        triggerEvent: triggerEvent.bind(null, expect),
        canTriggerEventsOnOutputType: true
    });
    assertionGenerator.installInto(expect);

    expect.addAssertion('<ReactModule> to have been injected', function (expect) {
        checkAttached(expect);
    });

    var StatelessWrapper = function (_React$Component) {
        _inherits(StatelessWrapper, _React$Component);

        function StatelessWrapper() {
            _classCallCheck(this, StatelessWrapper);

            return _possibleConstructorReturn(this, (StatelessWrapper.__proto__ || Object.getPrototypeOf(StatelessWrapper)).apply(this, arguments));
        }

        _createClass(StatelessWrapper, [{
            key: 'render',
            value: function render() {
                return this.props.children;
            }
        }]);

        return StatelessWrapper;
    }(_react2.default.Component);

    expect.addAssertion('<ReactElement> when deeply rendered <assertion?>', function (expect, subject) {
        var component = void 0;
        if (subject.prototype && typeof subject.prototype.render === 'function') {
            component = _testUtils2.default.renderIntoDocument(subject);
        } else {
            // Stateless component
            component = _testUtils2.default.renderIntoDocument(_react2.default.createElement(
                StatelessWrapper,
                null,
                subject
            ));
            component = _reactRenderHook2.default.findComponent(component);
            if (component) {
                component = component && component.data.children[0] && component.data.children[0]._instance;
            } else {
                expect.errorMode = 'nested';
                expect.fail({
                    message: function message(output) {
                        return output.error('Cannot find rendered stateless component. Are you sure you passed a real component to `when deeply rendered`');
                    }
                });
            }
        }
        return expect.shift(component);
    });

    expect.addAssertion('<ReactElement> to [exactly] deeply render [with all children] [with all wrappers] [with all classes] [with all attributes] as <ReactElement>', function (expect, subject, expected) {

        if (this.flags.exactly) {
            return expect(subject, 'when deeply rendered', 'to have exactly rendered', expected);
        }
        return expect(subject, 'when deeply rendered to have rendered [with all children] [with all wrappers] [with all classes] [with all attributes]', expected);
    });
}

exports.installInto = installInto;
exports.triggerEvent = triggerEvent;