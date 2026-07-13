import {
  CaseDocumentSchema,
  ControlDefinitionSchema,
  PolicyDefinitionSchema,
} from "@/src/domain/schemas";
import { z } from "zod";

export const demoPolicy = PolicyDefinitionSchema.parse({
  id: "policy-procurement-2026",
  title: "Procurement and Vendor Change Policy",
  version: "Demo 1.0",
  text: `1. Two distinct approvers are required when the transaction amount exceeds EUR 10,000.
2. The purchase order must predate the invoice.
3. Purchase order and invoice amounts must match.
4. Purchase order and invoice currencies must match.
5. Delivery evidence must exist.
6. A bank-details change requires independent verification.
7. The initiator and approver must be different people.`,
  controlIds: [
    "CTRL-APPROVAL",
    "CTRL-TIMING",
    "CTRL-AMOUNT",
    "CTRL-CURRENCY",
    "CTRL-DELIVERY",
    "CTRL-BANK",
    "CTRL-SOD",
  ],
});

export const demoControls = z.array(ControlDefinitionSchema).parse([
  {
    id: "CTRL-APPROVAL",
    title: "Approval threshold",
    description: "Require two distinct approvers when the transaction exceeds the configured EUR threshold.",
    severity: "HIGH",
    enabled: true,
    kind: "APPROVAL_THRESHOLD",
    parameters: { thresholdAmount: 10_000, currency: "EUR", requiredApprovers: 2 },
  },
  {
    id: "CTRL-TIMING",
    title: "Purchase order timing",
    description: "Confirm that the purchase order predates the supplier invoice.",
    severity: "HIGH",
    enabled: true,
    kind: "PO_BEFORE_INVOICE",
    parameters: {},
  },
  {
    id: "CTRL-AMOUNT",
    title: "Amount match",
    description: "Compare purchase order and invoice amounts.",
    severity: "HIGH",
    enabled: true,
    kind: "AMOUNT_MATCH",
    parameters: {},
  },
  {
    id: "CTRL-CURRENCY",
    title: "Currency consistency",
    description: "Compare purchase order and invoice currencies.",
    severity: "HIGH",
    enabled: true,
    kind: "CURRENCY_MATCH",
    parameters: {},
  },
  {
    id: "CTRL-DELIVERY",
    title: "Delivery evidence",
    description: "Confirm that delivery evidence is present.",
    severity: "MEDIUM",
    enabled: true,
    kind: "DELIVERY_EVIDENCE",
    parameters: {},
  },
  {
    id: "CTRL-BANK",
    title: "Independent bank verification",
    description: "Require independent verification when supplier bank details change.",
    severity: "CRITICAL",
    enabled: true,
    kind: "BANK_CHANGE_VERIFICATION",
    parameters: {},
  },
  {
    id: "CTRL-SOD",
    title: "Segregation of duties",
    description: "Flag a workflow where the same person initiated and approved the transaction.",
    severity: "HIGH",
    enabled: true,
    kind: "SEGREGATION_OF_DUTIES",
    parameters: {},
  },
]);

export const demoDocuments = z.array(CaseDocumentSchema).parse([
  {
    id: "DOC-PO-1042",
    title: "Purchase Order PO-1042",
    type: "PURCHASE_ORDER",
    content:
      "Supplier: Northstar Facilities Ltd.\nPurchase order amount: 12,480 EUR.\nPurchase order date: 2026-07-03.",
    facts: [
      {
        id: "FACT-SUPPLIER",
        key: "supplierName",
        value: "Northstar Facilities Ltd.",
        sourceLocator: "Supplier field",
        excerpt: "Supplier: Northstar Facilities Ltd.",
      },
      {
        id: "FACT-PO-AMOUNT",
        key: "purchaseOrderAmount",
        value: 12_480,
        sourceLocator: "Amount field",
        excerpt: "Purchase order amount: 12,480 EUR.",
      },
      {
        id: "FACT-PO-CURRENCY",
        key: "purchaseOrderCurrency",
        value: "EUR",
        sourceLocator: "Amount field",
        excerpt: "Purchase order amount: 12,480 EUR.",
      },
      {
        id: "FACT-PO-DATE",
        key: "purchaseOrderDate",
        value: "2026-07-03",
        sourceLocator: "Order date field",
        excerpt: "Purchase order date: 2026-07-03.",
      },
    ],
  },
  {
    id: "DOC-INV-8821",
    title: "Invoice INV-8821",
    type: "INVOICE",
    content:
      "Supplier: Northstar Facilities Ltd.\nInvoice amount: 12,480 USD.\nInvoice date: 2026-07-05.",
    facts: [
      {
        id: "FACT-INVOICE-AMOUNT",
        key: "invoiceAmount",
        value: 12_480,
        sourceLocator: "Invoice total",
        excerpt: "Invoice amount: 12,480 USD.",
      },
      {
        id: "FACT-INVOICE-CURRENCY",
        key: "invoiceCurrency",
        value: "USD",
        sourceLocator: "Invoice total",
        excerpt: "Invoice amount: 12,480 USD.",
      },
      {
        id: "FACT-INVOICE-DATE",
        key: "invoiceDate",
        value: "2026-07-05",
        sourceLocator: "Invoice date field",
        excerpt: "Invoice date: 2026-07-05.",
      },
    ],
  },
  {
    id: "DOC-DEL-447",
    title: "Delivery Note DN-447",
    type: "DELIVERY_NOTE",
    content: "Delivery note exists.\nDelivery date: 2026-07-04.",
    facts: [
      {
        id: "FACT-DELIVERY-EXISTS",
        key: "deliveryEvidenceExists",
        value: true,
        sourceLocator: "Delivery record",
        excerpt: "Delivery note exists.",
      },
      {
        id: "FACT-DELIVERY-DATE",
        key: "deliveryDate",
        value: "2026-07-04",
        sourceLocator: "Delivery date field",
        excerpt: "Delivery date: 2026-07-04.",
      },
    ],
  },
  {
    id: "DOC-WF-209",
    title: "Approval Workflow WF-209",
    type: "WORKFLOW",
    content: "Initiator: Emma Reed.\nApprovers recorded: Emma Reed.\nApprover count: 1.",
    facts: [
      {
        id: "FACT-INITIATOR",
        key: "initiator",
        value: "Emma Reed",
        sourceLocator: "Workflow initiator",
        excerpt: "Initiator: Emma Reed.",
      },
      {
        id: "FACT-APPROVERS",
        key: "approvers",
        value: ["Emma Reed"],
        sourceLocator: "Workflow approvers",
        excerpt: "Approvers recorded: Emma Reed.",
      },
    ],
  },
  {
    id: "DOC-VC-031",
    title: "Vendor Change Request VC-031",
    type: "VENDOR_CHANGE",
    content:
      "Supplier bank details were changed.\nNo independent bank-verification evidence was attached.",
    facts: [
      {
        id: "FACT-BANK-CHANGED",
        key: "bankDetailsChanged",
        value: true,
        sourceLocator: "Change summary",
        excerpt: "Supplier bank details were changed.",
      },
      {
        id: "FACT-BANK-VERIFICATION",
        key: "independentBankVerificationExists",
        value: false,
        sourceLocator: "Attachment checklist",
        excerpt: "No independent bank-verification evidence was attached.",
      },
    ],
  },
]);
