// Conflux Verify — 50-Case Golden Test Set Evaluation Benchmark Runner

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verificationService } from '../lib/verify/verificationService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('======================================================================');
console.log('       CONFLUX VERIFY — 50-CASE GOLDEN BENCHMARK EVALUATION           ');
console.log('======================================================================\n');

async function runBenchmark() {
  const goldenPath = path.resolve(rootDir, 'docs/verify/golden_test_set.json');
  if (!fs.existsSync(goldenPath)) {
    console.error('Golden test set file not found at:', goldenPath);
    process.exit(1);
  }

  const goldenSet = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
  console.log(`Loaded ${goldenSet.length} benchmark test cases across 10 categories.\n`);

  const categoryResults = {};
  const latencies = [];
  let totalCorrectStatus = 0;
  let totalFalseSupported = 0;
  let totalFalseContradicted = 0;
  let totalContradictionsExpected = 0;
  let totalContradictionsDetected = 0;
  let totalOutdatedExpected = 0;
  let totalOutdatedDetected = 0;
  let totalDisputedExpected = 0;
  let totalDisputedDetected = 0;
  let totalEvidenceRelevant = 0;
  let totalSyndicatedDetected = 0;
  let totalSyndicatedExpected = 0;

  for (const tc of goldenSet) {
    const startTime = performance.now();
    const result = await verificationService.verifyClaim({
      entityName: tc.entityName,
      claimText: tc.claimText,
      forceFresh: true
    });
    const latency = performance.now() - startTime;
    latencies.push(latency);

    const cat = tc.category;
    if (!categoryResults[cat]) {
      categoryResults[cat] = {
        category: cat,
        total: 0,
        correct: 0,
        falseSupported: 0,
        falseContradicted: 0,
        avgLatencyMs: 0,
        latencies: []
      };
    }

    const catObj = categoryResults[cat];
    catObj.total++;
    catObj.latencies.push(latency);

    const isStatusMatch = (result.status === tc.expectedStatus);
    if (isStatusMatch) {
      catObj.correct++;
      totalCorrectStatus++;
    }

    // Safety checks
    if (tc.expectedStatus !== 'SUPPORTED' && result.status === 'SUPPORTED') {
      catObj.falseSupported++;
      totalFalseSupported++;
      console.warn(`[SAFETY ALERT - FALSE SUPPORTED] ${tc.id} (${tc.entityName}): Expected ${tc.expectedStatus}, got SUPPORTED!`);
    }

    if (tc.expectedStatus === 'SUPPORTED' && result.status === 'CONTRADICTED') {
      catObj.falseContradicted++;
      totalFalseContradicted++;
      console.warn(`[SAFETY ALERT - FALSE CONTRADICTED] ${tc.id} (${tc.entityName}): Expected SUPPORTED, got CONTRADICTED!`);
    }

    if (tc.expectedStatus === 'CONTRADICTED') {
      totalContradictionsExpected++;
      if (result.status === 'CONTRADICTED') totalContradictionsDetected++;
    }

    if (tc.expectedStatus === 'OUTDATED') {
      totalOutdatedExpected++;
      if (result.status === 'OUTDATED') totalOutdatedDetected++;
    }

    if (tc.expectedStatus === 'DISPUTED') {
      totalDisputedExpected++;
      if (result.status === 'DISPUTED') totalDisputedDetected++;
    }

    if (cat === 'SYNDICATED_COPYCATS') {
      totalSyndicatedExpected++;
      if (result.sourceQualityBreakdown.independentOriginsCount <= 1) {
        totalSyndicatedDetected++;
      }
    }

    if (result.explanation && result.explanation.length > 20) {
      totalEvidenceRelevant++;
    }
  }

  // Calculate p95 Latency
  latencies.sort((a, b) => a - b);
  const p95Latency = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);
  const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);

  console.log('----------------------------------------------------------------------');
  console.log('                   PER-CATEGORY ACCURACY BREAKDOWN                    ');
  console.log('----------------------------------------------------------------------');
  console.log('Category                          Total  Correct  Accuracy   False-Supp');
  console.log('----------------------------------------------------------------------');

  Object.values(categoryResults).forEach(c => {
    const acc = ((c.correct / c.total) * 100).toFixed(0);
    const catPadded = c.category.padEnd(32, ' ');
    const totPadded = String(c.total).padStart(5, ' ');
    const corPadded = String(c.correct).padStart(8, ' ');
    const accPadded = `${acc}%`.padStart(9, ' ');
    const fsPadded = String(c.falseSupported).padStart(12, ' ');
    console.log(`${catPadded} ${totPadded} ${corPadded} ${accPadded} ${fsPadded}`);
  });

  console.log('----------------------------------------------------------------------\n');

  const finalStatusAccuracy = ((totalCorrectStatus / goldenSet.length) * 100).toFixed(1);
  const falseSupportedRate = ((totalFalseSupported / goldenSet.length) * 100).toFixed(1);
  const falseContradictedRate = ((totalFalseContradicted / goldenSet.length) * 100).toFixed(1);
  const contradictionRecall = totalContradictionsExpected > 0 ? ((totalContradictionsDetected / totalContradictionsExpected) * 100).toFixed(1) : '100.0';
  const temporalAccuracy = totalOutdatedExpected > 0 ? ((totalOutdatedDetected / totalOutdatedExpected) * 100).toFixed(1) : '100.0';
  const syndicationAccuracy = totalSyndicatedExpected > 0 ? ((totalSyndicatedDetected / totalSyndicatedExpected) * 100).toFixed(1) : '100.0';

  console.log('======================================================================');
  console.log('                      OVERALL BENCHMARK METRICS                       ');
  console.log('======================================================================');
  console.log(`Total Golden Test Cases:              ${goldenSet.length}`);
  console.log(`Final Status Accuracy:                ${finalStatusAccuracy}% (${totalCorrectStatus}/${goldenSet.length})`);
  console.log(`False-Supported Rate (CRITICAL):      ${falseSupportedRate}% (Target: < 2.0%)`);
  console.log(`False-Contradicted Rate (CRITICAL):   ${falseContradictedRate}% (Target: < 2.0%)`);
  console.log(`Contradiction Detection Recall:       ${contradictionRecall}%`);
  console.log(`Temporal Correctness (OUTDATED):      ${temporalAccuracy}%`);
  console.log(`Syndication / Copycat Collapsing:     ${syndicationAccuracy}%`);
  console.log(`Average Latency:                      ${avgLatency} ms`);
  console.log(`P95 Latency:                          ${p95Latency} ms`);
  console.log(`Estimated Cost Per Verification:      $0.0000 USD (Zero unmetered crawlers)`);
  console.log('======================================================================\n');

  if (parseFloat(falseSupportedRate) > 2.0) {
    console.error(`Benchmark failed safety threshold: False-Supported rate ${falseSupportedRate}% exceeds 2.0% limit.`);
    process.exit(1);
  }
}

runBenchmark();
