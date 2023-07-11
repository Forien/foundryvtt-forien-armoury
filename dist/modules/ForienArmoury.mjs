import Utility from "./Utility.mjs";
import ItemRepair from "./ItemRepair.mjs";
import TemporaryRunes from "./Runes.mjs";
import ArrowReclamation from "./ArrowReclamation.js";

export default class ForienArmoury {
  /**
   * @type TemporaryRunes
   */
  runes;
  /**
   * @type ItemRepair
   */
  itemRepair;
  /**
   * @type ArrowReclamation
   */
  arrowReclamation;
  /**
   * @type SocketlibSocket
   */
  socket;

  constructor() {
    Utility.init('forien-armoury',"Forien's Armoury");

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
    this.arrowReclamation = new ArrowReclamation();
  }

  /**
   * Binds hooks
   */
  #bindHooks() {
    Hooks.once('ready', () => {
      if (game.modules.get("socketlib")?.active) {
        this.socket = socketlib.registerModule('forien-armoury');
        this.arrowReclamation.registerSockets(this.socket);
      }
    });

    this.runes.bindHooks();
    this.itemRepair.bindHooks();
    this.arrowReclamation.bindHooks();

    Utility.notify("Hooks registered.", {consoleOnly: true});
  }

  /**
   * Preloads templates used by the modules.
   */
  async #preloadTemplates() {
      Utility.notify("Preloading Templates.", {consoleOnly: true})
      let itemRepairTemplates = this.itemRepair.getTemplates();
      let arrowReclamationTemplates = this.arrowReclamation.getTemplates();
      let templates = [...itemRepairTemplates, ...arrowReclamationTemplates];

      templates = templates.map(Utility.getTemplate);

      loadTemplates(templates).then(() => {
        Utility.notify("Templates preloaded.", {consoleOnly: true})
      });
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
    // Add enable/disable setting for temporary runes damaging items
    game.settings.register('forien-armoury', 'runes.damageEnable', {
      name: 'Forien.Armoury.Settings.Runes.Enable',
      hint: 'Forien.Armoury.Settings.Runes.EnableHint',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean
    });
    
    // Add enable/disable setting for arrow reclamation feature
    game.settings.register('forien-armoury', 'arrowReclamation.Enable', {
      name: 'Forien.Armoury.Settings.ArrowReclamation.Enable',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.EnableHint',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean
    });

    // Add enable/disable recovery of Arrows
    game.settings.register('forien-armoury', 'arrowReclamation.EnableArrows', {
      name: 'Forien.Armoury.Settings.ArrowReclamation.EnableArrows',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.EnableArrowsHint',
      scope: 'world',
      config: true,
      default: true,
      type: Boolean
    });
    // Add enable/disable recovery of Bolts
    game.settings.register('forien-armoury', 'arrowReclamation.EnableBolts', {
      name: 'Forien.Armoury.Settings.ArrowReclamation.EnableBolts',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.EnableBoltsHint',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean
    });
    // Add enable/disable recovery of Bullets
    game.settings.register('forien-armoury', 'arrowReclamation.EnableBullets', {
      name: 'Forien.Armoury.Settings.ArrowReclamation.EnableBullets',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.EnableBulletsHint',
      scope: 'world',
      config: true,
      default: true,
      type: Boolean
    });

    // Add setting that allows for different rules of arrow reclamation
    game.settings.register('forien-armoury', 'arrowReclamation.Rule', {
      name: 'Forien.Armoury.Settings.ArrowReclamation.Rule',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.RuleHint',
      scope: 'world',
      config: true,
      default: 'default',
      type: String,
      choices: {
        'default': 'Forien.Armoury.Settings.ArrowReclamation.DefaultRule',
        'success': 'Forien.Armoury.Settings.ArrowReclamation.SuccessRule',
        'noCrit': 'Forien.Armoury.Settings.ArrowReclamation.NoCritRule',
        'successNoCrit': 'Forien.Armoury.Settings.ArrowReclamation.SuccessNoCritRule',
        'failure': 'Forien.Armoury.Settings.ArrowReclamation.FailureRule',
        'failureNoCrit': 'Forien.Armoury.Settings.ArrowReclamation.FailureNoCritRule',
        'percentage': 'Forien.Armoury.Settings.ArrowReclamation.PercentageRule',
        'percentageNoCrit': 'Forien.Armoury.Settings.ArrowReclamation.PercentageNoCritRule',
      }
    });

    // Add Percentage setting for Percentage rules
    game.settings.register('forien-armoury', 'arrowReclamation.Percentage', {
      name: 'Forien.Armoury.Settings.ArrowReclamation.Percentage',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.PercentageHint',
      scope: 'world',
      config: true,
      default: 50,
      type: Number
    });
  }
}
