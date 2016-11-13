## `with event` .... [`on`]

`with event` can trigger events in the shallow, full and test renderers.  For the normal full renderer,
`TestUtils.Simulate` is used to simulate the event. For the shallow and test renderers, it is expected that 
there is a prop with the name `on[EventName]`, where the first letter of the event is capitalised.

e.g. with a button that counts its own clicks

```js
var renderer = TestRenderer.create(<MyButton />)

expect(renderer, 'with event', 'click', 'to have rendered', <button>Button was clicked 1 times</button>);
```

Also note that due to unexpected's clever string handling, you can often concatenate the `with event` and the 
event name.

Given the following todo list:

```js
var renderer = TestRenderer.create(
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
  renderer,
  'with event click', 'on', <div id="todo-3" />,
  'to contain', <div id="todo-3"><span>Completed!</span></div>
);
```

To pass arguments to the event, simply include the event object after the event name

```js
expect(
  renderer,
  'with event mouseDown', { mouseX: 150, mouseY: 50 },
  'on', <div id="todo-2" />,
  'not to contain', <div id="todo-2"><span>Completed!</span></div>
);
```

This will call the function passed in the `onMouseDown` prop of the `<TodoItem>`.


You can take the renderer after the event has been triggered by using the promise returned
from `expect`.  This is often used to test that spy or mock callbacks have been called (using for instance [sinon.js](http://sinonjs.org)).

```js
expect(
  renderer,
  'with event click', 'on', <div id="todo-2" />
);
```

```js#async:true
return expect(
  renderer,
  'with event click', 'on', <div id="todo-2" />
).then(function (renderer) {
  var todoListInstance = renderer.getInstance();
  expect(todoListInstance.state, 'to satisfy', { clicked: { 2: true } });
});
        
```

## eventTarget

You can add an `eventTarget` prop to the expected to trigger the event on a child component.
e.g.
```js
var renderer = TestRenderer.create(<App />);

expect(renderer, 
    'with event', 'click', 'on', <div className="click-test"><button eventTarget /></div>, 
    'to have rendered', 
    <div>
        <div className="other-button"><button>Not clicked</button></div>
        <div className="click-test"><button>Button was clicked</button></div>
    </div>);
```
