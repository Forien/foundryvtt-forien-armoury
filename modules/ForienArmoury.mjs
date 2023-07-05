import Utility from "./Utility.mjs";
import ItemRepair from "./ItemRepair.mjs";
import TemporaryRunes from "./Runes.mjs";

export default class ForienArmoury {
  /**
   * @type TemporaryRunes
   */
  runes;
  /**
   * @type ItemRepair
   */
  itemRepair;

  constructor() {
    this.runes = TemporaryRunes;
    this.itemRepair = ItemRepair;
    Utility.init("Forien's Armoury");

    this._bindHooks();

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
}
