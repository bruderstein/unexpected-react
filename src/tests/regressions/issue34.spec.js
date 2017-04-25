import unexpectedReact from '../../unexpected-react';
import React, { Component } from 'react';
import { createRenderer } from 'react-dom/test-utils';
import unexpected from 'unexpected';

class Foo extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      focus: false
    };
    
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }
  
  handleFocus(e) {
    this.setState({ focus: true });
  }
  
  handleBlur(e) {
    this.setState({ focus: false });
  }
  
  render() {
    const {
      focus
    } = this.state;
    
    return (
      <div tabIndex='0' onFocus={this.handleFocus} onBlur={this.handleBlur}>
        {focus &&
        <div className='with-focus'>
          <span>with focus</span>
        </div>
        }
      </div>
    );
  }
}

const expect = unexpected
  .clone()
  .use(unexpectedReact);

describe('issue 34', function () {
  let renderer;
  
  before(() => {
    expect.addAssertion('<ReactShallowRenderer> when focussed <assertion>', (expect, renderer) => {
      const { props: { onFocus } } = renderer.getRenderOutput();
      onFocus();
      return expect.shift(renderer);
    });
    expect.addAssertion('<ReactShallowRenderer> when blurred <assertion>', (expect, renderer) => {
      const { props: { onBlur } } = renderer.getRenderOutput();
      onBlur();
      return expect.shift(renderer);
    });
  });
  
  beforeEach(() => {
    renderer = createRenderer();
  });
  
  describe('with event', function () {
    it(`renders div.with-focus on focus`, function () {
      renderer.render(<Foo />);
      
      return expect(renderer, 'with event focus', 'to contain', (
        <div className='with-focus'>
          <span>with focus</span>
        </div>
      ));
    });
    
    it(`does not render div.with-focus' on blur`, function () {
      renderer.render(<Foo />);
      
      return expect(renderer, 'with event focus', 'with event blur', 'not to contain', (
        <div className='with-focus' />
      ));
    });
  });
  
  describe('custom', function () {
    it(`renders div.with-focus on focus`, function () {
      renderer.render(<Foo />);
      
      return expect(renderer, 'when focussed', 'to contain', (
        <div className='with-focus'>
          <span>with focus</span>
        </div>
      ));
    });
    
    it(`does not render div.with-focus on blur`, function () {
      renderer.render(<Foo />);
      
      return expect(renderer, 'when focussed', 'when blurred', 'not to contain', (
        <div className='with-focus' />
      ));
    });
  });
});