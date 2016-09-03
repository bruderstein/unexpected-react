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

Given the following todo list:

```js
var renderer = TestUtils.createRenderer()
renderer.render(
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
  'with event click',
  'on', <TodoItem id={3} />,
  'to contain', <TodoItem id={3} clicked={true} />
);
```

To pass arguments to the event, simply include the event object after the event name

```js
expect(
  renderer,
  'with event mouseDown', { mouseX: 150, mouseY: 50 },
  'on', <TodoItem id={2} />,
  'to contain', <TodoItem id={2} clicked={false} />
);
```

This will call the function passed in the `onMouseDown` prop of the `<TodoItem>`.



You can take the renderer after the event has been triggered by using the promise returned
from `expect`.  This is often used to test that spy or mock callbacks have been called (using for instance [sinon.js](http://sinonjs.org)).

```js#async:true
return expect(
  renderer,
  'with event click', 'on', <TodoItem id={2} />
).then(renderer => {
  const todoListInstance = renderer.getMountedInstance();
  expect(todoListInstance.state, 'to satisfy', { clicked: { 2: true } });
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
