/// <reference types="trackjs" />
// tslint:disable no-submodule-imports
// tslint:disable no-import-side-effect
import '@babel/polyfill';
// @ts-ignore
import regeneratorRuntime from '@babel/runtime/regenerator';
import LogRocket from 'logrocket';
// @ts-ignore
import './Modernizr';

// tslint:disable-next-line no-any no-object-mutation
(global as any).regeneratorRuntime = regeneratorRuntime;

// tslint:disable no-object-mutation strict-type-predicates
if (typeof window !== 'undefined') {
  // @ts-ignore
  process.stdout = {
    isTTY: undefined,
  };

  if (process.env.NODE_ENV === 'production') {
    LogRocket.init('p5ugma/neo-one');
    // tslint:disable-next-line no-any
    (window as any)._trackJs = {
      token: 'ccff2c276a494f0b94462cdbf6bf4518',
      application: 'neo-one',
    };
    // tslint:disable-next-line
    const trackJs = require('trackjs');
    trackJs.addMetadata('type', 'main');
    LogRocket.getSessionURL((url) => {
      trackJs.addMetadata('logrocket', url);
    });
  }

  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && e.reason.name === 'Canceled') {
      // This is an error from vscode that vscode uses to cancel some actions
      // We don't want to show this to the user
      e.preventDefault();
    }
  });

  if (Modernizr.serviceworker) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        // tslint:disable-next-line no-console
        console.error(error);
      });
    });
  }
}
