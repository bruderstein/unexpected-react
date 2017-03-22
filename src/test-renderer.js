import types from './types/types';
import * as testRendererAssertions from './assertions/testRendererAssertions';

module.exports = {
  name: 'unexpected-react-test-renderer',
  
  installInto(expect) {

      expect.installPlugin(require('magicpen-prism'));

      types.installInto(expect);
      testRendererAssertions.installInto(expect);

      expect.addAssertion([
          '<ReactTestRenderer|ReactTestRendererOutput> to match snapshot',
          '<ReactTestRenderer|ReactTestRendererOutput> to satisfy snapshot',
      ], function (expect) {

          expect.errorMode = 'bubble';
          expect.fail({
              message: function (output) {
                  return output.text('To use the `')
                      .error(expect.testDescription)
                      .text('` assertion with the test renderer, require unexpected-react as `require(\'unexpected-react/test-renderer-jest\');`');
              }
          });
      });

      expect.addAssertion([
          '<RawReactTestRendererJson> to match snapshot',
          '<RawReactTestRendererJson> to satisfy snapshot',
      ], function (expect) {

          expect.errorMode = 'bubble';
          expect.fail({
              message: function (output) {
                  return output.text('To use the `')
                      .error(expect.testDescription)
                      .text('` assertion with the test renderer, require unexpected-react as `require(\'unexpected-react/test-renderer-jest\');`')
                      .nl().i()
                      .nl().i()
                      .text('Also, don\'t pass the JSON, pass the test renderer directly');
              }
          });
      });

  },
  
  clearAll() {
    // No-op. Left in so that tests can easily use either interface
  }
};
