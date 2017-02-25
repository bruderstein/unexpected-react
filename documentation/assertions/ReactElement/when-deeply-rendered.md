
You can render a component with the full DOM renderer directly with the `when deeply rendered` assertion.

This works with both stateful and stateless (functional) components, which can be easier than creating a manual wrapper and manually rendering into the DOM with `TestUtils.renderIntoDocument(...)` or `ReactDOM.render(...)`

Say you have these components:
```js

const Page = (props) => <a href={'/page-' + props.page}>Page {props.page}</a>;

const Pages = (props) => {
    const pageElements = [];
    for (let i = 1; i <= props.count; ++i) {
      pageElements.push(<Page key={i} page={i} />);
    }
    return (
      <div>
        {pageElements}
      </div>
    );
};

```

You can check the rendering directly using the `when deeply rendered` assertion, saving you from creating stateless wrappers and rendering into the DOM by hand:
```js
expect(<Pages count={3} />, 
    'when deeply rendered', 
    'to have rendered', 
    <div>
      <a href="/page-1">Page 1</a>
      <a href="/page-2">Page 2</a>
      <a href="/page-3">Page 3</a>
    </div>
);
```

Everything works after the `when deeply rendered`, so you can use events and all the other assertions as normal
```js
expect(<MyButton />, 
    'when deeply rendered', 
    'with event', 'click',
    'to have rendered', 
    <button>Button was clicked 1 times</button>
);
```
