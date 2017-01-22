Under [jest](https://facebook.github.io/jest/), you can use snapshots. Snapshot tests save a snapshot of the component as it is currently rendered to a `.snapshot` file under a directory `__snapshots__`. Note that the snapshots for `unexpected-react` are saved to a different filename than those jest uses natively. This is because the format differs slightly.

Remember that to include snapshot support for the shallow and DOM renderers, you need to require unexpected-react as `require('unexpected-react/jest')`

Given the following test component:

```js
var MyComponent = () => (
  <div className="parent" id="main">
    <span>one</span>
    <span>two</span>
    <span>three</span>
  </div>
)
```

Let's render the output with the shallow renderer:

```js
var renderer = TestUtils.createRenderer();
renderer.render(<MyComponent />);
```

Then we can validate it matches the snapshot.  If no snapshot exists, it will be automatically created the first time it is run.      

```js#evaluate:false
expect(renderer, 'to satisfy snapshot');
```

If in the future the component output changes, the error will be highlighted (using the same error highlighting used in the rest of unexpected-react).

Once you have checked that the changes are correct, you can run `jest -u` to update the snapshot, or if running in watch mode, press `u`.

### Events
Triggered events still works, and can be combined with matching snaphots.

e.g.

```js#evaluate:false
var renderer = TestUtils.createRenderer();
renderer.render(<MyButton />);

expect(renderer, 
  'with event click', 
  'to satisfy snapshot'
);
```

### Matching

The snapshot matches in the same way as `to have rendered`, so new classes, attributes and child nodes are not treated as a difference.  This can be advantageous when you want to add new features to a component, but expect the existing component to keep the same basic template. 

If you'd prefer to match the template exactly (order of classes is still ignored), see the assertion `to match snapshot`.
