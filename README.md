# unexpected-react

Plugin for [unexpected](https://unexpected.js.org) to allow for testing the full virtual DOM, and 
against the shallow renderer (replaces [unexpected-react-shallow](https://github.com/bruderstein/unexpected-react-shallow))

TODO: Image

See the blog post for an introduction: https://medium.com/@bruderstein/unittesting-react-virtual-dom

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

**TODO: Image of the error**
# Assertions

All the assertions can be used with an instance of the shallow renderer, a shallow rendered component 
(i.e. the return value from `renderer.getRenderOutput()`), or a normally rendered component (i.e. the return
value from `React.render()`, or `TestUtils.renderIntoDocument()`). 

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

## Roadmap / Plans

* There are some performance optimisations to do. The performance suffers a bit due to the possible asynchronous nature of the inline assertions. Most of the time these will be synchronous, and hence we don't need to pay the price.
* Some helper functions, allowing directly calling functions passed to props may make working with events and the shallow renderer easier

# Contributing

We welcome pull requests, bug reports, and extra test cases. If you find something that doesn't work
as you believe it should, or where the output isn't as good as it could be, raise an issue!

## Thanks

Huge thanks to [@Munter](https://github.com/munter) for [unexpected-dom](https://github.com/munter/unexpected-dom),
and along with [@dmatteo](https://github.com/dmatteo) for handing over the unexpected-react name. 

[Unexpected](http://unexpected.js.org) is a great library to work with, and I offer my sincere thanks to [@sunesimonsen](https://github.com/sunesimonsen)
and [@papandreou](https://github.com/papandreou), who have created an assertion library that makes testing JavaScript a joy.

## License
MIT


