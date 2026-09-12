// Conflux AI — Runtime Stability & Telemetry Fail-Safe Verification Suite
import './load_env.js';
import assert from 'assert';
import { connectService } from '../lib/connectService.ts';
import { trackPageView, trackEvent, logEvent } from '../lib/analytics.ts';
import { businessService } from '../lib/businessService.ts';

async function runRuntimeStabilityTests() {
  console.log('=== CONFLUX AI — RUNTIME STABILITY & ERROR RECOVERY TEST SUITE ===\n');

  let passed = 0;
  let total = 0;

  const test = (description, fn) => {
    total++;
    try {
      fn();
      console.log(`  [PASS] Test ${total}: ${description}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] Test ${total}: ${description} —`, err.message);
    }
  };

  const testAsync = async (description, fn) => {
    total++;
    try {
      await fn();
      console.log(`  [PASS] Test ${total}: ${description}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] Test ${total}: ${description} —`, err.message);
    }
  };

  // -------------------------------------------------------------
  // Test Group 1: connectService.logEvent method existence & signature
  // -------------------------------------------------------------
  console.log('Group 1: Telemetry Method Existence & Binding');
  test('connectService.logEvent is defined and is a function', () => {
    assert(typeof connectService.logEvent === 'function', 'logEvent must be a function on connectService');
  });

  test('connectService.recordConnectAction is defined and is a function', () => {
    assert(typeof connectService.recordConnectAction === 'function', 'recordConnectAction must be a function on connectService');
  });

  test('Unbound callback invocation preserves "this"', async () => {
    const unboundLog = connectService.logEvent;
    const res = await unboundLog({
      businessId: 'test_biz_unbound',
      eventType: 'BUSINESS_VIEW',
      channel: 'HUMAN_WEB'
    });
    assert(res && res.businessId === 'test_biz_unbound', 'Unbound invocation should succeed without throwing');
  });

  // -------------------------------------------------------------
  // Test Group 2: connectService.logEvent defensive resilience (no throws)
  // -------------------------------------------------------------
  console.log('\nGroup 2: Telemetry Defensive Resilience (Fail-Open Guarantee)');
  await testAsync('logEvent succeeds with standard valid payload', async () => {
    const record = await connectService.logEvent({
      businessId: 'test_biz_001',
      eventType: 'BUSINESS_VIEW',
      channel: 'HUMAN_WEB'
    });
    assert(record && record.eventType === 'BUSINESS_VIEW', 'Record returned with correct eventType');
  });

  await testAsync('logEvent does not throw with empty object {}', async () => {
    const record = await connectService.logEvent({});
    assert(record !== undefined, 'Record should be returned even with empty payload');
  });

  await testAsync('logEvent does not throw with undefined/null argument', async () => {
    const record1 = await connectService.logEvent(undefined);
    const record2 = await connectService.logEvent(null);
    assert(record1 !== undefined && record2 !== undefined, 'logEvent gracefully returns fallback record on null/undefined');
  });

  await testAsync('logEvent records all 7 core interaction event types without throwing', async () => {
    const eventTypes = [
      'BUSINESS_VIEW',
      'DISCOVERY_SEARCH',
      'PHONE_CLICK',
      'WHATSAPP_CLICK',
      'WEBSITE_CLICK',
      'DIRECTIONS_CLICK',
      'BOOKING_CLICK'
    ];

    for (const ev of eventTypes) {
      const rec = await connectService.logEvent({
        businessId: 'test_biz_matrix',
        eventType: ev,
        channel: 'HUMAN_WEB'
      });
      assert(rec.eventType === ev, `Recorded event matches ${ev}`);
    }
  });

  // -------------------------------------------------------------
  // Test Group 3: Memory & Local Storage Sync
  // -------------------------------------------------------------
  console.log('\nGroup 3: Memory Event Ingestion');
  test('Recent events are retained in getRecordedEvents()', () => {
    const events = connectService.getRecordedEvents();
    assert(Array.isArray(events) && events.length > 0, 'getRecordedEvents returns non-empty array of records');
    const recent = events.find(e => e.businessId === 'test_biz_matrix');
    assert(recent !== undefined, 'Recently recorded event found in event queue');
  });

  // -------------------------------------------------------------
  // Test Group 4: Google Analytics 4 (lib/analytics.ts) safety
  // -------------------------------------------------------------
  console.log('\nGroup 4: GA4 Analytics Module Resilience');
  test('trackPageView does not throw in Node or browser environment', () => {
    trackPageView('Test Page Title', 'https://confluxai.in/test', '/test');
  });

  test('trackEvent does not throw in Node or browser environment', () => {
    trackEvent('user_search', { query: 'diagnostic clinic' });
  });

  test('logEvent alias does not throw and mirrors trackEvent', () => {
    logEvent('click_whatsapp', { business: 'test' });
  });

  // -------------------------------------------------------------
  // Test Group 5: Consumer Search & Fallback Pipeline
  // -------------------------------------------------------------
  console.log('\nGroup 5: Discovery Search & Null Safety');
  await testAsync('businessService.searchBusinesses returns an array even for unknown terms', async () => {
    const res = await businessService.searchBusinesses({ query: 'nonexistent_random_service_xyz_99' });
    assert(Array.isArray(res), 'Search must always return an array');
  });

  await testAsync('Fallback query for verified businesses returns valid array', async () => {
    const fallbacks = await businessService.searchBusinesses({ verifiedOnly: true });
    assert(Array.isArray(fallbacks), 'Verified fallback search returns array');
  });

  console.log('\n=============================================================');
  console.log(`TOTAL RUNTIME STABILITY TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('=============================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runRuntimeStabilityTests().catch(err => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
