# x402 Conformance Fixtures

Cross-language conformance vectors for x402 protocol extensions.

## Structure

```
fixtures/
  <suite-name>/
    <version>/
      README.md          # What the suite tests
      manifest.json      # Suite metadata + vector listing
      vectors/
        NNNN-name.json   # Individual test vectors
```

## Vector format

Each vector is a JSON file:

```json
{
  "name": "descriptive-name",
  "spec": "suite-specific-spec-identifier",
  "expected_result": "PASS | FAIL",
  "notes": "What this vector tests and why"
}
```

Additional fields are suite-specific (preimage objects, expected digests, payment hashes, etc.).

## Current suites

| Suite | Version | Vectors | Tests |
|-------|---------|---------|-------|
| [action-ref-verify](action-ref-verify/v0/) | v0 | 9 | Work-receipt digest binding via SHA-256(JCS(preimage)) |

## Adding vectors

Conformance vectors from independent implementations are welcome. See each suite's README for reproduction instructions and the vector schema.
