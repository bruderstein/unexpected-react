---
template: default.ejs
theme: dark
title: unexpected-react
repository: https://github.com/bruderstein/unexpected-react
---

# unexpected-react

Plugin for [unexpected](https://unexpected.js.org) to allow for testing the full virtual DOM, and 
against the shallow renderer (replaces [unexpected-react-shallow](https://github.com/bruderstein/unexpected-react-shallow))

!![output_demo](https://cloud.githubusercontent.com/assets/91716/11253997/c5d2a9b4-8e3e-11e5-8da5-2df95598865c.png)

See the blog post for an introduction: https://medium.com/@bruderstein/the-missing-piece-to-the-react-testing-puzzle-c51cd30df7a0

# Features

* Assert React component's output using the [shallow renderer](http://facebook.github.io/react/docs/test-utils.html#shallow-rendering)
* Assert React component's output using the full renderer and JSX "expected" values (e.g. `TestUtils.renderIntoDocument()`) 
* Assert React component's output using the test renderer ([react-test-renderer](https://www.npmjs.com/package/react-test-renderer) (require `unexpected-react/test-renderer`)
* Trigger events on components in shallow, full and test renderers
* Locate components using JSX queries in shallow, full and test renderers
* All assertions work identically with the shallow, full and test renderers, allowing you to mix and match in your tests, based on what you need.

# Examples

* Checking a simple render

```js
var todoList = TestUtils.renderIntoDocument(
  <TodoList>
    <TodoItem id={1} label="Buy flowers for the wife"/>
    <TodoItem id={2} label="Mow the lawn"/>
    <TodoItem id={3} label="Buy groceries"/>
  </TodoList>
);

expect(
  todoList,
  'to have rendered', 
  <TodoList>
    <div className='items'>
      <TodoItem id={1}>
        <span className="label">Buy flowers for the wife</span>
      </TodoItem>
      <TodoItem id={2}>
        <span className="label">Mow the lawn</span>
      </TodoItem>
      <TodoItem id={3}>
        <span className="label">Buy groceries</span>
      </TodoItem>
    </div>
  </TodoList>
);
```

* Triggering an event on a button inside a subcomponent (using the `eventTarget` prop to identify where the event should be triggered)

```js
expect(
  todoList,
  'with event click',
  'on', <TodoItem id={2}><span className="label" eventTarget /></TodoItem>,
  'to contain',
  <TodoItem id={2}>
    <div className='completed'>
      <span>Completed!</span>
    </div>
  </TodoItem>
);
```


* Locating a component with `queried for` then validating the render

```js
expect(
  todoList,
  'queried for', <TodoItem id={2} />,
  'to have rendered',
  <TodoItem id={2}>
    <div className='completed'/>
  </TodoItem>
);
```


* Locating a component and then checking the state of the component with the full renderer

```js#async:true
expect(todoList,
  'with event click',
  'on', <TodoItem id={1}><span className="label" eventTarget /></TodoItem>,
  'queried for', <TodoItem id={1} />
).then(todoItem => {
  // Here we're checking the state, but we could perform
  // any operation on the instance of the component.
  expect(todoItem.state, 'to satisfy', { completed: true });
});
```

* Calling an event and validating the output using the test renderer

```js#evaluate:false
const unexpected = require('unexpected');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const expect = unexpected.clone().use(require('unexpected-react/test-renderer'));

describe('ClickCounterButton', function () {
  
  it('shows the increased click count after a click event', function () {
    const renderer = TestRenderer.create(<ClickCounterButton />);
    expect(renderer, 
        'with event', 'click',
        'to have rendered',
        <button>Clicked {1} time</button>
    );
  });
});
```
# Usage

```
npm install --save-dev unexpected unexpected-react
```

## Initialising

### With the shallow renderer

```js#evaluate:false

var unexpected = require('unexpected');
var unexpectedReact = require('unexpected-react');

var React = require('react');
var ReactTestUtils = require('react-addons-test-utils');

// Require the component we want to test
var MyComponent = require('../MyComponent');

// Declare our `expect` instance to use unexpected-react
var expect = unexpected.clone()
    .use(unexpectedReact);
    
describe('MyComponent', function () {
    it('renders a button', function () {
        var renderer = ReactTestUtils.createRenderer();
        renderer.render(<MyComponent />);
        expect(renderer, 'to have rendered', <button>Click me</button>);
    });
});

```

### With the [test renderer](https://www.npmjs.com/package/react-test-renderer)

If you want to use the [react-test-renderer](https://www.npmjs.com/package/react-test-renderer), then **`require('unexpected-react/test-renderer')`**

```js#evaluate:false

var unexpected = require('unexpected');

// Note that for the test-renderer, we need a different `require`
var unexpectedReact = require('unexpected-react/test-renderer');

var React = require('react');
var TestRenderer = require('react-test-renderer');

var MyComponent = require('../MyComponent');

// define our instance of the `expect` function to use unexpected-react
const expect = unexpected.clone()
    .use(unexpectedReact);
    

describe('MyComponent', function () {
    it('renders a button', function () {
        var renderer = TestRenderer.create(<MyComponent />);
        expect(renderer, 'to have rendered', <button>Click me</button>);
    });
});
```

### With the full virtual DOM (all custom components AND the DOM elements)

If you want to assert over the whole virtual DOM, then you need to emulate the DOM 
(note this library is not designed for use in the browser - it may be possible, but at the 
very least, you'll need to disable the react-devtools)

If you don't need the virtual DOM, and you're just using the [shallow renderer](http://facebook.github.io/react/docs/test-utils.html#shallow-rendering),
then the order of the requires is not important, and you obviously don't need the `emulateDom.js` require.

The **order of `require`'s is important**. `unexpected-react` must be required **before** `react` is required. That means `unexpected-react` must be required
before any other file is required that requires React (e.g. your components!)

(You can also use the shallow renderer interchangeably with this setup)

```js#evaluate:false
// First require your DOM emulation file (see below)
require( '../testHelpers/emulateDom');

var unexpected = require('unexpected');

// then require unexpected-react
var unexpectedReact = require('unexpected-react');

// then react
var React = require('react');

// ...and optionally the addons
var TestUtils = require('react-addons-test-utils');

// then our component(s)
var MyComponent = require('../MyComponent);

// define our instance of the `expect` function to use unexpected-react
const expect = unexpected.clone()
    .use(unexpectedReact);
    
describe('MyComponent', function () {
    it('renders a button', function () {
        var component = TestUtils.renderIntoDocument(<MyComponent />);

        // All custom components and DOM elements are included in the tree,
        // so you can assert to whatever level you wish
        expect(component, 'to have rendered', 
          <MyComponent>
            <button>Click me</button>
          </MyComponent>);
    });
});
```

## Emulating the DOM

The `emulateDom` file depends on whether you want to use [`domino`](https://npmjs.com/package/domino), or [`jsdom`](https://npmjs.com/package/jsdom)

For `jsdom`:

```js#evaluate:false
// emulateDom.js - jsdom variant

if (typeof document === 'undefined') {

    const jsdom = require('jsdom').jsdom;
    global.document = jsdom('');
    global.window = global.document.defaultView;

    for (let key in global.window) {
        if (!global[key]) {
            global[key] = global.window[key];
        }
    }
}
```

For `domino`:

```js#evaluate:false
// emulateDom.js - domino variant

if (typeof document === 'undefined') {

    const domino = require('domino');
    global.window = domino.createWindow('');
    global.document = global.window.document;
    global.navigator = { userAgent: 'domino' };

    for (let key in global.window) {
        if (!global[key]) {
            global[key] = global.window[key];
        }
    }
}
```

# React Compatibility

v3.x.x is compatible with React v0.14.x and v15.
v2.x.x is compatible with React v0.13.x and v0.14.x

It is not planned to make further releases of the v2 branch, but if you still need 0.13 support,
and are missing things from v3, please raise an issue.

# Tests

For the shallow renderer, you can assert on the renderer itself (you can also write the same assertion for the result of `getRenderOutput()`)

```js
var renderer = TestUtils.createRenderer();

renderer.render(<MyButton />);

expect(renderer, 'to have rendered',
  <button>
      Button was clicked 1 times
  </button>
);
```

If this fails for some reason, you get a nicely formatted error, with the differences highlighted:

```output
expected
<button onClick={function bound onClick() { /* native code */ }}>
  Button was clicked 0 times
</button>
to have rendered <button>Button was clicked 1 times</button>

<button onClick={function bound onClick() { /* native code */ }}>
  Button was clicked 0 times // -Button was clicked 0 times
                             // +Button was clicked 1 times
</button>
```

If you've emulated the DOM, you can write a similar test, but using `ReactDOM.render()` (or `TestUtils.renderIntoDocument()`)

```js
var component = TestUtils.renderIntoDocument(<MyButton/>)
expect(component, 'to have rendered',
  <button>
      Button was clicked 1 times
  </button>
);
```

```output
expected
<MyButton>
  <button onClick={function bound onClick() { /* native code */ }}>
    Button was clicked 0 times
  </button>
</MyButton>
to have rendered <button>Button was clicked 1 times</button>

<MyButton>
  <button onClick={function bound onClick() { /* native code */ }}>
    Button was clicked 0 times // -Button was clicked 0 times
                               // +Button was clicked 1 times
  </button>
</MyButton>
```

Note the major difference between the shallow renderer and the "normal" renderer, is that child components are also
rendered.  That is easier to see with these example components:

```js

var Text = React.createClass({
   render() {
       return <span>{this.props.content}</span>;
   }
});

var App = React.createClass({
   render() {
        return (
            <div className="testing-is-fun">
              <Text content="hello" />
              <Text content="world" />
            </div>
        );
   }
});

```

Rendering the `App` component with the shallow renderer will not render the `span`s, only the 
`Text` component with the props.  If you wanted to test for the content of the span elements, you'd 
need to use `TestUtils.renderIntoDocument(...)`, or `ReactDOM.render(...)`

Because unexpected-react` by default ignores wrapper elements, and also "extra" children (child
nodes that appear in the actual render, but are not in the expected result), it is possible to 
test both scenarios with the full renderer. To demonstrate, all the following tests will pass:

```js
var component = TestUtils.renderIntoDocument(<App />);

// renders the Text components with the spans with the full renderer
expect(component, 'to have rendered', 
  <App>
    <div className="testing-is-fun">
      <Text content="hello">
        <span>hello</span>
      </Text>
      <Text content="world">
        <span>world</span>
      </Text>
    </div>
  </App>
);
```

```js
// renders the Text nodes with the full renderer'
   
expect(component, 'to have rendered', 
  <div className="testing-is-fun">
      <Text content="hello" />
      <Text content="world" />
  </div>
);
```

```js
// renders the spans with the full renderer

expect(component, 'to have rendered', 
  <div className="testing-is-fun">
      <span>hello</span>
      <span>world</span>
  </div>
);

```

The first test shows the full virtual DOM that gets rendered. The second test skips the `<App>` "wrapper" 
component, and leaves out the `<span>` children of the `<Text>` components. The third tests skips both 
the `<App>` wrapper component, and the `<Text>` wrapper component.


## Stateless components
Because [stateless components](https://facebook.github.io/react/docs/reusable-components.html#stateless-functions) can't be instantiated, `renderIntoDocument` won't return an instance back. 
Using the shallow renderer works as shown in the first example. 
For full rendering, they can be tested with a wrapper component as such:

```js
class StatelessWrapper extends React.Component {
  render() {
    return (this.props.children);
  }
}

var StatelessComponent = function (props) {
  return (
    <div>{ props.name }</div>
  )
}

var component = TestUtils.renderIntoDocument(<StatelessWrapper><StatelessComponent name="Daniel" /></StatelessWrapper>);
```

## Cleaning up

When using the normal renderer, unexpected-react makes use of [`react-render-hook`](https://npmjs.org/package/react-render-hook),
which utilises the code from the [React devtools](https://github.com/facebook/react-devtools). As there is no way for `react-render-hook` 
to know when a test is completed, it has to keep a reference to every rendered component. Whilst this shouldn't normally be an issue,
if you use a test runner that keeps the process alive (such as [wallaby.js](http://wallabyjs.com)), it is a good idea to call
`unexpectedReact.clearAll()` in a global `beforeEach()` or `afterEach()` block. This clears the cache of rendered nodes.

## Roadmap / Plans

* [DONE] ~~There are some performance optimisations to do. The performance suffers a bit due to the possible asynchronous nature of the inline assertions. Most of the time these will be synchronous, and hence we don't need to pay the price.~~
* [DONE] ~~`queried for` implementation~~
* [DONE] ~~Directly calling events on both the shallow renderer, and the full virtual DOM renderer~~
* Support Snapshot testing in Jest
* Cleanup output - where there are no differences to highlight, we could skip the branch

# Contributing

We welcome pull requests, bug reports, and extra test cases. If you find something that doesn't work
as you believe it should, or where the output isn't as good as it could be, raise an issue!

## Thanks

Huge thanks to [@Munter](https://github.com/munter) for [unexpected-dom](https://github.com/munter/unexpected-dom),
and along with [@dmatteo](https://github.com/dmatteo) from Podio for handing over the unexpected-react name. 

[Unexpected](http://unexpected.js.org) is a great library to work with, and I offer my sincere thanks to [@sunesimonsen](https://github.com/sunesimonsen)
and [@papandreou](https://github.com/papandreou), who have created an assertion library that makes testing JavaScript a joy.

## License
MIT


