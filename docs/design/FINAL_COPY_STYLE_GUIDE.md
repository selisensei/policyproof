# PolicyProof final copy style guide

## Voice

PolicyProof speaks like an experienced audit product team. Copy is calm, direct, precise, and factual. It explains the review state and the next action without promotional language.

## Punctuation

- Use full stops and commas for normal prose.
- Do not use em dashes or en dashes in visible product copy or principal public documents.
- Use a colon only when it introduces a value or a short explanation.
- Use semicolons only where they prevent ambiguity in a required technical limitation.
- Keep arrows for genuine sequences and before/after comparisons. Do not add arrows to routine button labels.
- Keep mathematical symbols, command flags, file names, hashes, and machine identifiers unchanged.

## Capitalization

- Use sentence case for headings, buttons, notices, and errors.
- Reserve uppercase text for compact ledger references and established statuses.
- Keep schema identifiers and status enums in their defined machine-readable form.

## Core terminology

| English | French |
| --- | --- |
| Review | Revue |
| Control | Contrôle |
| Evidence | Preuve |
| Automated result | Conclusion automatisée |
| Reviewer decision | Décision du réviseur |
| Recorded decision | Décision consignée |
| Review fingerprint | Empreinte de revue |
| Receipt integrity | Intégrité du reçu |
| Source document | Document source |
| Exact excerpt | Extrait exact |
| Re-run checks | Relancer les contrôles |
| Requires review | Revue requise |

`controlId`, `displayReference`, schema versions, and exported field names remain in English because they are technical contracts.

## Buttons

Use a specific verb and object: `Run review`, `Open decision`, `Verify receipt integrity`, or `Export receipt JSON`. Avoid `Continue`, `Proceed`, `Explore`, `Learn more`, and vague calls to action.

## Status language

Always pair color or a glyph with a textual status. A failed control is a review conclusion, not an application failure. Missing evidence is an explicit absence, not a system error. `Pending` describes an unresolved reviewer decision.

## Errors

State what happened and what the user can do next. Do not expose stack traces or provider payloads. Avoid dramatic wording and generic reassurance.

## French writing

- Write natural professional French instead of translating English structure literally.
- Use `contrôle`, `preuve`, `conclusion automatisée`, and `décision du réviseur` consistently.
- Keep French spacing before colons and semicolons.
- Prefer specific finite verbs on buttons.
- Do not translate schema identifiers, control IDs, file formats, or exact source excerpts.

## Expressions to avoid

Avoid generic claims such as `AI-powered`, `leverage`, `unlock`, `seamless`, `robust`, `cutting-edge`, `intelligent platform`, `at a glance`, `actionable insights`, and `built for trust`. Avoid rhetorical formulas such as `not just X, but Y`.

## Acceptable technical language

Use GPT-5.6, TypeScript, Zod, SHA-256, Review Fingerprint, Receipt Integrity, canonicalization, and exact-excerpt validation when the detail helps the reader complete or verify a task. Keep those terms out of the first-screen explanation unless they are necessary.

## Before and after examples

| Before | After |
| --- | --- |
| Every result traced. Every decision defensible. | Review the Northstar vendor change. |
| The case at a glance | Review results |
| Automation concludes. You decide. | Record the reviewer decision. |
| Same review, same fingerprint | Re-run the checks. |
| Turn policies into controls with evidence behind every conclusion. | Compare written policy with case documents and inspect the exact evidence behind each conclusion. |
