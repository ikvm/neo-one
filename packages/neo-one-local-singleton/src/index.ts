// tslint:disable no-any
/// <reference types="@neo-one/types" />
import { BrowserLocalClient, FileSystem } from '@neo-one/local-browser';
import { JSONRPCLocalProvider } from '@neo-one/node-browser';
import { WorkerManager } from '@neo-one/worker';

// tslint:disable no-let
let browserLocalClient: BrowserLocalClient | undefined;
let jsonRPCLocalProviderManager: WorkerManager<typeof JSONRPCLocalProvider> | undefined;
let fs: FileSystem | undefined;
// tslint:enable no-let

export const getFileSystem = (): FileSystem => {
  if (fs === undefined) {
    throw new Error('FileSystem has not be set');
  }

  return fs;
};

export const setFileSystem = (_fs: FileSystem) => {
  fs = _fs;
};

export const getJSONRPCLocalProviderManager = (): WorkerManager<typeof JSONRPCLocalProvider> => {
  if (jsonRPCLocalProviderManager === undefined) {
    throw new Error('JSONRPCLocalProvider has not be set');
  }

  return jsonRPCLocalProviderManager;
};

export const setJSONRPCLocalProviderManager = (
  _jsonRPCLocalProviderManager: WorkerManager<typeof JSONRPCLocalProvider>,
) => {
  jsonRPCLocalProviderManager = _jsonRPCLocalProviderManager;
};

export const getBrowserLocalClient = (): BrowserLocalClient => {
  if (browserLocalClient === undefined) {
    throw new Error('BrowserLocalClient has not be set');
  }

  return browserLocalClient;
};

export const setBrowserLocalClient = (_browserLocalClient: BrowserLocalClient) => {
  browserLocalClient = _browserLocalClient;
};
