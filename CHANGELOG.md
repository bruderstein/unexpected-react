# Changelog

## v0.2.x

Original version from [podio](https://github.com/podio)

## v0.3.0

Initial version using [unexpected-htmllike](https://github.com/bruderstein/unexpected-htmllike) and 
[react-render-hook](https://github.com/bruderstein/react-render-hook) to provide assertions on the 
full virtual DOm

## v0.3.1

Fix dependencies - issue seen when using npm 2.x (thanks to @faceyspacey for reporting)

## v0.3.2

Fix error handling when react-render-hook was not injected

## v0.4.0

Update to v0.4.1 of unexpected-htmllike-jsx-adapter, to add support for iterators as children
Thanks to @jkimbo for the failing test, and @Lugribossk for reporting

## v0.4.1

Force dependency update to unexpected-htmllike 0.3.2 - important bugfix for 'to contain', when a child element 
is not identical, but actually matches with the `to contain` flags that are in place.
