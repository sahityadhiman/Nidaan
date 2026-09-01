import crypto from 'crypto';

/*
  Tamper-evident ledger (GlassLedger 6c).
  Every status change is appended as an immutable entry that stores the SHA-256
  hash of the previous entry, forming a hash chain. Mutating any past entry
  breaks every hash that follows it — which `verifyChain` detects.
*/

const GENESIS = '0000000000000000000000000000000000000000000000000000000000000000';

// Deterministic hash over the meaningful fields + the previous hash.
export function hashEntry(entry, prevHash) {
  const payload = JSON.stringify({
    timestamp: entry.timestamp,
    status: entry.status,
    actor: entry.actor,
    message: entry.message,
    prevHash,
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// Append a new entry to an existing trail, wiring up the hash chain.
// Canonical fields (timestamp/status/actor/message + prevHash) are hashed;
// optional display metadata (tool/service/reasoning) is preserved alongside.
export function appendLedger(trail = [], entry) {
  const prev = trail.length ? trail[trail.length - 1] : null;
  const prevHash = prev?.hash || GENESIS;
  const stamped = {
    timestamp: entry.timestamp || new Date().toISOString(),
    status: entry.status,
    actor: entry.actor,
    message: entry.message,
    ...(entry.tool ? { tool: entry.tool } : {}),
    ...(entry.service ? { service: entry.service } : {}),
    ...(entry.reasoning ? { reasoning: entry.reasoning } : {}),
    prevHash,
  };
  stamped.hash = hashEntry(stamped, prevHash);
  return [...trail, stamped];
}

// Re-hash an entire trail from scratch (used when seeding pre-built trails).
export function sealTrail(entries = []) {
  let trail = [];
  for (const e of entries) {
    trail = appendLedger(trail, e);
  }
  return trail;
}

// Walk the chain and confirm no entry was tampered with after the fact.
export function verifyChain(trail = []) {
  let prevHash = GENESIS;
  for (let i = 0; i < trail.length; i++) {
    const e = trail[i];
    if (e.prevHash !== prevHash) {
      return { valid: false, brokenAt: i, reason: 'prevHash mismatch' };
    }
    if (hashEntry(e, prevHash) !== e.hash) {
      return { valid: false, brokenAt: i, reason: 'hash mismatch' };
    }
    prevHash = e.hash;
  }
  return { valid: true, length: trail.length, head: prevHash };
}

export { GENESIS };
