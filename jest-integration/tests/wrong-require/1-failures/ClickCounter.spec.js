import React from 'react';
import ClickCounter from '../ClickCounter';
import Unexpected from 'unexpected';
import jestSnapshot from 'jest-snapshot';
import TestUtils from 'react-addons-test-utils';

import UnexpectedReact from '../../unexpected-react-non-jest';

const expect = Unexpected.clone().use(UnexpectedReact);

describe('ClickCounter', function () {

  it('renders with default props', function () {
    const renderer = TestUtils.createRenderer();
    renderer.render(<ClickCounter />);
    // This will fail as we've not included the unexpected-react/jest
    expect(renderer, 'to match snapshot');
  });

  it('renders with `when rendered`', function () {
    // This will also fail, but should include the `when rendered` message
    expect(<ClickCounter />, 'when rendered', 'to match snapshot');
  });

  it('renders with default props with to satisfy', function () {
    const renderer = TestUtils.createRenderer();
    renderer.render(<ClickCounter />);
    // This will fail as we've not included the unexpected-react/jest
    expect(renderer, 'to satisfy snapshot');
  });

  it('renders with `when rendered to satisfy`', function () {
    // This will also fail, but should include the `when rendered` message
    expect(<ClickCounter />, 'when rendered', 'to satisfy snapshot');
  });

});
