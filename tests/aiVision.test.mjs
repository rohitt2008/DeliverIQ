import test from 'node:test';
import assert from 'node:assert';
import { analyzePODImage } from '../src/lib/aiVision.ts';

test('AI Vision: Clean POD with stamp and signature returns VERIFIED', async () => {
  const dummyBuffer = Buffer.from('dummy image content');
  const result = await analyzePODImage({
    imageBuffer: dummyBuffer,
    mimeType: 'image/jpeg',
    imageFileName: 'TRP-66120-clean-pod.jpg',
    tripContext: {
      id: 'TRP-66120',
      lrNumber: 'LR-NGP-8812',
      expectedQty: 700,
      material: 'Portland Pozzolana Cement',
      currentRetakeCount: 0,
    },
  });

  assert.strictEqual(result.recommendedStatus, 'VERIFIED');
  assert.strictEqual(result.stampDetected, true);
  assert.strictEqual(result.signatureDetected, true);
  assert.strictEqual(result.retakeReason, null);
  assert.ok(result.aiConfidence > 0.8);
});

test('AI Vision: Missing stamp on initial attempt requests retake', async () => {
  const dummyBuffer = Buffer.from('dummy image content');
  const result = await analyzePODImage({
    imageBuffer: dummyBuffer,
    mimeType: 'image/jpeg',
    imageFileName: 'TRP-66134-nostamp.jpg',
    tripContext: {
      id: 'TRP-66134',
      lrNumber: 'LR-PUN-3490',
      expectedQty: 520,
      material: 'TMT Steel Bars',
      currentRetakeCount: 0,
    },
  });

  assert.strictEqual(result.recommendedStatus, 'RETAKE_REQUESTED');
  assert.strictEqual(result.stampDetected, false);
  assert.ok(result.retakeReason.includes('stamp'));
});

test('AI Vision: Retake cap enforcement (Capped at 2 retakes maximum)', async () => {
  const dummyBuffer = Buffer.from('dummy image content');
  
  // When driver has already retaken twice (currentRetakeCount = 2)
  const result = await analyzePODImage({
    imageBuffer: dummyBuffer,
    mimeType: 'image/jpeg',
    imageFileName: 'TRP-66134-nostamp.jpg',
    tripContext: {
      id: 'TRP-66134',
      lrNumber: 'LR-PUN-3490',
      expectedQty: 520,
      material: 'TMT Steel Bars',
      currentRetakeCount: 2, // ALREADY RETAKEN TWICE
    },
  });

  // MUST NOT request 3rd retake! Must escalate to NEEDS_REVIEW
  assert.strictEqual(result.recommendedStatus, 'NEEDS_REVIEW');
  assert.strictEqual(result.retakeReason, null);
  assert.ok(result.executiveAlert.includes('Retake limit reached'));
});

test('AI Vision: Shortage remark escalates to billing executive and never prompts retake', async () => {
  const dummyBuffer = Buffer.from('dummy image content');
  const result = await analyzePODImage({
    imageBuffer: dummyBuffer,
    mimeType: 'image/jpeg',
    imageFileName: 'TRP-66141-shortage.jpg',
    tripContext: {
      id: 'TRP-66141',
      lrNumber: 'LR-IND-5012',
      expectedQty: 450,
      material: 'Refined Edible Oil Cartons',
      currentRetakeCount: 0,
    },
  });

  assert.strictEqual(result.recommendedStatus, 'NEEDS_REVIEW');
  assert.strictEqual(result.isShortageOrDamage, true);
  assert.strictEqual(result.retakeReason, null); // Shortage is physical, not a photo defect!
  assert.strictEqual(result.qtyDiscrepancy, 6);
});
