# PolicyProof Competition Evaluation Report

Schema: `policyproof.competition-evaluation.v1`<br>
Application schema: `policyproof.app-schema.v1`<br>
Mode: `LOCAL_DETERMINISTIC_NO_NETWORK`<br>
Overall result: **PASS**

This tracked report is deterministic. It contains no generation timestamp, runtime duration, local path, environment value, provider payload, or browser metadata.

## Coverage

| Scenario | Controls | Conclusions matched | Actual outcome profile | Result |
| --- | ---: | ---: | --- | --- |
| northstar-mixed-risk | 7 | 7/7 | 3 PASS, 2 FAIL, 1 MISSING, 1 WARNING | PASS |
| meridian-clean-procurement | 7 | 7/7 | 7 PASS, 0 FAIL, 0 MISSING, 0 WARNING | PASS |
| atlas-incomplete-evidence | 7 | 7/7 | 4 PASS, 1 FAIL, 2 MISSING, 0 WARNING | PASS |

- Scenarios evaluated: 3/3
- Controls evaluated: 21/21
- Expected conclusions matched: 21/21
- Outcome profiles matched: 3/3
- Business-rule mutations: 7/7
- Adversarial cases: 10/10
- External network calls: 0

## Executed checks

- **scenarioSchemas: PASS** — Three strict scenario schemas validated.
- **expectedConclusions: PASS** — All 21 expected conclusions matched.
- **outcomeProfiles: PASS** — All three outcome profiles matched.
- **evidenceReferences: PASS** — All evidence references and control relationships are valid.
- **exactExcerpts: PASS** — All controlled excerpts are exact source text.
- **scenarioIsolation: PASS** — Scenario identifiers and state remain isolated.
- **deterministicReproduction: PASS** — All conclusions reproduced from cloned inputs.
- **thresholdSensitivity: PASS** — Only approval changes at EUR 15,000; strict > boundaries pass.
- **reviewFingerprints: PASS** — Same inputs preserve fingerprints; threshold mutation changes it.
- **receiptIntegrity: PASS** — Controlled receipts verify and modified receipts fail.
- **businessRuleMutations: PASS** — All 7 business-rule mutations passed.
- **adversarialValidation: PASS** — All 10 adversarial cases passed.
- **noNetwork: PASS** — Network APIs were blocked for the complete evaluation.

## Historical GPT-5.6 evidence

Status: **HISTORICAL EVIDENCE**. The controlled Northstar live validation was not rerun. Its tracked source is `docs/evaluation/LIVE_GPT56_VALIDATION.md` and its validated commit is `eb120feaca78bf3cdbc71b7b7198045f86a44852`. Meridian and Atlas remain deterministic and mocked only.

## Receipt integrity security boundary

**EXPECTED SECURITY BOUNDARY**

Receipt content matches the recorded hash, and modified content retained with the old hash is detected. The hash is not digitally signed. A party able to modify both receipt content and its hash can produce a new internally consistent pair. The mechanism does not establish origin, identity, authorship, trusted time, or legal signature.

## Warnings

- Historical live GPT-5.6 evidence was not rerun.
- Evaluation covers one controlled procurement-policy domain, not universal policy coverage.

## Failures

None.
