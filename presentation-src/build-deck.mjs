import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillScripts = "C:\\Users\\woojo\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.521.10419\\skills\\presentations\\scripts";
const node = "C:\\Users\\woojo\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe";
const python = "C:\\Users\\woojo\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
const workspace = __dirname;
const out = path.join(__dirname, "..", "digital-citizenship-canva-style.pptx");

const result = spawnSync(
  node,
  [
    path.join(skillScripts, "build_artifact_deck.mjs"),
    "--workspace", workspace,
    "--slides-dir", path.join(__dirname, "slides"),
    "--out", out,
    "--preview-dir", path.join(__dirname, "preview"),
    "--layout-dir", path.join(__dirname, "layout"),
    "--contact-sheet", path.join(__dirname, "contact-sheet.png"),
    "--slide-count", "8",
  ],
  {
    cwd: workspace,
    stdio: "inherit",
    env: { ...process.env, PYTHON: python },
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(out);
