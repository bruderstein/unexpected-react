var path = require('path');
var jestJson = require(path.resolve(process.argv[2]));
var normalizer = require('./jest-normalizer');

console.log(JSON.stringify(normalizer(jestJson, process.cwd()), null, 2));
