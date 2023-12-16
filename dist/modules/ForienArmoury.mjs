import Utility from "./utility/Utility.mjs";
import ItemRepair from "./features/ItemRepair.mjs";
import TemporaryRunes from "./features/Runes.mjs";
import ArrowReclamation from "./features/ArrowReclamation.mjs";
import Settings from "./Settings.mjs";
import Integrations from "./Integrations.mjs";
import {constants, settings} from "./constants.mjs";
import CombatFatigue from "./features/CombatFatigue.mjs";
import ItemProperties from "./features/ItemProperties.mjs";
import {Debug} from "./utility/Debug.mjs";
import {styleHelpers} from "./helpers/styleHelpers.js";
import CastingFatigue from "./features/CastingFatigue.mjs";
import SettingsApp from "./apps/SettingsApp.mjs";
import CheckCareers from "./features/CheckCareers.mjs";

export default class ForienArmoury {
  /**
   * List of Modules to be initialized and added to API
   */
  #modules = [
    ArrowReclamation,
    CastingFatigue,
    CheckCareers,
    CombatFatigue,
    Integrations,
    ItemProperties,
    ItemRepair,
    TemporaryRunes,
  ]

  /**
   * Actually initialized modules
   */
  modules = new Map();

  /**
   * @type {SocketlibSocket}
   * @public
   */
  #socket;

  /**
   * @type {{}}
   * @public
   */
  helpers;

  /**
   * @type {Settings}
   * @public
   */
  #settings;

  constructor() {
    this.#initializeModules();
    this.#bindHooks();
    this.#preloadTemplates();
    this.#hackWFRP4e();
    this.#registerSettings();

    Utility.notify("Module initialized!", {consoleOnly: true});
  }

  /**
   *
   * @return {TemporaryRunes}
   */
  get runes() {
    return this.modules.get('temporaryRunes');
  }

  /**
   *
   * @return {ItemRepair}
   */
  get itemRepair() {
    return this.modules.get('itemRepair');
  }

  /**
   * @return {CombatFatigue}
   */
  get combatFatigue() {
    return this.modules.get('combatFatigue');
  };

  /**
   * @return {CastingFatigue}
   */
  get castingFatigue() {
    return this.modules.get('castingFatigue');
  };

  /**
   * @return {ItemProperties}
   */
  get itemProperties() {
    return this.modules.get('itemProperties');
  };

  /**
   * @return {ArrowReclamation}
   */
  get arrowReclamation() {
    return this.modules.get('arrowReclamation');
  };

  /**
   * @return {CheckCareers}
   */
  get checkCareers() {
    return this.modules.get('checkCareers');
  };

  /**
   * @return {Integrations}
   */
  get integrations() {
    return this.modules.get('integrations');
  };

  /**
   * Initializes API modules
   */
  #initializeModules() {
    for (let module of this.#modules) {
      const Module = new module();
      this.modules.set(Module.camelName, Module);
    }

    this.#settings = new Settings();

    this.helpers = {
      styles: styleHelpers
    };
  }

  /**
   * Binds hooks
   */
  #bindHooks() {
    Hooks.once('ready', () => {
      if (game.modules.get("socketlib")?.active) {
        this.#socket = socketlib.registerModule(constants.moduleId);
        this.modules.get('arrowReclamation').registerSockets(this.#socket);
      }

      if (game.settings.get(constants.moduleId, settings.initialized) === false) {
        this.#initialConfig()
      }
    });

    this.modules.forEach(module => module.bindHooks());

    Utility.notify("Hooks registered.", {consoleOnly: true});
  }

  /**
   * Preloads templates used by the modules.
   */
  #preloadTemplates() {
    const templates = {
      [constants.moduleId]: {
        settings: SettingsApp.partials
      }
    };

    this.modules.forEach((module, name) => {
      templates[constants.moduleId][name] = module.getTemplates();
    })


    Utility.preloadTemplates(templates);
  }

  /**
   * Not really hacking anything, just adding entries to system config for increased compatibility.
   *
   * For example, adding a Runebound lore so Runebound Spells can be searched via Item Browser
   */
  #hackWFRP4e() {
    game.wfrp4e.config.magicLores.runebound = 'Forien.Armoury.Runebound.LoreName';
    this.modules.get('itemProperties').appendProperties();

    Utility.notify("WFRP4e patched.", {consoleOnly: true});
  }

  /**
   * Registers settings with the Foundry
   */
  #registerSettings() {
    this.#settings.registerSettings();
    this.modules.forEach((module) => {
      module.registerSettings();
    })
    Debug.registerSetting();
  }

  #initialConfig() {
    this.modules.forEach((module) => {
      module.registerSettings();
    })
  }

  /**
   * Returns the version of the API.
   * @return {string}
   */
  version() {
    return '1.1.0';
  }
}
