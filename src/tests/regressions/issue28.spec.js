const EmulateDom = require( '../helpers/emulateDom');

const Unexpected = require('unexpected');
const UnexpectedReact = require('../../unexpected-react');

const React = require('react');
const TestUtils = require('react-addons-test-utils');
const Immutable = require('immutable');

const expect = Unexpected
  .clone()
  .use(UnexpectedReact);


function ListEntry(props) {
  return (<p>{props.name}</p>);
}
function List(props) {
  return (<div>
    <h3>List</h3>
    {props.list.map(listItem => (<ListEntry name={listItem} key={listItem} />))}
  </div>);
}

describe('issue 28 - immutable components in shallow renderer', function () {

  it('renders the immutable mapped components', function () {

    const renderer = TestUtils.createRenderer();
    const immutableList = Immutable.fromJS(['test1', 'test2']);
    renderer.render(<List list={immutableList} />);

    expect(renderer, 'to have rendered', 
      <div>
        <h3>List</h3>
        <ListEntry key="test1" name="test1" />
        <ListEntry key="test2" name="test2" />
      </div>
    );
  });

});
