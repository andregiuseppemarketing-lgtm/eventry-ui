#!/usr/bin/env node
/**
 * EVENT APP / EVENTIQ – Advanced Milestone Runner v2.0
 * (C) 2025 Andrea Granata – AI Dev Pipeline
 *
 * ✅ Novità:
 * 1. Scrive automaticamente i prompt in /prompts/milestone-N.txt
 * 2. Stampa in console il percorso generato
 * 3. Compatibile con Node ESM (type: "module")
 * 4. Pronto per integrazione CI/CD GitHub + Vercel
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Config ---
const OUTPUT_DIR = path.join(__dirname, "..", "prompts");

// --- Helpers ---
function readPromptMaster() {
  const paths = [
    path.join(__dirname, "..", "docs", "PROMPT_MASTER_EVENT_APP.md"),
    path.join(__dirname, "..", "PROMPT_MASTER_EVENT_APP.md"),
  ];
  for (const p of paths) if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  console.error("❌ File PROMPT_MASTER_EVENT_APP.md non trovato."); process.exit(1);
}

function extractMilestoneContent(markdown, milestone) {
  const regex = new RegExp(`###\\s*🧩\\s*Milestone\\s*${milestone}[^#]+`, "i");
  const match = markdown.match(regex);
  if (!match) { console.error(`❌ Milestone ${milestone} non trovata.`); process.exit(1); }
  return match[0].trim();
}

function buildPrompt(fullDoc, milestoneSection, milestone) {
  return `
🧠 **Event App / EventIQ – Milestone ${milestone}**

Agisci come Lead Architect & AI Engineer incaricato di sviluppare la milestone ${milestone} del progetto Event App / EventIQ.

─────────────────────────────
📘 PROMPT MASTER (estratto):
─────────────────────────────
${fullDoc.split("## 🗓️ Roadmap tecnica")[0].trim()}

─────────────────────────────
🧩 Milestone ${milestone} Dettagliata:
─────────────────────────────
${milestoneSection}

─────────────────────────────
🎯 Istruzioni per il modello:
─────────────────────────────
- Genera tutto il codice necessario (API, componenti, Prisma models, UI, test).
- Mantieni compatibilità con Next.js 15, TypeScript, Prisma, NextAuth e PostgreSQL.
- Usa Tailwind + shadcn/ui per lo styling.
- Evita modifiche breaking.
- Commenta i file generati con spiegazioni brevi.
- Al termine, riassumi i test da eseguire.

✅ Output atteso: codice funzionante + breve spiegazione dei file creati.
`;
}

// --- Main ---
const milestone = process.argv[2];
if (!milestone) { console.error("❌ Usa: npm run milestone <numero>"); process.exit(1); }

console.log(`🚀 Generazione prompt per Milestone ${milestone}...`);

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const markdown = readPromptMaster();
const section = extractMilestoneContent(markdown, milestone);
const prompt = buildPrompt(markdown, section, milestone);

const outputPath = path.join(OUTPUT_DIR, `milestone-${milestone}.txt`);
fs.writeFileSync(outputPath, prompt);

console.log(`✅ Prompt Milestone ${milestone} generato: ${outputPath}\n`);
console.log("─────────────────────────────");
console.log("📋 Copia e incolla il contenuto in Sonnet o GPT-5.1-Codex.");
console.log("─────────────────────────────\n");
