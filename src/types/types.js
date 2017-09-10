import React from 'react';
import UnexpectedHtmlLike from 'unexpected-htmllike';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import TestRendererAdapter from 'unexpected-htmllike-testrenderer-adapter';
import RawAdapter from 'unexpected-htmllike-raw-adapter';
import * as TestRendererTypeWrapper from './test-renderer-type-wrapper';

function installInto(expect) {

    const reactElementAdapter = new ReactElementAdapter({ convertToString: true, concatTextContent: true });
    const htmlLikeReactElement = UnexpectedHtmlLike(reactElementAdapter);
    const testRendererAdapter = new TestRendererAdapter({ convertToString: true, concatTextContent: true });
    const htmlLikeTestRenderer = UnexpectedHtmlLike(testRendererAdapter);
    const rawAdapter = new RawAdapter({ convertToString: true, concatTextContent: true });
    const htmlLikeRaw = UnexpectedHtmlLike(rawAdapter);


    expect.addType({
        name: 'ReactElement',

        identify: function (value) {
            return React.isValidElement(value) ||
                (typeof value === 'object' &&
                value !== null &&
                (typeof value.type === 'function' || typeof value.type === 'string') &&
                typeof value.hasOwnProperty === 'function' &&
                value.hasOwnProperty('props') &&
                value.hasOwnProperty('ref') &&
                value.hasOwnProperty('key'));
        },

        inspect: function (value, depth, output, inspect) {

            return htmlLikeReactElement.inspect(value, depth, output, inspect);
        }
    });


    expect.addType({

        name: 'ReactModule',

        identify(value) {

            return (typeof value === 'object' &&
                value !== null &&
                typeof value.hasOwnProperty === 'function' &&
                value.hasOwnProperty('createElement') &&
                value.hasOwnProperty('cloneElement') &&
                value.hasOwnProperty('createFactory') &&
                value.hasOwnProperty('isValidElement'));
        },

        inspect(value, depth, output) {
            output.text('<<ReactModule>>');
        }

    });


    expect.addType({
        name: 'ReactShallowRenderer',
        base: 'object',
        identify: function (value) {
            return typeof value === 'object' &&
                value !== null &&
                typeof value.getRenderOutput === 'function';
        },

        inspect: function (value, depth, output, inspect) {
            output.append(inspect(value.getRenderOutput()));
        }
    });



    expect.addType({
       name: 'ReactTestRenderer',
       base: 'object',
       identify: function (value) {
           return value && typeof value === 'object' &&
               typeof value.hasOwnProperty === 'function' &&
               typeof value.toJSON === 'function' &&
               typeof value.unmount === 'function' &&
               typeof value.update === 'function' &&
               typeof value.getInstance === 'function';
       },

        inspect: function (value, depth, output, inspect) {
            output.append(inspect(TestRendererTypeWrapper.getTestRendererOutputWrapper(value)));
        }
    });

    expect.addType({
        name: 'ReactTestRendererOutput',
        base: 'object',
        identify: function (value) {
            return TestRendererTypeWrapper.isTestRendererOutputWrapper(value);
        },

        inspect: function (value, depth, output, inspect) {
            return htmlLikeTestRenderer.inspect(TestRendererTypeWrapper.getRendererOutputJson(value), depth, output, inspect);
        }
    });

    expect.addType({
        name: 'RawReactTestRendererJson',
        base: 'object',
        identify: function (value) {
            return value && typeof value === 'object' && value.props && value.children && value.type;
        }
    });

    expect.addType({
        name: 'ReactRawObjectElement',
        base: 'RawReactTestRendererJson',
        identify: function (value) {
            return rawAdapter.isRawElement(value);
        },
        
        inspect: function (value, depth, output, inspect) { 
            return htmlLikeRaw.inspect(value, depth, output, inspect);
        }
    });

}

export default { installInto };
