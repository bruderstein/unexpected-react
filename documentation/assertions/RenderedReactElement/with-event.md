## `with event` .... [`on`]

`with event` can trigger events in both the shallow and full renderer.  For the normal full renderer,
`TestUtils.Simulate` is used to simulate the event. For the shallow renderer, it is expected that 
there is a prop with the name `on[EventName]`, where the first letter of the event is capitalised.

e.g. with a button that counts it's own clicks

```js

var component = TestUtils.renderIntoDocument(<MyButton />);

expect(component, 'with event', 'click', 'to have rendered', <button>Button was clicked 1 times</button>);
```

If you want to trigger an event on a specific component, (i.e. not the top level component), use `on` 
after the event.

```js
expect(component, 'with event click', 'on', <TodoItem item={{ id: 3}} />, 
    'to contain', <span className="TodoItem--completed">do something</span>);
```

To pass arguments to the event, simply include the event object after the event name

```js
expect(<TodoList items={items} />, 'with event mouseDown', { mouseX: 150, mouseY: 50 },
    'on', <TodoItem item={{ id: 3}} />,
    'to contain', <span className="TodoItem--completed">do something</span>);
```

This will call the function passed in the `onMouseDown` prop of the `<TodoItem>`.

## Multiple events

To call multiple events, simple list them one after the other:


```js
expect(<TodoList items={items} />, 
    'with event mouseDown', { mouseX: 150, mouseY: 50 },
    'on', <TodoItem item={{ id: 3}} />,
    'with event mouseDown', { mouseX: 50, mouseY: 50 },
    'on', <TodoItem item={{ id: 2}} />,
    'to have rendered', 
    <div>
      <TodoItem item={{ id: 2 }}>
         <span className="completed" />
      </TodoItem>
      <TodoItem item={{ id: 3 }}>
         <span className="completed" />
      </TodoItem>
    </div>
);
```

You can optionally add `and` before the second and further events, to make it easier to read:

```js
expect(<TodoList items={items} />, 
    'with event mouseDown', { mouseX: 150, mouseY: 50 },
    'on', <TodoItem item={{ id: 3}} />,
    'and with event mouseDown', { mouseX: 50, mouseY: 50 },
    'on', <TodoItem item={{ id: 2}} />,
    'to have rendered', 
    <div>
      <TodoItem item={{ id: 2 }}>
         <span className="completed" />
      </TodoItem>
      <TodoItem item={{ id: 3 }}>
         <span className="completed" />
      </TodoItem>
    </div>
);
```
