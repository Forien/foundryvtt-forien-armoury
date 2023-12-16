import ItemPiles from "./module-integrations/ItemPiles.mjs";
import ATL from "./module-integrations/ATL.mjs";
import ForienBaseModule from "./utility/ForienBaseModule.mjs";

export default class Integrations extends ForienBaseModule {
  /**
   * @type {ItemPiles}
   */
  itemPiles;
  /**
   * @type {ATL}
   */
  atl;

  constructor() {
    let superReturn = super();

    if (game.modules.get("item-piles")?.active)
      this.itemPiles = new ItemPiles();

    if (game.modules.get("ATL")?.active)
      this.atl = new ATL();

    return superReturn;
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

  onReady() {
    this.itemPiles?.initialize();
  }

  /**
   * Methods that will run automatically once when module is first installed.
   */
  initialConfig() {
    //
  }
}