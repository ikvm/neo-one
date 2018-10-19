// tslint:disable no-submodule-imports no-import-side-effect
// @ts-ignore
import babelPluginProposalAsyncGeneratorFunctions from '@babel/plugin-proposal-async-generator-functions';
// @ts-ignore
import babelPluginProposalObjectRestSprerad from '@babel/plugin-proposal-object-rest-spread';
// @ts-ignore
import babelPluginTransformTypeScript from '@babel/plugin-transform-typescript';
// @ts-ignore
import babelPresetReact from '@babel/preset-react';
// @ts-ignore
import Babel from '@babel/standalone';
import { RawSourceMap } from 'source-map';

import '@babel/preset-env-standalone';

// tslint:disable-next-line no-let
let initialized = false;
const initialize = () => {
  if (initialized) {
    return;
  }
  initialized = true;

  Babel.registerPreset('@babel/preset-react', babelPresetReact);
  Babel.registerPlugin('@babel/plugin-proposal-object-rest-spread', babelPluginProposalObjectRestSprerad);
  Babel.registerPlugin('@babel/plugin-proposal-async-generator-functions', babelPluginProposalAsyncGeneratorFunctions);
  Babel.registerPlugin('@babel/plugin-transform-typescript', babelPluginTransformTypeScript);
};

export interface TranspileResult {
  readonly code: string;
  readonly sourceMap: RawSourceMap;
}

export const transpile = (path: string, value: string): TranspileResult => {
  initialize();

  const { code, sourceMap } = Babel.transform(value, {
    cwd: '/',
    filename: path,
    sourceMaps: true,
    presets: [
      '@babel/preset-react',
      [
        '@babel/preset-env',
        {
          targets: { browsers: ['last 2 versions', 'not ie <= 11', 'not dead'] },
          modules: true,
          useBuiltIns: 'usage',
          ignoreBrowserslistConfig: true,
        },
      ],
    ],
    plugins: [
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-async-generator-functions',
      '@babel/plugin-transform-typescript',
    ],
  });

  return { code, sourceMap };
};
