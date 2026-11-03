// Crée (ou remplace) le compte administrateur du site.
//   npm run admin:create
// Demande l'identifiant et le mot de passe (saisie masquée). Pour un usage automatisé :
//   ADMIN_USERNAME=... ADMIN_PASSWORD=... npm run admin:create
// Le mot de passe n'est jamais stocké en clair : seule une empreinte scrypt salée est enregistrée
// dans <stockage>/admin.json (même format que lib/store.ts).
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";

// même règle que lib/store.ts : sur un serveur Linux (NODE_ENV=production), le défaut est ~/obirin-data
const DEFAULT_STORE_DIR =
  process.env.NODE_ENV === "production" && process.platform !== "win32" ? path.join(os.homedir(), "obirin-data") : path.join(process.cwd(), "data", "store");
const STORE_DIR = path.resolve(process.env.OBIRIN_STORE_DIR || DEFAULT_STORE_DIR);

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
        else if (!s.includes("\n") && !s.includes("\r")) rl.output.write("*");
        else rl.output.write(s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

let username = process.env.ADMIN_USERNAME;
let password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  console.log("\nCréation du compte administrateur Obirin\n");
  username = (await ask("Identifiant : ")).trim();
  password = await ask("Mot de passe (10 caractères minimum) : ", { hidden: true });
  const confirm = await ask("Confirmez le mot de passe : ", { hidden: true });
  if (password !== confirm) {
    console.error("\n✗ Les deux mots de passe ne correspondent pas. Rien n'a été modifié.");
    process.exit(1);
  }
}

username = username.trim();
if (username.length < 3) {
  console.error("✗ L'identifiant doit contenir au moins 3 caractères.");
  process.exit(1);
}
if (password.length < 10) {
  console.error("✗ Le mot de passe doit contenir au moins 10 caractères.");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
fs.mkdirSync(STORE_DIR, { recursive: true });
const target = path.join(STORE_DIR, "admin.json");
const existed = fs.existsSync(target);
fs.writeFileSync(target, JSON.stringify({ username, salt, hash, updatedAt: new Date().toISOString() }, null, 2), { mode: 0o600 });
console.log(`\n✓ Compte administrateur ${existed ? "remplacé" : "créé"} pour « ${username} ».`);
console.log("  Connectez-vous sur /admin/connexion (les sessions ouvertes précédemment sont fermées).");
