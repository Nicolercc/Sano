import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const filesToScan = [
  "app",
  "components",
  "lib"
];

const auditedPairs = [
  ["white/72 on hero navy", "#ffffff", "#1e2a38", 0.72],
  ["white/72 placeholder on hero field", "#ffffff", "#415160", 0.72],
  ["ink/65 on oat", "#17201b", "#f8f4eb", 0.65],
  ["ink/65 on white", "#17201b", "#ffffff", 0.65],
  ["ink/65 on surface-2", "#17201b", "#fffaf1", 0.65],
  ["amberText on oat", "#7a5714", "#f8f4eb", 1],
  ["amberText on white", "#7a5714", "#ffffff", 1],
  ["amberText on amber/15 over oat", "#7a5714", "#e7dbc5", 1],
  ["coralText on oat", "#a62626", "#f8f4eb", 1],
  ["coralText on white", "#a62626", "#ffffff", 1],
  ["coralText on coral/10 over oat", "#a62626", "#f2dfd8", 1]
];

const bannedMeaningfulTextPatterns = [
  /text-ink\/(?:45|50|55|60)\b/g,
  /text-white\/(?:40|45|50|52)\b/g,
  /text-amber(?!Text)\b/g,
  /text-coral(?!Text)\b/g
];

const allowlistedTextPatterns = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16)
  ];
}

function blend(foreground, background, alpha) {
  return foreground.map((channel, index) =>
    channel * alpha + background[index] * (1 - alpha)
  );
}

function channelToLinear(channel) {
  const value = channel / 255;
  return value <= 0.03928
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb) {
  const [red, green, blue] = rgb.map(channelToLinear);
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function checkAuditedPairs() {
  for (const [label, foregroundHex, backgroundHex, alpha] of auditedPairs) {
    const background = hexToRgb(backgroundHex);
    const foreground = blend(hexToRgb(foregroundHex), background, alpha);
    const ratio = contrastRatio(foreground, background);

    assert(
      ratio >= 4.5,
      `${label} is ${ratio.toFixed(2)}:1; expected at least 4.5:1.`
    );
  }
}

function getTrackedFiles() {
  const output = execFileSync("git", ["ls-files"], {
    cwd: root,
    encoding: "utf8"
  });
  return output
    .split("\n")
    .filter(Boolean)
    .filter((file) => filesToScan.some((folder) => file.startsWith(`${folder}/`)));
}

function isAllowlisted(file, line) {
  return allowlistedTextPatterns.some(
    (item) => item.file === file && line.includes(item.pattern)
  );
}

function checkRiskyTextClasses(files) {
  const violations = [];

  for (const file of files) {
    const source = readFileSync(join(root, file), "utf8");
    source.split("\n").forEach((line, index) => {
      if (isAllowlisted(file, line)) {
        return;
      }

      for (const pattern of bannedMeaningfulTextPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          violations.push(`${file}:${index + 1}: ${line.trim()}`);
          break;
        }
      }
    });
  }

  assert(
    violations.length === 0,
    `Found risky meaningful-text contrast classes:\n${violations.join("\n")}`
  );
}

function main() {
  checkAuditedPairs();
  checkRiskyTextClasses(getTrackedFiles());
  console.log("Accessibility contrast checks passed.");
}

main();
