import { makeErrorWithCode } from '@neo-one/utils';
import { TranspiledModule } from './engine';

// tslint:disable-next-line export-name
export const ModuleNotFoundError = makeErrorWithCode(
  'MODULE_NOT_FOUND_ERROR',
  (path: string) => `Could not find module for ${path}`,
);

export type EvaluateError = Error & {
  readonly code: 'EVALUATE_ERROR';
  readonly modules: ReadonlyArray<TranspiledModule>;
};

// tslint:disable-next-line no-any
export const isEvaluateError = (error: Error): error is EvaluateError => (error as any).code === 'EVALUATE_ERROR';
