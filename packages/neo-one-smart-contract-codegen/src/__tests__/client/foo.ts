import {
  Client,
  DeveloperClient,
  LocalKeyStore,
  LocalMemoryStore,
  LocalUserAccountProvider,
  NEOONEDataProvider,
  NEOONEDataProviderOptions,
  NEOONEProvider,
  OneClient,
  UserAccountProvider,
  UserAccountProviders,
} from '@neo-one/client';
import { JSONRPCLocalProvider } from '@neo-one/node-browser';

export interface DefaultUserAccountProviders {
  readonly memory: LocalUserAccountProvider<LocalKeyStore, NEOONEProvider>;
}
const getDefaultUserAccountProviders = (provider: NEOONEProvider): DefaultUserAccountProviders => ({
  memory: new LocalUserAccountProvider({
    keystore: new LocalKeyStore({ store: new LocalMemoryStore() }),
    provider,
  }),
});

const isLocalUserAccountProvider = (
  userAccountProvider: UserAccountProvider,
): userAccountProvider is LocalUserAccountProvider<any, any> => userAccountProvider instanceof LocalUserAccountProvider;

export const createClient = <TUserAccountProviders extends UserAccountProviders<any> = DefaultUserAccountProviders>(
  getUserAccountProviders: (provider: NEOONEProvider) => TUserAccountProviders = getDefaultUserAccountProviders as any,
): Client<
  TUserAccountProviders extends UserAccountProviders<infer TUserAccountProvider> ? TUserAccountProvider : never,
  TUserAccountProviders
> => {
  const providers: Array<NEOONEDataProvider | NEOONEDataProviderOptions> = [
    { network: 'priv', rpcURL: 'http://localhost:4500/rpc' },
  ];
  providers.push(new NEOONEDataProvider({ network: 'local', rpcURL: new JSONRPCLocalProvider() }));
  const provider = new NEOONEProvider(providers);

  const userAccountProviders = getUserAccountProviders(provider);
  const localUserAccountProviders = Object.values(userAccountProviders).filter(isLocalUserAccountProvider);
  const localUserAccountProvider = localUserAccountProviders.find(
    (userAccountProvider) => userAccountProvider.keystore instanceof LocalKeyStore,
  );

  if (process.env.NODE_ENV !== 'production') {
    if (localUserAccountProvider !== undefined) {
      const localKeyStore = localUserAccountProvider.keystore;
      if (localKeyStore instanceof LocalKeyStore) {
        Promise.all([
          localKeyStore.addAccount({
            network: 'local',
            name: 'master',
            privateKey: 'L4qhHtwbiAMu1nrSmsTP5a3dJbxA3SNS6oheKnKd8E7KTJyCLcUv',
          }),
        ]).catch(() => {
          // do nothing
        });
      }
    }
  }
  return new Client(userAccountProviders);
};

export const createDeveloperClients = (): { readonly [network: string]: DeveloperClient } => ({
  priv: new DeveloperClient(new NEOONEDataProvider({ network: 'priv', rpcURL: 'http://localhost:4500/rpc' })),
  local: new DeveloperClient(new NEOONEDataProvider({ network: 'local', rpcURL: new JSONRPCLocalProvider() })),
});

export const createOneClients = (): { readonly [network: string]: OneClient } => ({});
