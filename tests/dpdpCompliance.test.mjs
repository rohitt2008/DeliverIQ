import test from 'node:test';
import assert from 'node:assert';
import { maskPhoneNumber, maskPersonalName } from '../src/lib/dpdp.ts';

test('DPDP Act 2023: Phone number masking protects driver & consignee personal data', () => {
  // Format with country code
  assert.strictEqual(maskPhoneNumber('+91 98220 54321'), '+91 98•••• 4321');
  assert.strictEqual(maskPhoneNumber('+91 94220 11990'), '+91 94•••• 1990');

  // Empty or invalid handling
  assert.strictEqual(maskPhoneNumber(null), '—');
  assert.strictEqual(maskPhoneNumber(undefined), '—');
});

test('DPDP Act 2023: Personal name masking on public links protects individual privacy', () => {
  // Public view: masked
  assert.strictEqual(maskPersonalName('Sanjay Deshpande', false), 'S***** D********');
  assert.strictEqual(maskPersonalName('Anita Rane', false), 'A**** R***');

  // Authorized staff view: unmasked
  assert.strictEqual(maskPersonalName('Sanjay Deshpande', true), 'Sanjay Deshpande');
});
