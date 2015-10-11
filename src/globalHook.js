const Backend = require('./react-devtools/backend/backend');
const GlobalHook = require('./react-devtools/backend/GlobalHook');

const ComponentMap = require('./componentMap');

if (typeof global.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
    delete global.__REACT_DEVTOOLS_GLOBAL_HOOK__;
}
if (typeof window !== 'undefined' && typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
    delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
}

// Install the global hook
const tempGlobal = {};

GlobalHook(tempGlobal);
const hook = tempGlobal.__REACT_DEVTOOLS_GLOBAL_HOOK__;
global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook;
if (typeof window !== 'undefined') {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook;
}

// Inject the backend
Backend(hook);


const exported = {
    hook,
    cleanup() {
        ComponentMap.clearAll();
    }
};

hook.sub('renderer-attached', function (args) {
    exported.rendererId = args.renderer;
    exported.helpers = args.helpers;
    exported.isAttached = true;
});


hook.sub('mount', component => {
    ComponentMap.mount(component);
});

exported.findComponent = function (component) {
    return ComponentMap.findComponent(component);
};

exported.findInternalComponent = function (internalComponent) {
    return ComponentMap.findInternalComponent(internalComponent);
}
module.exports = exported;

