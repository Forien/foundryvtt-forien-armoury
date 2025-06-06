import {compilePack, extractPack}     from "@foundryvtt/foundryvtt-cli";
import logger                         from "fancy-log";
import fs                             from "fs";
import {default as YAML}              from "js-yaml";
import {readdir, readFile, writeFile} from "node:fs/promises";
import path                           from "path";
import yargs                          from "yargs";
import {hideBin}                      from "yargs/helpers";
import {foundryPath, getManifest}     from "./_common.mjs";

/**
 * Retrieves the manifest information of the package.
 *
 * @type {Object}
 * @property {string} name
 * @property {string} version
 * @property {Object} dependencies
 * @property {string} description
 * @property {Array} resources
 */
const manifest = getManifest();

/**
 * @type {"yaml"|"json"}
 */
const FORMAT = "yaml";

/**
 * @type {"yml"|"json"}
 */
const EXT = FORMAT ? "yml" : "json";

/**
 * Folder where the compiled compendium packs should be located relative to the
 * base package folder.
 * @type {string}
 */
const PACK_DEST = `${foundryPath(manifest.id)}/packs`;

/**
 * Folder where source JSON files should be located relative to the package folder.
 * @type {string}
 */
const PACK_SRC = "packs/_source";


yargs(hideBin(process.argv))
  .command(packageCommand())
  .help()
  .alias("help", "h")
  .argv;

function packageCommand() {
  return {
    command: "package [action] [pack] [entry]",
    describe: "Manage packages",
    builder: yargs => {
      yargs.positional("action", {
        describe: "The action to perform.",
        type: "string",
        choices: ["unpack", "pack", "clean"],
      });
      yargs.positional("pack", {
        describe: "Name of the pack upon which to work.",
        type: "string",
      });
      yargs.positional("entry", {
        describe: "Name of any entry within a pack upon which to work. Only applicable to extract & clean commands.",
        type: "string",
      });
    },
    handler: async argv => {
      const {action, pack, entry} = argv;
      switch (action) {
        case "clean":
          return await cleanPacks(pack, entry);
        case "pack":
          return await compilePacks(pack);
        case "unpack":
          return await extractPacks(pack, entry);
      }
    },
  };
}

/**
 * Removes unwanted flags, permissions, and other data from entries before extracting or compiling.
 * @param {object} data                           Data for a single entry to clean.
 * @param {object} [options={}]
 * @param {boolean} [options.clearSourceId=true]  Should the core sourceId flag be deleted.
 * @param {number} [options.ownership=0]          Value to reset default ownership to.
 */
function cleanPackEntry(data, {clearSourceId = true, ownership = 0} = {}) {
  if (data.ownership) data.ownership = {default: ownership};
  if (clearSourceId) {
    delete data._stats?.compendiumSource;
    delete data.flags?.core?.sourceId;
  }

  if (data._stats?.lastModifiedBy) data._stats.lastModifiedBy = "forien0000000000";

  // Remove empty entries in flags
  if (!data.flags) data.flags = {};
  Object.entries(data.flags).forEach(([key, contents]) => {
    if (Object.keys(contents).length === 0) delete data.flags[key];
  });

  // Remove mystery-man.svg from Actors
  if (["character", "npc"].includes(data.type) && data.img === "icons/svg/mystery-man.svg") {
    data.img = "";
    data.prototypeToken.texture.src = "";
  }

  if (data.effects) data.effects.forEach(i => cleanPackEntry(i, {clearSourceId: false}));
  if (data.items) data.items.forEach(i => cleanPackEntry(i, {clearSourceId: false}));
  if (data.pages) data.pages.forEach(i => cleanPackEntry(i, {ownership: -1}));
  if (data.label) data.label = cleanString(data.label);
  if (data.name) data.name = cleanString(data.name);
}


/**
 * Removes invisible whitespace characters and normalizes single- and double-quotes.
 * @param {string} str  The string to be cleaned.
 * @returns {string}    The cleaned string.
 */
function cleanString(str) {
  return str.replace(/\u2060/gu, "")
    .replace(/[‘’]/gu, "'")
    .replace(/[“”]/gu, "\"");
}


/**
 * Cleans and formats source JSON files, removing unnecessary permissions and flags and adding the proper spacing.
 * @param {string} [packName]   Name of pack to clean. If none provided, all packs will be cleaned.
 * @param {string} [entryName]  Name of a specific entry to clean.
 *
 * - `npm run build:clean` - Clean all source JSON files.
 * - `npm run build:clean -- classes` - Only clean the source files for the specified compendium.
 * - `npm run build:clean -- classes Barbarian` - Only clean a single item from the specified compendium.
 */
async function cleanPacks(packName, entryName) {
  entryName = entryName?.toLowerCase();
  const folders = fs.readdirSync(PACK_SRC, {withFileTypes: true})
    .filter(file => file.isDirectory() && (!packName || packName === file.name));

  /**
   * Walk through directories to find JSON files.
   * @param {string} directoryPath
   * @yields {string}
   */
  async function* _walkDir(directoryPath) {
    const directory = await readdir(directoryPath, {withFileTypes: true});
    for (const entry of directory) {
      const entryPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) yield* _walkDir(entryPath);
      else if (path.extname(entry.name) === `.${EXT}`) yield entryPath;
    }
  }

  for (const folder of folders) {
    logger.info(`Cleaning pack ${folder.name}`);
    for await (const src of _walkDir(path.join(PACK_SRC, folder.name))) {
      const contents = await readFile(src, {encoding: "utf8"});
      const data = FORMAT === "json" ? JSON.parse(contents) : YAML.load(contents);
      if (entryName && entryName !== data.name.toLowerCase()) continue;
      if (!data._id || !data._key) {
        console.log(`Failed to clean \x1b[31m${src}\x1b[0m, must have _id and _key.`);
        continue;
      }
      cleanPackEntry(data);
      fs.rmSync(src, {force: true});
      const dump = FORMAT === "json" ? JSON.stringify(data, null, 2) : YAML.dump(data);
      writeFile(src, `${dump}\n`, {mode: 0o664});
    }
  }
}


/* ----------------------------------------- */
/*  Compile Packs                            */

/* ----------------------------------------- */

/**
 * Compile the source JSON files into compendium packs.
 * @param {string} [packName]       Name of pack to compile. If none provided, all packs will be packed.
 *
 * - `npm run build:db` - Compile all JSON files into their LevelDB files.
 * - `npm run build:db -- classes` - Only compile the specified pack.
 */
async function compilePacks(packName) {
  const yaml = FORMAT === "yaml";
  // Determine which source folders to process
  const folders = fs.readdirSync(PACK_SRC, {withFileTypes: true})
    .filter(file => file.isDirectory() && (!packName || packName === file.name));

  for (const folder of folders) {
    const src = path.join(PACK_SRC, folder.name);
    const dest = path.join(PACK_DEST, folder.name);
    logger.info(`Compiling pack ${folder.name}`);
    await compilePack(src, dest, {
      yaml,
      recursive: true,
      log: true,
      transformEntry: cleanPackEntry,
    });
  }
}


/* ----------------------------------------- */
/*  Extract Packs                            */

/* ----------------------------------------- */

/**
 * Extract the contents of compendium packs to JSON files.
 * @param {string} [packName]       Name of pack to extract. If none provided, all packs will be unpacked.
 * @param {string} [entryName]      Name of a specific entry to extract.
 *
 * - `npm build:json - Extract all compendium LevelDB files into JSON files.
 * - `npm build:json -- classes` - Only extract the contents of the specified compendium.
 * - `npm build:json -- classes Barbarian` - Only extract a single item from the specified compendium.
 */
async function extractPacks(packName, entryName) {
  entryName = entryName?.toLowerCase();
  const yaml = FORMAT === "yaml";

  // Determine which source packs to process.
  const packs = manifest.packs.filter(p => !packName || p.name === packName);

  for (const packInfo of packs) {
    const dest = path.join(PACK_SRC, packInfo.name);
    const packPath = `${foundryPath(manifest.id)}/${packInfo.path}`;
    logger.info(`Extracting pack ${packInfo.name} from ${packPath} to ${dest}`);

    const folders = {};
    const containers = {};
    await extractPack(packPath, dest, {
      yaml,
      log: false,
      transformEntry: e => {
        if (e._key.startsWith("!folders")) folders[e._id] = {name: slugify(e.name), folder: e.folder};
        else if (e.type === "container") containers[e._id] = {
          name: slugify(e.name), container: e.system?.container, folder: e.folder,
        };

        return false;
      },
    });
    const buildPath = (collection, entry, parentKey) => {
      let parent = collection[entry[parentKey]];
      entry.path = entry.name;
      while (parent) {
        entry.path = path.join(parent.name, entry.path);
        parent = collection[parent[parentKey]];
      }
    };
    Object.values(folders).forEach(f => buildPath(folders, f, "folder"));
    Object.values(containers).forEach(c => {
      buildPath(containers, c, "container");
      const folder = folders[c.folder];
      if (folder) c.path = path.join(folder.path, c.path);
    });

    await extractPack(packPath, dest, {
      yaml,
      log: true,
      transformEntry: entry => {
        if (entryName && entryName !== entry.name.toLowerCase()) return false;
        cleanPackEntry(entry);
      },
      transformName: entry => {
        if (entry._id in folders) return path.join(folders[entry._id].path, `_folder.${EXT}`);
        if (entry._id in containers) return path.join(containers[entry._id].path, `_container.${EXT}`);
        const outputName = slugify(entry.name);
        const parent = containers[entry.system?.container] ?? folders[entry.folder];

        return path.join(parent?.path ?? "", `${outputName}.${EXT}`);
      },
    });
  }
}

/**
 * Standardize name format.
 * @param {string} name
 * @returns {string}
 */
function slugify(name) {
  return name.toLowerCase()
    .replace("'", "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .replace(/\s+|-{2,}/g, "-");
}
