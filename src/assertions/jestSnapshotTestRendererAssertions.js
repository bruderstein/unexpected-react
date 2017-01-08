import { compareSnapshot } from '../helpers/snapshots';
import { triggerEvent } from './testRendererAgainstRawAssertions';
import ReactTestAdapter from 'unexpected-htmllike-testrenderer-adapter'

function installInto(expect) {
  
  const reactTestAdapter = new ReactTestAdapter({ convertToString: true, concatStringContent: true });

  expect.addAssertion('<ReactTestRenderer> to match snapshot',
    function (expect, subject) {
      compareSnapshot(expect, { }, reactTestAdapter, subject, subject.toJSON());
    }
  );
  
  expect.addAssertion('<ReactTestRendererPendingEvent> to match snapshot',
    function (expect, subject) {
      triggerEvent(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      expect.errorMode = 'bubble';
      expect(subject.renderer, 'to match snapshot');
    }
  );
  
  expect.addAssertion('<ReactTestRenderer> to satisfy snapshot',
    function (expect, subject) {
      compareSnapshot(expect, { satisfy: true }, reactTestAdapter, subject, subject.toJSON());
    }
  );
  
  expect.addAssertion('<ReactTestRendererPendingEvent> to satisfy snapshot',
    function (expect, subject) {
      triggerEvent(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      expect.errorMode = 'bubble';
      expect(subject.renderer, 'to satisfy snapshot');
    }
  );
}

module.exports = { installInto };
