'use strict';

if (typeof document === 'undefined') {

    var jsdom = require('jsdom').jsdom;
    global.document = jsdom('');
    global.window = global.document.defaultView;

    for (var key in global.window) {
        if (!global[key]) {
            global[key] = global.window[key];
        }
    }
}
//# sourceMappingURL=emulateDom.js.map