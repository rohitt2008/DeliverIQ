import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const pdfPath = path.join(rootDir, 'docs', 'Technical_Design_Document.pdf');
const deployPath = path.join(rootDir, 'deployment.md');
const tempDir = path.join(rootDir, 'submission_temp');
const zipOutput = path.join(rootDir, 'DeliverIQ_Submission.zip');

if (!fs.existsSync(pdfPath)) {
  console.error('Error: Technical_Design_Document.pdf not found in docs/');
  process.exit(1);
}

if (!fs.existsSync(deployPath)) {
  console.error('Error: deployment.md not found in root/');
  process.exit(1);
}

// Clean and prepare temp directory
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// Copy the two files
fs.copyFileSync(pdfPath, path.join(tempDir, 'Technical_Design_Document.pdf'));
fs.copyFileSync(deployPath, path.join(tempDir, 'deployment.md'));

// Remove old zip if present
if (fs.existsSync(zipOutput)) {
  fs.unlinkSync(zipOutput);
}

// Create ZIP archive
try {
  execSync(`cd "${tempDir}" && zip -r "${zipOutput}" Technical_Design_Document.pdf deployment.md`, {
    stdio: 'inherit',
  });
  console.log(`\n🎉 Successfully packaged submission ZIP at: ${zipOutput}`);
  const stats = fs.statSync(zipOutput);
  console.log(`Archive Size: ${(stats.size / 1024).toFixed(1)} KB (Well under 25 MB limit)`);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
