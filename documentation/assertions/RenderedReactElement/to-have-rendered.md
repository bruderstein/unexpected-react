Given the following test component:

```js
class MyComponent extends React.Component {
  render () {
    return (
      <div className="parent" id="main">
        <span>one</span>
        <span>two</span>
        <span>three</span>
      </div>
    );
  }
}
```

Let's render the component with the virtual DOM renderer:

```js
const component = TestUtils.renderIntoDocument(<MyComponent />);
```

```js
// Extra props and children from the render are ignored
expect(component, 'to have rendered', <div className="parent" />);
```

```js
// The span "two" is missing here, but it is ignored.
expect(component, 'to have rendered',
  <div id="main">
    <span>one</span>
    <span>three</span>
  </div>
);
```

```js
// The following assertion will fail, as 'four' does not exist
expect(component, 'to have rendered',
  <div id="main">
    <span>one</span>
    <span>four</span>
  </div>
);
```

```output
expected
<MyComponent>
  <div className="parent" id="main">
    <span>one</span><span>two</span><span>three</span>
  </div>
</MyComponent>
to have rendered <div id="main"><span>one</span><span>four</span></div>

<MyComponent>
  <div className="parent" id="main">
    <span>one</span>
    <span>
      two // -two
          // +four
    </span>
    <span>three</span>
  </div>
</MyComponent>
```

If you want to check for an exact render, use `'to have exactly rendered'`.

Alternatively, if you don't care about extra props, but want to check that there are no extra child nodes, use `'to have rendered with all children'`
Note that `exactly` implies `with all children`, so you using both options is not necessary.

Normally wrappers (elements that simply wrap other components) are ignored. This can be useful if you have higher order
components wrapping your components, you can simply ignore them in your tests (they will be shown greyed out 
if there is a "real" error).  If you want to test that there are no extra wrappers, simply add 
`with all wrappers` to the assertion.


```js
// The span "two" is missing here, as is `className="parent"`
// The missing span will cause an assertion error, but the extra prop will be ignored
// due to `to have rendered with all children` being used

expect(component, 'to have rendered with all children',
  <div id="main">
    <span>one</span>
    <span>three</span>
  </div>
);
```

```output
expected
<MyComponent>
  <div className="parent" id="main">
    <span>one</span><span>two</span><span>three</span>
  </div>
</MyComponent>
to have rendered with all children <div id="main"><span>one</span><span>three</span></div>

<MyComponent>
  <div className="parent" id="main">
    <span>one</span>
    <span>two</span> // should be removed
    <span>three</span>
  </div>
</MyComponent>
```

```js
// The span "two" is missing here, as is `className="parent"`
// This will cause an assertion error,
// due to `to have exactly rendered` being used

expect(component, 'to have exactly rendered',
  <MyComponent>
    <div id="main">
      <span>one</span>
      <span>three</span>
    </div>
  </MyComponent>
);
```

```output
expected
<MyComponent>
  <div className="parent" id="main">
    <span>one</span><span>two</span><span>three</span>
  </div>
</MyComponent>
to have exactly rendered <MyComponent><div id="main"><span>one</span><span>three</span></div></MyComponent>

<MyComponent>
  <div className="parent" // className should be removed
     id="main">
    <span>one</span>
    <span>two</span> // should be removed
    <span>three</span>
  </div>
</MyComponent>
```

