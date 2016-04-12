import RenderHook from 'react-render-hook';
import UnexpectedHtmlLike from 'unexpected-htmllike';
import RenderedReactElementAdapter from 'unexpected-htmllike-reactrendered-adapter';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { findDOMNode } from 'react-dom';

const PENDING_SHALLOW_EVENT_TYPE = Symbol('Pending shallow event');
const PENDING_DEEP_EVENT_TYPE = Symbol('Pending deep event');

function checkAttached(expect) {
    if (!RenderHook.isAttached) {
        expect.errorMode = 'bubble';
        expect.fail(output => {
            return output.error('The global rendering hook is not attached')
                .nl().text('This probably means React was required before unexpected-react. Check that unexpected-react is required first');
        });
    }
}

function installInto(expect) {

    expect.addAssertion(['<RenderedReactElement> to have [exactly] rendered <ReactElement>',
        '<RenderedReactElement> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, element) {

        checkAttached(expect);

        const data = RenderHook.findComponent(subject);

        return expect(data, 'to have [exactly] rendered [with all children] [with all wrappers]', element);
    });

    expect.addAssertion(['<RenderedReactElementData> to have [exactly] rendered <ReactElement>',
        '<RenderedReactElementData> to have rendered [with all children] [with all wrappers] <ReactElement>'], function (expect, subject, element) {

            checkAttached(expect);
            var exactly = this.flags.exactly;
            const renderedReactElementAdapter = new RenderedReactElementAdapter({ convertToString: true, concatTextContent: !exactly });

            const htmlLikeRenderedReactElement = UnexpectedHtmlLike(renderedReactElementAdapter);
            var withAllChildren = this.flags['with all children'];
            var withAllWrappers = this.flags['with all wrappers'];

            var jsxAdapter = new ReactElementAdapter({ convertToString: true });
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
            const diffResult = htmlLikeRenderedReactElement.diff(jsxAdapter, subject, element, expect, options);

            return htmlLikeRenderedReactElement.withResult(diffResult, result => {

                return expect.withError(() => expect(result.weight, 'to equal', 0), () => {
                    expect.fail({
                        diff: function (output, diff, inspect) {
                            return {
                                diff: htmlLikeRenderedReactElement.render(result, output, diff, inspect)
                            };
                        }
                    });
                });
            });

        });
    
    
    expect.addAssertion(['<RenderedReactElement> [not] to contain [exactly] <ReactElement|string>',
        '<RenderedReactElement> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, element) {

        checkAttached(expect);

        const data = RenderHook.findComponent(subject);

        return expect(data, '[not] to contain [exactly] [with all children] [with all wrappers]', element);
    });

    expect.addAssertion(['<RenderedReactElementData> [not] to contain [exactly] <ReactElement|string>',
        '<RenderedReactElementData> [not] to contain [with all children] [with all wrappers] <ReactElement|string>'], function (expect, subject, element) {

        checkAttached(expect);

        var not = this.flags.not;
        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        const renderedReactElementAdapter = new RenderedReactElementAdapter({ convertToString: true });
        const htmlLikeRenderedReactElement = UnexpectedHtmlLike(renderedReactElementAdapter);
        var jsxAdapter = new ReactElementAdapter({ convertToString: true });
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

        const containsResult = htmlLikeRenderedReactElement.contains(jsxAdapter, subject, element, expect, options);

        return htmlLikeRenderedReactElement.withResult(containsResult, result => {
            if (not) {
                if (result.found) {
                    expect.fail({
                        diff: function (output, diff, inspect) {
                            return {
                                diff: output.error('but found the following match').nl().append(htmlLikeRenderedReactElement.render(result.bestMatch, output.clone(), diff, inspect))
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
                            diff: output.error('the best match was').nl().append(htmlLikeRenderedReactElement.render(result.bestMatch, output.clone(), diff, inspect))
                        };
                    }
                });
            }

        });

    });
    

    
    expect.addAssertion(['<RenderedReactElement> queried for [exactly] <ReactElement> <assertion>',
        '<RenderedReactElement> queried for [with all children] [with all wrapppers] <ReactElement> <assertion>'], function (expect, subject, query) {

        var exactly = this.flags.exactly;
        var withAllChildren = this.flags['with all children'];
        var withAllWrappers = this.flags['with all wrappers'];

        var adapter = new RenderedReactElementAdapter({ convertToString: true, concatTextContent: !exactly});
        var renderedHtmlLike = new UnexpectedHtmlLike(adapter);
        var jsxAdapter = new ReactElementAdapter({ convertToString: true, concatTextContent: !exactly });

        const options = {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly,
            diffExactClasses: exactly,
            diffExtraClasses: exactly
        };

        const data = RenderHook.findComponent(subject);
        const containsResult = renderedHtmlLike.contains(jsxAdapter, data, query, expect, options);

        return renderedHtmlLike.withResult(containsResult, function (result) {

            if (!result.found) {
                expect.fail({
                    diff: (output, diff, inspect) => {
                        const resultOutput = {
                            diff: output.error('`queried for` found no match.')
                        };
                        if (result.bestMatch) {
                            resultOutput.diff.error('  The best match was')
                                .nl()
                                .append(renderedHtmlLike.render(result.bestMatch, output.clone(), diff, inspect));
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

        identify: function (value) {
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
        const renderedAdapter = new RenderedReactElementAdapter({ convertToString: true });
        const jsxAdapter = new ReactElementAdapter({ convertToString: true });
        const reactHtmlLike = new UnexpectedHtmlLike(renderedAdapter);

        const componentData = RenderHook.findComponent(subject.component);
        const exactly = this.flags.exactly;
        const withAllChildren = this.flags['with all children'];
        const withAllWrappers = this.flags['with all wrappers'];
        const containsResult = reactHtmlLike.contains(jsxAdapter, componentData, target, expect, {
            diffWrappers: exactly || withAllWrappers,
            diffExtraChildren: exactly || withAllChildren,
            diffExtraAttributes: exactly
        });
        
        return reactHtmlLike.withResult(containsResult, result => {
            
            if (!result.found) {
                return expect.fail({

                    diff: function (output, diff, inspect) {
                        if (result.bestMatch) {
                            return {
                                diff: output
                                    .error('Could not find the target. The best match was ')
                                    .append(reactHtmlLike.render(result.bestMatch, output.clone(), diff, inspect))
                            };
                        }

                        return {
                            diff: output.error('Could not find the target.')
                        };
                    }
                })
            }

            const newSubject = Object.assign({}, subject, {
                target: result.bestMatchItem
            });
            expect.shift(newSubject);
        });
    });

    function triggerEvent(component, target, eventName, eventArgs) {
        let targetDOM = findDOMNode(component);
        if (target) {
            targetDOM = findDOMNode(target.element.getPublicInstance());
        }

        if (typeof TestUtils.Simulate[eventName] !== 'function') {

            return expect.fail({
                diff: function (output) {
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

    expect.addAssertion(['<ReactPendingDeepEvent> to have [exactly] rendered <ReactElement>',
        '<ReactPendingDeepEvent> to have rendered [with all children] [with all wrappers]'], function (expect, subject, expected) {

        triggerEvent(subject.component, subject.target, subject.eventName, subject.eventArgs);
        return expect(subject.component, 'to have [exactly] rendered [with all children] [with all wrappers]', expected);
    });

    expect.addAssertion(['<ReactPendingDeepEvent> to contain [exactly] <ReactElement>',
        '<ReactPendingDeepEvent> to contain [with all children] [with all wrappers]'], function (expect, subject, expected) {

        triggerEvent(subject.component, subject.target, subject.eventName, subject.eventArgs);
        return expect(subject.component, 'to contain [exactly] [with all children] [with all wrappers]', expected);
    });

    expect.addAssertion(['<ReactPendingDeepEvent> queried for [exactly] <ReactElement> <assertion>',
        '<ReactPendingDeepEvent> queried for [with all children] [with all wrappers] <ReactElement> <assertion>'], function (expect, subject, expected) {

        triggerEvent(subject.component, subject.target, subject.eventName, subject.eventArgs);
        return expect.apply(expect,
            [subject.component, 'queried for [exactly] [with all children] [with all wrappers]', expected]
                .concat(Array.prototype.slice.call(arguments, 3)));
    });


    expect.addAssertion('<ReactModule> to have been injected', function (expect) {
        checkAttached(expect);
    });
}

export { installInto };