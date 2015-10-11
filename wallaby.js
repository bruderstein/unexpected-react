

var Babel = require('babel');

module.exports = function (wallaby) {

    return {
        files: [
            'src/**/*.js',
            {
                pattern: 'src/**/tests/*.spec.js',
                ignore: true
            },
            {
                pattern: 'src/react-devtools/**/*.js',
                instrument: false
            },
            {
                pattern: 'src/testHelpers/**/*',
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

        tests: ['src/**/*.spec.js'],
        env: {
            type: 'node',
            runner: '/home/dave/.nvm/versions/node/v4.1.2/bin/node',
        },

        workers: {
            /**
             *  We need to recycle the node processes in order to get the React injection
             * The 'react' module is not removed from the cache, but the local file 'globalHook.js' is
             * This means that the event handler for 'renderer-attached' is recreated, but the `inject` call
             * (which fires the renderer-attached event) in react is only performed when react is require()d
             * for the first time.
             */

            recycle: true
        },

        compilers: {
            '**/*.js': wallaby.compilers.babel({
                babel: Babel
            }),
            '**/*.jsx': wallaby.compilers.babel({
                babel: Babel
            })
        }
    };
};