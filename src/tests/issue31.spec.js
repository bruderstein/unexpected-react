const Unexpected = require('unexpected');
const UnexpectedReact = require('../unexpected-react');

const expect = Unexpected
  .clone()
  .use(UnexpectedReact);

describe('issue 31 - asserting on objects with no prototype', function () {

  it('handles objects without __prop__', function () {
    var result = {
      id: '666',
      name: 'Chuck Norris'
    };
    result.__proto__ = null;

    return expect(result, 'to satisfy', {
      id: '666',
      name: 'Chuck Norris'
    });
  });

});
