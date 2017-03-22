import types from './types/types';
import * as testRendererAssertions from './assertions/testRendererAssertions';
import * as testRendererAgainstRawAssertions from './assertions/testRendererAgainstRawAssertions';
import * as jestSnapshotAssertions from './assertions/jestSnapshotTestRendererAssertions';
import * as snapshotFunctionType from './assertions/snapshotFunctionType';
import * as snapshotFunctionAssertions from './assertions/snapshotFunctionAssertions';

module.exports = {
  name: 'unexpected-react-test-renderer',
  
  installInto(expect) {
    
    expect.installPlugin(require('magicpen-prism'));
    
    types.installInto(expect);
    
    // This is a bit of a hack. The AssertionGenerator generates a type for context to add the pending event,
    // and this type must be re-used when adding further assertions with a different expected type
    // - in this case that's the RawAdapter type rather than the ReactElement type.
    
    // It works, but it's ugly.  It would be nicer to split the AssertionGenerator out further
    // such that this could be less ugly - not sure how that would look though.
    
    // This /may/ be solved by the upcoming (possibly already existing!) expect.context interface.
    // When that's available, we won't need the intermediate type for pending events, and we can just
    // add the pending event to the context and have the main assertions handle it.
    
    // But we can't rely on that yet, I don't think
    
    const mainAssertionGenerator = testRendererAssertions.installInto(expect);
    testRendererAgainstRawAssertions.installAsAlternative(expect, mainAssertionGenerator);
    
    jestSnapshotAssertions.installInto(expect);
    snapshotFunctionType.installInto(expect);
    snapshotFunctionAssertions.installInto(expect);

      expect.addAssertion('<RawReactTestRendererJson> to match snapshot', function (expect, subject) {
          expect.errorMode = 'bubble';
          expect.fail({
              message: function (output) {
                  return output.text('To assert snapshots, use the testRenderer directly, not the result of `.toJSON()`')
                      .nl().i()
                      .text('e.g.')
                      .nl().i()
                      .text('  const testRenderer = ReactTestRenderer.create(<MyComponent />);').nl().i()
                      .text('  expect(testRenderer, \'to match snapshot\');');
              }
          });
      });
  },
  
  clearAll() {
    // No-op. Left in so that tests can easily use either interface
  }
};
