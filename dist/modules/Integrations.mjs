import ItemPiles from "./module-integrations/ItemPiles.mjs";
import ATL from "./module-integrations/ATL.mjs";

export default class Integrations {
  /**
   * @type {ItemPiles}
   */
  itemPiles;
  /**
   * @type {ATL}
   */
  atl;

  constructor() {
    if (game.modules.get("item-piles")?.active)
      this.itemPiles = new ItemPiles();

    if (game.modules.get("ATL")?.active)
      this.atl = new ATL();
  }


  /**
   * Bind hooks for each module integration
   */
  bindHooks() {
    //
  }

  /**
   * Register Settings for module integration
   */
  registerSettings() {
    this.atl?.registerSettings();
    this.itemPiles?.registerSettings();
  }

  ready() {
    this.itemPiles?.initialize();
  }

  /**
   * Methods that will run automatically once when module is first installed.
   */
  initialConfig() {
    //
  }
}