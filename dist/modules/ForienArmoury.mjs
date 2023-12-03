import Utility from "./utility/Utility.mjs";
import ItemRepair from "./ItemRepair.mjs";
import TemporaryRunes from "./Runes.mjs";
import ArrowReclamation from "./ArrowReclamation.mjs";
import Settings from "./Settings.mjs";
import Integrations from "./Integrations.mjs";
import CheckCareers from "./CheckCareers.mjs";
import {constants, settings} from "./constants.mjs";
import CombatFatigue from "./CombatFatigue.mjs";
import ItemProperties from "./ItemProperties.mjs";

export default class ForienArmoury {
  /**
   * @type SocketlibSocket
   */
  socket;
  /**
   * @type TemporaryRunes
   */
  runes;
  /**
   * @type ItemRepair
   */
  itemRepair;
  /**
   * @type CombatFatigue
   */
  combatFatigue;
  /**
   * @type ItemProperties
   */
  itemProperties;
  /**
   * @type ArrowReclamation
   */
  arrowReclamation;
  /**
   * @type CheckCareers
   */
  checkCareers;
  /**
   * @type Integrations
   */
  integrations;
  /**
   * @type Settings
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
   * Initializes API modules
   */
  #initializeModules() {
    this.runes = new TemporaryRunes();
    this.itemRepair = new ItemRepair();
    this.combatFatigue = new CombatFatigue();
    this.itemProperties = new ItemProperties();
    this.arrowReclamation = new ArrowReclamation();
    this.checkCareers = CheckCareers;
    this.integrations = new Integrations();
    this.#settings = new Settings();
  }

  /**
   * Binds hooks
   */
  #bindHooks() {
    Hooks.once('ready', () => {
      if (game.modules.get("socketlib")?.active) {
        this.socket = socketlib.registerModule(constants.moduleId);
        this.arrowReclamation.registerSockets(this.socket);
      }

      if (game.settings.get(constants.moduleId, settings.initialized) === false) {
        this.#initialConfig()
      }
    });

    this.runes.bindHooks();
    this.itemRepair.bindHooks();
    this.combatFatigue.bindHooks();
    this.itemProperties.bindHooks();
    this.arrowReclamation.bindHooks();
    this.integrations.bindHooks();

    Utility.notify("Hooks registered.", {consoleOnly: true});
  }

  /**
   * Preloads templates used by the modules.
   */
  #preloadTemplates() {
      let itemRepairTemplates = this.itemRepair.getTemplates();
      let arrowReclamationTemplates = this.arrowReclamation.getTemplates();
      let checkCareersTemplates = this.checkCareers.templates;
      let templates = [...itemRepairTemplates, ...arrowReclamationTemplates, ...checkCareersTemplates];

      Utility.preloadTemplates(templates);
  }

  /**
   * Not really hacking anything, just adding entries to system config for increased compatibility.
   *
   * For example, adding a Runebound lore so Runebound Spells can be searched via Item Browser
   */
  #hackWFRP4e() {
    game.wfrp4e.config.magicLores.runebound = 'Forien.Armoury.Runebound.LoreName'

    Utility.notify("WFRP4e patched.", {consoleOnly: true});
  }

  /**
   * Registers settings with the Foundry
   */
  #registerSettings() {
    this.#settings.registerSettings();
    this.integrations.registerSettings();
  }

  #initialConfig() {
    this.integrations.initialConfig();
  }

  /**
   * Returns the version of the API.
   * @return {string}
   */
  version() {
    return '1.0.0';
  }
}
