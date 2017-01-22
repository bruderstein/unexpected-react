"use strict";

function bound1() {/* stuff */}
function bound2() {
  return 42;
}
function bound3(a, b) {
  return a + b;
}

var someObject = {};

// These are all helper functions that return a new instance of a function of the given type
// They are in this separate file such that when running with wallaby, they don't get instrumented (which makes them all different!)
module.exports = {
  anonymous: function anonymous() {
    return function () {/* stuff */};
  },
  anonymousContent: function anonymousContent() {
    return function () {
      return 42;
    };
  },
  anonymousContentArgs: function anonymousContentArgs() {
    return function (a, b) {
      return a + b;
    };
  },
  named: function named() {
    return function doStuff() {/* stuff */};
  },
  namedContent: function namedContent() {
    return function doStuff() {
      return 42;
    };
  },
  namedContentArgs: function namedContentArgs() {
    return function doStuff(a, b) {
      return a + b;
    };
  },
  bound: function bound() {
    return bound1.bind(someObject);
  },
  boundContent: function boundContent() {
    return bound2.bind(someObject);
  },
  boundContentArgs: function boundContentArgs() {
    return bound3.bind(someObject);
  }
};