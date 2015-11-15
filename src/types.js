import GlobalHook from 'react-render-hook';
import React from 'react';
import UnexpectedHtmlLike from 'unexpected-htmllike';
import RenderedReactElementAdapter from 'unexpected-htmllike-reactrendered-adapter';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';

function installInto(expect) {

    const renderedReactElementAdapter = new RenderedReactElementAdapter({ convertToString: true });
    const htmlLikeRenderedReactElement = UnexpectedHtmlLike(renderedReactElementAdapter);
    const reactElementAdapter = new ReactElementAdapter({ convertToString: true });
    const htmlLikeReactElement = UnexpectedHtmlLike(reactElementAdapter);

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

            return htmlLikeReactElement.inspect(value, depth, output, inspect);
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
            value.hasOwnProperty('createFactory') &&
            value.hasOwnProperty('isValidElement') &&
            value.hasOwnProperty('PropTypes'));
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
}

export default { installInto };