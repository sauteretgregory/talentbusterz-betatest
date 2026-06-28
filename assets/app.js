/* TalentBusterZ V0.8.4 hotfix step 2 — RAW Resolver + Trace IA future */
const TBZ_VERSION = "0.8.4-hotfix-step2-rawresolver-trace";

const state = {
  raw: null,
  rawHash: null,
  previousRawHash: localStorage.getItem("tbz_previous_raw_hash") || null,
  cvSourceLoaded: false,
  offerText: "",
  activeOffer: null,
  rawResolution: null,
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
    version: "0.8.4-hotfix-step2-sample",
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
  validated_core: {
    summary: "Profil fictif orienté AMOA, CRM, Data, BI et coordination projet.",
    proofs: [
      "Pilotage fictif de projets CRM/Data et BI.",
      "Coordination fictive entre équipes métier, IT et prestataires.",
      "Mise en place fictive de référentiels clients et amélioration de qualité de données."
    ]
  },
  skills: {
    project_management: ["AMOA", "Cadrage fonctionnel", "Analyse des besoins", "Recette fonctionnelle", "Coordination transverse"],
    crm_customer_data: ["CRM", "Référentiel Client Unique", "Customer data", "RGPD", "Anonymisation"],
    data_bi: ["SQL", "Data Quality", "Data Warehouse", "BI", "Reporting", "Power BI"]
  },
  tools: ["CRM Démo", "BI Démo", "SQL", "Outil projet Démo"],
  experiences: [
    {
      title: "Chef de Projet AMOA Data — Démo",
      company: "Client Démo",
      period: "Période fictive",
      bullets: [
        "Coordination fictive d’un projet CRM/Data.",
        "Cadrage fictif des besoins métier et suivi de recette.",
        "Amélioration fictive de la qualité de données."
      ]
    }
  ],
  watch_points: [
    "Clarifier le niveau exact de budget.",
    "Clarifier management hiérarchique vs coordination projet.",
    "Ne pas sur-vendre l’expertise hands-on."
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

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function flattenSkills(skills) {
  if (!skills || typeof skills !== "object") return [];
  return Object.values(skills).flatMap((value) => Array.isArray(value) ? value : []);
}

function candidateLabel() {
  return (
    state.raw?.candidate?.display_label ||
    state.raw?.display_name ||
    state.raw?.identity_public?.label ||
    "Profil chargé depuis RAW local"
  );
}

function candidatePositioning() {
  return (
    state.raw?.target_positioning ||
    state.raw?.candidate?.positioning?.join(" / ") ||
    state.raw?.validated_core?.summary ||
    "Positionnement à clarifier"
  );
}

function buildProofCandidateFromText(text, source, weight = 1) {
  return {
    evidence_id: `${source}_${Math.random().toString(36).slice(2, 9)}`,
    label: String(text).slice(0, 140),
    source,
    raw_text: String(text),
    weight,
    usage_status: "candidate_from_raw"
  };
}

function resolveRaw(raw) {
  const proofCandidates = [];

  if (!raw) {
    return {
      resolver_status: "no_raw",
      profile_label: "Aucun RAW",
      positioning: "",
      proof_candidates: [],
      skills_detected: [],
      tools_detected: [],
      watch_points: []
    };
  }

  // Format V0.8-style: evidence_library
  asArray(raw.evidence_library).forEach((evidence, index) => {
    proofCandidates.push({
      evidence_id: evidence.evidence_id || `evidence_library_${index}`,
      label: evidence.label || evidence.context || `Preuve RAW ${index + 1}`,
      source: "evidence_library",
      raw_text: JSON.stringify(evidence),
      signals: evidence.signals || [],
      weight: 4,
      usage_status: evidence.usage_status || "candidate_from_raw"
    });
  });

  // Format V0.7: validated_core.proofs
  asArray(raw.validated_core?.proofs).forEach((proof, index) => {
    proofCandidates.push(buildProofCandidateFromText(proof, `validated_core.proofs.${index}`, 3));
  });

  // Format V0.7: experiences bullets
  asArray(raw.experiences).forEach((experience, expIndex) => {
    const expHeader = [experience.title, experience.company, experience.period].filter(Boolean).join(" — ");
    asArray(experience.bullets).forEach((bullet, bulletIndex) => {
      proofCandidates.push({
        evidence_id: `experience_${expIndex}_${bulletIndex}`,
        label: `${expHeader}: ${String(bullet).slice(0, 110)}`,
        source: "experiences.bullets",
        raw_text: JSON.stringify({ experience: expHeader, bullet }),
        experience_title: experience.title,
        company: experience.company,
        period: experience.period,
        weight: 2,
        usage_status: "candidate_from_raw"
      });
    });
  });

  const skillsDetected = flattenSkills(raw.skills);
  const toolsDetected = asArray(raw.tools);
  const watchPoints = asArray(raw.watch_points);

  return {
    resolver_status: proofCandidates.length ? "resolved_from_raw" : "raw_loaded_but_no_proof_candidate",
    profile_label: candidateLabel(),
    positioning: candidatePositioning(),
    proof_candidates: proofCandidates,
    skills_detected: skillsDetected,
    tools_detected: toolsDetected,
    watch_points: watchPoints
  };
}

function keywordScore(text, keywords) {
  const lower = String(text || "").toLowerCase();
  return keywords.reduce((score, keyword) => score + (lower.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function parseOffer(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let company = "Entreprise non détectée";
  let title = "Intitulé non détecté";

  const logoLine = lines.find((line) => /^logo de l.?entreprise/i.test(line));
  if (logoLine) {
    const cleaned = logoLine.replace(/^logo de l.?entreprise,?/i, "").replace(/[.,:]+$/g, "").trim();
    if (cleaned) company = cleaned;
  }

  // LinkedIn paste often has company on first or second meaningful line.
  const companyCandidate = lines.find((line, index) => {
    if (index > 8) return false;
    if (/postuler|enregistrer|hybride|temps plein|réponses gérées/i.test(line)) return false;
    if (/consultant|chef|manager|directeur|chargé|responsable|talent|recruiter|data|bi/i.test(line)) return false;
    return line.length >= 2 && line.length <= 80;
  });
  if (companyCandidate && company === "Entreprise non détectée") company = companyCandidate.replace(/[.,:]+$/g, "");

  const titleCandidate = lines.find((line) =>
    /(chef de projet|consultant|manager|responsable|chargé|talent|recruiter|data|bi|crm|amoa|business analyst)/i.test(line)
  );
  if (titleCandidate) title = titleCandidate;

  const signalMap = [
    ["AMOA", ["amoa", "maîtrise d’ouvrage", "maitrise d’ouvrage"]],
    ["Data/BI", ["data", "bi", "business intelligence", "data viz", "dataviz"]],
    ["CRM", ["crm", "client", "référentiel client", "customer"]],
    ["Luxe/Retail", ["luxe", "retail", "magasin", "merchandising"]],
    ["Cahier des charges", ["cahier des charges", "besoins utilisateurs"]],
    ["Spécifications", ["spécifications", "specifications"]],
    ["Recette / tests", ["recette", "tests", "uat", "intégration", "unitaires"]],
    ["Coordination transverse", ["coordination", "management non hiérarchique", "comités", "copil"]],
    ["Budget / charges", ["budget", "charges", "moyens financiers"]],
    ["Anglais", ["anglais", "english"]]
  ];

  const signals = signalMap
    .filter(([, keywords]) => keywordScore(text, keywords) > 0)
    .map(([label]) => label);

  const risks = [];
  if (signals.includes("Data/BI")) risks.push("Clarifier le niveau BI/Data Viz hands-on vs pilotage AMOA.");
  if (signals.includes("Budget / charges")) risks.push("Clarifier responsabilité budgétaire directe vs suivi opérationnel.");
  if (signals.includes("Anglais")) risks.push("Confirmer l’usage professionnel réel de l’anglais.");
  if (signals.includes("Coordination transverse")) risks.push("Distinguer management non hiérarchique et management direct.");

  return {
    company,
    title,
    display_title: `${company} — ${title}`,
    signals,
    risks,
    raw_excerpt: String(text).slice(0, 3000)
  };
}

function selectEvidenceForOffer(resolution, offer) {
  const offerKeywords = [...offer.signals, offer.title, offer.company].join(" ").toLowerCase();

  const scored = asArray(resolution?.proof_candidates).map((proof) => {
    const proofText = [proof.label, proof.raw_text, proof.source].join(" ").toLowerCase();
    let score = proof.weight || 1;

    ["crm", "data", "bi", "amoa", "client", "retail", "luxe", "référentiel", "rcu", "recette", "budget", "coordination", "rgpd", "reporting"].forEach((keyword) => {
      if (proofText.includes(keyword) && offerKeywords.includes(keyword)) score += 2;
      else if (proofText.includes(keyword)) score += 1;
    });

    return { ...proof, match_score: score };
  }).sort((a, b) => b.match_score - a.match_score);

  return {
    active: scored[0] || null,
    alternatives: scored.slice(1, 5)
  };
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
  if (!state.raw._tbz_trace) state.raw._tbz_trace = { sessions: [] };
  if (!Array.isArray(state.raw._tbz_trace.sessions)) state.raw._tbz_trace.sessions = [];

  state.rawHash = await sha256(JSON.stringify(state.raw));
  state.rawResolution = resolveRaw(state.raw);

  if (state.previousRawHash && state.previousRawHash === state.rawHash) {
    $("rawStatus").className = "status neutral";
    $("rawStatus").innerHTML = `<strong>RAW déjà chargé — aucune nouvelle donnée détectée.</strong><br>Continuation de la session locale.`;
  } else {
    localStorage.setItem("tbz_previous_raw_hash", state.rawHash);
    state.previousRawHash = state.rawHash;
  }

  setGateStatus();
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

  state.activeOffer = parseOffer(state.offerText);
  state.rawResolution = resolveRaw(state.raw);
  const evidenceSelection = selectEvidenceForOffer(state.rawResolution, state.activeOffer);
  state.activeEvidence = evidenceSelection.active || {
    evidence_id: "evidence_to_clarify",
    label: "Preuve principale à clarifier",
    source: "fallback",
    raw_text: "",
    usage_status: "needs_user_input"
  };

  const hasRaw = Boolean(state.raw);
  const baseScore = hasRaw ? 86 : 62;
  const evidenceBonus = evidenceSelection.active ? Math.min(5, Math.round((evidenceSelection.active.match_score || 0) / 3)) : 0;
  const signalBonus = Math.min(4, state.activeOffer.signals.length);
  state.score = Math.min(95, baseScore + evidenceBonus + signalBonus);

  state.scoreHistory = [{
    at: nowIso(),
    from: null,
    to: state.score,
    delta: null,
    reason: "Analyse initiale depuis l’offre collée et le RAW local.",
    details: {
      base_score: baseScore,
      evidence_bonus: evidenceBonus,
      signal_bonus: signalBonus,
      active_evidence: state.activeEvidence,
      offer_signals: state.activeOffer.signals
    }
  }];

  $("analysisOutput").innerHTML = `
    <h3>${escapeHtml(state.activeOffer.display_title)}</h3>
    <div class="score">${state.score}</div>
    <p><strong>Lecture TalentBusterZ :</strong> ${escapeHtml(state.activeOffer.signals.join(" / ") || "signaux à clarifier")}</p>
    <p><strong>Score expliqué :</strong> base RAW ${baseScore}, bonus preuve +${evidenceBonus}, bonus signaux offre +${signalBonus}.</p>
    <p><strong>Preuve active proposée :</strong> ${escapeHtml(state.activeEvidence.label)}</p>
    <p><strong>Autres preuves candidates :</strong></p>
    <div>${evidenceSelection.alternatives.map((proof) => `<span class="pill">${escapeHtml(proof.label.slice(0, 70))}</span>`).join("") || "<span class='pill'>Aucune alternative détectée</span>"}</div>
    <p><strong>Compétences / signaux détectés dans l’offre :</strong></p>
    <div>${state.activeOffer.signals.map((signal) => `<span class="pill">${escapeHtml(signal)}</span>`).join("")}</div>
    <p><strong>Points de vigilance :</strong></p>
    <div>${state.activeOffer.risks.concat(state.rawResolution.watch_points.slice(0, 3)).map((risk) => `<span class="pill">${escapeHtml(risk.slice(0, 90))}</span>`).join("") || "<span class='pill'>Aucun point de vigilance détecté</span>"}</div>
    <div class="${hasRaw ? "status success" : "status warning"}">
      ${hasRaw ? "RAW chargé : preuve active résolue depuis le RAW, Question Engine actif et livrables de travail disponibles." : "Aucun RAW chargé : initialisez ou chargez un RAW pour activer la continuité."}
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
    title: "Question 1/4 — Validation de la preuve principale",
    objective: "Confirmer ou corriger la preuve que TBZ propose d’utiliser.",
    maxGain: 3,
    appreciated: ["preuve reliée à l’offre", "contexte clair", "rôle personnel", "résultat observable"],
    missing: ["frontière exacte entre contribution personnelle et périmètre projet", "outils réellement utilisés", "résultat mesurable"]
  },
  {
    title: "Question 2/4 — Rôle personnel",
    objective: "Clarifier ce qui a réellement été fait.",
    maxGain: 2,
    appreciated: ["frontière claire entre rôle assumé et non assumé", "AMOA / coordination / recette"],
    missing: ["budget direct ou non", "management direct ou non"]
  },
  {
    title: "Question 3/4 — Chiffres assumables",
    objective: "Ajouter des ordres de grandeur sans sur-vente.",
    maxGain: 2,
    appreciated: ["volumes", "utilisateurs", "équipe", "gains qualité"],
    missing: ["KPI officiellement mesurés", "ROI ou gains financiers si non documentés"]
  },
  {
    title: "Question 4/4 — Audit final avant CV",
    objective: "Préparer le point de vigilance pour le CV et l’entretien.",
    maxGain: 2,
    appreciated: ["risques identifiés", "formulation prudente", "préparation entretien"],
    missing: ["niveau exact sur outils BI/Data Viz", "responsabilité budgétaire complète", "anglais en contexte projet"]
  }
];

function buildQuestionPrompt(questionIndex) {
  const offer = state.activeOffer;
  const evidence = state.activeEvidence;
  const alternatives = selectEvidenceForOffer(state.rawResolution, state.activeOffer).alternatives;

  if (questionIndex === 0) {
    return `Pour l’offre ${offer.display_title}, TBZ repère les signaux suivants : ${offer.signals.join(", ") || "signaux à clarifier"}.

Dans le RAW, je propose comme preuve principale :
« ${evidence.label} ».

C’est potentiellement solide, mais je veux éviter de l’imposer si ce n’est pas la meilleure preuve.
Voulez-vous confirmer cette preuve, la corriger, ou choisir une autre preuve parmi les alternatives détectées ?

Alternatives détectées :
${alternatives.map((proof, index) => `${index + 1}. ${proof.label}`).join("\n") || "Aucune alternative forte détectée."}

Répondez avec :
- preuve choisie ;
- contexte ;
- rôle personnel exact ;
- outils ;
- résultat observable ;
- ce qu’il ne faut pas sur-vendre.`;
  }

  if (questionIndex === 1) {
    return `Sur la preuve validée pour ${offer.display_title}, quel a été votre rôle personnel exact : cadrage, AMOA, pilotage, coordination, recette, budget, formation ?

Dites ce que vous assumez, ce que vous avez seulement coordonné, et ce qu’il ne faut pas écrire comme responsabilité directe.`;
  }

  if (questionIndex === 2) {
    return `Quels chiffres pouvez-vous assumer sans sur-vendre pour cette preuve : volume de données, utilisateurs, taille d’équipe, planning, indicateurs, gains qualité ?

Précisez si ce sont des mesures officielles, des ordres de grandeur ou des éléments à valider.`;
  }

  return `Dernier audit avant génération du CV de travail.

Pour ${offer.display_title}, TBZ voit les points de vigilance suivants :
${offer.risks.concat(state.rawResolution.watch_points.slice(0, 3)).map((risk) => `- ${risk}`).join("\n") || "- Aucun point de vigilance détecté."}

Quel point doit être formulé avec prudence dans le CV et en entretien ?
Répondez avec :
- ce que vous assumez ;
- ce que vous refusez de sur-vendre ;
- la formulation prudente à utiliser.`;
}

function summarizeAnswer(answer) {
  const lower = answer.toLowerCase();
  const signals = [];
  if (lower.includes("amoa")) signals.push("AMOA");
  if (lower.includes("coord")) signals.push("coordination transverse");
  if (lower.includes("recette") || lower.includes("test")) signals.push("recette / tests");
  if (lower.includes("data") || lower.includes("bi")) signals.push("Data/BI");
  if (lower.includes("crm")) signals.push("CRM");
  if (lower.includes("budget")) signals.push("budget cadré");
  if (lower.includes("sans sur-vendre") || lower.includes("ne revendique pas")) signals.push("prudence anti-survente");
  return signals.length ? signals : ["réponse exploitable à clarifier"];
}

function computeGain(question, answer) {
  const length = answer.trim().length;
  let gain = 0;
  if (length > 40) gain += 1;
  if (length > 180) gain += 1;
  if (/(contexte|rôle|résultat|outil|utilisateur|coord|amoa|recette|budget|anglais|formation|rgpd|client|data|bi|crm)/i.test(answer)) gain += 1;
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
  const prompt = buildQuestionPrompt(state.questionIndex);

  box.innerHTML = `
    ${lastFeedback}
    <div class="question-title">${escapeHtml(question.title)}</div>
    <p><strong>Offre active :</strong> ${escapeHtml(state.activeOffer.display_title)}</p>
    <p><strong>Preuve active :</strong> ${escapeHtml(state.activeEvidence.label)}</p>
    <p><strong>Objectif :</strong> ${escapeHtml(question.objective)}</p>
    <div class="notice neutral">
      TBZ dialogue comme en entretien. Si la question est trop vague, si le score est discutable ou si la preuve proposée n’est pas la bonne, indiquez-le : ce commentaire sera conservé dans le RAW.
    </div>
    <p style="white-space: pre-line">${escapeHtml(prompt)}</p>

    <label>Votre réponse</label>
    <textarea id="answerText" rows="8"></textarea>

    <label>Commentaire sur la question ou la lecture TBZ <small>optionnel</small></label>
    <textarea id="questionComment" rows="3" placeholder="Ex : question trop vague, preuve mal choisie, score discutable..."></textarea>

    <button id="submitAnswerBtn">Enregistrer la réponse et passer à la question suivante</button>
  `;

  $("submitAnswerBtn").addEventListener("click", submitAnswer);
}

function submitAnswer() {
  const answer = $("answerText").value.trim();
  const comment = $("questionComment").value.trim();
  if (!answer) return;

  const question = questions[state.questionIndex];
  const prompt = buildQuestionPrompt(state.questionIndex);
  const before = state.score;
  const gain = computeGain(question, answer);
  const after = Math.min(100, before + gain);
  const understood = summarizeAnswer(answer);

  const record = {
    interaction_type: "question_answer",
    question_index: state.questionIndex + 1,
    question_title: question.title,
    active_offer: state.activeOffer,
    raw_resolution_snapshot: state.rawResolution,
    active_evidence: state.activeEvidence,
    alternative_evidence_candidates: selectEvidenceForOffer(state.rawResolution, state.activeOffer).alternatives,
    question_prompt: prompt,
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
    usage_decision: {
      store_in_raw: true,
      use_in_working_cv: true,
      needs_human_review: Boolean(comment),
      trace_first_no_filtering: true
    },
    created_at: nowIso()
  };

  state.answers.push(record);
  state.score = after;
  state.scoreHistory.push({
    at: nowIso(),
    from: before,
    to: after,
    delta: gain,
    reason: `Réponse Q${state.questionIndex + 1}`,
    interaction_ref: record.question_title
  });

  const feedback = `
    <div class="feedback-panel">
      <h3>Retour TBZ sur votre réponse</h3>
      <p><strong>Ce que j’ai compris :</strong> ${understood.map(escapeHtml).join(", ")}.</p>
      <p><strong>Ce qui est solide :</strong> ${question.appreciated.map(escapeHtml).join(", ")}.</p>
      <p><strong>Ce qui manque pour le maximum :</strong> ${question.missing.map(escapeHtml).join(", ")}.</p>
      <p><strong>Score :</strong> ${before} → ${after} &nbsp; | &nbsp; Gain obtenu : +${gain} / +${question.maxGain}</p>
      <div class="notice warning">
        Si cette lecture est inexacte, trop prudente ou trop généreuse, corrigez-la avant génération du CV. Votre commentaire sera conservé dans le RAW.
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
    offer_text_excerpt: state.offerText.slice(0, 3000),
    raw_resolution_snapshot: state.rawResolution,
    active_evidence: state.activeEvidence,
    alternative_evidence_candidates: selectEvidenceForOffer(state.rawResolution, state.activeOffer).alternatives,
    score_final: state.score,
    score_history: state.scoreHistory,
    interactions: state.answers,
    deliverable_metadata: {
      generated_at: nowIso(),
      deliverable_type: deliverableType,
      cv_source_loaded: state.cvSourceLoaded,
      status: state.cvSourceLoaded ? "source_verification_possible" : "working_deliverables_generated_from_raw_only"
    },
    raw_policy: {
      trace_first: true,
      filter_user_information: false,
      preserve_questions_answers_comments: true,
      selection_happens_at_generation_time: true,
      future_ai_reuse_ready: true
    }
  };

  baseRaw._tbz_trace.sessions.push(session);
  baseRaw._tbz_last_generation = session.deliverable_metadata;
  baseRaw._tbz_last_resolution = state.rawResolution;

  return baseRaw;
}

function buildCvText() {
  const answers = state.answers.map((answer, index) => `Réponse Q${index + 1}: ${answer.user_answer_raw}`).join("\n\n");

  return {
    title: `CV de travail — ${candidateLabel()}`,
    paragraphs: [
      "Version de travail générée depuis RAW local.",
      "Statut : non vérifiée contre CV source.",
      `Offre analysée : ${state.activeOffer?.display_title || "offre non nommée"}.`,
      `Score TalentBusterZ : ${state.score}/100.`,
      `Preuve principale : ${state.activeEvidence?.label || "preuve à clarifier"}.`,
      `Positionnement RAW : ${candidatePositioning()}.`,
      "Synthèse : profil orienté AMOA, CRM/Data, coordination métier/IT, qualité de données, recette, accompagnement utilisateurs et pilotage transverse.",
      "Réponses utilisateur intégrées :",
      answers || "Aucune réponse utilisateur."
    ]
  };
}

function buildScoringText() {
  return `# Note / scoring TalentBusterZ

Version : ${TBZ_VERSION}
Offre : ${state.activeOffer?.display_title}
Score final : ${state.score}/100
Mode : ${state.cvSourceLoaded ? "RAW + CV source" : "RAW seul — livrables de travail"}

## Score initial expliqué

${state.scoreHistory.map((item) => `- ${item.from ?? "initial"} → ${item.to} ${item.delta ? `(gain +${item.delta})` : ""} : ${item.reason}`).join("\n")}

## Preuve active

${state.activeEvidence?.label}

## Preuves alternatives

${selectEvidenceForOffer(state.rawResolution, state.activeOffer).alternatives.map((proof) => `- ${proof.label}`).join("\n")}

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
- Alignement détecté avec les signaux de l’offre : ${state.activeOffer?.signals.join(", ") || "à clarifier"}.
- Preuve active proposée depuis le RAW : ${state.activeEvidence?.label || "à clarifier"}.
- Rôle personnel clarifié progressivement par entretien.
- Conservation des commentaires utilisateur dans le RAW enrichi.
- Prudence anti-survente intégrée.

## Axes d'amélioration / points à préparer
${state.activeOffer?.risks.map((risk) => `- ${risk}`).join("\n") || "- Points de vigilance à clarifier."}
${state.rawResolution?.watch_points.slice(0, 5).map((risk) => `- ${risk}`).join("\n") || ""}

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
${state.activeOffer?.display_title}

## Preuve active
${state.activeEvidence?.label}

## Resolver RAW
Statut : ${state.rawResolution?.resolver_status}
Profil : ${state.rawResolution?.profile_label}
Positionnement : ${state.rawResolution?.positioning}

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
