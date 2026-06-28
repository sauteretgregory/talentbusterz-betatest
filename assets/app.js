/* TalentBusterZ V0.8.4 hotfix step 1 — GitHub-safe static prototype */
const TBZ_VERSION = "0.8.4-hotfix-step1-datagate";

const state = {
  raw: null,
  rawHash: null,
  previousRawHash: localStorage.getItem("tbz_previous_raw_hash") || null,
  cvSourceLoaded: false,
  offerText: "",
  activeOffer: null,
  activeEvidence: null,
  answers: [],
  score: null,
  scoreHistory: [],
  questionIndex: 0,
  generated: null
};

const $ = (id) => document.getElementById(id);

const sampleRaw = {
  raw_schema: {
    name: "TalentBusterZ RAW fictif GitHub-safe",
    version: "0.8.4-hotfix-step1-sample",
    mode: "local_static_demo",
    privacy: "fictional_sample_only"
  },
  candidate: {
    candidate_id: "profil_demo_anonyme",
    display_label: "Profil Démo",
    positioning: [
      "Chef de projet IT senior",
      "AMOA CRM/Data",
      "Data/BI",
      "Coordination métier/IT"
    ]
  },
  evidence_library: [
    {
      evidence_id: "demo_rcu_project",
      label: "Projet RCU fictif — CRM/Data omnicanal",
      context: "Référentiel client unique fictif dans un environnement de démonstration.",
      signals: ["CRM", "Data", "BI", "RGPD", "AMOA", "coordination"],
      numbers: {
        clients: "volume fictif",
        anonymized_clients: "volume fictif",
        users: "volume fictif",
        contributors: "périmètre fictif"
      },
      usage_status: "démonstration uniquement"
    }
  ],
  _tbz_trace: {
    sessions: []
  }
};

const demoOffer = `Entreprise Démo

Chef de Projet Data/BI Senior — Offre Démo

Contexte :
Entreprise de démonstration spécialisée dans les projets Data, BI et transformation digitale.

Mission :
Vous pilotez des projets AMOA BI : analyse des besoins utilisateurs, cahier des charges, spécifications fonctionnelles et techniques, suivi des risques, recette, support utilisateurs, coordination non hiérarchique, comités projet et accompagnement métiers.

Attendus :
Expérience AMOA Data/BI, coordination projet, qualité de données, outils CRM/BI, anglais professionnel, capacité à travailler avec des équipes métiers et techniques.`;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function escapeXml(value) {
  return String(value ?? "").replace(/[<>&'"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;"
  }[char]));
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function nowIso() {
  return new Date().toISOString();
}

function candidateLabel() {
  return state.raw?.candidate?.display_label || "Profil chargé depuis RAW local";
}

function computePermissions() {
  const hasRaw = Boolean(state.raw);
  const hasCvSource = Boolean(state.cvSourceLoaded);
  const hasJobOffer = Boolean(state.activeOffer || state.offerText.trim());

  return {
    hasRaw,
    hasCvSource,
    hasJobOffer,
    canAnalyze: hasRaw && hasJobOffer,
    canRunQuestionEngine: hasRaw && hasJobOffer,
    canGenerateWorkingDeliverables: hasRaw && hasJobOffer,
    canGenerateWorkingCv: hasRaw && hasJobOffer,
    canGenerateScoring: hasRaw && hasJobOffer,
    canGenerateStrengthsWeaknesses: hasRaw && hasJobOffer,
    canGenerateRtou: hasRaw && hasJobOffer,
    canGenerateUpdatedRaw: hasRaw && hasJobOffer,
    canGenerateSourceVerifiedPack: hasRaw && hasCvSource && hasJobOffer
  };
}

function setGateStatus() {
  const permissions = computePermissions();
  const rawStatus = $("rawStatus");
  const gateStatus = $("gateStatus");
  const exportsGate = $("exportsGate");

  if (state.raw) {
    rawStatus.className = "status success";
    rawStatus.innerHTML = `<strong>RAW local chargé.</strong><br>Hash : <code>${escapeHtml((state.rawHash || "").slice(0, 12))}</code>`;

    gateStatus.className = "status success";
    gateStatus.innerHTML = `
      <strong>RAW local chargé : mémoire TalentBusterZ active.</strong><br>
      Analyse, enrichissement, CV de travail, note/scoring, points forts, axes d’amélioration, RTOU et RAW actualisé sont autorisés.<br>
      Le CV source n’est pas chargé : seul le pack final source-vérifié reste indisponible.
    `;

    exportsGate.className = "status success";
    exportsGate.innerHTML = `
      <strong>RAW seul : livrables de travail autorisés.</strong><br>
      Vous pouvez générer un CV Word de travail, une note/scoring, les points forts, les axes d’amélioration, le RTOU et le RAW actualisé.<br>
      Le pack final source-vérifié nécessite CV source + RAW.
    `;
  } else {
    rawStatus.className = "status neutral";
    rawStatus.textContent = "Aucun RAW chargé.";

    gateStatus.className = "status warning";
    gateStatus.textContent = "Chargez un RAW ou initialisez une mémoire locale fictive.";

    exportsGate.className = "status warning";
    exportsGate.textContent = "Chargez un RAW et analysez une offre pour générer les livrables de travail.";
  }

  $("generateBtn").disabled = !permissions.canGenerateWorkingDeliverables;
  $("downloadSourcePackBtn").disabled = !permissions.canGenerateSourceVerifiedPack;
}

async function loadRawObject(rawObject) {
  state.raw = rawObject;

  if (!state.raw._tbz_trace) {
    state.raw._tbz_trace = { sessions: [] };
  }
  if (!Array.isArray(state.raw._tbz_trace.sessions)) {
    state.raw._tbz_trace.sessions = [];
  }

  state.rawHash = await sha256(JSON.stringify(state.raw));

  if (state.previousRawHash && state.previousRawHash === state.rawHash) {
    $("rawStatus").className = "status neutral";
    $("rawStatus").innerHTML = `<strong>RAW déjà chargé — aucune nouvelle donnée détectée.</strong><br>Continuation de la session locale.`;
  } else {
    localStorage.setItem("tbz_previous_raw_hash", state.rawHash);
    state.previousRawHash = state.rawHash;
  }

  setGateStatus();
}

function detectOffer(text) {
  const lower = text.toLowerCase();
  const isDataBiOffer = lower.includes("data") || lower.includes("bi") || lower.includes("business intelligence");

  return {
    title: isDataBiOffer ? "Entreprise Démo — Chef de Projet Data/BI Senior — Offre Démo" : "Offre collée",
    family: isDataBiOffer ? "AMOA Data/BI — offre démo" : "Matching générique",
    signals: isDataBiOffer
      ? ["AMOA", "Data/BI", "cahier des charges", "spécifications", "recette", "coordination", "support utilisateurs", "anglais"]
      : ["analyse offre", "matching", "preuves à clarifier"]
  };
}

function pickEvidence() {
  const evidenceList = state.raw?.evidence_library || [];
  return evidenceList[0] || {
    evidence_id: "evidence_manual",
    label: "Preuve principale à clarifier",
    context: "Preuve issue du RAW ou de la réponse utilisateur.",
    signals: []
  };
}

$("rawFile").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    await loadRawObject(JSON.parse(text));
  } catch (error) {
    $("rawStatus").className = "status danger";
    $("rawStatus").textContent = "RAW invalide : " + error.message;
  }
});

$("cvFile").addEventListener("change", (event) => {
  state.cvSourceLoaded = Boolean(event.target.files?.[0]);
  setGateStatus();
});

$("initRawBtn").addEventListener("click", async () => {
  await loadRawObject(JSON.parse(JSON.stringify(sampleRaw)));
});

$("demoOfferBtn").addEventListener("click", () => {
  $("offerText").value = demoOffer;
});

$("analyzeBtn").addEventListener("click", () => {
  state.offerText = $("offerText").value.trim();

  if (!state.offerText) {
    $("analysisOutput").innerHTML = `<div class="status warning">Collez une offre avant l’analyse.</div>`;
    return;
  }

  state.activeOffer = detectOffer(state.offerText);
  state.activeEvidence = pickEvidence();

  const hasRaw = Boolean(state.raw);
  state.score = hasRaw ? 89 : 62;
  state.scoreHistory = [{
    at: nowIso(),
    from: null,
    to: state.score,
    delta: null,
    reason: hasRaw ? "Analyse depuis RAW local chargé." : "Analyse démo limitée sans RAW."
  }];

  $("analysisOutput").innerHTML = `
    <h3>${escapeHtml(state.activeOffer.title)}</h3>
    <div class="score">${state.score}</div>
    <p><strong>Lecture TalentBusterZ :</strong> ${escapeHtml(state.activeOffer.family)}</p>
    <p>Score prudent : les livrables de travail sont autorisés en RAW seul ; le pack final source-vérifié reste réservé au mode CV source + RAW.</p>
    <p><strong>Compétences / preuves à remonter :</strong></p>
    <div>${state.activeOffer.signals.map((signal) => `<span class="pill">${escapeHtml(signal)}</span>`).join("")}</div>
    <div class="${hasRaw ? "status success" : "status warning"}">
      ${hasRaw ? "RAW chargé : Question Engine actif et livrables de travail disponibles." : "Aucun RAW chargé : initialisez ou chargez un RAW pour activer la continuité."}
    </div>
  `;

  state.answers = [];
  state.questionIndex = 0;
  state.generated = null;
  renderQuestion();
  setGateStatus();
});

const questions = [
  {
    title: "Question 1/4 — Preuve principale",
    objective: "Choisir la preuve la plus pertinente pour l’offre.",
    prompt: "Pour cette offre Data/BI, quelle preuve voulez-vous mettre en avant en priorité ? Donnez le contexte, votre rôle personnel, les outils et un résultat observable.",
    maxGain: 3,
    appreciated: ["choix d’une preuve ciblée", "lien avec Data/BI", "résultat observable"],
    missing: ["rôle personnel exact", "outils", "mesure d’impact"]
  },
  {
    title: "Question 2/4 — Rôle personnel",
    objective: "Clarifier ce qui a réellement été fait.",
    prompt: "Sur cette preuve, quel a été votre rôle personnel exact : cadrage, AMOA, pilotage, coordination, recette, budget, formation ? Indiquez ce que vous assumez et ce que vous ne voulez pas sur-vendre.",
    maxGain: 2,
    appreciated: ["frontière claire entre rôle assumé et non assumé", "AMOA / coordination / recette"],
    missing: ["budget direct ou non", "management direct ou non"]
  },
  {
    title: "Question 3/4 — Chiffres assumables",
    objective: "Ajouter des ordres de grandeur sans sur-vente.",
    prompt: "Quels chiffres pouvez-vous assumer : volume de données, utilisateurs, équipe, planning, indicateurs ou gains qualité ? Précisez s’il s’agit de mesures officielles ou d’ordres de grandeur.",
    maxGain: 2,
    appreciated: ["volumes", "utilisateurs", "équipe", "gains qualité"],
    missing: ["KPI officiellement mesurés", "ROI ou gains financiers si non documentés"]
  },
  {
    title: "Question 4/4 — Audit final avant CV",
    objective: "Préparer le point de vigilance pour le CV et l’entretien.",
    prompt: "Pour finaliser le CV de travail, quel point doit être formulé avec prudence : BI/Data Viz hands-on, budget, cabinet conseil, anglais, management non hiérarchique ? Dites ce que vous assumez, ce que vous ne voulez pas sur-vendre et la formulation prudente à utiliser.",
    maxGain: 2,
    appreciated: ["risques identifiés", "formulation prudente", "préparation entretien"],
    missing: ["niveau exact sur outils BI/Data Viz", "responsabilité budgétaire complète", "anglais en contexte projet"]
  }
];

function summarizeAnswer(answer) {
  const lower = answer.toLowerCase();
  const signals = [];

  if (lower.includes("amoa")) signals.push("AMOA");
  if (lower.includes("coord")) signals.push("coordination transverse");
  if (lower.includes("recette") || lower.includes("test")) signals.push("recette / tests");
  if (lower.includes("data") || lower.includes("bi")) signals.push("Data/BI");
  if (lower.includes("budget")) signals.push("budget cadré");
  if (lower.includes("sans sur-vendre") || lower.includes("ne revendique pas")) signals.push("prudence anti-survente");

  return signals.length ? signals : ["réponse exploitable à clarifier"];
}

function computeGain(question, answer) {
  const length = answer.trim().length;
  let gain = 0;

  if (length > 40) gain += 1;
  if (length > 180) gain += 1;
  if (/(contexte|rôle|résultat|outil|utilisateur|coord|amoa|recette|budget|anglais|formation|rgpd|client|data|bi)/i.test(answer)) {
    gain += 1;
  }

  return Math.min(question.maxGain, gain);
}

function renderQuestion(lastFeedback = "") {
  const box = $("questionEngine");

  if (!state.raw || !state.activeOffer) {
    box.innerHTML = `<p>Chargez un RAW et analysez une offre pour activer l’entretien.</p>`;
    return;
  }

  if (state.questionIndex >= questions.length) {
    box.innerHTML = `
      ${lastFeedback}
      <div class="status success">
        <strong>Entretien terminé.</strong><br>
        Vous pouvez générer les livrables de travail. Le CV source reste optionnel pour ces livrables.
      </div>
    `;
    setGateStatus();
    return;
  }

  const question = questions[state.questionIndex];
  const evidenceLabel = state.activeEvidence?.label || "preuve active";

  box.innerHTML = `
    ${lastFeedback}
    <div class="question-title">${escapeHtml(question.title)}</div>
    <p><strong>Offre active :</strong> ${escapeHtml(state.activeOffer.title)}</p>
    <p><strong>Preuve active :</strong> ${escapeHtml(evidenceLabel)}</p>
    <p><strong>Objectif :</strong> ${escapeHtml(question.objective)}</p>
    <div class="notice neutral">
      TBZ doit dialoguer comme en entretien. Si la question est trop vague ou si le score est discutable, indiquez-le : ce commentaire sera tracé dans le RAW.
    </div>
    <p>${escapeHtml(question.prompt)}</p>

    <label>Votre réponse</label>
    <textarea id="answerText" rows="7"></textarea>

    <label>Commentaire sur la question ou la lecture TBZ <small>optionnel</small></label>
    <textarea id="questionComment" rows="3" placeholder="Ex : question trop vague, contexte manquant, score discutable..."></textarea>

    <button id="submitAnswerBtn">Enregistrer la réponse et passer à la question suivante</button>
  `;

  $("submitAnswerBtn").addEventListener("click", submitAnswer);
}

function submitAnswer() {
  const answer = $("answerText").value.trim();
  const comment = $("questionComment").value.trim();
  if (!answer) return;

  const question = questions[state.questionIndex];
  const before = state.score;
  const gain = computeGain(question, answer);
  const after = Math.min(100, before + gain);
  const understood = summarizeAnswer(answer);

  const record = {
    interaction_type: "question_answer",
    question_index: state.questionIndex + 1,
    question_title: question.title,
    active_offer: state.activeOffer,
    active_evidence: state.activeEvidence,
    question_prompt: question.prompt,
    user_answer_raw: answer,
    user_comment_on_question: comment || null,
    assistant_interpretation: {
      understood,
      appreciated_signals: question.appreciated,
      missing_for_max_score: question.missing
    },
    score_before: before,
    score_gain_obtained: gain,
    score_gain_potential: question.maxGain,
    score_after: after,
    user_can_dispute: true,
    created_at: nowIso()
  };

  state.answers.push(record);
  state.score = after;
  state.scoreHistory.push({
    at: nowIso(),
    from: before,
    to: after,
    delta: gain,
    reason: `Réponse Q${state.questionIndex + 1}`
  });

  const feedback = `
    <div class="feedback-panel">
      <h3>Retour TBZ sur votre réponse</h3>
      <p><strong>Ce que j’ai compris :</strong> ${understood.map(escapeHtml).join(", ")}.</p>
      <p><strong>Ce qui est solide :</strong> ${question.appreciated.map(escapeHtml).join(", ")}.</p>
      <p><strong>Ce qui manque pour le maximum :</strong> ${question.missing.map(escapeHtml).join(", ")}.</p>
      <p><strong>Score :</strong> ${before} → ${after} &nbsp; | &nbsp; Gain obtenu : +${gain} / +${question.maxGain}</p>
      <div class="notice warning">
        Si cette lecture est inexacte, trop prudente ou trop généreuse, corrigez-la avant génération du CV.
      </div>
    </div>
  `;

  state.questionIndex += 1;
  renderQuestion(feedback);
}

function buildUpdatedRaw(deliverableType = "all_working_deliverables") {
  const baseRaw = state.raw ? JSON.parse(JSON.stringify(state.raw)) : JSON.parse(JSON.stringify(sampleRaw));

  if (!baseRaw._tbz_trace) baseRaw._tbz_trace = { sessions: [] };
  if (!Array.isArray(baseRaw._tbz_trace.sessions)) baseRaw._tbz_trace.sessions = [];

  const session = {
    session_id: "tbz_" + Date.now(),
    tbz_version: TBZ_VERSION,
    mode: state.cvSourceLoaded ? "raw_plus_cv_source" : "raw_only_working_mode",
    source_raw_hash: state.rawHash,
    active_offer: state.activeOffer,
    offer_text_excerpt: state.offerText.slice(0, 2000),
    active_evidence: state.activeEvidence,
    score_final: state.score,
    score_history: state.scoreHistory,
    answers: state.answers,
    deliverable_metadata: {
      generated_at: nowIso(),
      deliverable_type: deliverableType,
      cv_source_loaded: state.cvSourceLoaded,
      status: state.cvSourceLoaded ? "source_verification_possible" : "working_deliverables_generated_from_raw_only"
    },
    raw_policy: {
      trace_first: true,
      filter_user_information: false,
      selection_happens_at_generation_time: true
    }
  };

  baseRaw._tbz_trace.sessions.push(session);
  baseRaw._tbz_last_generation = session.deliverable_metadata;

  return baseRaw;
}

function buildCvText() {
  const answers = state.answers.map((answer, index) => `Réponse Q${index + 1}: ${answer.user_answer_raw}`).join("\n\n");

  return {
    title: `CV de travail — ${candidateLabel()}`,
    paragraphs: [
      "Version de travail générée depuis RAW local.",
      "Statut : non vérifiée contre CV source.",
      `Offre analysée : ${state.activeOffer?.title || "offre non nommée"}.`,
      `Score TalentBusterZ : ${state.score}/100.`,
      `Preuve principale : ${state.activeEvidence?.label || "preuve à clarifier"}.`,
      "Synthèse : profil orienté AMOA, CRM/Data, coordination métier/IT, qualité de données, recette, accompagnement utilisateurs et pilotage transverse.",
      "Réponses utilisateur intégrées :",
      answers || "Aucune réponse utilisateur."
    ]
  };
}

function buildScoringText() {
  return `# Note / scoring TalentBusterZ

Version : ${TBZ_VERSION}
Offre : ${state.activeOffer?.title}
Score final : ${state.score}/100
Mode : ${state.cvSourceLoaded ? "RAW + CV source" : "RAW seul — livrables de travail"}

## Historique score

${state.scoreHistory.map((item) => `- ${item.from ?? "initial"} → ${item.to} ${item.delta ? `(gain +${item.delta})` : ""} : ${item.reason}`).join("\n")}

## Réponses et justification

${state.answers.map((answer) => `### ${answer.question_title}
Score : ${answer.score_before} → ${answer.score_after} (+${answer.score_gain_obtained}/${answer.score_gain_potential})

Ce que TBZ a compris : ${answer.assistant_interpretation.understood.join(", ")}
Ce qui est fort : ${answer.assistant_interpretation.appreciated_signals.join(", ")}
Manque pour maximum : ${answer.assistant_interpretation.missing_for_max_score.join(", ")}

Réponse brute :
${answer.user_answer_raw}

Commentaire utilisateur :
${answer.user_comment_on_question || "Aucun"}
`).join("\n")}
`;
}

function buildStrengthsText() {
  return `# Points forts et axes d'amélioration

## Points forts
- Alignement AMOA Data/BI.
- Preuve contextualisée autour d'un projet CRM/Data.
- Rôle personnel clarifié progressivement.
- Prudence anti-survente intégrée dans le RAW.

## Axes d'amélioration / points à préparer
- Niveau réel BI/Data Viz hands-on.
- Budget : responsabilité directe ou suivi opérationnel.
- Cabinet conseil : expérience confirmée ou posture conseil projet.
- Anglais : niveau et contexte d'usage.
- Management non hiérarchique vs management direct.

## Statut
Version de travail générée depuis RAW local. Non vérifiée contre CV source.
`;
}

function buildRtouText() {
  return `# RTOU — Retour Traçable d'Observation Utilisateur

## Définition
RTOU = Retour Traçable d'Observation Utilisateur.

Ce document trace l'entretien entre TBZ et l'utilisateur final : questions, réponses, commentaires, objections, score et décisions d'usage.

## Offre
${state.activeOffer?.title}

## Preuve active
${state.activeEvidence?.label}

## Interactions

${state.answers.map((answer, index) => `### Interaction ${index + 1}

Question :
${answer.question_prompt}

Réponse utilisateur :
${answer.user_answer_raw}

Commentaire utilisateur sur la question :
${answer.user_comment_on_question || "Aucun"}

Lecture TBZ :
${answer.assistant_interpretation.understood.join(", ")}

Score :
${answer.score_before} → ${answer.score_after}
`).join("\n")}

## Règle de conservation
Le RAW conserve toutes les réponses et commentaires. La sélection pour le CV est effectuée à la génération.
`;
}

function renderCvPreview() {
  const cv = buildCvText();
  $("cvPreview").innerHTML = `
    <h3>${escapeHtml(cv.title)}</h3>
    ${cv.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
  `;
}

$("generateBtn").addEventListener("click", () => {
  const permissions = computePermissions();

  if (!permissions.canGenerateWorkingDeliverables) {
    $("exportStatus").className = "status warning";
    $("exportStatus").textContent = "Chargez un RAW et analysez une offre avant génération.";
    return;
  }

  renderCvPreview();

  state.generated = {
    cv: buildCvText(),
    scoring: buildScoringText(),
    strengths: buildStrengthsText(),
    rtou: buildRtouText(),
    raw: buildUpdatedRaw("all_working_deliverables")
  };

  ["downloadCvBtn", "downloadScoringBtn", "downloadStrengthsBtn", "downloadRtouBtn", "downloadRawBtn"].forEach((id) => {
    $(id).disabled = false;
  });

  $("downloadSourcePackBtn").disabled = !permissions.canGenerateSourceVerifiedPack;

  $("exportStatus").className = "status success";
  $("exportStatus").innerHTML = `
    <strong>Livrables de travail générés depuis RAW local.</strong><br>
    CV Word + RAW, note/scoring + RAW, points forts / axes + RAW, RTOU + RAW et RAW actualisé sont disponibles.<br>
    ${state.cvSourceLoaded ? "CV source chargé : pack final source-vérifié possible." : "CV source absent : seul le pack final source-vérifié reste indisponible."}
  `;
});

function crc32(bytes) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c >>> 0;
    }
  }

  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = table[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(value) {
  return [value & 255, (value >>> 8) & 255];
}

function u32(value) {
  return [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255];
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosdate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dosdate };
}

function makeZip(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const dt = dosDateTime();

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = file.bytes instanceof Uint8Array ? file.bytes : encoder.encode(file.content || "");
    const crc = crc32(data);

    const local = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0),
      ...u16(dt.time), ...u16(dt.date), ...u32(crc), ...u32(data.length), ...u32(data.length),
      ...u16(nameBytes.length), ...u16(0)
    ]);

    chunks.push(local, nameBytes, data);

    const centralRecord = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0),
      ...u16(dt.time), ...u16(dt.date), ...u32(crc), ...u32(data.length), ...u32(data.length),
      ...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)
    ]);

    central.push(centralRecord, nameBytes);
    offset += local.length + nameBytes.length + data.length;
  }

  const centralStart = offset;
  const centralSize = central.reduce((total, item) => total + item.length, 0);
  const end = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length),
    ...u32(centralSize), ...u32(centralStart), ...u16(0)
  ]);

  const all = [...chunks, ...central, end];
  const totalSize = all.reduce((total, item) => total + item.length, 0);
  const output = new Uint8Array(totalSize);

  let position = 0;
  for (const item of all) {
    output.set(item, position);
    position += item.length;
  }

  return output;
}

function makeDocx(cv) {
  const paragraphs = cv.paragraphs.map((paragraph) => `<w:p><w:r><w:t>${escapeXml(paragraph)}</w:t></w:r></w:p>`).join("");

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(cv.title)}</w:t></w:r></w:p>
${paragraphs}
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
</w:body>
</w:document>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  return makeZip([
    { name: "[Content_Types].xml", content: contentTypes },
    { name: "_rels/.rels", content: rels },
    { name: "word/document.xml", content: documentXml }
  ]);
}

function downloadBlob(name, bytes, type = "application/octet-stream") {
  const blob = new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function ensureGenerated() {
  if (!state.generated) {
    $("generateBtn").click();
  }
  return state.generated;
}

function rawJson(deliverableType) {
  return JSON.stringify(buildUpdatedRaw(deliverableType), null, 2);
}

$("downloadCvBtn").addEventListener("click", () => {
  const generated = ensureGenerated();
  const zip = makeZip([
    { name: "CV_de_travail_TalentBusterZ.docx", bytes: makeDocx(generated.cv) },
    { name: "RAW_actualise.json", content: rawJson("cv_word_working") }
  ]);
  downloadBlob("CV_Word_plus_RAW.zip", zip);
});

$("downloadScoringBtn").addEventListener("click", () => {
  const generated = ensureGenerated();
  const zip = makeZip([
    { name: "Note_scoring_TalentBusterZ.md", content: generated.scoring },
    { name: "RAW_actualise.json", content: rawJson("note_scoring") }
  ]);
  downloadBlob("Note_scoring_plus_RAW.zip", zip);
});

$("downloadStrengthsBtn").addEventListener("click", () => {
  const generated = ensureGenerated();
  const zip = makeZip([
    { name: "Points_forts_axes_amelioration.md", content: generated.strengths },
    { name: "RAW_actualise.json", content: rawJson("points_axes") }
  ]);
  downloadBlob("Points_axes_plus_RAW.zip", zip);
});

$("downloadRtouBtn").addEventListener("click", () => {
  const generated = ensureGenerated();
  const zip = makeZip([
    { name: "RTOU.md", content: generated.rtou },
    { name: "RAW_actualise.json", content: rawJson("rtou") }
  ]);
  downloadBlob("RTOU_plus_RAW.zip", zip);
});

$("downloadRawBtn").addEventListener("click", () => {
  downloadBlob(
    "RAW_actualise_TalentBusterZ.json",
    new TextEncoder().encode(rawJson("raw_only")),
    "application/json"
  );
});

setGateStatus();
