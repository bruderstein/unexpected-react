## `with event` .... [`on`]

`with event` can trigger events in both the shallow and full renderer.  For the normal full renderer,
`TestUtils.Simulate` is used to simulate the event. For the shallow renderer, it is expected that 
there is a prop with the name `on[EventName]`, where the first letter of the event is capitalised.

e.g. with a button that counts it's own clicks

```js

var renderer = TestUtils.createRenderer()
renderer.render(<MyButton />);

expect(renderer, 'with event', 'click', 'to have rendered', <button>Button was clicked 1 times</button>);
```

This works with the component directly, as a shallow renderer is automatically created.
Also note that due to unexpected's clever string handling, you can concatenated the `with event` and the 
event name.


```js
expect(<MyButton />, 'with event click', 'to have rendered', <button>Button was clicked 1 times</button>);
```

If you want to trigger an event on a specific component, (i.e. not the top level component), use `on` 
after the event.

```js
expect(<TodoList items={items} />, 'with event click', 'on', <TodoItem item={{ id: 3}} />, 
    'to contain', <span className="TodoItem--completed">do something</span>);
```

To pass arguments to the event, simply include the event object after the event name

```js
expect(<TodoList items={items} />, 'with event mouseDown', { mouseX: 150, mouseY: 50 },
    'on', <TodoItem item={{ id: 3}} />,
    'to contain', <span className="TodoItem--completed">do something</span>);
```

This will call the function passed in the `onMouseDown` prop of the `<TodoItem>`.



You can take the instance of the component after the event has been triggered by using the promise returned
from `expect`.

```js
expect(<TodoList items={items} />, 
    'with event mouseDown', { mouseX: 150, mouseY: 50 })
    .then(todoList => {
        expect(todoList.state, 'to satisfy', { items: [ { clicked: true } ] });
    });
        
```

## eventTarget

You can add an `eventTarget` prop to the expected to trigger the event on a child component.
e.g.
```js
var renderer = TestUtils.createRenderer()
renderer.render(<App />);

expect(renderer, 
    'with event', 'click', 'on', <div className="click-test"><button eventTarget /></div>, 
    'to have rendered', 
    <div>
        <div className="other-button"><button>Not clicked</button></div>
        <div className="click-test"><button>Button was clicked</button></div>
    </div>);
```
