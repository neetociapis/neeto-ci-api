import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "cli", "catalog.json");
const snippetsDir = join(root, "snippets", "cli");
const overviewPath = join(root, "cli-reference", "overview.mdx");

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|");

const commandPathParts = (command) => command.replace(/^neetoci\s+/, "").split(/\s+/);

const flagLabel = (flag) =>
  flag.shorthand ? `\`--${flag.name}, -${flag.shorthand}\`` : `\`--${flag.name}\``;

const flagsTable = (flags) => {
  const header =
    "| Flag | Type | Required | Default | Description |\n" +
    "| --- | --- | --- | --- | --- |";
  const rows = flags.map((flag) => {
    const type = flag.type ? `\`${flag.type}\`` : "";
    const required = flag.required ? "Yes" : "";
    const def = flag.default ? `\`${flag.default}\`` : "";
    return `| ${flagLabel(flag)} | ${type} | ${required} | ${def} | ${escapeCell(flag.description)} |`;
  });
  return [header, ...rows].join("\n");
};

const writeSnippet = (command, flags) => {
  const parts = commandPathParts(command);
  const filePath = join(snippetsDir, `${parts.join("/")}.mdx`);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${flagsTable(flags)}\n`);
  return parts;
};

let snippetCount = 0;
const overviewGroups = [];

const walk = (entry, topGroup) => {
  const isLeaf = !entry.subcommands || entry.subcommands.length === 0;

  if (isLeaf) {
    if (topGroup && topGroup !== entry) {
      topGroup.commands.push({ command: entry.command, description: entry.description });
    }
    if (entry.flags && entry.flags.length > 0) {
      writeSnippet(entry.command, entry.flags);
      snippetCount += 1;
    }
    return;
  }

  for (const sub of entry.subcommands) {
    walk(sub, topGroup);
  }
};

rmSync(snippetsDir, { recursive: true, force: true });

for (const group of catalog) {
  const overviewGroup = {
    command: group.command,
    description: group.description,
    commands: [],
  };
  overviewGroups.push(overviewGroup);
  if (group.subcommands && group.subcommands.length > 0) {
    walk(group, overviewGroup);
  } else {
    overviewGroup.commands.push({ command: group.command, description: group.description });
    if (group.flags && group.flags.length > 0) {
      writeSnippet(group.command, group.flags);
      snippetCount += 1;
    }
  }
}

const groupToPage = {
  "neetoci ci-jobs": "/cli-reference/ci-jobs",
  "neetoci debug-sessions": "/cli-reference/debug-sessions",
  "neetoci global-env-vars": "/cli-reference/global-env-vars",
  "neetoci project-env-vars": "/cli-reference/project-env-vars",
  "neetoci projects": "/cli-reference/projects",
};
const utilityPage = "/cli-reference/utility";

const utilityGroups = new Set([
  "neetoci doctor",
  "neetoci login",
  "neetoci logout",
  "neetoci setup",
  "neetoci update",
  "neetoci version",
  "neetoci whoami",
]);

const pageFiles = {
  "/cli-reference/ci-jobs": "ci-jobs.mdx",
  "/cli-reference/debug-sessions": "debug-sessions.mdx",
  "/cli-reference/global-env-vars": "global-env-vars.mdx",
  "/cli-reference/project-env-vars": "project-env-vars.mdx",
  "/cli-reference/projects": "projects.mdx",
  "/cli-reference/utility": "utility.mdx",
};

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const leafCommands = [];
const collectLeaves = (entry) => {
  if (!entry.subcommands || entry.subcommands.length === 0) {
    leafCommands.push({ command: entry.command, tokens: entry.command.split(/\s+/) });
    return;
  }
  entry.subcommands.forEach(collectLeaves);
};
catalog.forEach(collectLeaves);

const matchCommand = (lineTokens) => {
  let best = null;
  for (const leaf of leafCommands) {
    if (leaf.tokens.length > lineTokens.length) continue;
    const isPrefix = leaf.tokens.every((token, index) => token === lineTokens[index]);
    if (isPrefix && (!best || leaf.tokens.length > best.tokens.length)) best = leaf;
  }
  return best ? best.command : null;
};

const parsePageAnchors = (fileName) => {
  const lines = readFileSync(join(root, "cli-reference", fileName), "utf8").split("\n");
  const anchors = new Map();
  let inCode = false;
  let codeLang = "";
  let currentAnchor = null;
  for (const line of lines) {
    const fence = line.match(/^\s*(`{3,})(.*)$/);
    if (fence) {
      if (inCode) {
        inCode = false;
        codeLang = "";
      } else {
        inCode = true;
        codeLang = fence[2].trim().split(/\s+/)[0].toLowerCase();
      }
      continue;
    }
    if (!inCode) {
      const heading = line.match(/^#{2,6}\s+(.+?)\s*$/);
      if (heading) currentAnchor = slugify(heading[1]);
      continue;
    }
    if (codeLang !== "bash") continue;
    const lineTokens = line.trim().split(/\s+/);
    if (lineTokens[0] !== "neetoci") continue;
    const command = matchCommand(lineTokens);
    if (command && currentAnchor && !anchors.has(command)) anchors.set(command, currentAnchor);
  }
  return anchors;
};

const anchorsByPage = {};
for (const [page, fileName] of Object.entries(pageFiles)) {
  anchorsByPage[page] = parsePageAnchors(fileName);
}

const warnings = [];
const missingAnchors = [];

const resolvePage = (groupCommand) => {
  if (groupToPage[groupCommand]) return groupToPage[groupCommand];
  if (!utilityGroups.has(groupCommand)) {
    warnings.push(
      `No page mapping for group "${groupCommand}"; linking to ${utilityPage}. ` +
        "Add it to groupToPage in scripts/generate-cli-reference.mjs.",
    );
  }
  return utilityPage;
};

const overviewSection = (group) => {
  const page = resolvePage(group.command);
  const anchors = anchorsByPage[page] ?? new Map();
  const title = group.command.replace(/^neetoci\s+/, "");
  const rows = group.commands
    .map((c) => {
      const anchor = anchors.get(c.command);
      if (!anchor) missingAnchors.push(c.command);
      const href = anchor ? `${page}#${anchor}` : page;
      return `| [\`${c.command}\`](${href}) | ${escapeCell(c.description)} |`;
    })
    .join("\n");
  return (
    `### ${title}\n\n` +
    `${group.description}\n\n` +
    "| Command | Description |\n| --- | --- |\n" +
    `${rows}\n`
  );
};

const globalFlags = [
  { name: "json", description: "Output as JSON" },
  { name: "quiet", description: "Output raw data only (no envelope)" },
  { name: "toon", description: "Output in TOON format (token-optimized for AI agents)" },
  { name: "subdomain", description: "Override saved subdomain" },
];

const globalFlagsSection =
  "## Global flags\n\n" +
  "These flags work on every command and are left out of the per-command flag tables below. " +
  "See [Output formats](/cli/output-formats) for details.\n\n" +
  "| Flag | Description |\n| --- | --- |\n" +
  globalFlags.map((f) => `| \`--${f.name}\` | ${escapeCell(f.description)} |`).join("\n");

const sections = overviewGroups.map(overviewSection).join("\n");

const overview =
  "---\n" +
  'title: "Commands overview"\n' +
  'description: "Every neetoci command grouped by resource, with links to the full reference."\n' +
  "---\n\n" +
  `${globalFlagsSection}\n\n` +
  sections;

mkdirSync(dirname(overviewPath), { recursive: true });
writeFileSync(overviewPath, overview);

for (const warning of warnings) {
  console.error(`Warning: ${warning}`);
}

if (missingAnchors.length > 0) {
  console.error(
    "Warning: no bash-block heading anchor found for these commands; linked to the bare page:",
  );
  for (const command of missingAnchors) {
    console.error(`  - ${command}`);
  }
}

console.log(`Generated ${snippetCount} flag-table snippets and cli-reference/overview.mdx`);
