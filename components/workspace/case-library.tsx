import type { ReviewScenario, ScenarioProfile } from "@/src/domain/scenario-schema";
import { useLocale } from "@/src/i18n/locale-context";

const profileCopy: Record<ScenarioProfile, { en: string; fr: string }> = {
  MIXED_RISK: { en: "Mixed-risk", fr: "Risques mixtes" },
  MOSTLY_COMPLIANT: { en: "Mostly compliant", fr: "Majoritairement conforme" },
  EVIDENCE_DEFICIENT: { en: "Evidence-deficient", fr: "Preuves insuffisantes" },
};

export function CaseLibrary({ scenarios, activeScenarioId, onSelect }: {
  scenarios: readonly ReviewScenario[];
  activeScenarioId: string;
  onSelect: (scenarioId: string) => void;
}) {
  const { locale } = useLocale();
  const active = scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0];

  return (
    <section className="case-library" aria-labelledby="case-library-title">
      <div className="case-library-heading">
        <div>
          <p className="eyebrow">{locale === "fr" ? "BIBLIOTHÈQUE DE CAS" : "CASE LIBRARY"}</p>
          <h2 id="case-library-title">{locale === "fr" ? "Choisir un dossier contrôlé" : "Choose a controlled case"}</h2>
        </div>
        <p>{locale === "fr" ? "Même politique · même moteur · profils de preuve distincts" : "Same policy · same engine · distinct evidence profiles"}</p>
      </div>
      <div className="case-library-register" role="list">
        {scenarios.map((scenario) => {
          const selected = scenario.id === activeScenarioId;
          return (
            <div key={scenario.id} role="listitem" className="case-library-item">
              <button
                type="button"
                aria-pressed={selected}
                className={selected ? "case-library-row is-selected" : "case-library-row"}
                onClick={() => onSelect(scenario.id)}
              >
                <span className="case-library-ref">{scenario.caseReference}</span>
                <span className="case-library-copy"><strong>{scenario.caseName[locale]}</strong><small>{scenario.caseDescription[locale]}</small></span>
                <span>{scenario.policy.title}<small>{scenario.policy.version}</small></span>
                <span>{scenario.documents.length}<small>{locale === "fr" ? "documents" : "documents"}</small></span>
                <span data-profile={scenario.profile}>{profileCopy[scenario.profile][locale]}</span>
                <span aria-hidden="true">{selected ? "✓" : "→"}</span>
              </button>
            </div>
          );
        })}
      </div>
      {active && (
        <div className="scenario-provenance">
          <div>
            <strong>{locale === "fr" ? "Pourquoi ce cas existe" : "Why this case exists"}</strong>
            <p>{active.purpose[locale]}</p>
          </div>
          <p>{locale === "fr" ? "Données fictives contrôlées" : "Fictional controlled data"} · {active.policy.version} · {active.documents.length} {locale === "fr" ? "documents" : "documents"} · {locale === "fr" ? "fixture déterministe" : "deterministic fixture"} · {locale === "fr" ? "aucune donnée d’organisation réelle" : "no real organization data"}</p>
          <details>
            <summary>{locale === "fr" ? "Hypothèses du scénario" : "Scenario assumptions"}</summary>
            <div className="scenario-assumptions">
              <div><strong>{locale === "fr" ? "Démontre" : "Demonstrates"}</strong><ul>{active.assumptions.demonstrates.map((item) => <li key={item.en}>{item[locale]}</li>)}</ul></div>
              <div><strong>{locale === "fr" ? "Simplifications" : "Simplifications"}</strong><ul>{active.assumptions.simplifications.map((item) => <li key={item.en}>{item[locale]}</li>)}</ul></div>
              <div><strong>{locale === "fr" ? "Manques intentionnels" : "Intentionally missing"}</strong>{active.assumptions.intentionallyMissing.length ? <ul>{active.assumptions.intentionallyMissing.map((item) => <li key={item.en}>{item[locale]}</li>)}</ul> : <p>{locale === "fr" ? "Aucun." : "None."}</p>}</div>
              <div><strong>{locale === "fr" ? "Détection attendue" : "Expected detection"}</strong><ul>{active.assumptions.expectedDetection.map((item) => <li key={item.en}>{item[locale]}</li>)}</ul></div>
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
