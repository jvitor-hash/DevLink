import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const targets = process.argv.slice(2);
const LITERAL = "\\\\r";

const walk = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
};

for (const target of targets) {
  const files = statSync(target).isDirectory() ? walk(target) : [target];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    if (content.includes(LITERAL)) {
      writeFileSync(file, content.replaceAll(LITERAL, ""));
      console.log("cleaned:", file);
    }
  }
}
