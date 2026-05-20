# action-ref-verify conformance fixtures (v0)

Conformance vectors for verifying `action_ref` work-receipt digest binding as discussed in [#2357](https://github.com/x402-foundation/x402/issues/2357).

## Derivation

```
action_ref = SHA-256(JCS(preimage))
```

Where JCS is [JSON Canonicalization Scheme (RFC 8785)](https://www.rfc-editor.org/rfc/rfc8785). The preimage is a JSON object with:

| Field | Type | Description |
|-------|------|-------------|
| `action_type` | string | What was requested |
| `agent_id` | string | Who requested it |
| `scope` | string | Scoping context |
| `timestamp_ms` | integer | Epoch milliseconds (not RFC 3339 string) |

`timestamp_ms` (epoch integer) is the canonical field name. See vector 0009 for why this is load-bearing.

## Vectors

| # | Name | Result | Tests |
|---|------|--------|-------|
| 0001 | baseline | PASS | Canonical happy path |
| 0002 | ms-precision-trap | FAIL | Float vs integer timestamp_ms |
| 0003 | trailing-whitespace | FAIL | Space in string value changes digest |
| 0004 | extra-field-ignored | PASS | Additional preimage fields (open model) |
| 0005 | key-order-resilience | PASS | Reversed key order, same digest |
| 0006 | rfc8785-negative-zero | PASS | timestamp_ms = 0 |
| 0007 | key-sorting-stress | PASS | Unicode in values |
| 0008 | interop-shared-payment-hash | PASS | Cross-layer binding with payment_hash |
| 0009 | field-name-load-bearing | FAIL | `timestamp` vs `timestamp_ms` divergence |

Vectors 0002, 0003, and 0009 are negative vectors: they MUST fail verification against the expected digest.

## Cross-layer interop

Vector 0008 includes a `payment_hash` field binding the work-receipt layer to a payment-conditions layer. Three independent implementations (Node.js, Python, Rust) produced identical `action_ref` and `payment_hash` digests from this preimage with independent JCS canonicalization and no shared code.

## Reproducing

Any language with a JCS (RFC 8785) implementation and SHA-256 can verify these vectors:

```bash
# Node.js (using the action-ref-verify CLI)
npx action-ref-verify vectors/0001-baseline.json

# Or manually:
# 1. Parse the preimage object
# 2. Canonicalize with JCS (RFC 8785)
# 3. SHA-256 hash the canonical bytes
# 4. Compare hex output to expected_digest
```

## Source

These vectors are derived from the [action-ref-verify](https://github.com/andysalvo/action-ref-verify) conformance harness (v0.3.0, Apache-2.0).
