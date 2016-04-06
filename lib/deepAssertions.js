'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _unexpectedHtmllike = require('unexpected-htmllike');

var _unexpectedHtmllike2 = _interopRequireDefault(_unexpectedHtmllike);

var _unexpectedHtmllikeReactrenderedAdapter = require('unexpected-htmllike-reactrendered-adapter');

var _unexpectedHtmllikeReactrenderedAdapter2 = _interopRequireDefault(_unexpectedHtmllikeReactrenderedAdapter);

var _unexpectedHtmllikeJsxAdapter = require('unexpected-htmllike-jsx-adapter');

var _unexpectedHtmllikeJsxAdapter2 = _interopRequireDefault(_unexpectedHtmllikeJsxAdapter);

var _reactAddons = require('react/addons');

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var TestUtils = _reactAddons2['default'].addons.TestUtils;
var PENDING_SHALLOW_EVENT_TYPE = Symbol('Pending shallow event');
var PENDING_DEEP_EVENT_TYPE = Symbol('Pending deep event');

function checkAttached(expect) {
    if (!_reactRenderHook2['default'].isAttached) {
        expect.errorMode = 'bubble';
        expect.fail(function (output) {
            return output.error('The global rendering hook is not attached').nl().text('This probably means React was required before unexpected-react. Check that unexpected-react is required first');
        });
    }
}

function installInto(expect) {

    expect.addAssertion(['<RenderedReactElement> to have [exactly] rendered <ReactElement>', '<RenderedReactElement> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, element) {

        checkAttached(expect);

        var data = _reactRenderHook2['default'].findComponent(subject);

        return expect(data, 'to have [exactly] rendered [with all children] [with all wrappers]', element);
    });

    expect.addAssertion(['<RenderedReactElementData> to have [exactly] rendered <ReactElement>', '<RenderedReactElementData> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, element) {

        checkAttached(expect);
        var exactly = this.flags.exactly;
        var renderedReactElementAdapter = new _unexpectedHtmllikeReactrenderedAdapter2['default']({ convertToString: true, concatTextContent: !exactly });

        var htmlLikeRenderedReactElement = (0, _unexpectedHtmllike2['default'])(renderedReactElementAdapter);
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var jsxAdapter = new _unexpectedHtmllikeJsxAdapter2['default']({ convertToString: true });
        if (!exactly) {
            jsxAdapter.setOptions({ concatTextContent: true });
        }

        var options = {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly,
            diffExactClasses: false, // TODO: This should be exactly - need to check the tests around this
            diffExtraClasses: exactly
        };
        var diffResult = htmlLikeRenderedReactElement.diff(jsxAdapter, subject, element, expect, options);

        return htmlLikeRenderedReactElement.withResult(diffResult, function (result) {

            return expect.withError(function () {
                return expect(result.weight, 'to equal', 0);
            }, function () {
                expect.fail({
                    diff: function diff(output, _diff, inspect) {
                        return {
                            diff: htmlLikeRenderedReactElement.render(result, output, _diff, inspect)
                        };
                    }
                });
            });
        });
    });

    expect.addAssertion(['<RenderedReactElement> [not] to contain [exactly] <ReactElement|string>', '<RenderedReactElement> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, element) {

        checkAttached(expect);

        var data = _reactRenderHook2['default'].findComponent(subject);

        return expect(data, '[not] to contain [exactly] [with all children] [with all wrappers]', element);
    });

    expect.addAssertion(['<RenderedReactElementData> [not] to contain [exactly] <ReactElement|string>', '<RenderedReactElementData> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, element) {

        checkAttached(expect);

        var not = this.flags.not;
        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var renderedReactElementAdapter = new _unexpectedHtmllikeReactrenderedAdapter2['default']({ convertToString: true });
        var htmlLikeRenderedReactElement = (0, _unexpectedHtmllike2['default'])(renderedReactElementAdapter);
        var jsxAdapter = new _unexpectedHtmllikeJsxAdapter2['default']({ convertToString: true });
        if (!exactly) {
            jsxAdapter.setOptions({ concatTextContent: true });
            renderedReactElementAdapter.setOptions({ concatTextContent: true });
        }

        var options = {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly,
            diffExactClasses: false,
            diffExtraClasses: exactly
        };

        var containsResult = htmlLikeRenderedReactElement.contains(jsxAdapter, subject, element, expect, options);

        return htmlLikeRenderedReactElement.withResult(containsResult, function (result) {
            if (not) {
                if (result.found) {
                    expect.fail({
                        diff: function diff(output, _diff2, inspect) {
                            return {
                                diff: output.error('but found the following match').nl().append(htmlLikeRenderedReactElement.render(result.bestMatch, output.clone(), _diff2, inspect))
                            };
                        }
                    });
                }
                return;
            }

            if (!result.found) {
                expect.fail({
                    diff: function diff(output, _diff3, inspect) {
                        return {
                            diff: output.error('the best match was').nl().append(htmlLikeRenderedReactElement.render(result.bestMatch, output.clone(), _diff3, inspect))
                        };
                    }
                });
            }
        });
    });

    expect.addAssertion(['<RenderedReactElement> queried for [exactly] <ReactElement> <assertion>', '<RenderedReactElement> queried for [with all children] [with all wrapppers] <ReactElement> <assertion>'], function (expect, subject, query) {

        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var adapter = new _unexpectedHtmllikeReactrenderedAdapter2['default']({ convertToString: true, concatTextContent: !exactly });
        var renderedHtmlLike = new _unexpectedHtmllike2['default'](adapter);
        var jsxAdapter = new _unexpectedHtmllikeJsxAdapter2['default']({ convertToString: true, concatTextContent: !exactly });

        var options = {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly,
            diffExactClasses: exactly,
            diffExtraClasses: exactly
        };

        var data = _reactRenderHook2['default'].findComponent(subject);
        var containsResult = renderedHtmlLike.contains(jsxAdapter, data, query, expect, options);

        return renderedHtmlLike.withResult(containsResult, function (result) {

            if (!result.found) {
                expect.fail({
                    diff: function diff(output, _diff4, inspect) {
                        var resultOutput = {
                            diff: output.error('`queried for` found no match.')
                        };
                        if (result.bestMatch) {
                            resultOutput.diff.error('  The best match was').nl().append(renderedHtmlLike.render(result.bestMatch, output.clone(), _diff4, inspect));
                        }
                        return resultOutput;
                    }
                });
            }

            expect.shift(result.bestMatchItem);
        });
    });

    expect.addType({

        name: 'ReactPendingDeepEvent',

        base: 'object',

        identify: function identify(value) {
            return value && typeof value === 'object' && value.$$typeof === PENDING_DEEP_EVENT_TYPE;
        }

    });

    expect.addAssertion('<RenderedReactElement> with event <string> <assertion>', function (expect, subject, eventName) {
        expect.shift({
            $$typeof: PENDING_DEEP_EVENT_TYPE,
            component: subject,
            eventName: eventName
        });
    });

    expect.addAssertion('<RenderedReactElement> with event <string> <object> <assertion>', function (expect, subject, eventName, args) {
        expect.shift({
            $$typeof: PENDING_DEEP_EVENT_TYPE,
            component: subject,
            eventName: eventName,
            eventArgs: args
        });
    });

    expect.addAssertion('<ReactPendingDeepEvent> on [exactly] [with all children] [with all wrappers] <ReactElement> <assertion>', function (expect, subject, target) {
        var renderedAdapter = new _unexpectedHtmllikeReactrenderedAdapter2['default']({ convertToString: true });
        var jsxAdapter = new _unexpectedHtmllikeJsxAdapter2['default']({ convertToString: true });
        var reactHtmlLike = new _unexpectedHtmllike2['default'](renderedAdapter);

        var componentData = _reactRenderHook2['default'].findComponent(subject.component);
        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];
        var containsResult = reactHtmlLike.contains(jsxAdapter, componentData, target, expect, {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly
        });

        return reactHtmlLike.withResult(containsResult, function (result) {

            if (!result.found) {
                return expect.fail({

                    diff: function diff(output, _diff5, inspect) {
                        if (result.bestMatch) {
                            return {
                                diff: output.error('Could not find the target. The best match was ').append(reactHtmlLike.render(result.bestMatch, output.clone(), _diff5, inspect))
                            };
                        }

                        return {
                            diff: output.error('Could not find the target.')
                        };
                    }
                });
            }

            var newSubject = Object.assign({}, subject, {
                target: result.bestMatchItem
            });
            expect.shift(newSubject);
        });
    });

    function triggerEvent(component, target, eventName, eventArgs) {
        var targetDOM = _reactAddons2['default'].findDOMNode(component);
        if (target) {
            targetDOM = _reactAddons2['default'].findDOMNode(target.element.getPublicInstance());
        }

        if (typeof TestUtils.Simulate[eventName] !== 'function') {

            return expect.fail({
                diff: function diff(output) {
                    return output.error('Event ').text("'" + eventName + "'").error(' is not supported by TestUtils.Simulate');
                }
            });
        }
        TestUtils.Simulate[eventName](targetDOM, eventArgs);
    }

    expect.addAssertion('<ReactPendingDeepEvent> [and] with event <string> <assertion>', function (expect, subject, eventName) {

        triggerEvent(subject.component, subject.target, subject.eventName, subject.eventArgs);
        expect.shift({
            $$typeof: PENDING_DEEP_EVENT_TYPE,
            component: subject.component,
            eventName: eventName
        });
    });

    expect.addAssertion('<ReactPendingDeepEvent> [and] with event <string> <object> <assertion>', function (expect, subject, eventName, eventArgs) {

        triggerEvent(subject.component, subject.target, subject.eventName, subject.eventArgs);
        expect.shift({
            $$typeof: PENDING_DEEP_EVENT_TYPE,
            component: subject.component,
            eventName: eventName,
            eventArgs: eventArgs
        });
    });

    expect.addAssertion(['<ReactPendingDeepEvent> to have [exactly] rendered <ReactElement>', '<ReactPendingDeepEvent> to have rendered [with all children] [with all wrappers]'], function (expect, subject, expected) {

        triggerEvent(subject.component, subject.target, subject.eventName, subject.eventArgs);
        return expect(subject.component, 'to have [exactly] rendered [with all children] [with all wrappers]', expected);
    });

    expect.addAssertion(['<ReactPendingDeepEvent> to contain [exactly] <ReactElement>', '<ReactPendingDeepEvent> to contain [with all children] [with all wrappers]'], function (expect, subject, expected) {

        triggerEvent(subject.component, subject.target, subject.eventName, subject.eventArgs);
        return expect(subject.component, 'to contain [exactly] [with all children] [with all wrappers]', expected);
    });

    expect.addAssertion(['<ReactPendingDeepEvent> queried for [exactly] <ReactElement> <assertion>', '<ReactPendingDeepEvent> queried for [with all children] [with all wrappers] <ReactElement> <assertion>'], function (expect, subject, expected) {

        triggerEvent(subject.component, subject.target, subject.eventName, subject.eventArgs);
        return expect.apply(expect, [subject.component, 'queried for [exactly] [with all children] [with all wrappers]', expected].concat(Array.prototype.slice.call(arguments, 3)));
    });

    expect.addAssertion('<ReactModule> to have been injected', function (expect) {
        checkAttached(expect);
    });
}

exports.installInto = installInto;
//# sourceMappingURL=deepAssertions.js.map