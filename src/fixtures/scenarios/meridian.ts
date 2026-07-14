import { validateScenario } from "@/src/domain/scenario-schema";
import { demoControls, demoPolicy } from "@/src/fixtures/demo-case";

export const meridianScenario = validateScenario({
  id: "meridian-clean-procurement",
  caseName: { en: "Meridian Office Services — Clean Procurement Case", fr: "Meridian Office Services — Dossier d’achat conforme" },
  caseDescription: { en: "A below-threshold purchase with matching records, independent approval, and complete delivery evidence.", fr: "Un achat sous le seuil avec des documents concordants, une approbation indépendante et une preuve de livraison complète." },
  purpose: { en: "Demonstrates that the shared engine can produce a fully supported compliant profile.", fr: "Démontre que le moteur partagé peut produire un profil conforme entièrement étayé." },
  profile: "MOSTLY_COMPLIANT",
  caseReference: "CASE-MERIDIAN-2026-08",
  policyReference: "POL-2026-004",
  policy: demoPolicy,
  controls: demoControls,
  documents: [
    { id: "MER-PO-218", title: "Purchase Order MO-218", type: "PURCHASE_ORDER", content: "Supplier: Meridian Office Services Ltd.\nPurchase order amount: 8,750 EUR.\nPurchase order date: 2026-08-10.", facts: [
      { id: "MER-SUPPLIER", key: "supplierName", value: "Meridian Office Services Ltd.", sourceLocator: "Supplier field", excerpt: "Supplier: Meridian Office Services Ltd." },
      { id: "MER-PO-AMOUNT", key: "purchaseOrderAmount", value: 8750, sourceLocator: "Amount field", excerpt: "Purchase order amount: 8,750 EUR." },
      { id: "MER-PO-CURRENCY", key: "purchaseOrderCurrency", value: "EUR", sourceLocator: "Amount field", excerpt: "Purchase order amount: 8,750 EUR." },
      { id: "MER-PO-DATE", key: "purchaseOrderDate", value: "2026-08-10", sourceLocator: "Order date field", excerpt: "Purchase order date: 2026-08-10." },
    ] },
    { id: "MER-INV-506", title: "Invoice MI-506", type: "INVOICE", content: "Supplier: Meridian Office Services Ltd.\nInvoice amount: 8,750 EUR.\nInvoice date: 2026-08-12.", facts: [
      { id: "MER-INV-AMOUNT", key: "invoiceAmount", value: 8750, sourceLocator: "Invoice total", excerpt: "Invoice amount: 8,750 EUR." },
      { id: "MER-INV-CURRENCY", key: "invoiceCurrency", value: "EUR", sourceLocator: "Invoice total", excerpt: "Invoice amount: 8,750 EUR." },
      { id: "MER-INV-DATE", key: "invoiceDate", value: "2026-08-12", sourceLocator: "Invoice date field", excerpt: "Invoice date: 2026-08-12." },
    ] },
    { id: "MER-DEL-218", title: "Delivery Note MD-218", type: "DELIVERY_NOTE", content: "Delivery note exists.\nDelivery date: 2026-08-11.", facts: [
      { id: "MER-DEL-EXISTS", key: "deliveryEvidenceExists", value: true, sourceLocator: "Delivery record", excerpt: "Delivery note exists." },
      { id: "MER-DEL-DATE", key: "deliveryDate", value: "2026-08-11", sourceLocator: "Delivery date field", excerpt: "Delivery date: 2026-08-11." },
    ] },
    { id: "MER-WF-218", title: "Approval Workflow MW-218", type: "WORKFLOW", content: "Initiator: Liam Chen.\nApprovers recorded: Sofia Bernard.\nApprover count: 1.", facts: [
      { id: "MER-INITIATOR", key: "initiator", value: "Liam Chen", sourceLocator: "Workflow initiator", excerpt: "Initiator: Liam Chen." },
      { id: "MER-APPROVERS", key: "approvers", value: ["Sofia Bernard"], sourceLocator: "Workflow approvers", excerpt: "Approvers recorded: Sofia Bernard." },
    ] },
    { id: "MER-VC-218", title: "Vendor Status Record MV-218", type: "VENDOR_CHANGE", content: "Supplier bank details were not changed.\nIndependent bank verification was not required.", facts: [
      { id: "MER-BANK-CHANGED", key: "bankDetailsChanged", value: false, sourceLocator: "Vendor status", excerpt: "Supplier bank details were not changed." },
      { id: "MER-BANK-VERIFICATION", key: "independentBankVerificationExists", value: false, sourceLocator: "Verification status", excerpt: "Independent bank verification was not required." },
    ] },
  ],
  expectedOutcomes: [
    { controlId: "CTRL-APPROVAL", status: "PASS" }, { controlId: "CTRL-TIMING", status: "PASS" },
    { controlId: "CTRL-AMOUNT", status: "PASS" }, { controlId: "CTRL-CURRENCY", status: "PASS" },
    { controlId: "CTRL-DELIVERY", status: "PASS" }, { controlId: "CTRL-BANK", status: "PASS" },
    { controlId: "CTRL-SOD", status: "PASS" },
  ],
  expectedOutcomeCounts: { PASS: 7, FAIL: 0, MISSING: 0, WARNING: 0, total: 7 },
  evidenceRelationships: [
    { controlId: "CTRL-APPROVAL", documentIds: ["MER-PO-218"], relationship: "SUPPORTING" },
    { controlId: "CTRL-TIMING", documentIds: ["MER-PO-218", "MER-INV-506"], relationship: "SUPPORTING" },
    { controlId: "CTRL-AMOUNT", documentIds: ["MER-PO-218", "MER-INV-506"], relationship: "SUPPORTING" },
    { controlId: "CTRL-CURRENCY", documentIds: ["MER-PO-218", "MER-INV-506"], relationship: "SUPPORTING" },
    { controlId: "CTRL-DELIVERY", documentIds: ["MER-DEL-218"], relationship: "SUPPORTING" },
    { controlId: "CTRL-BANK", documentIds: ["MER-VC-218"], relationship: "SUPPORTING" },
    { controlId: "CTRL-SOD", documentIds: ["MER-WF-218"], relationship: "SUPPORTING" },
  ],
  thresholdParameters: { defaultAmount: 10_000, comparisonAmount: null, currency: "EUR" },
  guidedDemo: { defaultSelectedControlId: "CTRL-AMOUNT", highlights: [
    { id: "clean-profile", controlId: null, copy: { en: "Confirm that all seven controls are evidence-backed passes.", fr: "Confirmer que les sept contrôles sont conformes et étayés." } },
    { id: "matching-records", controlId: "CTRL-AMOUNT", copy: { en: "Inspect the matching EUR 8,750 records.", fr: "Examiner les documents concordants à 8 750 EUR." } },
  ] },
  assumptions: {
    demonstrates: [{ en: "A complete, below-threshold procurement file.", fr: "Un dossier d’achat complet sous le seuil." }],
    simplifications: [{ en: "No bank change means independent verification is not required.", fr: "Sans changement bancaire, la vérification indépendante n’est pas requise." }],
    intentionallyMissing: [],
    expectedDetection: [{ en: "Seven evidence-backed PASS results.", fr: "Sept résultats CONFORME étayés par des preuves." }],
  },
  limitations: [{ en: "Meridian is validated deterministically and with mocks, not by a live GPT-5.6 request.", fr: "Meridian est validé de façon déterministe et par mocks, pas par une requête GPT-5.6 réelle." }],
  provenance: { fixtureType: "DETERMINISTIC_FIXTURE", fictional: true, containsRealOrganizationData: false },
});
