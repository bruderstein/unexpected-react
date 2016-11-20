
var Babel = require('babel-core');

module.exports = function (wallaby) {
  
  return {
    files: [
      'src/**/*.js',
      {
        pattern: 'src/tests/**/*.spec.js',
        ignore: true
      },
      {
        pattern: 'src/react-devtools/**/*.js',
        instrument: false
      },
      {
        pattern: 'src/testHelpers/**/*.js',
        instrument: false
      },
      {
        pattern: 'src/react-devtools/frontend/**/*.js',
        ignore: true
      },
      {
        pattern: 'src/react-devtools/plugins/**/*.js',
        ignore: true
      }],
    
    tests: ['src/tests/jest/**/*.spec.js'],
    env: {
      type: 'node',
      runner: 'node'
    },
    
    testFramework: 'jest',
  
    compilers: {
      'src/**/*.js': wallaby.compilers.babel({
        babel: Babel
      }),
      'src/**/*.jsx': wallaby.compilers.babel({
        babel: Babel
      })
    },
    
    setup: function (wallaby) {
      wallaby.testFramework.configure({
        // https://facebook.github.io/jest/docs/api.html#config-options
        // you may just pass `require('./package.json').jest`, if you use it for your Jest config
        // don't forget to include package.json in the files list in this case
        //testPathPattern: /\/src\/tests-jest\//
      });
    }
  };
};
