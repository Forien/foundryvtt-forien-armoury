import {constants} from "../constants.mjs";


/**
 * @extends ItemSheetWfrp4e
 */
export default class ScrollSheet extends ItemSheetWfrp4e {
  get template() {
    return `modules/${constants.moduleId}/templates/apps/scroll/sheet.hbs`;
  }

}