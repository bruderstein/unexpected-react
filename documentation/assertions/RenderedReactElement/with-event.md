## `with event` .... [`on`]

`with event` can trigger events in both the shallow and full renderer.  For the normal full renderer,
`TestUtils.Simulate` is used to simulate the event. For the shallow renderer, it is expected that 
there is a prop with the name `on[EventName]`, where the first letter of the event is capitalised.

e.g. with a button that counts it's own clicks

```js
var component = TestUtils.renderIntoDocument(<MyButton />);

expect(component, 'with event', 'click', 'to have rendered', <button>Button was clicked 1 times</button>);
```

Given the following todo list:

```js
var component = TestUtils.renderIntoDocument(
  <TodoList>
    <TodoItem id={1} label="Buy flowers for the wife"/>
    <TodoItem id={2} label="Mow the lawn"/>
    <TodoItem id={3} label="Buy groceries"/>
  </TodoList>
);
```

If you want to trigger an event on a specific component, (i.e. not the top level component), use `on` 
after the event.

```js
expect(
  component,
  'with event click',
  'on', <TodoItem id={3} />, 
  'to contain',
  <div className='completed'>
    <span className="label">Buy groceries</span>
  </div>
);
```

To pass arguments to the event, simply include the event object after the event name

```js
expect(
  component,
  'with event mouseDown', { mouseX: 150, mouseY: 50 },
  'on', <TodoItem id={3} />,
  'to contain',
  <div className="completed">
    <span className="label">Buy groceries</span>
  </div>
);
```

This will call the function passed in the `onMouseDown` prop of the `<TodoItem>`.

## Multiple events

To call multiple events, simple list them one after the other:


```js
expect(component,
  'with event click', { mouseX: 150, mouseY: 50 },
  'on', <TodoItem id={3}><div eventTarget /></TodoItem>,
  'with event click', { mouseX: 50, mouseY: 50 },
  'on', <TodoItem id={2}><div eventTarget /></TodoItem>,
  'to have rendered', 
  <TodoList>
    <div className="items">
      <TodoItem id={2}>
        <div className="completed" />
      </TodoItem>
      <TodoItem id={3}>
        <div className="completed" />
      </TodoItem>
    </div>
  </TodoList>
);
```

You can optionally add `and` before the second and further events, to make it easier to read:

```js
expect(component, 
  'with event mouseDown', { mouseX: 150, mouseY: 50 },
  'on', <TodoItem id={3} />,
  'and with event mouseDown', { mouseX: 50, mouseY: 50 },
  'on', <TodoItem id={2} />,
  'to have rendered', 
  <TodoList>
    <div className="items">
      <TodoItem id={2}>
        <div className="completed" />
      </TodoItem>
      <TodoItem id={3}>
        <div className="completed" />
      </TodoItem>
    </div>
  </TodoList>
);
```

You can extract the renderer after an event by using the result of the promise returned from `expect`

```js#async:true
return expect(
  component, 
  'with event mouseDown', { mouseX: 150, mouseY: 50 },
  'on', <TodoItem id={3} />
).then(renderer => {
  expect(
    renderer,
    'to contain',
    <TodoItem id={3}>
      <div className='completed'/>
    </TodoItem>
  );
});
```

## eventTarget

You can add an `eventTarget` prop to the expected to trigger the event on a child component.
e.g. This will trigger the click in the `<button>` inside the `TodoItem` with the `id` of `2`

```js
expect(
  component, 
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

When no `eventTarget` is specified, the event is triggered on the top level element specified in the `on` clause.
