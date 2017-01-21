This enables finding a particular component or element, to then perform further assertions on.

e.g.
```js

var component = TestUtils.renderIntoDocument(
  <TodoList>
    <TodoItem id={1} label="Buy flowers for the wife"/>
    <TodoItem id={2} label="Mow the lawn"/>
    <TodoItem id={3} label="Buy groceries"/>
  </TodoList>
);

expect(
  component,
  'queried for',
  <div className="item">
     <span className="id">{3}</span>
  </div>,
  'to have rendered', 
  <div>
    <span>Buy groceries</span>
  </div>
);
```

Here we're searching for a `div` representing a todo item with the id 3. Because
props are checked with `to satisfy`, extra data in this object is ignored.

You can use `to have rendered` or `to contain` with all the options as usual following a `queried for`.

It is also possible to extract the found component, by using the value of the returned promise from `expect`.


```js#async:true
return expect(component, 'queried for', <TodoItem id={3} />)
  .then(todoItem => {
      expect(todoItem.props.label, 'to equal', 'Buy groceries');
  });
```

## queryTarget

If you want to find a target nested inside a parent element, use `queryTarget` in the query.
e.g. This `queried for` clause returns the `span` inside the `TodoItem`

```js
expect(
  component,
  'queried for',
  <TodoItem id={3}>
    <div>
      <span className="label" queryTarget />
    </div>
  </TodoItem>,
  'to have rendered',
  <span className="label">Buy groceries</span>
);
```
