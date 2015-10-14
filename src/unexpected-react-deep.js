import GlobalHook from './globalHook';
import React from 'react';
import HtmlLikeUnexpected from './HtmlLikeUnexpected';
import RenderedReactElementAdapter from './Adapters/renderedReactElementAdapter';
import ReactElementAdapter from './Adapters/reactElementAdapter';


export default {
    name: 'unexpected-react-deep',

    installInto(expect) {

        expect.installPlugin(require('magicpen-prism'));

        const htmlLikeRenderedReactElement = HtmlLikeUnexpected(RenderedReactElementAdapter, ReactElementAdapter);

        expect.addType({

            name: 'RenderedReactElement',

            identify(value) {
                return (typeof value === 'object' &&
                    value !== null &&
                    value._reactInternalInstance &&
                    value.hasOwnProperty('props') &&
                    value.hasOwnProperty('refs'));
            },

            inspect(value, depth, output, inspect) {
                const data = GlobalHook.findComponent(value);
                return htmlLikeRenderedReactElement.inspect(data, depth, output, inspect);
            }
        });

        expect.addType({
            name: 'RenderedReactElementData',

            identify(value) {
                return (typeof value === 'object' &&
                    value !== null &&
                    value.hasOwnProperty('element') &&
                    value.data &&
                    value.data.type &&
                    value.data.nodeType);
            },
            inspect(value, depth, output, inspect) {
                return htmlLikeRenderedReactElement.inspect(value, depth, output, inspect);
            }
        });

        expect.addType({
            name: 'ReactElement',

            identify: function (value) {
                return React.isValidElement(value) ||
                    (typeof value === 'object' &&
                    value !== null &&
                    (typeof value.type === 'function' || typeof value.type === 'string') &&
                    value.hasOwnProperty('props') &&
                    value.hasOwnProperty('ref') &&
                    value.hasOwnProperty('key'));
            },

            inspect: function (value, depth, output, inspect) {

                return htmlLikeRenderedReactElement.inspectExpected(value, depth, output, inspect);
            }
        });


        expect.addType({

            name: 'ReactModule',

            identify(value) {
                return (typeof value === 'object' &&
                    value !== null &&
                    value.hasOwnProperty('createClass') &&
                value.hasOwnProperty('createElement') &&
                value.hasOwnProperty('cloneElement') &&
                value.hasOwnProperty('createFactory')  &&
                value.hasOwnProperty('isValidElement') &&
                value.hasOwnProperty('PropTypes'));
            },

            inspect(value, depth, output) {
                output.text('<<ReactModule>>');
            }

        });

        expect.addAssertion('<ReactModule> to have been injected', function (expect, subject) {

            return expect(GlobalHook.isAttached, 'to equal', true);
        });

        expect.addAssertion('<RenderedReactElement> to render as <ReactElement>', function (expect, subject, element) {

            const data = GlobalHook.findComponent(subject);
            const result = htmlLikeRenderedReactElement.diff(data, element, expect.output.clone(), expect.diff.bind(expect), expect.inspect.bind(expect), expect.equal.bind(expect));
            expect.withError(() => expect(result.weight, 'to equal', 0), () => {
                expect.fail({
                    diff: function (output, diff, inspect, equal) {
                        return {
                            diff: result.output
                        };
                    }
                });
            });

        });
    }
}