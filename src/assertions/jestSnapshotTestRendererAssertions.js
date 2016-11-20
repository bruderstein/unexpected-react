import { compareSnapshot } from '../helpers/snapshots';


function installInto(expect) {

  expect.addAssertion('<ReactTestRenderer> to [exactly] match snapshot [with all children] [with all wrappers]', 
    function (expect, subject) {
      compareSnapshot(expect, this.flags, subject);
    }
  );
}

module.exports = { installInto };
