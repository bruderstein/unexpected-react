const EmulateDom = require( '../helpers/emulateDom');

const Unexpected = require('unexpected');
const UnexpectedReact = require('../../unexpected-react');

const React = require('react');

const expect = Unexpected.clone()
    .use(UnexpectedReact);

function MailBodyReset({ content }) {
    return (
        <div
            className='MailBodyReset'
            dangerouslySetInnerHTML={{__html: content }}
        />
    );
}

it('should dangerouslySetInnerHTML the content', () => expect(
    <MailBodyReset content='<h1>Hello World</h1>' />,
    'to deeply render as',
    <div
        className='MailBodyReset'
        dangerouslySetInnerHTML={{
            __html: '<h1>Hello World</h1>'
        }}
    />
));

