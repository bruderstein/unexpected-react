'use strict';

var EmulateDom = require('../helpers/emulateDom');

var Unexpected = require('unexpected');
var UnexpectedReact = require('../../unexpected-react');

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var Immutable = require('immutable');

var expect = Unexpected.clone().use(UnexpectedReact);

function ListEntry(props) {
  return React.createElement(
    'p',
    null,
    props.name
  );
}
function List(props) {
  return React.createElement(
    'div',
    null,
    React.createElement(
      'h3',
      null,
      'List'
    ),
    props.list.map(function (listItem) {
      return React.createElement(ListEntry, { name: listItem, key: listItem });
    })
  );
}

describe('issue 28 - immutable components in shallow renderer', function () {

  it('renders the immutable mapped components', function () {

    var renderer = TestUtils.createRenderer();
    var immutableList = Immutable.fromJS(['test1', 'test2']);
    renderer.render(React.createElement(List, { list: immutableList }));

    expect(renderer, 'to have rendered', React.createElement(
      'div',
      null,
      React.createElement(
        'h3',
        null,
        'List'
      ),
      React.createElement(ListEntry, { key: 'test1', name: 'test1' }),
      React.createElement(ListEntry, { key: 'test2', name: 'test2' })
    ));
  });
});