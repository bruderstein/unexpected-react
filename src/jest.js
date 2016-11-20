import RenderHook from 'react-render-hook';

import types from './types/types';
import * as deepAssertions from './assertions/deepAssertions';
import * as shallowAssertions from './assertions/shallowAssertions';


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
