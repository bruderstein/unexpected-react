import GlobalHook from 'react-render-hook';
import React from 'react';
import UnexpectedHtmlLike from 'unexpected-htmllike';
import RenderedReactElementAdapter from 'unexpected-htmllike-reactrendered-adapter';

function installInto(expect) {

    const renderedReactElementAdapter = new RenderedReactElementAdapter({
        convertToString: true,
        concatTextContent: true
    });
    const htmlLikeRenderedReactElement = UnexpectedHtmlLike(renderedReactElementAdapter);

    expect.addType({

        name: 'RenderedReactElement',

        identify(value) {
            return (typeof value === 'object' &&
                value !== null &&
                (value._reactInternalInstance || value._reactInternalComponent) &&
                (typeof value.setState === 'function' || typeof value.updater === 'object' /* stateless components */));
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
                value.internalInstance &&
                value.data &&
                value.data.type &&
                value.data.nodeType);
        },

        inspect(value, depth, output, inspect) {
            return htmlLikeRenderedReactElement.inspect(value, depth, output, inspect);
        }
    });
}

export default { installInto };
