// tslint:disable
import { createPrivateKey, Hash256 } from '@neo-one/client';
import BigNumber from 'bignumber.js';
// @ts-ignore
import { withContracts } from '../generated/test';

jest.setTimeout(30000);

describe('Token', () => {
  test('allows minting tokens', async () => {
    // @ts-ignore
    await withContracts(async ({ client, token, masterAccountID, networkName, developerClient }) => {
      expect(token).toBeDefined();

      const toWallet = await client.providers.memory.keystore.addAccount({
        network: networkName,
        privateKey: createPrivateKey(),
      });

      const [
        name,
        symbol,
        decimals,
        amountPerNEO,
        owner,
        initialTotalSupply,
        initialRemaining,
        initialBalance,
      ] = await Promise.all([
        token.name(),
        token.symbol(),
        token.decimals(),
        token.amountPerNEO(),
        token.owner(),
        token.totalSupply(),
        token.remaining(),
        token.balanceOf(toWallet.account.id.address),
      ]);
      expect(name).toEqual('Eon');
      expect(symbol).toEqual('EON');
      expect(decimals.toNumber()).toEqual(8);
      expect(amountPerNEO.toNumber()).toEqual(100000);
      expect(owner).toEqual(masterAccountID.address);
      expect(initialTotalSupply.toNumber()).toEqual(0);
      expect(initialRemaining.toNumber()).toEqual(10_000_000_000);
      expect(initialBalance.toNumber()).toEqual(0);

      let error: Error | undefined;
      try {
        // Note that this transaction doesn't even get relayed to the blockchain and instead immediately fails because
        // the smart contract returned false from receiving assets.
        // Here we test that the mint tokens fails before the start time of the ICO
        await token.mintTokens.confirmed({
          sendTo: [
            {
              amount: new BigNumber(10),
              asset: Hash256.NEO,
            },
          ],
        });
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();

      // Fast forward to the start of the ICO
      await developerClient.fastForwardOffset(60 * 60);

      const mintReceipt = await token.mintTokens.confirmed({
        sendTo: [
          {
            amount: new BigNumber(10),
            asset: Hash256.NEO,
          },
        ],
      });
      if (mintReceipt.result.state === 'FAULT') {
        throw new Error(mintReceipt.result.message);
      }

      expect(mintReceipt.result.state).toEqual('HALT');
      expect(mintReceipt.result.value).toEqual(true);
      expect(mintReceipt.events).toHaveLength(1);
      let event = mintReceipt.events[0];
      expect(event.name).toEqual('transfer');
      if (event.name !== 'transfer') {
        throw new Error('For TS');
      }
      expect(event.parameters.from).toBeUndefined();
      expect(event.parameters.to).toEqual(masterAccountID.address);
      expect(event.parameters.amount.toNumber()).toEqual(1000000);

      error = undefined;
      try {
        // Note that this transaction doesn't even get relayed to the blockchain and instead immediately fails because
        // the smart contract returned false from receiving assets.
        await token.mintTokens.confirmed({
          sendTo: [
            {
              amount: new BigNumber(10),
              asset: Hash256.GAS,
            },
          ],
        });
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();

      // Fast forward past the end of of the ICO
      await developerClient.fastForwardOffset(24 * 60 * 60);

      error = undefined;
      try {
        // Here we test that the mint tokens fails after the end time of the ICO
        await token.mintTokens.confirmed({
          sendTo: [
            {
              amount: new BigNumber(10),
              asset: Hash256.NEO,
            },
          ],
        });
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();

      const [totalSupply, remaining, balance, toBalance] = await Promise.all([
        token.totalSupply(),
        token.remaining(),
        token.balanceOf(masterAccountID.address),
        token.balanceOf(toWallet.account.id.address),
      ]);
      expect(totalSupply.toNumber()).toEqual(1000000);
      expect(remaining.toNumber()).toEqual(9_999_000_000);
      expect(balance.toNumber()).toEqual(1000000);
      expect(toBalance.toNumber()).toEqual(0);

      const transferAmount = new BigNumber(5);
      const [successTransferReceipt, falseTransferReceipt0, falseTransferReceipt1] = await Promise.all([
        // Successful because there are sufficient funds and the from account is the masterAccountID (the currently selected account)
        token.transfer.confirmed(masterAccountID.address, toWallet.account.id.address, transferAmount),
        // Returns false because the from account is the toWallet
        token.transfer.confirmed(masterAccountID.address, toWallet.account.id.address, transferAmount, {
          from: toWallet.account.id,
        }),
        // Returns false because the from account has insufficient funds
        token.transfer.confirmed(masterAccountID.address, toWallet.account.id.address, new BigNumber(2000000)),
      ]);
      if (successTransferReceipt.result.state === 'FAULT') {
        throw new Error(successTransferReceipt.result.message);
      }
      expect(successTransferReceipt.result.state).toEqual('HALT');
      expect(successTransferReceipt.result.value).toEqual(true);

      expect(successTransferReceipt.events).toHaveLength(1);
      event = successTransferReceipt.events[0];
      expect(event.name).toEqual('transfer');
      if (event.name !== 'transfer') {
        throw new Error('For TS');
      }
      expect(event.parameters.from).toEqual(masterAccountID.address);
      expect(event.parameters.to).toEqual(toWallet.account.id.address);
      expect(event.parameters.amount.toNumber()).toEqual(transferAmount.toNumber());

      if (falseTransferReceipt0.result.state === 'FAULT') {
        throw new Error(falseTransferReceipt0.result.message);
      }
      expect(falseTransferReceipt0.result.state).toEqual('HALT');
      expect(falseTransferReceipt0.result.value).toEqual(false);
      expect(falseTransferReceipt0.events).toHaveLength(0);

      if (falseTransferReceipt1.result.state === 'FAULT') {
        throw new Error(falseTransferReceipt1.result.message);
      }
      expect(falseTransferReceipt1.result.state).toEqual('HALT');
      expect(falseTransferReceipt1.result.value).toEqual(false);
      expect(falseTransferReceipt1.events).toHaveLength(0);

      error = undefined;
      try {
        // Note that this transfer doesn't even get relayed to the blockchain and instead immediately fails because
        // the transaction would throw an error.
        await token.transfer.confirmed(toWallet.account.id.address, masterAccountID.address, new BigNumber(-1));
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
    });
  });
});
