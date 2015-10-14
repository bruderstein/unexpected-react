import GlobalHook from '../globalHook';
import React from 'react';

function isRawType(value) {
    var type = typeof value;
    return type === 'string' ||
        type === 'number' ||
        type === 'boolean' ||
        type === 'undefined' ||
        value === null;
}

const RenderedReactElementAdapter = {
    getName(comp) {
        return comp.data.name;
    },

    getAttributes(comp) {
        // TODO: skip / remove 'children'
        const props = {};
        if (comp.data.props) {
            Object.keys(comp.data.props).forEach(prop => {
                if (prop !== 'children' && prop !== 'ref' && prop !== 'key') {
                    props[prop] = comp.data.props[prop];
                }
            });
        }

        return props;
    },

    getChildren(comp) {
        const children = [];
        if (comp.data.children) {
            if (isRawType(comp.data.children)) {
                return [comp.data.children];
            }
            return comp.data.children.map(child => {
                const renderedChild = GlobalHook.findInternalComponent(child);
                if (renderedChild.data.nodeType === 'NativeWrapper') {
                    return GlobalHook.findInternalComponent(renderedChild.data.children[0]);
                }
                return renderedChild;
            });
        }
        return children;
    }
};

export default RenderedReactElementAdapter;