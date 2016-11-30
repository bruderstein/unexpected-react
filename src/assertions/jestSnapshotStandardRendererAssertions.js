import RawAdapter from 'unexpected-htmllike-raw-adapter';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import RenderedReactElementAdapter from 'unexpected-htmllike-reactrendered-adapter';
import { triggerEvent } from './shallowAssertions';
import { compareSnapshot } from '../helpers/snapshots';


function installInto(expect) {

  const rawAdapter = new RawAdapter({ convertToString: true, concatTextContent: true });
  const shallowAdapter = new ReactElementAdapter({ convertToString: true });
  const renderedReactAdapter = new RenderedReactElementAdapter({ convertToString: true, concatTextContent: true });
  expect.addAssertion('<ReactShallowRenderer> to [exactly] match snapshot [with all children] [with all wrappers]',
    function (expect, subject) {
      compareSnapshot(expect, this.flags, shallowAdapter, subject, subject.getRenderOutput());
    }
  );
  
  expect.addAssertion('<ReactShallowRendererPendingEvent> to [exactly] match snapshot [with all children] [with all wrappers]',
    function (expect, subject) {
      triggerEvent(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      expect(subject.renderer, 'to [exactly] match snapshot [with all children] [with all wrappers]');
    }
  );

  expect.addAssertion('<RenderedReactElement> to [exactly] match snapshot [with all children] [with all wrappers]',
    function (expect, subject) {
      compareSnapshot(expect, this.flags, rawAdapter.convertFromOther(renderedReactAdapter, subject));
    }
  );
}

module.exports = { installInto };
