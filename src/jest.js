import RenderHook from 'react-render-hook';

import types from './types/types';
import * as deepAssertions from './assertions/deepAssertions';
import * as deepAgainstRawAssertions from './assertions/deepAgainstRawAssertions';
import * as shallowAssertions from './assertions/shallowAssertions';
import * as shallowAgainstRawAssertions from './assertions/shallowAgainstRawAssertions';
import * as jestSnapshotStandardRendererAssertions from './assertions/jestSnapshotStandardRendererAssertions';
import * as snapshotFunctionType from './assertions/snapshotFunctionType';
import * as snapshotFunctionAssertions from './assertions/snapshotFunctionAssertions';


module.exports = {
  name: 'unexpected-react',
  
  installInto(expect) {
    
    expect.installPlugin(require('magicpen-prism'));
    
    types.installInto(expect);
    const mainAssertionGenerator = shallowAssertions.installInto(expect);
    shallowAgainstRawAssertions.installAsAlternative(expect, mainAssertionGenerator);
    
    const deepMainAssertionGenerator = deepAssertions.installInto(expect);
    deepAgainstRawAssertions.installAsAlternative(expect, deepMainAssertionGenerator);
    jestSnapshotStandardRendererAssertions.installInto(expect);
    snapshotFunctionType.installInto(expect);
    snapshotFunctionAssertions.installInto(expect);
  },
  
  clearAll() {
    RenderHook.clearAll();
  }
};
