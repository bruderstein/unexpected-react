
import EmulateDom from '../../helpers/emulateDom';

import Unexpected from 'unexpected';
import UnexpectedReact from '../../../unexpected-react';

import React from 'react';
import TestUtils from 'react-addons-test-utils';

import ClickCounter from '../../components/ClickCounter';

const expect = Unexpected.clone().use(UnexpectedReact);

describe('standard-instead-of-jest', function () {

    it('shows a helpful error message when asserting using `to match snapshot`', function () {
        expect(() => expect(<ClickCounter />, 'to match snapshot'), 'to throw',
            [
                'To use the `to match snapshot` assertion with the shallow and full DOM renderers, require unexpected-react as `require(\'unexpected-react/jest\');`',
                '',
                ''
            ].join('\n')
        );
    });

    it('shows a helpful error message when asserting using `to satisfy snapshot`', function () {
        expect(() => expect(<ClickCounter />, 'to satisfy snapshot'), 'to throw',
            [
                'To use the `to satisfy snapshot` assertion with the shallow and full DOM renderers, require unexpected-react as `require(\'unexpected-react/jest\');`',
                '',
                ''
            ].join('\n')
        );
    });

    it('shows a helpful error message after shallow rendering when asserting using `to match snapshot`', function () {
        expect(() => expect(<ClickCounter />, 'when rendered', 'to match snapshot'), 'to throw',
            [
                'expected <ClickCounter /> when rendered',
                'To use the `to match snapshot` assertion with the shallow and full DOM renderers, require unexpected-react as `require(\'unexpected-react/jest\');`',
                '',
                ''
            ].join('\n')
        );
    });

    it('shows a helpful error message when asserting using `to satisfy snapshot`', function () {
        expect(() => expect(<ClickCounter />, 'when rendered', 'to satisfy snapshot'), 'to throw',
            [
                'expected <ClickCounter /> when rendered',
                'To use the `to satisfy snapshot` assertion with the shallow and full DOM renderers, require unexpected-react as `require(\'unexpected-react/jest\');`',
                '',
                ''
            ].join('\n')
        );
    });

});
