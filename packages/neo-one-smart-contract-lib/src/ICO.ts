// tslint:disable readonly-keyword readonly-array no-object-mutation strict-boolean-expressions
import {
  Address,
  Blockchain,
  createEventNotifier,
  Fixed,
  Hash256,
  Integer,
  receive,
  send,
} from '@neo-one/smart-contract';

import { Token } from './Token';

const notifyRefund = createEventNotifier('refund');

export abstract class ICO<Decimals extends number> extends Token<Decimals> {
  private mutableRemaining: Fixed<Decimals>;

  public constructor(
    public readonly startTimeSeconds: Integer,
    public readonly icoDurationSeconds: Integer,
    public readonly icoAmount: Fixed<Decimals>,
    public readonly amountPerNEO: Fixed<Decimals>,
  ) {
    super();
    this.mutableRemaining = icoAmount;
  }

  public get remaining(): number {
    return this.mutableRemaining;
  }

  @receive
  public mintTokens(): boolean {
    if (!this.hasStarted() || this.hasEnded()) {
      notifyRefund();

      return false;
    }

    const { references } = Blockchain.currentTransaction;
    if (references.length === 0) {
      return false;
    }
    const sender = references[0].address;

    let amount = 0;
    // tslint:disable-next-line no-loop-statement
    for (const output of Blockchain.currentTransaction.outputs) {
      if (output.address.equals(Blockchain.contractAddress)) {
        if (!output.asset.equals(Hash256.NEO)) {
          notifyRefund();

          return false;
        }

        amount += output.value * this.amountPerNEO;
      }
    }

    if (amount > this.remaining) {
      notifyRefund();

      return false;
    }

    this.balances.set(sender, this.balanceOf(sender) + amount);
    this.mutableRemaining -= amount;
    this.mutableSupply += amount;
    this.notifyTransfer(undefined, sender, amount);

    return true;
  }

  @send
  public withdraw(): boolean {
    return Address.isSender(this.owner);
  }

  private hasStarted(): boolean {
    return Blockchain.currentBlockTime >= this.startTimeSeconds;
  }

  private hasEnded(): boolean {
    return Blockchain.currentBlockTime > this.startTimeSeconds + this.icoDurationSeconds;
  }
}
