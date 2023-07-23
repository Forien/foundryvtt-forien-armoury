// import ItemPiles from "./module-integrations/ItemPiles.mjs";
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
    // this.itemPiles = new ItemPiles();
    this.ATL = new ATL();
  }


  /**
   * Binds hooks
   */
  bindHooks() {
    // this.itemPiles.bindHooks();
  }

  registerSettings() {
    this.ATL.registerSettings();
  }

  initialConfig() {
    // probably shouldn't be forced on players...
    //this.ATL.setPresets();
  }
}