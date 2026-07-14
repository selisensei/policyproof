import type { ReviewScenario } from "@/src/domain/scenario-schema";
import { atlasScenario } from "@/src/fixtures/scenarios/atlas";
import { meridianScenario } from "@/src/fixtures/scenarios/meridian";
import { northstarScenario } from "@/src/fixtures/scenarios/northstar";

export const reviewScenarios: readonly ReviewScenario[] = [northstarScenario, meridianScenario, atlasScenario];
export const defaultScenarioId = northstarScenario.id;

export { atlasScenario, meridianScenario, northstarScenario };
