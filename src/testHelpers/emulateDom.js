
module.exports = function (html) {
    if (typeof document !== 'undefined') {
        return;
    }

    const jsdom = require('jsdom').jsdom;
    global.document = jsdom(html || '');
    global.window = global.document.defaultView;

    for (let key in global.window) {
        if (!global[key]) {
            global[key] = global.window[key];
        }
    }
}