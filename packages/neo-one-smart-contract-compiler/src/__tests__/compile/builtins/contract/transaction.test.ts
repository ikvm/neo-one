import { Attribute, Input, Output } from '@neo-one/client';
import { AttributeUsage, common } from '@neo-one/client-core';
import BigNumber from 'bignumber.js';
import { helpers, keys } from '../../../../__data__';
import { DiagnosticCode } from '../../../../DiagnosticCode';

describe('Transaction', () => {
  test('properties', async () => {
    const node = await helpers.startNode();
    const block = await node.readClient.getBlock(0);
    const { transaction } = await node.executeString(
      `
      import { Hash256, TransactionType, Transaction, } from '@neo-one/smart-contract';

      const transaction = Transaction.for(Hash256.from('${block.transactions[0].hash}'));

      assertEqual(transaction.type, TransactionType.Miner);
    `,
      {
        transfers: [
          {
            to: keys[0].address,
            amount: new BigNumber(10),
            asset: common.NEO_ASSET_HASH,
          },
        ],
        attributes: [
          {
            usage: 'Description',
            data: Buffer.from('Hello World', 'utf8').toString('hex'),
          },
        ],
      },
    );

    const getUsage = (attribute: Attribute) => AttributeUsage[attribute.usage];

    const checkAttribute = (idx: number, attribute: Attribute) => `
      attribute = attributes[${idx}];

      assertEqual(attribute.usage, ${getUsage(attribute)});
      assertEqual(attribute.data.equals(${helpers.getBufferHash(attribute.data)}), true)
      assertEqual(attribute instanceof AttributeBase, true);
    `;

    const checkInput = (idx: number, input: Input) => `
      input = inputs[${idx}];

      assertEqual(input.hash.equals(Hash256.from('${input.hash}')), true)
      assertEqual(input.index, ${input.index})
      assertEqual(input instanceof Input, true);
    `;

    const checkOutput = (idx: number, output: Output) => `
      output = outputs[${idx}];

      assertEqual(output.asset.equals(Hash256.from('${output.asset}')), true);
      assertEqual(output.value, ${helpers.getDecimal(output.value)});
      assertEqual(output.address.equals(Address.from('${output.address}')), true);
      assertEqual(output instanceof Output, true);
    `;

    const references = await Promise.all(transaction.inputs.map(async (input) => node.readClient.getOutput(input)));

    await node.executeString(`
      import { TransactionBase, TransactionType, Transaction, Address, Hash256, Attribute, Output, Input, InvocationTransaction, AttributeBase } from '@neo-one/smart-contract';

      const transaction = Transaction.for(Hash256.from('${transaction.hash}')) as InvocationTransaction;

      assertEqual(transaction.type, TransactionType.Invocation);
      assertEqual(transaction.script.equals(${helpers.getBufferHash(transaction.script)}), true);

      const attributes = transaction.attributes;
      assertEqual(attributes.length, ${transaction.attributes.length});

      let attribute: Attribute;
      ${transaction.attributes.map((attribute, idx) => checkAttribute(idx, attribute)).join('')}

      const inputs = transaction.inputs;
      assertEqual(inputs.length, ${transaction.inputs.length});

      let input: Input;
      ${transaction.inputs.map((input, idx) => checkInput(idx, input)).join('')}

      let outputs = transaction.outputs;
      assertEqual(outputs.length, ${transaction.outputs.length});

      let output: Output;
      ${transaction.outputs.map((output, idx) => checkOutput(idx, output)).join('')}

      outputs = transaction.unspentOutputs;
      assertEqual(outputs.length, ${transaction.outputs.length});

      ${transaction.outputs.map((output, idx) => checkOutput(idx, output)).join('')}

      outputs = transaction.references;
      assertEqual(outputs.length, ${references.length});

      ${references.map((output, idx) => checkOutput(idx, output)).join('')}

      assertEqual(transaction instanceof TransactionBase, true);
    `);
  });

  test('cannot be implemented', async () => {
    helpers.compileString(
      `
      import { TransactionBase } from '@neo-one/smart-contract';

      class MyTransaction implements TransactionBase {
      }
    `,
      { type: 'error', code: DiagnosticCode.InvalidBuiltinImplement },
    );
  });

  test('cannot be referenced', async () => {
    helpers.compileString(
      `
      import { Transaction } from '@neo-one/smart-contract';

      const x = Transaction;
    `,
      { type: 'error', code: DiagnosticCode.InvalidBuiltinReference },
    );
  });
});