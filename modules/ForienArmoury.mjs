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

    this._bindHooks();
    this._preloadTemplates();

    Utility.notify("Module initialized!");
  }

  /**
   * @private
   */
  _bindHooks() {
    this.runes.bindHooks();
    this.itemRepair.bindHooks();

    Utility.notify("Hooks registered.");
  }

  /**
   * @private
   */
  async _preloadTemplates() {
      Utility.notify("Preloading Templates.")
      let itemRepairTemplates = this.itemRepair.getTemplates();
      let templates = [...itemRepairTemplates];

      templates = templates.map(Utility.getTemplate);

      loadTemplates(templates).then(templates => {
        Utility.notify("Templates preloaded.")
      });
  }
}
