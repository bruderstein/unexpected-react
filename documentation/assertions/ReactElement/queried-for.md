This enables finding a particular component or element, to then perform further assertions on.

e.g.
```js

var renderer = TestUtils.createRenderer();
renderer.render(<TodoList items={items} />);
expect(renderer, 'queried for', 
    <div className="item">
        <span className="id">3</span>
    </div>,
    'to have rendered', 
    <div className="item">
        <span>Do something</span>
    </div>);
```

Here the `TodoList` component is rendering a div for each item, and then a span with the id and a span for the 
item text. We're searching for the right div (with id 3), then checking the correct text is rendered.
As the spans for id and label are siblings, they don't need to be included to "match". 

You can use `to have rendered` or `to contain` with all the options as usual following a `queried for`.


It is possible to use `queried for` to extract a part of a component.

```js
var renderer = TestUtils.createRenderer();
renderer.render(<TodoList items={items} />);
return expect(renderer, 'queried for', <TodoItem id={3} />)
    .then(todoItem => {
        expect(todoItem.props.title, 'to equal', 'Do something');
    });
```

Note that it is not possible to call an event using `with event` after using `queried for` in
an assertion.  This is because the `queried for` extracts the rendered output from the shallow 
renderer, so future events will be lost.