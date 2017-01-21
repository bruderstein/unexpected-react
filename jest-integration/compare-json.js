var path = require('path');
var normalizer = require('./jest-normalizer');
var jestJson = require(path.resolve(process.argv[2]));
var expectedJson = require(path.resolve(process.argv[3]));
var expect = require('unexpected');

try {
    expect(normalizer(jestJson, path.resolve(process.argv[4])), 'to satisfy', expectedJson);
    process.exit(0);
} catch (error) {
    console.log(error.getDiff('text').toString());
    process.exit(1);
}


