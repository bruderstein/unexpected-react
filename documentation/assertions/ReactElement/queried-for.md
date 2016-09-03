This enables finding a particular component or element, to then perform further assertions on.

e.g.
```js
var renderer = TestUtils.createRenderer()
renderer.render(
  <TodoList>
    <TodoItem id={1} label="Buy flowers for the wife"/>
    <TodoItem id={2} label="Mow the lawn"/>
    <TodoItem id={3} label="Buy groceries"/>
  </TodoList>
);

expect(
    renderer, 'queried for', 
    <TodoItem id={3}/>,
    'to have rendered', 
    <TodoItem label="Buy groceries"/>
);
```

Here the `TodoList` component is rendering a list of todo items. Here we're
querying for the todo item with the id 3 and then we check that it has the
expected text. This example show how you only mention exactly what you are
searching for. If the assertion finds a match it is forwarded to the next
assertion; otherwise it fails with a helpful message.

You can use `to have rendered` or `to contain` with all the options as usual following a `queried for`.


It is possible to use `queried for` to extract a part of a component.

```js#async:true
return expect(renderer, 'queried for', <TodoItem id={3} />)
    .then(todoItem => {
        expect(todoItem.props.label, 'to equal', 'Buy groceries');
    });
```

Note that it is not possible to call an event using `with event` after using `queried for` in
an assertion.  This is because the `queried for` extracts the rendered output from the shallow 
renderer, so future events will be lost.

## queryTarget

If you want to find a target nested inside a parent element, use `queryTarget` in the query.
e.g. This `queried for` clause returns the `input` element inside the `div` with
the class `add-new-item`.

```js
expect(renderer, 'queried for', <div className="add-new-item"><input queryTarget /></div>,
    'to have rendered', <input placeholder="Enter something to do" />);
```
