import * as React from 'react';
import { MainEngine } from './engine/main';

// tslint:disable-next-line no-any
export type ComponentProps<C extends React.ComponentType<any>> = C extends React.ComponentType<infer P> ? P : never;

export interface EngineContentFile {
  readonly path: string;
  readonly content: string;
  readonly writable: boolean;
  readonly open: boolean;
}

export type EngineContentFiles = ReadonlyArray<EngineContentFile>;

export interface EngineState {
  readonly openFiles: ReadonlyArray<string>;
}

export interface EditorContextType {
  readonly engine: MainEngine;
}

export interface TestBase {
  readonly name: ReadonlyArray<string>;
}

export interface TestFailure extends TestBase {
  readonly status: 'fail';
  readonly duration: number;
  readonly error: string;
}

export interface TestSkip extends TestBase {
  readonly status: 'skip';
}

export interface TestPass extends TestBase {
  readonly status: 'pass';
  readonly duration: number;
}

export interface TestRunning extends TestBase {
  readonly status: 'running';
}

export type Test = TestFailure | TestSkip | TestPass | TestRunning;

export interface TestSuite {
  readonly path: string;
  readonly tests: ReadonlyArray<Test>;
  readonly error?: Error;
}

export interface TestRunnerCallbacks {
  readonly onUpdateSuite: (suite: TestSuite) => Promise<void>;
  readonly onRemoveSuite: (path: string) => Promise<void>;
  readonly onUpdateTest: (path: string, test: Test) => Promise<void>;
  readonly setTestsRunning: (running: boolean) => Promise<void>;
}
