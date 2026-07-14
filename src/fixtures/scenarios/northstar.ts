import { validateScenario } from "@/src/domain/scenario-schema";
import { demoControls, demoDocuments, demoPolicy } from "@/src/fixtures/demo-case";

export const northstarScenario = validateScenario({
  id: "northstar-mixed-risk",
  caseName: {
    en: "Northstar Facilities — Mixed-Risk Case",
    fr: "Northstar Facilities — Dossier à risques mixtes",
  },
  caseDescription: {
    en: "A vendor-change review with approval, currency, bank-verification, and segregation exceptions.",
    fr: "Une revue de changement fournisseur avec des exceptions d’approbation, de devise, de vérification bancaire et de séparation des tâches.",
  },
  purpose: {
    en: "Demonstrates all four PolicyProof outcomes and a threshold-sensitive approval rule.",
    fr: "Démontre les quatre résultats PolicyProof et une règle d’approbation sensible au seuil.",
  },
  profile: "MIXED_RISK",
  caseReference: "CASE-NORTHSTAR-2026-07",
  policyReference: "POL-2026-004",
  policy: demoPolicy,
  controls: demoControls,
  documents: demoDocuments,
  expectedOutcomes: [
    { controlId: "CTRL-APPROVAL", status: "FAIL" },
    { controlId: "CTRL-TIMING", status: "PASS" },
    { controlId: "CTRL-AMOUNT", status: "PASS" },
    { controlId: "CTRL-CURRENCY", status: "FAIL" },
    { controlId: "CTRL-DELIVERY", status: "PASS" },
    { controlId: "CTRL-BANK", status: "MISSING" },
    { controlId: "CTRL-SOD", status: "WARNING" },
  ],
  expectedOutcomeCounts: { PASS: 3, FAIL: 2, MISSING: 1, WARNING: 1, total: 7 },
  evidenceRelationships: [
    { controlId: "CTRL-APPROVAL", documentIds: ["DOC-PO-1042", "DOC-WF-209"], relationship: "CONTRADICTORY" },
    { controlId: "CTRL-TIMING", documentIds: ["DOC-PO-1042", "DOC-INV-8821"], relationship: "SUPPORTING" },
    { controlId: "CTRL-AMOUNT", documentIds: ["DOC-PO-1042", "DOC-INV-8821"], relationship: "SUPPORTING" },
    { controlId: "CTRL-CURRENCY", documentIds: ["DOC-PO-1042", "DOC-INV-8821"], relationship: "CONTRADICTORY" },
    { controlId: "CTRL-DELIVERY", documentIds: ["DOC-DEL-447"], relationship: "SUPPORTING" },
    { controlId: "CTRL-BANK", documentIds: ["DOC-VC-031"], relationship: "MISSING" },
    { controlId: "CTRL-SOD", documentIds: ["DOC-WF-209"], relationship: "CONTRADICTORY" },
  ],
  thresholdParameters: { defaultAmount: 10_000, comparisonAmount: 15_000, currency: "EUR" },
  guidedDemo: {
    defaultSelectedControlId: "CTRL-APPROVAL",
    highlights: [
      { id: "outcomes", controlId: null, copy: { en: "Inspect the mixed 3/2/1/1 outcome profile.", fr: "Examiner le profil mixte 3/2/1/1." } },
      { id: "currency", controlId: "CTRL-CURRENCY", copy: { en: "Compare the exact EUR and USD excerpts.", fr: "Comparer les extraits exacts en EUR et USD." } },
      { id: "threshold", controlId: "CTRL-APPROVAL", copy: { en: "Raise the threshold to EUR 15,000 and compare runs.", fr: "Porter le seuil à 15 000 EUR et comparer les exécutions." } },
    ],
  },
  assumptions: {
    demonstrates: [
      { en: "A mixed procurement review with all four result statuses.", fr: "Une revue d’achat mixte avec les quatre statuts de résultat." },
      { en: "A deterministic threshold change with one affected control.", fr: "Un changement de seuil déterministe affectant un seul contrôle." },
    ],
    simplifications: [
      { en: "Each required fact is represented as structured text evidence.", fr: "Chaque fait requis est représenté comme preuve textuelle structurée." },
    ],
    intentionallyMissing: [
      { en: "Independent bank-verification evidence is intentionally absent.", fr: "La preuve de vérification bancaire indépendante est intentionnellement absente." },
    ],
    expectedDetection: [
      { en: "Currency mismatch, insufficient approval, missing bank verification, and segregation warning.", fr: "Écart de devise, approbation insuffisante, vérification bancaire manquante et alerte de séparation des tâches." },
    ],
  },
  limitations: [
    { en: "Northstar is the only scenario validated with one supervised live GPT-5.6 run.", fr: "Northstar est le seul scénario validé par une exécution GPT-5.6 réelle supervisée." },
    { en: "The documents are short controlled fixtures, not production records.", fr: "Les documents sont des fixtures contrôlées courtes, pas des dossiers de production." },
  ],
  provenance: { fixtureType: "DETERMINISTIC_FIXTURE", fictional: true, containsRealOrganizationData: false },
});
