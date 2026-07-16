# Security policy

## Supported release status

PolicyProof is a Build Week prototype under active release preparation. Security fixes apply to the current release branch. There is no long-term support promise, hosted security service, or production service-level agreement.

## Reporting a vulnerability

After publication, use GitHub private vulnerability reporting when it is available for the repository. Do not place API keys, credentials, personal data, confidential documents, or exploit payloads containing secrets in a public issue. Until a private reporting channel is configured, describe only the non-sensitive impact in a public issue and ask the repository owner to establish a private channel.

## Data and provider boundary

- All bundled policies, documents, people, suppliers, and cases are fictional.
- Deterministic Demo and repository verification require no API key and no live provider request.
- Optional GPT-5.6 features use a server-only key after an explicit user action. Local source documents must remain fictional.
- Northstar has separately documented historical live GPT-5.6 validation. Meridian and Atlas are deterministic and mocked; the release checks do not rerun the historical provider call.

## Threat-model summary

PolicyProof validates structured inputs, supported control identifiers, document references, exact excerpts, receipt structures, and deterministic results. It treats policy and document text as untrusted data. The repository tests specific malformed-input and hostile-content boundaries, but it is not a universal security proof, compliance certification, legal-review system, or substitute for production threat modelling.

The integrity check confirms that the receipt content matches its recorded hash. Because the hash is not digitally signed, it does not establish origin, identity, authorship, authenticity or trusted time.

The tested prompt-injection case demonstrates that hostile instructions remain inert document data within the local structured evaluation boundary. It does not establish universal model-level prompt-injection resistance.

The evaluation harness blocks the network APIs used by the application and recorded zero attempted external calls during the verified workflow.

That network statement is scoped to the guarded evaluation workflow and the application network primitives it intercepts. It is not a claim that every possible platform-level network primitive is mathematically impossible.

## Known security limitations

- Someone who can replace both receipt content and its unkeyed hash can create a new internally consistent pair.
- Receipt integrity is not a legal signature, trusted timestamp, or identity check.
- Exact-excerpt validation proves that a cited string exists in a controlled source; it does not prove the source document is authentic.
- Browser state and the in-memory audit trail are not durable secure storage.
- The prototype supports text-based controlled inputs only; it does not parse PDF files, perform OCR, or inspect file provenance.
- Automated tests do not replace a production penetration test, dependency monitoring, accessibility review, or incident-response process.
