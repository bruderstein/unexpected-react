import RenderHook from 'react-render-hook';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import RawAdapter from 'unexpected-htmllike-raw-adapter';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import AssertionGenerator from './AssertionGenerator';
import { triggerEvent } from './shallowAssertions';

function getOptions(expect) {
  return {
    ActualAdapter: ReactElementAdapter,
      QueryAdapter: ReactElementAdapter,
    ExpectedAdapter: RawAdapter,
    actualTypeName: 'ReactShallowRenderer',
    queryTypeName: 'ReactElement',
    expectedTypeName: 'ReactRawObjectElement',
    getRenderOutput: renderer => renderer.getRenderOutput(),
    actualRenderOutputType: 'ReactElement',
    getDiffInputFromRenderOutput: renderOutput => renderOutput,
    rewrapResult: (renderer, target) => target,
    triggerEvent: triggerEvent.bind(expect)
  };
}
  
function installInto(expect) {
  const assertionGenerator = new AssertionGenerator(getOptions(expect));
  assertionGenerator.installInto(expect);
  return assertionGenerator;
}

function installAsAlternative(expect, mainAssertionGenerator) {
  const generatorOptions = getOptions(expect);
  const assertionGenerator = new AssertionGenerator({ mainAssertionGenerator, ...generatorOptions });
  assertionGenerator.installAlternativeExpected(expect);
}

export { installInto, installAsAlternative};
