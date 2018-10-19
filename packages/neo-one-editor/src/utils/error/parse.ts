/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { TranspiledModule } from 'neo-one-editor/src/engine';
import { StackFrame } from './StackFrame';

const regexExtractLocation = /\(?(.+?)(?::(\d+))?(?::(\d+))?\)?$/;

function extractLocation(token: string): [string, number, number] {
  const result = regexExtractLocation.exec(token);
  if (result === null) {
    throw new Error(`Invalid token: ${token}`);
  }

  const res = result.slice(1).map((v) => {
    const p = Number(v);
    if (!isNaN(p)) {
      return p;
    }

    return v;
  });

  // tslint:disable-next-line no-any
  return res as any;
}

const regexValidFrameChrome = /^\s*(at|in)\s.+(:\d+)/;
const regexValidFrameFireFox = /(^|@)\S+:\d+|.+line\s+\d+\s+>\s+(eval|Function).+/;

function parseStack(
  stack: ReadonlyArray<string>,
  modules: ReadonlyArray<TranspiledModule> = [],
): ReadonlyArray<StackFrame> {
  let currentIndex = 0;
  let currentModule = modules[0] as TranspiledModule | undefined;
  let found = true;

  const handleLocation = (funcName: string, last: string) => {
    const [fileName, lineNumber, columnNumber] = extractLocation(last);
    if (fileName === '<anonymous>') {
      found = true;

      return new StackFrame(funcName, fileName, lineNumber, columnNumber, currentModule);
    }

    if (found) {
      currentIndex += 1;
      found = false;
      currentModule = modules[currentIndex];
    }

    return new StackFrame(funcName, fileName, lineNumber, columnNumber);
  };

  return stack.filter((e) => regexValidFrameChrome.test(e) || regexValidFrameFireFox.test(e)).map((eIn) => {
    let e = eIn;

    if (regexValidFrameFireFox.test(e)) {
      // Strip eval, we don't care about it
      let isEval = false;
      if (/ > (eval|Function)/.test(e)) {
        e = e.replace(/ line (\d+)(?: > eval line \d+)* > (eval|Function):\d+:\d+/g, ':$1');
        isEval = true;
      }
      const data = e.split(/[@]/g);
      const last = data[data.length - 1];

      const [fileName, lineNumber, columnNumber] = extractLocation(last);
      if (fileName === '<anonymous>') {
      } else if (found) {
        currentIndex += 1;
        found = false;
      }

      return new StackFrame(data.join('@') || (isEval ? 'eval' : undefined), ...extractLocation(last));
    }

    // Strip eval, we don't care about it
    if (e.indexOf('(eval ') !== -1) {
      e = e.replace(/(\(eval at [^()]*)|(\),.*$)/g, '');
    }
    if (e.indexOf('(at ') !== -1) {
      e = e.replace(/\(at /, '(');
    }
    const dataOuter = e
      .trim()
      .split(/\s+/g)
      .slice(1);
    const lastOuter = dataOuter[dataOuter.length - 1];

    return new StackFrame(dataOuter.join(' ') || undefined, ...extractLocation(lastOuter));
  });
}

/**
 * Turns an <code>Error</code>, or similar object, into a set of <code>StackFrame</code>s.
 * @alias parse
 */
export function parse(error: Error | string | ReadonlyArray<string>): ReadonlyArray<StackFrame> {
  if (error == undefined) {
    throw new Error('You cannot pass a null object.');
  }
  if (typeof error === 'string') {
    return parseStack(error.split('\n'));
  }
  if (Array.isArray(error)) {
    return parseStack(error);
  }
  // tslint:disable-next-line no-any
  if (typeof (error as any).stack === 'string') {
    // tslint:disable-next-line no-any
    return parseStack((error as any).stack.split('\n'), (error as any).modules);
  }
  throw new Error('The error you provided does not contain a stack trace.');
}
