import { execSync } from 'child_process';

console.log('🚀 Running Full DeliverIQ End-to-End Verification Pipeline...\n');

function run(cmd, desc) {
  console.log(`▶ [STEP] ${desc} (${cmd})`);
  execSync(cmd, { stdio: 'inherit' });
  console.log(`✔ Passed\n`);
}

try {
  run('npm run seed', 'Seed Database with Maharashtra Logistics Trips');
  run('npm test', 'Execute Automated Unit & Business Logic Tests');
  run('npm run build', 'Compile Production Next.js & Prisma Build');
  run('npm run package', 'Regenerate TDD PDF and Submission ZIP Archive');
  console.log('🎉 ALL DELIVERIQ PIPELINES PASSED 100%! Ready for client and evaluator review.');
} catch (err) {
  console.error('❌ Pipeline failed:', err);
  process.exit(1);
}
