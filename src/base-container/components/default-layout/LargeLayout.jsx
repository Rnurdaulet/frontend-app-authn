import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Image } from '@openedx/paragon';
import classNames from 'classnames';

import messages from './messages';
import Header from './Header';
import Footer from './Footer';

const LargeLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Header />
      <div className="w-50 d-flex" style={{ marginTop: '48px', marginBottom: '48px' }}>
        <div className="col-md-12">
          <div className="min-vh-100 d-flex align-items-center">
            <div className={classNames({ 'large-yellow-line mr-n4.5': getConfig().SITE_NAME === 'edX' })} />
            <h1
              className={classNames(
                'display-2 text-white d-none',
                { 'ml-6': getConfig().SITE_NAME !== 'edX' },
              )}
            >
              {formatMessage(messages['start.learning'])}
              <div className="text-accent-a">
                {formatMessage(messages['with.site.name'], { siteName: getConfig().SITE_NAME })}
              </div>
            </h1>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LargeLayout;
