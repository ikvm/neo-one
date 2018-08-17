import {
  Address,
  Blockchain,
  createEventNotifier,
  Fixed,
  Hash256,
  Integer,
  MapStorage,
  SmartContract,
  verify,
  Contract,
  constant,
} from '@neo-one/smart-contract';

const notifyTransfer = createEventNotifier<Address | undefined, Address | undefined, Fixed<8>>(
  'transfer',
  'from',
  'to',
  'amount',
);

const notifyRefund = createEventNotifier('refund');

export class ICO implements SmartContract {
  public readonly properties = {
    codeVersion: '1.0',
    author: 'dicarlo2',
    email: 'alex.dicarlo@neotracker.io',
    description: 'NEO•ONE ICO',
    payable: true,
  };
  public readonly name = 'One';
  public readonly symbol = 'ONE';
  public readonly decimals = 8;
  public readonly amountPerNEO = 10;
  private mutableRemaining: Fixed<8> = 10_000_000_000_00000000;
  private mutableSupply: Fixed<8> = 0;
  private readonly balances = new MapStorage<Address, Fixed<8>>();

  public constructor(
    public readonly owner: Address = Address.from('AXNajBTQLxWHwc9sKyXcc4UdbJvp3arYDG'),
    public readonly startTimeSeconds: Integer = 1534108415,
    public readonly icoDurationSeconds: Integer = 157700000,
  ) {
    if (!Address.verifySender(owner)) {
      throw new Error('Sender was not the owner.');
    }
  }

  @constant
  public get totalSupply(): Fixed<8> {
    return this.mutableSupply;
  }

  @constant
  public balanceOf(address: Address): Fixed<8> {
    const balance = this.balances.get(address);

    return balance === undefined ? 0 : balance;
  }

  public transfer(from: Address, to: Address, amount: Fixed<8>): boolean {
    if (amount < 0) {
      throw new Error(`Amount must be greater than 0: ${amount}`);
    }

    if (!Address.verifySender(from)) {
      return false;
    }

    const contract = Contract.for(to);
    if (contract !== undefined && !contract.payable) {
      return false;
    }

    const fromBalance = this.balanceOf(from);
    if (fromBalance < amount) {
      return false;
    }

    const toBalance = this.balanceOf(to);
    this.balances.set(from, fromBalance - amount);
    this.balances.set(to, toBalance + amount);
    notifyTransfer(from, to, amount);

    return true;
  }

  @constant
  public get remaining(): Fixed<8> {
    return this.mutableRemaining;
  }

  @verify
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
    notifyTransfer(undefined, sender, amount);

    return true;
  }

  private hasStarted(): boolean {
    return Blockchain.currentBlockTime >= this.startTimeSeconds;
  }

  private hasEnded(): boolean {
    return Blockchain.currentBlockTime > this.startTimeSeconds + this.icoDurationSeconds;
  }
}