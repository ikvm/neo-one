/* @jest-environment jsdom */
import { interval, of as _of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { PackageManager } from '../../manager';

const coursePackages = {
  name: 'courses',
  version: '1',
  description: 'courses',
  main: './src/index.ts',
  dependencies: {
    'bignumber.js': '^7.2.1',
    react: '^16.5.1',
    reakit: '0.15.7',
    rxjs: '^6.3.3',
    'react-dom': '^16.5.1',
    'styled-components': '^3.4.10',
  },
};

const package2 = {
  name: 'test',
  version: '2',
  description: 'test',
  main: './src/index.ts',
  dependencies: {
    onigasm: '^2.2.1',
    'bignumber.js': '^7.2.1',
  },
};

describe('package manager', () => {
  const fs = {
    writeFile: jest.fn(),
    statSync: jest.fn(),
    readFileSync: jest.fn(),
    readdirSync: jest.fn(),
  };

  beforeEach(() => {
    fs.writeFile.mockClear();
  });

  test('files written properly', async () => {
    const packageJSON$ = _of(coursePackages);

    const pkm = new PackageManager({ fs, packageJSON$ });
    await new Promise<void>((resolve) => setTimeout(resolve, 10000));

    // tslint:disable-next-line no-array-mutation
    const paths = fs.writeFile.mock.calls.map((call) => call[0]).sort();
    expect(paths).toMatchSnapshot();
    pkm.dispose();
  });

  test('node_modules updated', async () => {
    const packageJSON$ = interval(5000).pipe(
      take(2),
      map((idx) => (idx === 0 ? coursePackages : package2)),
    );

    const pkm = new PackageManager({ fs, packageJSON$ });
    await new Promise<void>((resolve) => setTimeout(resolve, 15000));

    // tslint:disable-next-line no-array-mutation
    const paths = fs.writeFile.mock.calls.map((call) => call[0]).sort();
    expect(paths).toMatchSnapshot();
    pkm.dispose();
  });
});