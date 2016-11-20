import RenderHook from 'react-render-hook';

import types from './types';
import * as deepAssertions from './deepAssertions';
import * as shallowAssertions from './shallowAssertions';


module.exports = {
  name: 'unexpected-react',
  
  installInto(expect) {
    
    expect.installPlugin(require('magicpen-prism'));
    
    types.installInto(expect);
    shallowAssertions.installInto(expect);
    deepAssertions.installInto(expect);
    
  },
  
  clearAll() {
    RenderHook.clearAll();
  }
};
