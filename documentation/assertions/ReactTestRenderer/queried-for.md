This enables finding a particular component or element, to then perform further assertions on.

e.g.
```js
var TestRenderer = require('react-test-renderer');
var renderer = TestRenderer.create(
  <TodoList>
    <TodoItem id={1} label="Buy flowers for the wife"/>
    <TodoItem id={2} label="Mow the lawn"/>
    <TodoItem id={3} label="Buy groceries"/>
  </TodoList>
);

expect(
    renderer, 'queried for', 
    <div id="todo-3" />,
    'to have rendered', 
    <div>
      <span>Buy groceries</span>
    </div>
);
```

Here the `TodoList` component is rendering a list of todo items. Here we're
querying for the todo item with the id 3 and then we check that it has the
expected text. This example show how you only mention exactly what you are
searching for. If the assertion finds a match it is forwarded to the next
assertion; otherwise it fails with a helpful message.

You can use `to have rendered` or `to contain` with all the options as usual following a `queried for`.

## queryTarget

If you want to find a target nested inside a parent element, use `queryTarget` in the query.
e.g. This `queried for` clause returns the `input` element inside the `div` with
the class `add-new-item`.

```js
expect(renderer, 'queried for', <div className="add-new-item"><input queryTarget /></div>,
    'to have rendered', <input placeholder="Enter something to do" />);
```
