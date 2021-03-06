interface Resolver<K, R> {
  readonly key: K;
  readonly resolve: (value?: R) => void;
  readonly reject: (error: Error) => void;
}

const resolvedPromise = Promise.resolve();
// tslint:disable
const enqueuePostPromiseJob =
  typeof process === 'object' && typeof process.nextTick === 'function'
    ? (fn: () => void) => {
        resolvedPromise.then(() => process.nextTick(fn));
      }
    : setImmediate || setTimeout;
// tslint:enable

export class DataWriter<K, V, R> {
  private mutableResolvers: Array<Resolver<K, R>> = [];
  private mutableQueued: Map<K, V> = new Map();

  public constructor(private readonly batchWriteFunc: (data: Map<K, V>) => Promise<Map<K, R>>) {}

  public async write(key: K, value: V): Promise<R> {
    this.mutableQueued.set(key, value);

    // tslint:disable-next-line promise-must-complete
    return new Promise<R>((resolve, reject) => {
      this.mutableResolvers.push({ key, resolve, reject });

      if (this.mutableResolvers.length === 1) {
        enqueuePostPromiseJob(() => {
          const resolvers = this.mutableResolvers;
          const queued = this.mutableQueued;
          this.mutableResolvers = [];
          this.mutableQueued = new Map();

          this.batchWriteFunc(queued)
            .then((result) => {
              resolvers.forEach(({ key: queuedKey, resolve: queuedResolve }) => {
                queuedResolve(result.get(queuedKey));
              });
            })
            .catch((error) => {
              resolvers.forEach(({ reject: queuedReject }) => {
                queuedReject(error);
              });
            });
        });
      }
    });
  }
}
