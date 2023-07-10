import Utility from "./Utility.mjs";
import ItemRepair from "./ItemRepair.mjs";
import TemporaryRunes from "./Runes.mjs";

export default class ForienArmoury {
  /**
   * @type TemporaryRunes
   */
  runes = TemporaryRunes;
  /**
   * @type ItemRepair
   */
  itemRepair= ItemRepair;

  constructor() {
    Utility.init('forien-armoury',"Forien's Armoury");

    this.#bindHooks();
    this.#preloadTemplates();
    this.#hackWFRP4e();

    Utility.notify("Module initialized!", {consoleOnly: true});
  }

  /**
   * Binds hooks
   */
  #bindHooks() {
    this.runes.bindHooks();
    this.itemRepair.bindHooks();

    Utility.notify("Hooks registered.", {consoleOnly: true});
  }

  /**
   * Preloads templates used by the modules.
   */
  async #preloadTemplates() {
      Utility.notify("Preloading Templates.", {consoleOnly: true})
      let itemRepairTemplates = this.itemRepair.getTemplates();
      let templates = [...itemRepairTemplates];

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
}
