import Unexpected from 'unexpected';

import React from 'react';
import PropTypes from 'prop-types';
import ReactTestRenderer from 'react-test-renderer';
import UnexpectedReactTest from '../../../test-renderer';

import ClickCounter from '../../components/ClickCounter';

const expect = Unexpected.clone()
    .installPlugin(UnexpectedReactTest);

expect.output.preferredWidth = 80;

describe('test-renderer-instead-of-test-renderer-jest', function () {

    it('shows a helpful error message when asserting using `to match snapshot`', function () {
        const testRenderer = ReactTestRenderer.create(<ClickCounter />);
        expect(() => expect(testRenderer, 'to match snapshot'), 'to throw',
            'To use the `to match snapshot` assertion with the test renderer, require unexpected-react as `require(\'unexpected-react/test-renderer-jest\');`'
        );
    });

    it('shows a helpful error message when asserting using `to satisfy snapshot`', function () {
        const testRenderer = ReactTestRenderer.create(<ClickCounter />);
        expect(() => expect(testRenderer, 'to satisfy snapshot'), 'to throw',
            'To use the `to satisfy snapshot` assertion with the test renderer, require unexpected-react as `require(\'unexpected-react/test-renderer-jest\');`'
        );
    });

    it('shows a helpful error message when asserting using `to match snapshot` and the JSON output', function () {
        const testRenderer = ReactTestRenderer.create(<ClickCounter />);
        expect(() => expect(testRenderer.toJSON(), 'to match snapshot'), 'to throw',
            [
                'To use the `to match snapshot` assertion with the test renderer, require unexpected-react as `require(\'unexpected-react/test-renderer-jest\');`',
                '',
                'Also, don\'t pass the JSON, pass the test renderer directly'
            ].join('\n')
        );
    });
});
