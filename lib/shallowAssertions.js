'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _unexpectedHtmllike = require('unexpected-htmllike');

var _unexpectedHtmllike2 = _interopRequireDefault(_unexpectedHtmllike);

var _unexpectedHtmllikeJsxAdapter = require('unexpected-htmllike-jsx-adapter');

var _unexpectedHtmllikeJsxAdapter2 = _interopRequireDefault(_unexpectedHtmllikeJsxAdapter);

var _reactAddons = require('react/addons');

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var TestUtils = _reactAddons2['default'].addons.TestUtils;

var PENDING_SHALLOW_EVENT_TYPE = Symbol('Pending shallow event');

function installInto(expect) {

    expect.addType({

        name: 'ReactPendingShallowEvent',

        base: 'object',

        identify: function identify(value) {
            return value && typeof value === 'object' && value.$$typeof === PENDING_SHALLOW_EVENT_TYPE;
        }

    });

    expect.addAssertion(['<ReactShallowRenderer> to have [exactly] rendered <ReactElement>', '<ReactShallowRenderer> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, renderOutput) {
        var actual = subject.getRenderOutput();
        return expect(actual, 'to have [exactly] rendered [with all children] [with all wrappers]', renderOutput);
    });

    expect.addAssertion(['<ReactElement> to have [exactly] rendered <ReactElement>', '<ReactElement> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, expected) {

        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var adapter = new _unexpectedHtmllikeJsxAdapter2['default']();
        var jsxHtmlLike = new _unexpectedHtmllike2['default'](adapter);
        if (!exactly) {
            adapter.setOptions({ concatTextContent: true });
        }

        var options = {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly,
            diffExactClasses: false,
            diffExtraClasses: exactly
        };

        var diffResult = jsxHtmlLike.diff(adapter, subject, expected, expect, options);

        return jsxHtmlLike.withResult(diffResult, function (result) {

            if (result.weight !== 0) {
                return expect.fail({
                    diff: function diff(output, _diff, inspect) {
                        return {
                            diff: output.append(jsxHtmlLike.render(result, output.clone(), _diff, inspect))
                        };
                    }
                });
            }
        });
    });

    expect.addAssertion(['<ReactShallowRenderer> [not] to contain [exactly] <ReactElement|string>', '<ReactShallowRenderer> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, renderOutput) {
        var actual = subject.getRenderOutput();
        return expect(actual, '[not] to contain [exactly] [with all children] [with all wrappers]', renderOutput);
    });

    expect.addAssertion(['<ReactElement> [not] to contain [exactly] <ReactElement|string>', '<ReactElement> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, expected) {

        var not = this.flags.not;
        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var adapter = new _unexpectedHtmllikeJsxAdapter2['default']();
        var jsxHtmlLike = new _unexpectedHtmllike2['default'](adapter);
        if (!exactly) {
            adapter.setOptions({ concatTextContent: true });
        }

        var options = {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly
        };

        var containsResult = jsxHtmlLike.contains(adapter, subject, expected, expect, options);

        return jsxHtmlLike.withResult(containsResult, function (result) {

            if (not) {
                if (result.found) {
                    expect.fail({
                        diff: function diff(output, _diff2, inspect) {
                            return {
                                diff: output.error('but found the following match').nl().append(jsxHtmlLike.render(result.bestMatch, output.clone(), _diff2, inspect))
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
                            diff: output.error('the best match was').nl().append(jsxHtmlLike.render(result.bestMatch, output.clone(), _diff3, inspect))
                        };
                    }
                });
            }
        });
    });

    expect.addAssertion(['<ReactElement> queried for [exactly] <ReactElement> <assertion>', '<ReactElement> queried for [with all children] [with all wrapppers] <ReactElement> <assertion>'], function (expect, subject, query) {

        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var adapter = new _unexpectedHtmllikeJsxAdapter2['default']();
        var jsxHtmlLike = new _unexpectedHtmllike2['default'](adapter);
        if (!exactly) {
            adapter.setOptions({ concatTextContent: true });
        }

        var options = {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly,
            diffExactClasses: exactly,
            diffExtraClasses: exactly
        };

        var containsResult = jsxHtmlLike.contains(adapter, subject, query, expect, options);

        return jsxHtmlLike.withResult(containsResult, function (result) {

            if (!result.found) {
                expect.fail({
                    diff: function diff(output, _diff4, inspect) {
                        var resultOutput = {
                            diff: output.error('`queried for` found no match.')
                        };
                        if (result.bestMatch) {
                            resultOutput.diff.error('  The best match was').nl().append(jsxHtmlLike.render(result.bestMatch, output.clone(), _diff4, inspect));
                        }
                        return resultOutput;
                    }
                });
            }

            expect.shift(result.bestMatchItem);
        });
    });

    expect.addAssertion(['<ReactShallowRenderer> queried for [exactly] <ReactElement> <assertion>', '<ReactShallowRenderer> queried for [with all children] [with all wrapppers] <ReactElement> <assertion>'], function (expect, subject, query, assertion) {
        return expect.apply(expect, [subject.getRenderOutput(), 'queried for [exactly] [with all children] [with all wrappers]', query].concat(Array.prototype.slice.call(arguments, 3)));
    });

    expect.addAssertion('<ReactShallowRenderer> with event <string> <assertion>', function (expect, subject, eventName) {
        expect.shift({
            $$typeof: PENDING_SHALLOW_EVENT_TYPE,
            renderer: subject,
            eventName: eventName
        });
    });

    expect.addAssertion('<ReactShallowRenderer> with event <string> <object> <assertion>', function (expect, subject, eventName, args) {
        expect.shift({
            $$typeof: PENDING_SHALLOW_EVENT_TYPE,
            renderer: subject,
            eventName: eventName,
            eventArgs: args
        });
    });

    expect.addAssertion('<ReactElement> with event <string> <assertion>', function (expect, subject, eventName) {

        var renderer = TestUtils.createRenderer();
        renderer.render(subject);

        expect.shift({
            $$typeof: PENDING_SHALLOW_EVENT_TYPE,
            renderer: renderer,
            eventName: eventName
        });
    });

    expect.addAssertion('<ReactElement> with event <string> <object> <assertion>', function (expect, subject, eventName, eventArgs) {

        var renderer = TestUtils.createRenderer();
        renderer.render(subject);

        expect.shift({
            $$typeof: PENDING_SHALLOW_EVENT_TYPE,
            renderer: renderer,
            eventName: eventName,
            eventArgs: eventArgs
        });
    });

    expect.addAssertion('<ReactPendingShallowEvent> on [exactly] [with all children] [with all wrappers] <ReactElement> <assertion>', function (expect, subject, target) {
        var adapter = new _unexpectedHtmllikeJsxAdapter2['default']({ convertToString: true, concatTextContent: true });
        var jsxHtmlLike = new _unexpectedHtmllike2['default'](adapter);
        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];
        var containsResult = jsxHtmlLike.contains(adapter, subject.renderer.getRenderOutput(), target, expect, {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly
        });
        return jsxHtmlLike.withResult(containsResult, function (result) {
            if (!result.found) {
                return expect.fail({
                    diff: function diff(output, _diff5, inspect) {
                        output.error('Could not find the target for the event. ');
                        if (result.bestMatch) {
                            output.error('The best match was').nl().nl().append(jsxHtmlLike.render(result.bestMatch, output.clone(), _diff5, inspect));
                        }
                        return output;
                    }
                });
            }

            var newSubject = Object.assign({}, subject, {
                target: result.bestMatchItem
            });
            expect.shift(newSubject);
        });
    });

    function triggerEvent(renderer, target, eventName, eventArgs) {

        if (!target) {
            target = renderer.getRenderOutput();
        }

        var handlerPropName = 'on' + eventName[0].toUpperCase() + eventName.substr(1);
        var handler = target.props[handlerPropName];
        if (typeof handler !== 'function') {
            return expect.fail({
                diff: function diff(output) {
                    return output.error('No handler function prop ').text("'" + handlerPropName + "'").error(' on the target element');
                }
            });
        }
        handler(eventArgs);
        return renderer;
    }

    expect.addAssertion('<ReactPendingShallowEvent> to have [exactly] rendered [with all children] [with all wrappers] <ReactElement>', function (expect, subject, expected) {

        triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
        return expect(subject.renderer, 'to have [exactly] rendered [with all children] [with all wrappers]', expected);
    });

    expect.addAssertion('<ReactPendingShallowEvent> [and] with event <string> <assertion>', function (expect, subject, eventName) {

        triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
        return expect.shift({
            $$typeof: PENDING_SHALLOW_EVENT_TYPE,
            renderer: subject.renderer,
            eventName: eventName
        });
    });

    expect.addAssertion('<ReactPendingShallowEvent> [and] with event <string> <object> <assertion>', function (expect, subject, eventName, eventArgs) {

        triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
        return expect.shift({
            $$typeof: PENDING_SHALLOW_EVENT_TYPE,
            renderer: subject.renderer,
            eventName: eventName,
            eventArgs: eventArgs
        });
    });

    expect.addAssertion(['<ReactPendingShallowEvent> to contain [exactly] <ReactElement>', '<ReactPendingShallowEvent> to contain [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, expected) {

        triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
        return expect(subject.renderer, 'to contain [exactly] [with all children] [with all wrappers]', expected);
    });

    expect.addAssertion(['<ReactPendingShallowEvent> queried for [exactly] <ReactElement> <assertion>', '<ReactPendingShallowEvent> queried for [with all children] [with all wrappers] <ReactElement> <assertion>'], function (expect, subject, expected) {

        triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
        return expect.apply(expect, [subject.renderer, 'queried for [exactly] [with all children] [with all wrappers]', expected].concat(Array.prototype.slice.call(arguments, 3)));
    });

    expect.addAssertion('<ReactElement> to equal <ReactElement>', function (expect, subject, value) {
        return expect(subject, 'to have exactly rendered', value);
    });

    expect.addAssertion('<ReactShallowRenderer> to equal <ReactElement>', function (expect, subject, value) {
        return expect(subject.getRenderOutput(), 'to have exactly rendered', value);
    });

    expect.addAssertion('<ReactElement> to satisfy <ReactElement>', function (expect, subject, renderOutput) {
        return expect(subject, 'to have rendered', renderOutput);
    });
}

exports.installInto = installInto;
//# sourceMappingURL=shallowAssertions.js.map