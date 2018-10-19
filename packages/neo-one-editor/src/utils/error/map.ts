/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fetch from 'cross-fetch';
import { getLinesAround } from './getLinesAround';
import { getSourceMap, SourceMap } from './getSourceMap';
import { StackFrame } from './StackFrame';

/**
 * Enhances a set of <code>StackFrame</code>s with their original positions and code (when available).
 */
export async function map(frames: ReadonlyArray<StackFrame>, contextLines = 3): Promise<ReadonlyArray<StackFrame>> {
  const mutableCache: { [fileName: string]: { fileSource: string; map: SourceMap } | undefined } = {};
  const files: string[] = [];
  frames.forEach((frame) => {
    const { fileName } = frame;
    if (fileName == undefined) {
      return;
    }
    if (files.indexOf(fileName) !== -1) {
      return;
    }
    files.push(fileName);
  });
  await Promise.all(
    files.map(async (fileName) => {
      try {
        try {
          const fetchUrl =
            fileName.indexOf('webpack-internal:') === 0
              ? `/__get-internal-source?fileName=${encodeURIComponent(fileName)}`
              : fileName;

          const fileSource = await fetch(fetchUrl).then((r) => r.text());
          const sourceMap = await getSourceMap(fileName, fileSource);
          mutableCache[fileName] = { fileSource, map: sourceMap };
        } catch {
          const fetchUrl =
            fileName.indexOf('webpack-internal:') === 0
              ? `/__get-internal-source?fileName=${encodeURIComponent(fileName)}`
              : fileName;

          const fileSource = await fetch(fetchUrl).then((r) => r.text());
          const sourceMap = await getSourceMap(fileName, fileSource);
          mutableCache[fileName] = { fileSource, map: sourceMap };
        }
      } catch {
        // do nothing
      }
    }),
  );

  return frames.map((frame) => {
    const { functionName, fileName, lineNumber, columnNumber } = frame;
    if (fileName === undefined) {
      return frame;
    }

    const value = mutableCache[fileName];
    if (value === undefined) {
      return frame;
    }

    const { map: sourceMap, fileSource } = value;
    if (sourceMap === undefined || lineNumber == undefined || columnNumber === undefined) {
      return frame;
    }
    const { source, line, column } = sourceMap.getOriginalPosition(lineNumber, columnNumber);
    if (line === undefined) {
      return frame;
    }

    const originalSource = source === undefined ? undefined : sourceMap.getSource(source);
    if (originalSource === undefined) {
      return frame;
    }

    return new StackFrame(
      functionName,
      fileName,
      lineNumber,
      columnNumber,
      getLinesAround(lineNumber, contextLines, fileSource),
      functionName,
      source,
      line,
      column,
      getLinesAround(line, contextLines, originalSource),
    );
  });
}
