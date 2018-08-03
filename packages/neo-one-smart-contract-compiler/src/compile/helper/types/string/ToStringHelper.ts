import { tsUtils } from '@neo-one/ts-utils';
import ts from 'typescript';
import { ScriptBuilder } from '../../../sb';
import { VisitOptions } from '../../../types';
import { TypedHelper } from '../../common';
import { Helper } from '../../Helper';

// Input: [val]
// Output: [string]
export class ToStringHelper extends TypedHelper {
  public emit(sb: ScriptBuilder, node: ts.Node, options: VisitOptions): void {
    if (!options.pushValue) {
      sb.emitOp(node, 'DROP');

      return;
    }

    if (this.type !== undefined) {
      this.convertType(sb, node, options, this.type);
    } else {
      this.convertUnknown(sb, node, options);
    }
  }

  private convertType(sb: ScriptBuilder, node: ts.Node, options: VisitOptions, type: ts.Type): void {
    if (tsUtils.type_.isOnlyUndefined(type)) {
      this.convertUndefined(sb, node, options);
    } else if (tsUtils.type_.isOnlyNull(type)) {
      this.convertNull(sb, node, options);
    } else if (tsUtils.type_.isOnlyBoolean(type)) {
      this.convertBoolean(sb, node, options);
    } else if (tsUtils.type_.isOnlyNumberish(type)) {
      this.convertNumber(sb, node, options);
    } else if (tsUtils.type_.isOnlyStringish(type)) {
      this.convertString(sb, node, options);
    } else if (tsUtils.type_.isOnlySymbolish(type)) {
      this.convertSymbol(sb, node, options);
    } else if (tsUtils.type_.isOnlyObject(type)) {
      this.convertObject(sb, node, options);
    } else {
      this.convertUnknown(sb, node, options);
    }
  }

  private convertUndefined(sb: ScriptBuilder, node: ts.Node, _options: VisitOptions): void {
    sb.emitPushString(node, 'undefined');
  }

  private convertNull(sb: ScriptBuilder, node: ts.Node, _options: VisitOptions): void {
    sb.emitPushString(node, 'null');
  }

  private convertBoolean(sb: ScriptBuilder, node: ts.Node, options: VisitOptions): void {
    sb.emitHelper(
      node,
      options,
      sb.helpers.if({
        condition: () => {
          sb.emitHelper(node, options, sb.helpers.getBoolean);
        },
        whenTrue: () => {
          sb.emitPushString(node, 'true');
        },
        whenFalse: () => {
          sb.emitPushString(node, 'false');
        },
      }),
    );
  }

  private convertNumber(sb: ScriptBuilder, node: ts.Node, options: VisitOptions): void {
    const n = sb.scope.addUnique();
    const accum = sb.scope.addUnique();

    // [number]
    sb.emitHelper(node, options, sb.helpers.getNumber);
    sb.emitHelper(
      node,
      options,
      sb.helpers.if({
        condition: () => {
          // [number, number]
          sb.emitOp(node, 'DUP');
          // [0, number, number]
          sb.emitPushInt(node, 0);
          // [number === 0, number]
          sb.emitOp(node, 'NUMEQUAL');
        },
        whenTrue: () => {
          // []
          sb.emitOp(node, 'DROP');
          // [string]
          sb.emitPushString(node, '0');
        },
        whenFalse: () => {
          // []
          sb.scope.set(sb, node, options, n);
          // [buffer]
          sb.emitPushBuffer(node, Buffer.from([]));
          // []
          sb.scope.set(sb, node, options, accum);
          sb.emitHelper(
            node,
            options,
            sb.helpers.forLoop({
              condition: () => {
                // [n]
                sb.scope.get(sb, node, options, n);
                // [0, n]
                sb.emitPushInt(node, 0);
                // [n > 0]
                sb.emitOp(node, 'GT');
              },
              each: () => {
                // [n]
                sb.scope.get(sb, node, options, n);
                // [n, n]
                sb.emitOp(node, 'DUP');
                // [10, n, n]
                sb.emitPushInt(node, 10);
                // [n / 10, n]
                sb.emitOp(node, 'DIV');
                // [n]
                sb.scope.set(sb, node, options, n);
                // [10, n]
                sb.emitPushInt(node, 10);
                // [n % 10]
                sb.emitOp(node, 'MOD');
                // [0x30, n % 10]
                sb.emitPushInt(node, 0x30);
                // [number]
                sb.emitOp(node, 'ADD');
                // [accum, number]
                sb.scope.get(sb, node, options, accum);
                // [number + accum]
                sb.emitOp(node, 'CAT');
                // []
                sb.scope.set(sb, node, options, accum);
              },
            }),
          );
          // [string]
          sb.scope.get(sb, node, options, accum);
        },
      }),
    );
  }

  private convertString(sb: ScriptBuilder, node: ts.Node, options: VisitOptions): void {
    sb.emitHelper(node, options, sb.helpers.getString);
  }

  private convertSymbol(sb: ScriptBuilder, node: ts.Node, options: VisitOptions): void {
    sb.emitHelper(node, options, sb.helpers.throwTypeError);
  }

  private convertObject(sb: ScriptBuilder, node: ts.Node, options: VisitOptions): void {
    // [primitive]
    sb.emitHelper(node, options, sb.helpers.toPrimitive({ type: this.type, preferredType: 'string' }));
    // [value]
    this.convertUnknown(sb, node, options, true);
  }

  private convertUnknown(sb: ScriptBuilder, node: ts.Node, options: VisitOptions, shouldThrowOnObject = false): void {
    const emitIf = (check: Helper, whenTrue: () => void, whenFalse: () => void) =>
      sb.emitHelper(
        node,
        options,
        sb.helpers.if({
          condition: () => {
            // [value, value]
            sb.emitOp(node, 'DUP');
            // [isValue, value]
            sb.emitHelper(node, options, check);
          },
          whenTrue,
          whenFalse,
        }),
      );

    emitIf(
      sb.helpers.isString,
      () => this.convertString(sb, node, options),
      () =>
        emitIf(
          sb.helpers.isUndefined,
          () => this.convertUndefined(sb, node, options),
          () =>
            emitIf(
              sb.helpers.isNull,
              () => this.convertNull(sb, node, options),
              () =>
                emitIf(
                  sb.helpers.isBoolean,
                  () => this.convertBoolean(sb, node, options),
                  () =>
                    emitIf(
                      sb.helpers.isNumber,
                      () => this.convertNumber(sb, node, options),
                      () =>
                        emitIf(
                          sb.helpers.isSymbol,
                          () => this.convertSymbol(sb, node, options),
                          () => {
                            if (shouldThrowOnObject) {
                              sb.emitHelper(node, options, sb.helpers.throwTypeError);
                            } else {
                              this.convertObject(sb, node, options);
                            }
                          },
                        ),
                    ),
                ),
            ),
        ),
    );
  }
}