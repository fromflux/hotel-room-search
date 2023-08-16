import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './app';

if (process.env.NODE_ENV === 'test') {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const { worker } = require('./mocks/browser');
  worker.start();
}

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
