import jsWriter from 'js-writer';

function installInto(expect) {
  
  expect.addAssertion('<function> to satisfy <jest-snapshot-function>', function (expect, subject, value) {
    expect(jsWriter(subject), 'to equal', jsWriter(value));
  });
  
  expect.addAssertion('<function> to equal <jest-snapshot-function>', function (expect, subject, value) {
    expect(jsWriter(subject), 'to equal', jsWriter(value));
  });
  
}

module.exports = { installInto };