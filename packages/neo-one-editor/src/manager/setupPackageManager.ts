import { PouchDBFileSystem } from '@neo-one/local-browser';
import { utils } from '@neo-one/utils';
import { Disposable } from '@neo-one/worker';
import _ from 'lodash';
import { concat, defer, Subject } from 'rxjs';
import { buffer, concatMap, debounceTime, filter, map, publishReplay } from 'rxjs/operators';
import { FetchQueue } from './FetchQueue';
import { PackageManager } from './PackageManager';

interface TypePackage {
  readonly name: string;
  readonly version: string;
}

export const setupPackageManager = (fs: PouchDBFileSystem): Disposable => {
  const packageJSON$ = concat(
    defer(async () => {
      console.log('hello');
      try {
        return fs.readFileSync('/package.json');
      } catch {
        return '';
      }
    }),
    fs.changes$.pipe(
      filter((change) => change.id === '/package.json'),
      map((change) => (change.doc === undefined ? undefined : change.doc.content)),
      filter(utils.notNull),
    ),
  ).pipe(
    map((content) => {
      console.log(content);
      try {
        return JSON.parse(content);
      } catch {
        return undefined;
      }
    }),
    filter(utils.notNull),
    debounceTime(1000),
  );

  const typeChanges$ = new Subject<TypePackage>();
  const subscription = typeChanges$
    .pipe(
      buffer(typeChanges$.pipe(debounceTime(1000))),
      concatMap(async (changes) => {
        try {
          const packageJSON = JSON.parse(fs.readFileSync('/package.json'));
          await fs.writeFile('/package.json', {
            ...packageJSON,
            dependencies: {
              ...(packageJSON.dependencies === undefined ? {} : packageJSON.dependencies),
              ..._.fromPairs(changes.map((change) => [change.name, change.version])),
            },
          });
        } catch {
          changes.forEach((change) => typeChanges$.next(change));
        }
      }),
    )
    .subscribe();

  const manager = new PackageManager({
    fs,
    packageJSON$,
    onAddTypes: () => {
      // do nothing for now
      // typeChanges$.next({ name, version }),
    },
    fetchQueue: new FetchQueue(),
  });

  return {
    dispose: () => {
      subscription.unsubscribe();
      manager.dispose();
    },
  };
};
