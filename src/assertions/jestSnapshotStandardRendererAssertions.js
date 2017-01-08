import ReactRenderHook from 'react-render-hook';
import RawAdapter from 'unexpected-htmllike-raw-adapter';
import ReactElementAdapter from 'unexpected-htmllike-jsx-adapter';
import RenderedReactElementAdapter from 'unexpected-htmllike-reactrendered-adapter';
import { triggerEvent } from './shallowAssertions';
import { triggerEvent as triggerDeepEvent } from './deepAssertions'
import { compareSnapshot } from '../helpers/snapshots';


function installInto(expect) {

  const rawAdapter = new RawAdapter({ convertToString: true, concatTextContent: true });
  const shallowAdapter = new ReactElementAdapter({ convertToString: true });
  const renderedReactAdapter = new RenderedReactElementAdapter({ convertToString: true, concatTextContent: true });
  expect.addAssertion('<ReactShallowRenderer> to match snapshot',
    function (expect, subject) {
      compareSnapshot(expect, this.flags, shallowAdapter, subject, subject.getRenderOutput());
    }
  );
  
  expect.addAssertion('<ReactShallowRendererPendingEvent> to match snapshot',
    function (expect, subject) {
      triggerEvent(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      expect(subject.renderer, 'to match snapshot');
    }
  );

  expect.addAssertion('<RenderedReactElement> to match snapshot',
    function (expect, subject) {
      compareSnapshot(expect, this.flags, renderedReactAdapter, subject, ReactRenderHook.findComponent(subject));
    }
  );
  
  expect.addAssertion('<RenderedReactElementPendingEvent> to match snapshot',
    function (expect, subject) {
      triggerDeepEvent(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      expect(subject.renderer, 'to match snapshot');
    }
  );
  
  expect.addAssertion('<ReactShallowRenderer> to satisfy snapshot',
    function (expect, subject) {
      compareSnapshot(expect, { satisfy: true }, shallowAdapter, subject, subject.getRenderOutput());
    }
  );
  
  expect.addAssertion('<ReactShallowRendererPendingEvent> to satisfy snapshot',
    function (expect, subject) {
      triggerEvent(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      expect(subject.renderer, 'to satisfy snapshot');
    }
  );
  
  expect.addAssertion('<RenderedReactElement> to satisfy snapshot',
    function (expect, subject) {
      compareSnapshot(expect, { satisfy: true }, renderedReactAdapter, subject, ReactRenderHook.findComponent(subject));
    }
  );
  
  expect.addAssertion('<RenderedReactElementPendingEvent> to satisfy snapshot',
    function (expect, subject) {
      triggerDeepEvent(expect, subject.renderer, subject.target, subject.eventName, subject.eventArgs);
      expect(subject.renderer, 'to satisfy snapshot');
    }
  );
}

module.exports = { installInto };
