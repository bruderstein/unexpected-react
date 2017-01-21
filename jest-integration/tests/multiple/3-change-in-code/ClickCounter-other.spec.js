import React from 'react';
import ClickCounter from '../ClickCounter';
import TestRenderer from 'react-test-renderer';
import Unexpected from 'unexpected';
import jestSnapshot from 'jest-snapshot';

import UnexpectedReact from '../../unexpected-react-test-renderer';

const expect = Unexpected.clone().use(UnexpectedReact);

describe('ClickCounter', function () {
  
  
  it('counts a single click', function () {
    // Changing the output for this test as well, then we have two changes in two separate test files
    const renderer = TestRenderer.create(<ClickCounter />);
    expect(renderer, 
            'with event click',
            'with event click',
            'with event click',
            'to match snapshot');
  });

});
