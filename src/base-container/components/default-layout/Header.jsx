import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { Hyperlink, Image } from '@openedx/paragon';

import './Header.scss';
import logo from '../../../assets/img/logo.svg';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <Hyperlink destination={getConfig().MARKETING_SITE_BASE_URL}>
              <Image 
                className="logo-orleu" 
                alt={getConfig().SITE_NAME} 
                src={logo} 
              />
            </Hyperlink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
