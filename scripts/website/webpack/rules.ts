import { Bundle, Stage } from '../types';
import { cssLoader, exportsLoader, fileLoader, jsLoader, tsLoader, wasmFileLoader } from './loaders';

export const rules = (options: { readonly stage: Stage; readonly bundle: Bundle }) => [
  {
    oneOf: [
      // tslint:disable-next-line no-any
      jsLoader(options) as any,
      // tslint:disable-next-line no-any
      tsLoader(options) as any,
      cssLoader(options),
      fileLoader(),
      exportsLoader,
      wasmFileLoader,
    ],
  },
];
