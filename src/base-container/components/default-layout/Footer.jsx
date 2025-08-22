import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { Hyperlink } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import './Footer.scss';

const Footer = () => {
  const { formatMessage } = useIntl();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="footer-content">
              <p className="footer-copyright">
                {formatMessage({
                  id: 'footer.copyright',
                  defaultMessage: 'Все права защищены © 2025 Национальный центр повышения квалификации «Өрлеу»'
                })}
              </p>
              <Hyperlink destination="https://orleu.edu.kz" className="footer-link">
                orleu.edu.kz
              </Hyperlink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
