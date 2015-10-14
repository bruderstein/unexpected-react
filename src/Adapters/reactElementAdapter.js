import React from 'react';

function isRawType(value) {
    var type = typeof value;
    return type === 'string' ||
        type === 'number' ||
        type === 'boolean' ||
        type === 'undefined' ||
        value === null;
}

const ReactElementAdapter = {
    getName(element) {
        if (typeof element.type === 'string') {
            return element.type;
        }

        return element.type.displayName || element.type.name || 'no-display-name';
    },

    getAttributes(element) {

        var realProps = {};
        if (element.props) {
            for(var key in element.props) {
                if (key !== 'children') {
                    realProps[key] = element.props[key];
                }
            }
        }
        return realProps;
    },

    getChildren(element) {

        var childrenArray = [];
        React.Children.forEach(element.props.children, function (child) {
            if (child !== null) {
                childrenArray.push(child);
            }
        });

        return childrenArray;
    }
};

export default ReactElementAdapter;