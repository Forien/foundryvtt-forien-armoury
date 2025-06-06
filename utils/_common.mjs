import fs from "fs";
import {configDotenv} from "dotenv";

configDotenv();

/**
 * Generates the file path for the foundry module based on the current environment mode.
 *
 * @param {string} moduleId - The identifier of the specific module.
 * @return {string} The path to the module directory, either in the production or development environment.
 */
export function foundryPath(moduleId) {
  return process.env.MODE === "production"
    ? "./dist"
    : `${process.env.FOUNDRY_DATA}/modules/${moduleId}`;
}

export function getManifest() {
  return JSON.parse(fs.readFileSync("./static/module.json", {encoding: "utf8"}));
}
