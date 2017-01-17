import React from 'react';
import ClickCounter from '../ClickCounter';
import TestRenderer from 'react-test-renderer';
import Unexpected from 'unexpected';
import jestSnapshot from 'jest-snapshot';

import UnexpectedReact from '../../unexpected-react-test-renderer';

const expect = Unexpected.clone().use(UnexpectedReact);

describe('ClickCounter', function () {
  
  
  it('counts a single click', function () {
    // this test has the same name as the test in the other main spec file
    // but this changes the output, to ensure that the snapshots are being stored
    // correctly per test file
    const renderer = TestRenderer.create(<ClickCounter />);
    expect(renderer, 
            'with event click',
            'with event click',
            'to match snapshot');
  });

});
