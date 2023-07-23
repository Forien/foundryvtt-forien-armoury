import ItemPiles from "./module-integrations/ItemPiles.mjs";
import ATL from "./module-integrations/ATL.mjs";

export default class Integrations {
  /**
   * @type ItemPiles
   */
  itemPiles;
  /**
   * @type ATL
   */
  ATL;

  constructor() {
    this.itemPiles = new ItemPiles();
    this.ATL = new ATL();
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
    this.ATL.registerSettings();
    this.itemPiles.registerSettings();
  }

  /**
   * Methods that will run automatically once when module is first installed.
   */
  initialConfig() {
    //
  }
}