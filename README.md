# unexpected-react

Plugin for [unexpected](https://unexpected.js.org) to allow for testing the full virtual DOM, and 
against the shallow renderer (replaces [unexpected-react-shallow](https://github.com/bruderstein/unexpected-react-shallow))

!![output_demo](https://cloud.githubusercontent.com/assets/91716/11253997/c5d2a9b4-8e3e-11e5-8da5-2df95598865c.png)

See the blog post for an introduction: https://medium.com/@bruderstein/the-missing-piece-to-the-react-testing-puzzle-c51cd30df7a0

# Usage

```
npm install --save-dev unexpected unexpected-react
```

If you want to assert over the whole virtual DOM, then you need to emulate the DOM 
(note this library is not designed for use in the browser - it may be possible, but at the 
very least, you'll need to disable the react-devtools)

If you don't need the virtual DOM, and you're just using the [shallow renderer](http://facebook.github.io/react/docs/test-utils.html#shallow-rendering),
then the order of the requires is not important, and you obviously don't need the `emulateDom.js` require.

```js
// First require your DOM emulation file (see below)
require( '../testHelpers/emulateDom');

var unexpected = require('unexpected');

// then require unexpected-react
var unexpectedReact = require('unexpected-react');

// then react
var React = require('react/addons');

// define our instance of the `expect` function to use
const expect = unexpected.clone()
    .use(unexpectedReact);

```

The `emulateDom` file depends on whether you want to use [`domino`](https://npmjs.com/package/domino), or [`jsdom`](https://npmjs.com/package/jsdom)

For `jsdom`:
```js
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
```js
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

From that point on, you can `require` the components you want to test, and write your tests.

# Tests

For the shallow renderer, you can assert on the renderer itself (you can also write the same assertion for the result of `getRenderOutput()`)

```js

it('renders with content', function () {

    var renderer = TestUtils.createRenderer();

    renderer.render(<SomeComponent id={125} />);

    return expect(renderer, 'to have rendered',
       <div id={125}>
          Some simple content
       </div>
    );
});
```

If this fails for some reason, you get a nicely formatted error, with the differences highlighted:

![shallow_simple](https://cloud.githubusercontent.com/assets/91716/11193811/fde1eadc-8ca8-11e5-918a-45bc7c1e0efd.png)


If you've emulated the DOM, you can write a similar test, but using `ReactDOM.render()` (or `TestUtils.renderIntoDocument()`)

```js
it('renders with content', function () {

    var component = TestUtils.renderIntoDocument(<SomeComponent id={125} />);

    return expect(component, 'to have rendered',
       <div id={125}>
          Some simple content
       </div>
    );
});
```

![deeprender_simple](https://cloud.githubusercontent.com/assets/91716/11193714/8028b224-8ca8-11e5-9d34-65532b06417f.png)

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

Because `unexpected-react` be default ignores wrapper elements, and also "extra" children (child
nodes that appear in the actual render, but are not in the expected result), it is possible to test both scenarios 
with the full renderer. To demonstrate, all the following tests will pass:

```js

it('renders the Text components with the spans with the full renderer', function () {

   var component = TestUtils.renderIntoDocument(<App />);
   
   return expect(component, 'to have rendered', 
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
});

it('renders the Text nodes with the full renderer', function () {

   var component = TestUtils.renderIntoDocument(<App />);
   
   return expect(component, 'to have rendered', 
      <div className="testing-is-fun">
         <Text content="hello" />
         <Text content="world" />
      </div>
   );
});

it('renders the spans with the full renderer', function () {

   var component = TestUtils.renderIntoDocument(<App />);
   
   return expect(component, 'to have rendered', 
      <div className="testing-is-fun">
         <span>hello</span>
         <span>world</span>
      </div>
   );
});

```

The first test shows the full virtual DOM that gets rendered. The second test skips the `<App>` "wrapper" component,
and leaves out the `<span>` children of the `<Text>` components. The third tests skips both the `<App>` wrapper component,
and the `<Text>` wrapper component.

Notice that the result from `expect` is returned from the `it` block. The `unexpected-react` assertions are currently
asynchronous, and *can* therefore return a promise.  When using [mocha](https://npmjs.com/package/mocha), you can return
 the promise from the `it` block, and `mocha` will wait for the promise to be resolved.

# Assertions

All the assertions can be used with an instance of the shallow renderer, a shallow rendered component 
(i.e. the return value from `renderer.getRenderOutput()`), or a normally rendered component (i.e. the return
value from `ReactDOM.render()` (`React.render()` in React <= 0.13.x), or `TestUtils.renderIntoDocument()`). 

You can make the following assertions:
## `to have [exactly] rendered [with all children] [with all wrappers]`

```js
// Extra props and children from the render are ignored
expect(component, 'to have rendered', <div className="parent" />);

// The span "two" is missing here, but it is ignored.
expect(component, 'to have rendered',
   <div id="main">
      <span>one</span>
      <span>three</span>
  </div>
);

// The following assertion will fail, as 'four' does not exist
expect(renderer, 'to have rendered',
   <div id="main">
      <span>one</span>
      <span>four</span>
  </div>
);
```

If you want to check for an exact render, use `'to have exactly rendered'`.

Alternatively, if you don't care about extra props, but want to check that there are no extra child nodes, use `'to have rendered with all children'`
Note that `exactly` implies `with all children`, so you using both options is not necessary.

Normally wrappers (elements that simply wrap other components) are ignored. This can be useful if you have higher order
components wrapping your components, you can simply ignore them in your tests (they will be shown greyed out 
if there is a "real" error).  If you want to test that there are no extra wrappers, simply add `with all wrappers` to the
assertion.


```js

// The span "two" is missing here, as is `className="parent"`
// The missing span will cause an assertion error, but the extra prop will be ignored
// due to `to have rendered with all children` being used

expect(renderer, 'to have rendered with all children',
   <div id="main">
      <span>one</span>
      <span>three</span>
  </div>
);
```

```js

// The span "two" is missing here, as is `className="parent"`
// This will cause an assertion error,
// due to `to have exactly rendered` being used

expect(renderer, 'to have exactly rendered',
   <div id="main">
      <span>one</span>
      <span>three</span>
  </div>
);
```

## `[not] to contain [exactly] [with all children] [with all wrappers]`

It's possible to check for a part of the subtree, without
testing the entire returned tree.  This allows you to test specific elements, without
writing brittle tests that break when the structure changes.

```js
// This will pass, as `<span className="middle">two</span>` can be found in the renderers output
expect(renderer, 'to contain', <span>two</span>);
```

Notice that the extra `className="middle"` in the `<span className="middle">two</span>` is ignored,
in a similar way to the `to have rendered` assertion.

You can override this behaviour by using `'to contain exactly'`, and `'to contain with all children'`


```js
// This will fail, as `<span>two</span>` cannot be found in the renderers output, due to
// the missing `className="middle"` prop
expect(renderer, 'to contain exactly', <span>two</span>);

```

The same thing applies to children for `'to contain'` as for `'to have rendered'`.

# Strings

String content is split up by React when you have embedded variables.

For example:

```js
{
    render: function() {
        return (
           <div>
              Click on {this.props.clickCount} times
           </div>
        );
    }
}
```

This actually produces 3 "child" elements of the div, `Click on `, the `clickCount` and the ` times`
To make this simpler, `unexpected-react-shallow` concatenates these values so you can simply test the
previous example as follows:

```js
expect(renderer, 'to have rendered',
    <div>
       Clicked on 3 times
    </div>);
```

If you use the `exactly` variants of the assertions, you will need to split up your assertion in the same way

e.g.
```js
expect(renderer, 'to have exactly rendered',
    <div>
       Clicked on {3} times
    </div>);
```

## Cleaning up

When using the normal renderer, unexpected-react makes use of [`react-render-hook`](https://npmjs.org/package/react-render-hook),
which utilises the code from the [React devtools](https://github.com/facebook/react-devtools). As there is no way for `react-render-hook` 
to know when a test is completed, it has to keep a reference to every rendered component. Whilst this shouldn't normally be an issue,
if you use a test runner that keeps the process alive (such as [wallaby.js](http://wallabyjs.com)), it is a good idea to call
`unexpectedReact.clearAll()` in a global `beforeEach()` or `afterEach()` block. This clears the cache of rendered nodes.

## Roadmap / Plans

* There are some performance optimisations to do. The performance suffers a bit due to the possible asynchronous nature of the inline assertions. Most of the time these will be synchronous, and hence we don't need to pay the price.
* Some helper functions, allowing directly calling functions passed to props may make working with events and the shallow renderer easier

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


