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
  
  it('counts multiple clicks', function () {
    const renderer = TestRenderer.create(<ClickCounter />);
    expect(renderer,
      'with event click',
      'with event click',
      'with event click',
      'to match snapshot');
  });
  
  it('passes multiple snapshots in a single test', function () {
    let renderer = TestRenderer.create(<ClickCounter />);
    expect(renderer, 'to match snapshot');
    renderer = TestRenderer.create(<ClickCounter />);
    expect(renderer,
      'with event click',
      'with event click',
      'with event click',
      'to match snapshot');
  });
});
