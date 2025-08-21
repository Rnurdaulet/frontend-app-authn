import { messages as paragonMessages } from '@openedx/paragon';

import enMessages from './messages/en.json';
import kk_KZMessages from './messages/kk_KZ.json';
import ruMessages from './messages/ru.json';

const appMessages = {
  'en': enMessages,
  'kk-kz': kk_KZMessages,
  'ru': ruMessages,
};

export default [
  paragonMessages,
  appMessages,
];