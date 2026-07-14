import type { ReviewScenario } from "@/src/domain/scenario-schema";
import { northstarScenario } from "@/src/fixtures/scenarios/northstar";

export const reviewScenarios: readonly ReviewScenario[] = [northstarScenario];
export const defaultScenarioId = northstarScenario.id;

export { northstarScenario };
