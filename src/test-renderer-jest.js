import types from './types';
import * as testRendererAssertions from './testRendererAssertions';
import * as testRendererAgainstRawAssertions from './testRendererAgainstRawAssertions';
import * as jestSnapshotAssertions from './jestSnapshotTestRendererAssertions';

module.exports = {
  name: 'unexpected-react-test-renderer',
  
  installInto(expect) {
    
    expect.installPlugin(require('magicpen-prism'));
    
    types.installInto(expect);
    testRendererAssertions.installInto(expect);
    testRendererAgainstRawAssertions.installInto(expect);
    
    jestSnapshotAssertions.installInto(expect)
  },
  
  clearAll() {
    // No-op. Left in so that tests can easily use either interface
  }
};
