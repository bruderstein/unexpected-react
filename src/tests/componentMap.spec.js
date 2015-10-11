import Unexpected from 'unexpected';

import ComponentMap from '../componentMap';

const expect = Unexpected.clone();

function TestElement(rootNodeID, name) {
    this._rootNodeID = rootNodeID;
    // Just some property for identification later - doesn't matter what it is
    this.name = name;
}

function getPublicInstance(internalInstance) {
    if (!internalInstance.publicInstance) {
        internalInstance.publicInstance = {
            name: internalInstance.name,
            _reactInternalInstance: internalInstance
        };
    }

    return internalInstance.publicInstance;
}

const testInternalInstance1 = new TestElement('1', 'one');
const testInstance1 = getPublicInstance(testInternalInstance1);
const testInternalInstance2 = new TestElement('2', 'two');
const testInstance2 = getPublicInstance(testInternalInstance2);

const testInternalInstance2b = new TestElement('2', 'two - second');
const testInstance2b = getPublicInstance(testInternalInstance2b);

describe('componentMap', () => {

    it('finds a single added component', () => {

        ComponentMap.mount({
            element: testInternalInstance1,
            data: { test: 123, publicInstance: testInstance1 }
        });

        const located = ComponentMap.findComponent(testInstance1);
        expect(located, 'to satisfy', {
            data: { test: 123 }
        });

    });

    it('finds a component when two different roots are added', () => {

        ComponentMap.mount({
            element: testInternalInstance1,
            data: { test: 123, publicInstance: testInstance1 }
        });

        ComponentMap.mount({
            element: testInternalInstance2,
            data: { test: 123, publicInstance: testInstance2 }
        });

        const located = ComponentMap.findComponent(testInstance1);
        expect(located, 'to satisfy', {
            data: { test: 123 }
        });
    });

    it('finds a component when two different components in the same root', () => {

        ComponentMap.mount({
            element: testInternalInstance2,
            data: { test: 123, publicInstance: testInstance2 }
        });

        ComponentMap.mount({
            element: testInternalInstance2b,
            data: { test: 234, publicInstance: testInstance2b }
        });

        const located = ComponentMap.findComponent(testInstance2);
        expect(located, 'to satisfy', {
            data: { test: 123 }
        });

        const second = ComponentMap.findComponent(testInstance2b);
        expect(second, 'to satisfy', {
            data: { test: 234 }
        });
    });

    it('does not find a component after clearAll()', () => {

        ComponentMap.mount({
            element: testInternalInstance2,
            data: { test: 123, publicInstance: testInstance2 }
        });

        ComponentMap.clearAll();

        const located = ComponentMap.findComponent(testInstance2);
        expect(located, 'to be null');
    });

});
