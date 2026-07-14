import { validateScenario } from "@/src/domain/scenario-schema";
import { demoControls, demoPolicy } from "@/src/fixtures/demo-case";

export const atlasScenario = validateScenario({
  id: "atlas-incomplete-evidence",
  caseName: { en: "Atlas Workplace Supply — Incomplete Evidence Case", fr: "Atlas Workplace Supply — Dossier de preuves incomplet" },
  caseDescription: { en: "An above-threshold purchase with insufficient approval and two required evidence gaps.", fr: "Un achat au-dessus du seuil avec approbation insuffisante et deux lacunes de preuve requise." },
  purpose: { en: "Demonstrates explicit missing evidence without fabricating a source or collapsing it into a failure.", fr: "Démontre les preuves manquantes explicites sans inventer de source ni les confondre avec un échec." },
  profile: "EVIDENCE_DEFICIENT",
  caseReference: "CASE-ATLAS-2026-09",
  policyReference: "POL-2026-004",
  policy: demoPolicy,
  controls: demoControls,
  documents: [
    { id: "ATL-PO-771", title: "Purchase Order AP-771", type: "PURCHASE_ORDER", content: "Supplier: Atlas Workplace Supply Ltd.\nPurchase order amount: 18,400 EUR.\nPurchase order date: 2026-09-01.", facts: [
      { id: "ATL-SUPPLIER", key: "supplierName", value: "Atlas Workplace Supply Ltd.", sourceLocator: "Supplier field", excerpt: "Supplier: Atlas Workplace Supply Ltd." },
      { id: "ATL-PO-AMOUNT", key: "purchaseOrderAmount", value: 18400, sourceLocator: "Amount field", excerpt: "Purchase order amount: 18,400 EUR." },
      { id: "ATL-PO-CURRENCY", key: "purchaseOrderCurrency", value: "EUR", sourceLocator: "Amount field", excerpt: "Purchase order amount: 18,400 EUR." },
      { id: "ATL-PO-DATE", key: "purchaseOrderDate", value: "2026-09-01", sourceLocator: "Order date field", excerpt: "Purchase order date: 2026-09-01." },
    ] },
    { id: "ATL-INV-771", title: "Invoice AI-771", type: "INVOICE", content: "Supplier: Atlas Workplace Supply Ltd.\nInvoice amount: 18,400 EUR.\nInvoice date: 2026-09-04.", facts: [
      { id: "ATL-INV-AMOUNT", key: "invoiceAmount", value: 18400, sourceLocator: "Invoice total", excerpt: "Invoice amount: 18,400 EUR." },
      { id: "ATL-INV-CURRENCY", key: "invoiceCurrency", value: "EUR", sourceLocator: "Invoice total", excerpt: "Invoice amount: 18,400 EUR." },
      { id: "ATL-INV-DATE", key: "invoiceDate", value: "2026-09-04", sourceLocator: "Invoice date field", excerpt: "Invoice date: 2026-09-04." },
    ] },
    { id: "ATL-DEL-771", title: "Delivery Evidence Checklist AD-771", type: "DELIVERY_NOTE", content: "No delivery note was provided with the case file.", facts: [
      { id: "ATL-DEL-EXISTS", key: "deliveryEvidenceExists", value: false, sourceLocator: "Delivery checklist", excerpt: "No delivery note was provided with the case file." },
    ] },
    { id: "ATL-WF-771", title: "Approval Workflow AW-771", type: "WORKFLOW", content: "Initiator: Noor Blake.\nApprovers recorded: Elise Martin.\nApprover count: 1.", facts: [
      { id: "ATL-INITIATOR", key: "initiator", value: "Noor Blake", sourceLocator: "Workflow initiator", excerpt: "Initiator: Noor Blake." },
      { id: "ATL-APPROVERS", key: "approvers", value: ["Elise Martin"], sourceLocator: "Workflow approvers", excerpt: "Approvers recorded: Elise Martin." },
    ] },
    { id: "ATL-VC-771", title: "Vendor Change Request AV-771", type: "VENDOR_CHANGE", content: "Supplier bank details were changed.\nNo independent bank-verification evidence was attached.", facts: [
      { id: "ATL-BANK-CHANGED", key: "bankDetailsChanged", value: true, sourceLocator: "Change summary", excerpt: "Supplier bank details were changed." },
      { id: "ATL-BANK-VERIFICATION", key: "independentBankVerificationExists", value: false, sourceLocator: "Attachment checklist", excerpt: "No independent bank-verification evidence was attached." },
    ] },
  ],
  expectedOutcomes: [
    { controlId: "CTRL-APPROVAL", status: "FAIL" }, { controlId: "CTRL-TIMING", status: "PASS" },
    { controlId: "CTRL-AMOUNT", status: "PASS" }, { controlId: "CTRL-CURRENCY", status: "PASS" },
    { controlId: "CTRL-DELIVERY", status: "MISSING" }, { controlId: "CTRL-BANK", status: "MISSING" },
    { controlId: "CTRL-SOD", status: "PASS" },
  ],
  expectedOutcomeCounts: { PASS: 4, FAIL: 1, MISSING: 2, WARNING: 0, total: 7 },
  evidenceRelationships: [
    { controlId: "CTRL-APPROVAL", documentIds: ["ATL-PO-771", "ATL-WF-771"], relationship: "CONTRADICTORY" },
    { controlId: "CTRL-TIMING", documentIds: ["ATL-PO-771", "ATL-INV-771"], relationship: "SUPPORTING" },
    { controlId: "CTRL-AMOUNT", documentIds: ["ATL-PO-771", "ATL-INV-771"], relationship: "SUPPORTING" },
    { controlId: "CTRL-CURRENCY", documentIds: ["ATL-PO-771", "ATL-INV-771"], relationship: "SUPPORTING" },
    { controlId: "CTRL-DELIVERY", documentIds: ["ATL-DEL-771"], relationship: "MISSING" },
    { controlId: "CTRL-BANK", documentIds: ["ATL-VC-771"], relationship: "MISSING" },
    { controlId: "CTRL-SOD", documentIds: ["ATL-WF-771"], relationship: "SUPPORTING" },
  ],
  thresholdParameters: { defaultAmount: 10_000, comparisonAmount: 20_000, currency: "EUR" },
  guidedDemo: { defaultSelectedControlId: "CTRL-BANK", highlights: [
    { id: "missing-delivery", controlId: "CTRL-DELIVERY", copy: { en: "Inspect the explicit delivery-evidence gap.", fr: "Examiner la lacune explicite de preuve de livraison." } },
    { id: "missing-bank", controlId: "CTRL-BANK", copy: { en: "Confirm that no bank-verification source is fabricated.", fr: "Confirmer qu’aucune source de vérification bancaire n’est inventée." } },
  ] },
  assumptions: {
    demonstrates: [{ en: "An incomplete above-threshold procurement file.", fr: "Un dossier d’achat incomplet au-dessus du seuil." }],
    simplifications: [{ en: "A checklist records that delivery evidence was not supplied.", fr: "Une liste de contrôle indique que la preuve de livraison n’a pas été fournie." }],
    intentionallyMissing: [
      { en: "The delivery note is intentionally absent.", fr: "Le bon de livraison est intentionnellement absent." },
      { en: "Independent verification after the bank change is intentionally absent.", fr: "La vérification indépendante après le changement bancaire est intentionnellement absente." },
    ],
    expectedDetection: [{ en: "One approval failure and two explicit missing-evidence results.", fr: "Un échec d’approbation et deux résultats de preuve manquante explicites." }],
  },
  limitations: [{ en: "Atlas is validated deterministically and with mocks, not by a live GPT-5.6 request.", fr: "Atlas est validé de façon déterministe et par mocks, pas par une requête GPT-5.6 réelle." }],
  provenance: { fixtureType: "DETERMINISTIC_FIXTURE", fictional: true, containsRealOrganizationData: false },
});
