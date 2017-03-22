# Changelog

## v0.2.x

Original version from [podio](https://github.com/podio)

## v0.3.0

* Initial version using [unexpected-htmllike](https://github.com/bruderstein/unexpected-htmllike) and 
[react-render-hook](https://github.com/bruderstein/react-render-hook) to provide assertions on the 
full virtual DOM

## v0.3.1

* Fix dependencies - issue seen when using npm 2.x (thanks to @faceyspacey for reporting)

## v0.3.2

* Fix error handling when react-render-hook was not injected

## v0.4.0

* Update to v0.4.1 of unexpected-htmllike-jsx-adapter, to add support for iterators as children
Thanks to @jkimbo for the failing test, and @Lugribossk for reporting

## v0.4.1

* Force dependency update to unexpected-htmllike 0.3.2 - important bugfix for 'to contain', when a child element 
is not identical, but actually matches with the `to contain` flags that are in place.

## v0.5.0

* Update to unexpected-htmllike 0.4.0, and add className diffing, using class semantics. i.e. order does not matter,
extra classes are ignored by default (not with `exactly` style assertions).

## v0.5.1

* Patch version of unexpected-htmllike-jsx-adapter to support flattening children (only a package.json update)

## v0.5.2

* Patch version of unexpected-htmllike to ^0.5.0 to fix issue with reordered children

## v1.0.0

* Update to unexpected-htmllike v1.0.0 - much faster due to attempting everything sync first, before reverting  
to async if an async assertion is encountered.  You no longer need to return the result of the `expect`, unless 
you're actually doing an asynchronous `expect.it()` assertion somewhere in your `expected` value. 

## v1.0.1

* Patch version of unexpected-htmllike to ^1.1.0 (improves output for function props, and props with undefined values - #15)

## v2.0.0

* Props / Attributes are now tested with `to satisfy` semantics, unless `exactly` is specified, in which case
`to equal` is used.  This is probably what was expected, but could mean some tests that previously failed now pass,
hence the major version.

* `queried for` support for both shallow and deep renderers
* `with event` event triggering for shallow and deep renderers

## v2.0.1

* Fix rendering numerical 0, via a fix from react-devtools

## v3.0.0

* Drop support for React 0.13.x and add support for React v15 (thanks Gustav Nikolaj #19)
* Remove need for Symbol polyfill (fixed #18)

## v3.0.1

* Remove unexpected-documentation-site-generator from the dependencies (thanks @jkimbo #20)

## v3.0.2

* Update various dependencies, so that React 0.13 is properly no longer supported, and
React v15 *is* properly supported, without peerDep warnings (thanks @choffmeister)

## v3.1.0

* Enable using `queried for` and `with event` as the resolution of the promise.

## v3.1.1

* Update to htmllike 2.0.2, fixes output issue

## v3.1.2

* Fix for combining `queried for` and `with event` in the deep renderer (#23 - thanks @janmeier for reporting)

## v3.1.3

* Fix for 'not to contain' and 'to contain with all children' after event

## v3.2.0

* Update docs for rendering stateless components (thanks @2color)
* Add support for `eventTarget` in `on` clauses of `with event`
* Add support for `queryTarget` in `queried for`

## v3.2.1

* Update to unexpected-htmllike 2.1.1 (improved output for text content diffs)

## v3.2.2

* Fixed issue with `queried for` when the resulting promise is used, not returning the correct object. 
  Note that if the result of the query is an HTMLElement, it is now (correctly) the HTMLElement, and not an opaque
  object that could be used in a further `to have rendered` style assertion. As this should have been the case, although
  the tests have been changed, this is considered a patch version issue as this was the intended behaviour - the tests 
  were sadly wrong. (#26)
  
* Fixed issue that multiple events with arguments would not always use the correct object as the result of the promise.
  e.g. 
  
```js
expect(component,
    'with event click', { /* ... */ },
    'with event click', { /* ... */ })
   .then(result => {
      /* Here the result would have been undefined */
    });
```
  
  
## v3.2.3

* Fixed issue with default flags for `on` clauses in events. It now uses the same default matching flags as all other 
assertions.  All assertions now use a single function to calculate the options, so the matching flags are always the same
based on the `with all children`, `with all wrappers`, and `exactly` flags

## v3.2.4

* Fixed and updated the docs, and with huge thanks to @sunesimonsen all the examples in the docs are now tested

## v3.3.0

* Added support for the [react-test-renderer](https://www.npmjs.org/package/react-test-renderer)
* Fixed issue #28 (immutable lists mixed with other child components)

## v3.3.1

* Added missing `test-renderer` file for `require`ing

## v3.3.2

* Fix issue with asserting against objects that do not have `Object` as their prototype (thanks to Martin Eigenmann @eigenmannmartin for reporting and fixing!)

## v3.4.0

* Jest snapshot support (`'to match snapshot'` and `'to satisfy snapshot'` assertions)
* Major refactor so assertions for all renderers (shallow, full DOM, test and raw for snapshots) use the same code

## v3.5.0

* Add `when rendered`, `when deeply rendered` and `to render as` assertions to enable direct rendering within the assertion
* Add helpful error messages when using assertions that require a different `require` to be used (e.g. using jest snapshot assertions
  without requiring `unexpected-react/jest`
* Add helpful error message when validating against the test renderer `.toJSON()` method output - should be called with the renderer directly

## v3.5.1

* Bump version of js-writer to fix bug with snapshots with booleans

## v3.5.2

* Fix issue with snapshot comments (JSX representation) not always saving correctly (thanks @sunesimonsen for reporting, help tracking it down and the fix!)

