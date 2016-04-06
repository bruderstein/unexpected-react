
This enables finding a particular component or element, to then perform further assertions on.

e.g.
```js

var component = TestUtils.renderIntoDocument(<TodoList items={items} />);
expect(component, 'queried for', <TodoItem item={{ id: 3 }} />, 'to have rendered', <span>Do something</span>);
```
Here we're searching for a `TodoItem` component whose `item` prop satisfies `{ id: 3 }`. Because props are 
checked with `to satisfy`, extra data in this object is ignored.

You can use `to have rendered` or `to contain` with all the options as usual following a `queried for`.

