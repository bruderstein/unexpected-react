import GlobalHook from './globalHook';
import React from 'react';
import HtmlLikeUnexpected from './HtmlLikeUnexpected';
import RenderedReactElementAdapter from './Adapters/renderedReactElementAdapter';


export default {
    name: 'unexpected-react-deep',

    installInto(expect) {

        expect.installPlugin(require('magicpen-prism'));

        const htmlLikeRenderedReactElement = HtmlLikeUnexpected(RenderedReactElementAdapter);

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

                output.text('TODO - ReactElement inspect');
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

    }
}