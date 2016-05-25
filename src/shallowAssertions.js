import RenderHook from 'react-render-hook';
import UnexpectedHtmlLike from 'unexpected-htmllike';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import React from 'react';
import TestUtils from 'react-addons-test-utils';


// This is a dummy constant object used as a unique identifier for a pending
// event. This should be a Symbol in ES6, but would mean requiring polyfills
// for browsers that don't support it
// See issue #18
const PENDING_SHALLOW_EVENT_TYPE = { PENDING_SHALLOW_EVENT: 'Pending shallow event' };
const PENDING_QUERIED_FOR = { PENDING_QUERIED_FOR: 'Pending queried for' };

function getDefaultOptions(flags) {
    return {
        diffWrappers: flags.exactly || flags.withAllWrappers,
        diffExtraChildren: flags.exactly || flags.withAllChildren,
        diffExtraAttributes: flags.exactly,
        diffExactClasses: flags.exactly,
        diffExtraClasses: flags.exactly
    };
}

function installInto(expect) {

    expect.addType({

        name: 'ReactPendingShallowEvent',

        base: 'object',

        identify: function (value) {
            return value && typeof value === 'object' && value.$$typeof === PENDING_SHALLOW_EVENT_TYPE;
        }

    });

    
    expect.addAssertion(['<ReactShallowRenderer> to have [exactly] rendered <ReactElement>',
        '<ReactShallowRenderer> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, renderOutput) {
        var actual = subject.getRenderOutput();
        return expect(actual, 'to have [exactly] rendered [with all children] [with all wrappers]', renderOutput);
    });
    
    
    expect.addAssertion(['<ReactElement> to have [exactly] rendered <ReactElement>',
        '<ReactElement> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, expected) {

        const exactly = this.flags.exactly;
        const withAllChildren = this.flags['with all children'];
        const withAllWrappers = this.flags['with all wrappers'];

        const adapter = new ReactElementAdapter();
        const jsxHtmlLike = new UnexpectedHtmlLike(adapter);
        if (!exactly) {
            adapter.setOptions({ concatTextContent: true });
        }

        const options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });

        const diffResult = jsxHtmlLike.diff(adapter, subject, expected, expect, options);

        return jsxHtmlLike.withResult(diffResult, result => {

            if (result.weight !== 0) {
                return expect.fail({
                    diff: function (output, diff, inspect) {
                        return {
                            diff: output.append(jsxHtmlLike.render(result, output.clone(), diff, inspect))
                        };
                    }
                });
            }
        });

    });

    expect.addAssertion(['<ReactShallowRenderer> [not] to contain [exactly] <ReactElement|string>',
        '<ReactShallowRenderer> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, renderOutput) {
        var actual = subject.getRenderOutput();
        return expect(actual, '[not] to contain [exactly] [with all children] [with all wrappers]', renderOutput);
    });

    expect.addAssertion(['<ReactElement> [not] to contain [exactly] <ReactElement|string>',
        '<ReactElement> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, expected) {

        var not = this.flags.not;
        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var adapter = new ReactElementAdapter();
        var jsxHtmlLike = new UnexpectedHtmlLike(adapter);
        if (!exactly) {
            adapter.setOptions({ concatTextContent: true });
        }

        var options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });
        
        const containsResult = jsxHtmlLike.contains(adapter, subject, expected, expect, options);

        return jsxHtmlLike.withResult(containsResult, result => {

            if (not) {
                if (result.found) {
                    expect.fail({
                        diff: (output, diff, inspect) => {
                            return {
                                diff: output.error('but found the following match').nl().append(jsxHtmlLike.render(result.bestMatch, output.clone(), diff, inspect))
                            };
                        }
                    });
                }
                return;
            }

            if (!result.found) {
                expect.fail({
                    diff: function (output, diff, inspect) {
                        return {
                            diff: output.error('the best match was').nl().append(jsxHtmlLike.render(result.bestMatch, output.clone(), diff, inspect))
                        };
                    }
                });
            }
        });
    });

    expect.addAssertion(['<ReactElement> queried for [exactly] <ReactElement> <assertion?>',
        '<ReactElement> queried for [with all children] [with all wrapppers] <ReactElement> <assertion?>'], function (expect, subject, query) {

        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var adapter = new ReactElementAdapter();
        var jsxHtmlLike = new UnexpectedHtmlLike(adapter);
        if (!exactly) {
            adapter.setOptions({ concatTextContent: true });
        }

        const options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });
        options.findTargetAttrib = 'queryTarget';
        
        const containsResult = jsxHtmlLike.contains(adapter, subject, query, expect, options);

        return jsxHtmlLike.withResult(containsResult, function (result) {

            if (!result.found) {
                expect.fail({
                    diff: (output, diff, inspect) => {
                        const resultOutput = {
                            diff: output.error('`queried for` found no match.')
                        };
                        if (result.bestMatch) {
                            resultOutput.diff.error('  The best match was')
                                .nl()
                                .append(jsxHtmlLike.render(result.bestMatch, output.clone(), diff, inspect));
                        }
                        return resultOutput;
                    }
                });
            }

            return expect.shift(result.bestMatch.target || result.bestMatchItem);
        });
    });

    expect.addAssertion(['<ReactShallowRenderer> queried for [exactly] <ReactElement> <assertion?>',
        '<ReactShallowRenderer> queried for [with all children] [with all wrapppers] <ReactElement> <assertion?>'
    ], function (expect, subject, query, assertion) {
        return expect.apply(expect,
            [
                subject.getRenderOutput(), 'queried for [exactly] [with all children] [with all wrappers]', query
            ].concat(Array.prototype.slice.call(arguments, 3)));
    });


    expect.addAssertion('<ReactShallowRenderer> with event <string> <assertion?>', function (expect, subject, eventName) {
        if (arguments.length > 3) {
            return expect.shift({
                $$typeof: PENDING_SHALLOW_EVENT_TYPE,
                renderer: subject,
                eventName: eventName
            });
        } else {
            triggerEvent(subject, null, eventName);
            return expect.shift(subject);
        }
    });

    expect.addAssertion('<ReactShallowRenderer> with event <string> <object> <assertion?>', function (expect, subject, eventName, args) {
        if (arguments.length > 4) {
            return expect.shift({
                $$typeof: PENDING_SHALLOW_EVENT_TYPE,
                renderer: subject,
                eventName: eventName,
                eventArgs: args
            });
        } else {
            triggerEvent(subject, null, eventName, args);
            return expect.shift(subject);
        }
    });

    expect.addAssertion('<ReactElement> with event <string> <assertion?>', function (expect, subject, eventName) {

        const renderer = TestUtils.createRenderer();
        renderer.render(subject);
        return expect.apply(expect, [renderer, 'with event'].concat(Array.prototype.slice.call(arguments, 2)))

    });
    
    expect.addAssertion('<ReactElement> with event <string> <object> <assertion?>', function (expect, subject, eventName, eventArgs) {

        const renderer = TestUtils.createRenderer();
        renderer.render(subject);
        return expect.apply(expect, [renderer, 'with event'].concat(Array.prototype.slice.call(arguments, 2)))
    });
    
    
    expect.addAssertion('<ReactPendingShallowEvent> on [exactly] [with all children] [with all wrappers] <ReactElement> <assertion?>', function (expect, subject, target) {
        const adapter = new ReactElementAdapter({ convertToString: true, concatTextContent: true });
        const jsxHtmlLike = new UnexpectedHtmlLike(adapter);
        
        const exactly = this.flags.exactly;
        const withAllChildren = this.flags['with all children'];
        const withAllWrappers = this.flags['with all wrappers'];
        
        const options = getDefaultOptions({ exactly, withAllWrappers, withAllChildren });
        options.findTargetAttrib = 'eventTarget';
        
        const containsResult = jsxHtmlLike.contains(adapter, subject.renderer.getRenderOutput(), target, expect, options);
        return jsxHtmlLike.withResult(containsResult, result => {
            if (!result.found) {
                return expect.fail({
                    diff: function (output, diff, inspect) {
                        output.error('Could not find the target for the event. ');
                        if (result.bestMatch) {
                            output.error('The best match was').nl().nl().append(jsxHtmlLike.render(result.bestMatch, output.clone(), diff, inspect))
                        }
                        return output;
                    }
                })
            }

            const newSubject = Object.assign({}, subject, {
                target: result.bestMatch.target || result.bestMatchItem
            });

            if (arguments.length > 3) {
                return expect.shift(newSubject);
            } else {
                triggerEvent(newSubject.renderer, newSubject.target, newSubject.eventName, newSubject.eventArgs);
                return expect.shift(newSubject.renderer);
            }
        });
    });
    

    function triggerEvent(renderer, target, eventName, eventArgs) {

        if (!target) {
            target = renderer.getRenderOutput();
        }
        
        const handlerPropName = 'on' + eventName[0].toUpperCase() + eventName.substr(1);
        const handler = target.props[handlerPropName];
        if (typeof handler !== 'function') {
            return expect.fail({
                diff: function (output) {
                    return output.error('No handler function prop ').text("'" + handlerPropName + "'").error(' on the target element');

                }
            })
        }
        handler(eventArgs);
        return renderer;
    }
    

    expect.addAssertion('<ReactPendingShallowEvent> to have [exactly] rendered [with all children] [with all wrappers] <ReactElement>', function (expect, subject, expected) {

        triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
        return expect(subject.renderer, 'to have [exactly] rendered [with all children] [with all wrappers]', expected);
    });
    
    expect.addAssertion('<ReactPendingShallowEvent> [and] with event <string> <assertion?>', function (expect, subject, eventName) {

        triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
        if (arguments.length > 3) {
            return expect.shift({
                $$typeof: PENDING_SHALLOW_EVENT_TYPE,
                renderer: subject.renderer,
                eventName: eventName
            });
        } else {
            triggerEvent(subject.renderer, null, eventName);
            return expect.shift(subject.renderer);
        }
    });

    expect.addAssertion('<ReactPendingShallowEvent> [and] with event <string> <object> <assertion?>', function (expect, subject, eventName, eventArgs) {

        triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
        if (arguments.length > 4) {
            return expect.shift({
                $$typeof: PENDING_SHALLOW_EVENT_TYPE,
                renderer: subject.renderer,
                eventName: eventName,
                eventArgs: eventArgs
            });
        } else {
            triggerEvent(subject.renderer, null, eventName, eventArgs);
            return expect.shift(subject.renderer);
        }
    });

    expect.addAssertion(['<ReactPendingShallowEvent> [not] to contain [exactly] <ReactElement>',
        '<ReactPendingShallowEvent> [not] to contain [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, expected) {

        triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
        return expect(subject.renderer, '[not] to contain [exactly] [with all children] [with all wrappers]', expected);
    });
    
    
    expect.addAssertion(['<ReactPendingShallowEvent> queried for [exactly] <ReactElement> <assertion?>',
        '<ReactPendingShallowEvent> queried for [with all children] [with all wrappers] <ReactElement> <assertion?>'], function (expect, subject, expected) {

        triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
        return expect.apply(expect, 
            [subject.renderer, 'queried for [exactly] [with all children] [with all wrappers]', expected]
                .concat(Array.prototype.slice.call(arguments, 3)));
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

export { installInto };
