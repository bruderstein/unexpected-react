import { compareSnapshot } from '../helpers/snapshots';
import { triggerEvent } from './testRendererAgainstRawAssertions';
import ReactTestAdapter from 'unexpected-htmllike-testrenderer-adapter'

function installInto(expect) {
  
  const reactTestAdapter = new ReactTestAdapter({ convertToString: true, concatStringContent: true });

  expect.addAssertion('<ReactTestRenderer> to [exactly] match snapshot [with all children] [with all wrappers]',
    function (expect, subject) {
      compareSnapshot(expect, this.flags, reactTestAdapter, subject, subject.toJSON());
    }
  );
  
  expect.addAssertion('<ReactTestRendererPendingEvent> to [exactly] match snapshot [with all children] [with all wrappers]',
    function (expect, subject) {
      triggerEvent(subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      expect.errorMode = 'bubble';
      expect(subject.renderer, 'to [exactly] match snapshot [with all children] [with all wrappers]');
    }
  );
}

module.exports = { installInto };
