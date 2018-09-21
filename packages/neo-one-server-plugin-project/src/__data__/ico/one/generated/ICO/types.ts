/* @hash 713a6252e050a3e0f19ee5ac0970097c */
// tslint:disable
/* eslint-disable */
import {
  AddressString,
  Event,
  GetOptions,
  InvocationTransaction,
  InvokeReceipt,
  InvokeReceiveTransactionOptions,
  InvokeSendUnsafeTransactionOptions,
  ReadSmartContract,
  SmartContract,
  TransactionOptions,
  TransactionResult,
  Transfer,
} from '@neo-one/client';
import BigNumber from 'bignumber.js';

export interface ICOTransferEventParameters {
  readonly from: AddressString | undefined;
  readonly to: AddressString | undefined;
  readonly amount: BigNumber;
}
export interface ICOTransferEvent extends Event<'transfer', ICOTransferEventParameters> {}
export interface ICOApproveSendTransferEventParameters {
  readonly from: AddressString;
  readonly to: AddressString;
  readonly amount: BigNumber;
}
export interface ICOApproveSendTransferEvent
  extends Event<'approveSendTransfer', ICOApproveSendTransferEventParameters> {}
export interface ICORevokeSendTransferEventParameters {
  readonly from: AddressString;
  readonly to: AddressString;
  readonly amount: BigNumber;
}
export interface ICORevokeSendTransferEvent extends Event<'revokeSendTransfer', ICORevokeSendTransferEventParameters> {}
export type ICOEvent = ICOTransferEvent | ICOApproveSendTransferEvent | ICORevokeSendTransferEvent;

export interface ICOSmartContract extends SmartContract<ICOReadSmartContract> {
  readonly amountPerNEO: () => Promise<BigNumber>;
  readonly deploy: {
    (
      owner?: AddressString,
      startTimeSeconds?: BigNumber,
      icoDurationSeconds?: BigNumber,
      options?: TransactionOptions,
    ): Promise<TransactionResult<InvokeReceipt<boolean, ICOEvent>, InvocationTransaction>>;
    readonly confirmed: {
      (
        owner?: AddressString,
        startTimeSeconds?: BigNumber,
        icoDurationSeconds?: BigNumber,
        options?: TransactionOptions & GetOptions,
      ): Promise<InvokeReceipt<boolean, ICOEvent> & { readonly transaction: InvocationTransaction }>;
    };
  };
  readonly icoDurationSeconds: () => Promise<BigNumber>;
  readonly mintTokens: {
    (options?: InvokeReceiveTransactionOptions): Promise<
      TransactionResult<InvokeReceipt<boolean, ICOEvent>, InvocationTransaction>
    >;
    readonly confirmed: {
      (options?: InvokeReceiveTransactionOptions & GetOptions): Promise<
        InvokeReceipt<boolean, ICOEvent> & { readonly transaction: InvocationTransaction }
      >;
    };
  };
  readonly owner: () => Promise<AddressString>;
  readonly refundAssets: {
    (options?: InvokeSendUnsafeTransactionOptions): Promise<
      TransactionResult<InvokeReceipt<boolean, ICOEvent>, InvocationTransaction>
    >;
    readonly confirmed: {
      (options?: InvokeSendUnsafeTransactionOptions & GetOptions): Promise<
        InvokeReceipt<boolean, ICOEvent> & { readonly transaction: InvocationTransaction }
      >;
    };
  };
  readonly remaining: () => Promise<BigNumber>;
  readonly startTimeSeconds: () => Promise<BigNumber>;
}

export interface ICOReadSmartContract extends ReadSmartContract<ICOEvent> {
  readonly amountPerNEO: () => Promise<BigNumber>;
  readonly icoDurationSeconds: () => Promise<BigNumber>;
  readonly owner: () => Promise<AddressString>;
  readonly remaining: () => Promise<BigNumber>;
  readonly startTimeSeconds: () => Promise<BigNumber>;
}
