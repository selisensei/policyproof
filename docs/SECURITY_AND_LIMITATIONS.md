# Security and Limitations

## Security boundaries

- OpenAI access is server-only; the browser never receives the API key.
- Deterministic mode makes no OpenAI request.
- API request and response shapes are validated with Zod.
- Exact evidence excerpts must occur verbatim in their fictional source documents.
- Provider errors are categorized and correlated without returning detailed provider payloads.
- `.env.local`, dependencies, builds, test results, reports, and coverage are ignored by Git.
- Local uploads are restricted to fictional TXT, MD, and JSON files with count, size, filename, MIME, encoding, binary, line-length, duplicate, and JSON checks.
- React renders document content as escaped text.
- Basic browser headers restrict MIME sniffing, framing, referrer leakage, camera, microphone, and geolocation.
- Production dependency build scripts are allowlisted narrowly.

## Local storage

The prototype stores one versioned current/previous run pair in localStorage. It contains only timestamp, threshold, counts, and control statuses. It does not contain policy text, document contents, evidence excerpts, reviewer comments, provider responses, or credentials. Corrupt or blocked storage is ignored safely. This is convenience state, not an audit database.

## Model safeguards

GPT-5.6 proposes controls and extracts structured facts. It does not calculate final supported checks, approve a payment, issue a legal opinion, or certify compliance. Human control approval and final review remain mandatory. One controlled fictional Northstar run passed; this does not establish general model accuracy.

## Known limitations

- One fictional procurement/vendor-change case only.
- Seven supported deterministic control types only.
- Text documents only; no PDF, OCR, tables, images, or email ingestion.
- No authentication, authorization, multi-tenancy, collaboration, database, retention policy, or durable audit log.
- Browser review state is temporary except the minimal run comparison.
- No real customer, confidential, or regulated data has been tested.
- No production threat model, penetration test, legal review, or compliance validation has been completed.
- Automated accessibility checks do not replace a manual screen-reader review.
- A strict Content Security Policy remains a deployment-stage verification item.
- There is no deployed URL yet.

## Production requirements not represented by this prototype

A production system would require secure identity, role-based authorization, tenant isolation, encrypted durable storage, retention and deletion controls, privacy review, organization-specific policy governance, model evaluations, monitoring, incident response, document-ingestion hardening, audit logging, and legal/compliance approval.

## Reporting a problem

During the hackathon, record reproducible issues in the primary Codex task and include the mode, workflow step, fictional input, visible safe error category, and correlation/reference ID when available. Never include an API key or confidential document.

## Competition-hardening boundaries

- All three scenario fixtures are fictional and explicitly declare that they contain no real organization data.
- Northstar has one sanitized real GPT-5.6 validation; Meridian and Atlas were not sent to the provider.
- Scenario expectations validate fixtures in tests but are not a source for displayed results.
- Scenario comparison and the audit trail are current-session state, not durable records or compliance logs.
- Audit events contain timestamps, action types, scenario/control identifiers, and short safe descriptions only.
- JSON receipts may include the safe audit trail. CSV includes only structured review and exact fictional evidence fields.
- Judge Mode is guidance only and cannot perform user actions or invoke GPT-5.6.

The prototype remains limited to one policy domain, three controlled profiles, seven supported control types, and text documents. It does not establish cross-industry generalization, complete model accuracy, or WCAG conformance. Manual screen-reader and production-host security checks remain required.
