
const nodes = new Map();

exports.mount = function (component) {

    const rootNodeID = component.element._rootNodeID;
    let elementsInRoot = nodes.get(rootNodeID);
    if (elementsInRoot === undefined) {
        elementsInRoot = [];
        nodes.set(rootNodeID, elementsInRoot);
    }
    elementsInRoot.push(component);
};

exports.findComponent = function (component) {
    if (component && component._reactInternalInstance) {
        const elementsInRoot = nodes.get(component._reactInternalInstance._rootNodeID);
        if (elementsInRoot) {
            for (let index = elementsInRoot.length - 1; index >= 0; --index) {
                if (elementsInRoot[index].data.publicInstance === component) {
                    const renderedComponent = elementsInRoot[index];
                    if (renderedComponent.data.nodeType === 'NativeWrapper') {
                        return exports.findInternalComponent(renderedComponent.data.children[0]);
                    }
                    return renderedComponent;
                }
            }
        }
    }

    return null;
};

exports.findInternalComponent = function (internalComponent) {
    if (internalComponent) {
        const elementsInRoot = nodes.get(internalComponent._rootNodeID);
        if (elementsInRoot) {
            for (let index = elementsInRoot.length - 1; index >= 0; --index) {
                if (elementsInRoot[index].element === internalComponent) {
                    return elementsInRoot[index];
                }
            }
        }

    }
}

exports.clearAll = function () {
   nodes.clear();
};