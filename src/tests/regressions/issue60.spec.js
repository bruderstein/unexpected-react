import unexpectedReact from '../../unexpected-react';
import React, { Component } from 'react';
import { createRenderer } from 'react-test-renderer/shallow';
import unexpected from 'unexpected';

class Foo extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      value: null
    };
    
    this.handleChange = this.handleChange.bind(this);
  }
  
  handleChange(e) {
    this.setState({ value: e.target.value });
  }
  
  render() {
    const {
        value
    } = this.state;
    
    return (
      <div>
        <span>Value: {value}</span>
        <input onChange={this.handleChange} onInput={this.handleChange}/>
      </div>
    );
  }
}

const expect = unexpected
  .clone()
  .use(unexpectedReact);

describe('issue 60', function () {
  let renderer;
  
  beforeEach(() => {
    renderer = createRenderer();
  });
  
  describe('with event input', function () {
    it('renders value after input', function () {
      renderer.render(<Foo />);
      
      return expect(
          renderer,
          'with event input', { target: { value: 'Test' } },
          'on', <input/>, 
          'to contain',
          <span>Value: Test</span>
      );
    });
  });

  describe('with event change', function () {
    it('renders value after change', function () {
      renderer.render(<Foo />);
      
      return expect(
          renderer,
          'with event change', { target: { value: 'Test' } },
          'on', <input/>, 
          'to contain',
          <span>Value: Test</span>
      );
    });
  });

});
