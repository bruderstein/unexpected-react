import RenderHook from 'react-render-hook';

import types from './types';
import assertions from './assertions';


module.exports = {
    name: 'unexpected-react',

    installInto(expect) {

        expect.installPlugin(require('magicpen-prism'));

        types.installInto(expect);
        assertions.installInto(expect);
    },

    clearAll() {
        RenderHook.clearAll();
    }
};
