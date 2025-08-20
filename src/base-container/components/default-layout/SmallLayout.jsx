import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Image } from '@openedx/paragon';
import classNames from 'classnames';

import messages from './messages';
import Header from './Header';
import Footer from './Footer';

const SmallLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Header />
      <span className="w-100" style={{ marginTop: '48px', marginBottom: '48px' }}>
        <div>
          <div className="d-flex align-items-center m-3.5">
            <div className={classNames({ 'small-yellow-line mr-n2.5': getConfig().SITE_NAME === 'edX' })} />
            <h1
              className={classNames(
                'text-white mt-3.5 mb-3.5 d-none',
              )}
            >
              <span>
                {formatMessage(messages['start.learning'])}{' '}
                <span className="text-accent-a d-inline-block">
                  {formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
                </span>
              </span>
            </h1>
          </div>
        </div>
      </span>
      <Footer />
    </>
  );
};

export default SmallLayout;
