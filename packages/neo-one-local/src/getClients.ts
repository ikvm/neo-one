import {
  Client,
  DeveloperClient,
  LocalKeyStore,
  LocalMemoryStore,
  LocalUserAccountProvider,
  NEOONEDataProvider,
  NEOONEProvider,
} from '@neo-one/client-full';

export const getClients = async (provider: NEOONEDataProvider, masterPrivateKey: string) => {
  const client = new Client({
    memory: new LocalUserAccountProvider({
      keystore: new LocalKeyStore({ store: new LocalMemoryStore() }),
      provider: new NEOONEProvider([provider]),
    }),
  });
  const developerClient = new DeveloperClient(provider);

  await client.providers.memory.keystore.addAccount({
    network: provider.network,
    privateKey: masterPrivateKey,
  });

  return { client, developerClient };
};
