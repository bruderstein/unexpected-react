import types from './types/types';
import * as testRendererAssertions from './assertions/testRendererAssertions';

module.exports = {
  name: 'unexpected-react-test-renderer',
  
  installInto(expect) {
    
    expect.installPlugin(require('magicpen-prism'));
    
    types.installInto(expect);
    testRendererAssertions.installInto(expect);
  },
  
  clearAll() {
    // No-op. Left in so that tests can easily use either interface
  }
};
