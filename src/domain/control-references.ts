export const CONTROL_REFERENCE_REGISTRY = [
  { controlId: "CTRL-APPROVAL", displayReference: "CTRL-01" },
  { controlId: "CTRL-TIMING", displayReference: "CTRL-02" },
  { controlId: "CTRL-AMOUNT", displayReference: "CTRL-03" },
  { controlId: "CTRL-CURRENCY", displayReference: "CTRL-04" },
  { controlId: "CTRL-DELIVERY", displayReference: "CTRL-05" },
  { controlId: "CTRL-BANK", displayReference: "CTRL-06" },
  { controlId: "CTRL-SOD", displayReference: "CTRL-07" },
] as const;

export type RegisteredControlId = (typeof CONTROL_REFERENCE_REGISTRY)[number]["controlId"];
export type ControlReference = {
  controlId: string;
  displayReference: string;
  mapped: boolean;
};

const referenceById = new Map<string, string>(
  CONTROL_REFERENCE_REGISTRY.map(({ controlId, displayReference }) => [controlId, displayReference]),
);

export function resolveControlReference(controlId: string): ControlReference {
  const stableId = controlId.trim();
  if (!stableId) throw new TypeError("A non-empty stable control ID is required.");
  const displayReference = referenceById.get(stableId);
  return {
    controlId: stableId,
    displayReference: displayReference ?? stableId,
    mapped: Boolean(displayReference),
  };
}

export function requireRegisteredControlReference(controlId: string): ControlReference {
  const reference = resolveControlReference(controlId);
  if (!reference.mapped) throw new Error(`No registered display reference exists for control ${reference.controlId}.`);
  return reference;
}
