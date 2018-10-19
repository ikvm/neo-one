import { isEvaluateError } from '../../errors';
import { EngineBase } from '../EngineBase';
import { TranspiledModule } from '../TranspiledModule';
import { Exports } from '../types';
import { createRequire } from './createRequire';

// tslint:disable
// @ts-ignore
const _self = this;
// tslint:enable

export const evaluate = (engine: EngineBase, mod: TranspiledModule, useEval = false): Exports => {
  const globals = engine.getGlobals(mod);
  const require = createRequire(engine, mod, useEval);
  const code = mod.code;
  const module = { exports: {} };
  const params = ['require', 'module', 'exports'].concat(Object.keys(globals));
  const args = [require, module, module.exports, ...Object.values(globals)];
  try {
    if (useEval) {
      const evalCode = `(function evaluate(${params.join(', ')}) { ${code} })`;
      // tslint:disable-next-line ban-comma-operator
      (0, eval)(evalCode).apply(_self, args);
    } else {
      const func = new Function(...params.concat([code]));
      func(...args);
    }
  } catch (e) {
    let error = e;
    if (typeof e === 'string') {
      error = new Error(e);
    }
    if (isEvaluateError(error)) {
      // We cheat a bit here to force modules to not be readonly...
      // tslint:disable-next-line no-any no-object-mutation
      (error as any).modules = [...error.modules, mod];
    } else {
      // tslint:disable-next-line no-any no-object-mutation
      (error as any).code = 'EVALUATE_ERROR';
      // tslint:disable-next-line no-any no-object-mutation
      (error as any).modules = [mod];
    }

    throw error;
  }

  return module.exports;
};
