import path = require("path");

export const inertiaPagesDir = getInertiaPagesDir();

function getInertiaPagesDir() {
  const cwd = process.cwd();
  const pagesDir = path.join(cwd, "resources", "js", "inertia-pages");
  return pagesDir;
}
