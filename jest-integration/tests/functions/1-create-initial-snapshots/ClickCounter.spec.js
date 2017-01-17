import React from 'react';
import ClickCounter from '../ClickCounter';
import TestRenderer from 'react-test-renderer';
import Unexpected from 'unexpected';
import jestSnapshot from 'jest-snapshot';

import UnexpectedReact from '../../unexpected-react-test-renderer';

const expect = Unexpected.clone().use(UnexpectedReact);

describe('ClickCounter', function () {

  it('renders with default props', function () {

    const renderer = TestRenderer.create(<ClickCounter />);
    expect(renderer, 'to match snapshot');
  });

  // We've removed all other tests, as the onClick won't work without the binding
  // but the point of this test it to check that the test notices the binding is gone
});
