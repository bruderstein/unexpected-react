
function bound1() { /* stuff */ }
function bound2() { return 42; }
function bound3(a, b) { return a + b; }

var someObject = {};

// These are all helper functions that return a new instance of a function of the given type
// They are in this separate file such that when running with wallaby, they don't get instrumented (which makes them all different!)
module.exports = {
  anonymous: () => function () { /* stuff */ },
  anonymousContent: () => function () { return 42; },
  anonymousContentArgs: () => function (a, b) { return a + b; },
  named: () => function doStuff() { /* stuff */ },
  namedContent: () => function doStuff() { return 42; },
  namedContentArgs: () => function doStuff(a, b) {
    // comment
    return a + b;
  },
  bound: () => bound1.bind(someObject),
  boundContent: () => bound2.bind(someObject),
  boundContentArgs: () => bound3.bind(someObject)
};