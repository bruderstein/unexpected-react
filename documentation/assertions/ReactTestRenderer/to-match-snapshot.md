Under [jest](https://facebook.github.io/jest/), you can use snapshots. Snapshot tests save a snapshot of the component as it is currently rendered to a `.snapshot` file under a directory `__snapshots__`. Note that the snapshots for `unexpected-react` are saved to a different filename than those jest uses natively. This is because the format differs slightly.

Remember that to include snapshot support for the test renderer, you need to require unexpected-react as `require('unexpected-react/test-renderer-jest')`

Given the following test component:

```js
const MyComponent = () => (
  <div className="parent" id="main">
    <span>one</span>
    <span>two</span>
    <span>three</span>
  </div>
)
```

Let's render the output with the test renderer:

```js
const renderer = TestRenderer.create(<MyComponent />);
```

Then we can validate it matches the snapshot.  If no snapshot exists, it will be automatically created the first time it is run.      

```js#evaluate:false
expect(renderer, 'to match snapshot');
```

If in the future the component output changes, the error will be highlighted (using the same error highlighting used in the rest of unexpected-react).

Once you have checked that the changes are correct, you can run `jest -u` to update the snapshot, or if running in watch mode, press `u`.

### Events
Triggered events still works, and can be combined with matching snaphots.

e.g.

```js#evaluate:false
const renderer = TestRenderer.create(<MyButton />);

expect(renderer, 
  'with event click', 
  'to match snapshot'
);
```

### Matching

The snapshot matches everything, so extra classes and attributes will causes a difference to be highlighted.  If you want your snapshots to work more like `to have rendered`, so new attributes, classes and child elements can be added without triggering a change, see the assertion `to satisfy snapshot`.

