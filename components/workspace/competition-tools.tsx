import type { ReviewScenario } from "@/src/domain/scenario-schema";
import type { AuditEvent } from "@/src/lib/audit-trail";
import type { ResultSummary } from "@/src/lib/review-summary";
import { useLocale } from "@/src/i18n/locale-context";

export type CompletedScenarioReview = {
  scenarioId: string;
  summary: ResultSummary;
  unresolved: number;
  verifiedControls: number;
  controlCount: number;
};

const judgeSteps = [
  { en: "Select Northstar", fr: "Sélectionner Northstar" },
  { en: "Review policy-to-control chain", fr: "Examiner la chaîne politique-contrôles" },
  { en: "Run the review", fr: "Lancer la revue" },
  { en: "Read outcome composition", fr: "Lire la composition des résultats" },
  { en: "Inspect evidence coverage", fr: "Examiner la couverture des preuves" },
  { en: "Open Currency consistency", fr: "Ouvrir la cohérence des devises" },
  { en: "Verify exact EUR/USD excerpts", fr: "Vérifier les extraits EUR/USD exacts" },
  { en: "Record a human decision", fr: "Enregistrer une décision humaine" },
  { en: "Change the threshold", fr: "Modifier le seuil" },
  { en: "Review the run comparison", fr: "Examiner la comparaison des exécutions" },
  { en: "Open the receipt", fr: "Ouvrir le reçu" },
  { en: "Explain GPT-5.6 → TypeScript → Human", fr: "Expliquer GPT-5.6 → TypeScript → Humain" },
];

export function CompetitionTools({ judgeMode, judgeStep, completed, scenarios, auditTrail, onEnterJudgeMode, onExitJudgeMode, onJudgeStep, onSelectScenario, onClearAudit }: {
  judgeMode: boolean;
  judgeStep: number;
  completed: CompletedScenarioReview[];
  scenarios: readonly ReviewScenario[];
  auditTrail: AuditEvent[];
  onEnterJudgeMode: () => void;
  onExitJudgeMode: () => void;
  onJudgeStep: (step: number) => void;
  onSelectScenario: (scenarioId: string) => void;
  onClearAudit: () => void;
}) {
  const { locale } = useLocale();
  return <section className="competition-tools" aria-label={locale === "fr" ? "Outils de démonstration" : "Demonstration tools"}>
    <div className="competition-toolbar">
      {!judgeMode ? <button type="button" onClick={onEnterJudgeMode}>{locale === "fr" ? "Entrer en mode jury" : "Enter Judge Mode"}</button> : <button type="button" className="is-active" onClick={onExitJudgeMode}>{locale === "fr" ? "Quitter le mode jury" : "Exit Judge Mode"}</button>}
      <details><summary>{locale === "fr" ? "Comparer les cas exécutés" : "Compare completed cases"}</summary><ScenarioComparison completed={completed} scenarios={scenarios} onSelect={onSelectScenario} /></details>
      <details><summary>{locale === "fr" ? "Architecture" : "Architecture"}</summary><ArchitectureExplanation /></details>
      <details><summary>{locale === "fr" ? "Piste d’audit" : "Audit trail"} ({auditTrail.length})</summary><AuditTrail events={auditTrail} onClear={onClearAudit} /></details>
    </div>
    {judgeMode && <div className="judge-mode-panel" role="region" aria-label={locale === "fr" ? "Séquence du mode jury" : "Judge Mode sequence"}>
      <div><span>{locale === "fr" ? "MODE JURY" : "JUDGE MODE"} · {judgeStep + 1}/{judgeSteps.length}</span><strong>{judgeSteps[judgeStep][locale]}</strong><small>{locale === "fr" ? "Guide uniquement : aucune action ni décision n’est automatisée." : "Guidance only: no action or decision is automated."}</small></div>
      <nav aria-label={locale === "fr" ? "Progression du mode jury" : "Judge Mode progress"}>
        <button type="button" disabled={judgeStep === 0} onClick={() => onJudgeStep(judgeStep - 1)}>← {locale === "fr" ? "Précédent" : "Previous"}</button>
        <button type="button" disabled={judgeStep === judgeSteps.length - 1} onClick={() => onJudgeStep(judgeStep + 1)}>{locale === "fr" ? "Suivant" : "Next"} →</button>
      </nav>
    </div>}
  </section>;
}

function ScenarioComparison({ completed, scenarios, onSelect }: { completed: CompletedScenarioReview[]; scenarios: readonly ReviewScenario[]; onSelect: (id: string) => void }) {
  const { locale } = useLocale();
  if (!completed.length) return <p className="competition-empty">{locale === "fr" ? "Aucun scénario exécuté pendant cette session." : "No scenario has been run in this session."}</p>;
  return <div className="scenario-comparison" role="table" aria-label={locale === "fr" ? "Comparaison des scénarios exécutés" : "Completed scenario comparison"}>
    <div role="row"><span role="columnheader">{locale === "fr" ? "Cas" : "Case"}</span><span role="columnheader">PASS</span><span role="columnheader">FAIL</span><span role="columnheader">MISSING</span><span role="columnheader">WARNING</span><span role="columnheader">{locale === "fr" ? "Décisions ouvertes" : "Open decisions"}</span><span role="columnheader">{locale === "fr" ? "Sources exactes" : "Exact sources"}</span></div>
    {completed.map((item) => { const scenario = scenarios.find((candidate) => candidate.id === item.scenarioId); return scenario && <div role="row" className="scenario-comparison-row" key={item.scenarioId}><span role="cell"><button type="button" onClick={() => onSelect(item.scenarioId)}>{scenario.caseName[locale]}</button></span><span role="cell">{item.summary.PASS}</span><span role="cell">{item.summary.FAIL}</span><span role="cell">{item.summary.MISSING}</span><span role="cell">{item.summary.WARNING}</span><span role="cell">{item.unresolved}</span><span role="cell">{item.verifiedControls}/{item.controlCount}</span></div>; })}
    <p>{locale === "fr" ? "Résultats de la session actuelle — aucun score ni classement." : "Current-session results — no score or ranking."}</p>
  </div>;
}

function ArchitectureExplanation() {
  const { locale } = useLocale();
  return <div className="architecture-explanation" role="img" aria-label={locale === "fr" ? "GPT-5.6 interprète et extrait, TypeScript vérifie objectivement, l’humain prend la décision finale" : "GPT-5.6 interprets and extracts, TypeScript checks objective facts, and a human makes the final decision"}>
    <article><span>01</span><strong>GPT-5.6</strong><p>{locale === "fr" ? "Interprétation de la politique et extraction structurée des faits et preuves." : "Policy interpretation and structured fact and evidence extraction."}</p></article><i aria-hidden="true">→</i>
    <article><span>02</span><strong>TypeScript</strong><p>{locale === "fr" ? "Contrôles objectifs des dates, montants, devises, comptes et présences." : "Objective date, amount, currency, count, and presence checks."}</p></article><i aria-hidden="true">→</i>
    <article><span>03</span><strong>{locale === "fr" ? "Humain" : "Human"}</strong><p>{locale === "fr" ? "Confirmation, rejet ou dérogation acceptée avec justification." : "Confirmation, rejection, or accepted exception with rationale."}</p></article>
    <footer>{locale === "fr" ? "Validation des extraits exacts · repli déterministe · supervision humaine" : "Exact-excerpt validation · deterministic fallback · human oversight"}</footer>
  </div>;
}

function AuditTrail({ events, onClear }: { events: AuditEvent[]; onClear: () => void }) {
  const { locale } = useLocale();
  return <div className="audit-trail"><header><p>{locale === "fr" ? "Événements sûrs de cette session, sans contenu documentaire." : "Safe session events without document contents."}</p><button type="button" onClick={onClear} disabled={!events.length}>{locale === "fr" ? "Effacer" : "Clear"}</button></header>{events.length ? <ol>{[...events].reverse().map((event) => <li key={event.id}><time dateTime={event.timestamp}>{new Date(event.timestamp).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time><strong>{event.action.replaceAll("_", " ")}</strong><span>{event.controlId ?? event.scenarioId}</span><p>{event.description}</p></li>)}</ol> : <p className="competition-empty">{locale === "fr" ? "Aucun événement enregistré." : "No event recorded."}</p>}</div>;
}
