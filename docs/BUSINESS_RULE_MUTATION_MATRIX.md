# PolicyProof Business-Rule Mutation Matrix

Schema: `policyproof.business-rule-mutation.v1`

Every case starts from a schema-validated defensive clone of Northstar. The shared engine evaluates all seven stable control IDs. A PASS requires exactly one expected status transition, six unchanged statuses, valid exact evidence, unchanged scenario identity, pending human decisions, a changed Review Fingerprint, and zero network calls.

| ID | Changed fact | Expected changed control | Transition | Expected unchanged controls | Fingerprint | Rationale | Test reference |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `MUT-CURRENCY-001` | Invoice currency USD → EUR | `CTRL-CURRENCY` (`CTRL-04`) | FAIL → PASS | Other six | Changes | Isolates currency equality. | `tests/evaluation/business-rule-mutations.test.ts` |
| `MUT-AMOUNT-001` | Invoice amount 12,480 → 12,481 | `CTRL-AMOUNT` (`CTRL-03`) | PASS → FAIL | Other six, including base currency FAIL | Changes | Isolates exact amount equality. | `tests/evaluation/business-rule-mutations.test.ts` |
| `MUT-TIMING-001` | Invoice date 2026-07-05 → 2026-07-02 | `CTRL-TIMING` (`CTRL-02`) | PASS → FAIL | Other six | Changes | Isolates ISO chronology. | `tests/evaluation/business-rule-mutations.test.ts` |
| `MUT-DELIVERY-001` | Delivery evidence true → false with exact missing statement | `CTRL-DELIVERY` (`CTRL-05`) | PASS → MISSING | Other six | Changes | Proves fail-closed documentary evidence. | `tests/evaluation/business-rule-mutations.test.ts` |
| `MUT-SOD-001` | Approver Emma Reed → Alex Morgan | `CTRL-SOD` (`CTRL-07`) | WARNING → PASS | Other six; approver count remains one | Changes | Isolates fictional identity equality. | `tests/evaluation/business-rule-mutations.test.ts` |
| `MUT-BANK-001` | Independent verification false → true with exact source text | `CTRL-BANK` (`CTRL-06`) | MISSING → PASS | Other six | Changes | Proves controlled bank-verification evidence. | `tests/evaluation/business-rule-mutations.test.ts` |
| `MUT-THRESHOLD-001` | Threshold EUR 10,000 → EUR 15,000 | `CTRL-APPROVAL` (`CTRL-01`) | FAIL → PASS | Other six | Changes | Protects the demonstrated causal threshold change. | `tests/evaluation/business-rule-mutations.test.ts` |

## Strict threshold boundary

The policy says transactions **above** EUR 10,000 require two approvers. The engine therefore uses `amount > threshold`, never `amount >= threshold`.

| Amount | One-approver result |
| ---: | --- |
| EUR 9,999.99 | PASS |
| EUR 10,000.00 | PASS |
| EUR 10,000.01 | FAIL |
