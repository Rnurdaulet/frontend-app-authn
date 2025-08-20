import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Image } from '@openedx/paragon';
import classNames from 'classnames';

import messages from './messages';
import Header from './Header';
import Footer from './Footer';

const MediumLayout = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Header />
      <div className="w-100 p-0 mb-3 d-flex" style={{ marginTop: '48px', marginBottom: '48px' }}>
        <div className="col-md-12">
          <div className="d-flex align-items-center justify-content-center mb-4 ">
            <div className={classNames({ 'mt-1 medium-yellow-line': getConfig().SITE_NAME === 'edX' })} />
            <div>
              <h1
                className={classNames(
                  'display-1 text-white mt-5 mb-5 mr-2 main-heading d-none',
                  { 'ml-4.5': getConfig().SITE_NAME !== 'edX' },
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MediumLayout;
