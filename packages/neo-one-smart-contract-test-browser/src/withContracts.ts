import { NEOONEDataProvider } from '@neo-one/client';
import { createCompilerHost, FileSystem } from '@neo-one/local-browser';
import { getFileSystem } from '@neo-one/local-singleton';
import { JSONRPCLocalProvider } from '@neo-one/node-browser';
import { JSONRPCLocalProviderWorker } from '@neo-one/node-browser-worker';
import {
  Contract,
  TestOptions,
  withContracts as withContractsBase,
  WithContractsOptions,
} from '@neo-one/smart-contract-test-common';
import { constants } from '@neo-one/utils';
import { WorkerManager } from '@neo-one/worker';

export { TestOptions, WithContractsOptions, Contract };

export const createWithContracts = (getFS: () => FileSystem) => async <T>(
  contracts: ReadonlyArray<Contract>,
  test: (contracts: T & TestOptions) => Promise<void>,
  options?: WithContractsOptions,
): Promise<void> =>
  withContractsBase(
    contracts,
    test,
    () => createCompilerHost({ fs: getFS() }),
    async () => {
      const manager = new WorkerManager<typeof JSONRPCLocalProvider>(
        JSONRPCLocalProviderWorker,
        () => ({ options: { type: 'memory' as 'memory' }, disposables: [] }),
        300 * 1000,
      );
      const dataProvider = new NEOONEDataProvider({ network: 'priv', rpcURL: manager });

      return {
        dataProvider,
        privateKey: constants.PRIVATE_NET_PRIVATE_KEY,
        cleanup: async () => {
          manager.dispose();
        },
      };
    },
    options,
  );

export const withContracts = createWithContracts(getFileSystem);
