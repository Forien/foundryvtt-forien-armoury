import ScrollTest from "../tests/ScrollTest.mjs";
import Utility from "../utility/Utility.mjs";
import {debug} from "../utility/Debug.mjs";


export default class ScrollDialog extends CastDialog {

  testClass = ScrollTest;
  chatTemplate = Utility.getTemplate("chat-rolls/scroll-card.hbs");

  /**
   * @inheritDoc
   *
   * @returns {{}}
   */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes = options.classes.concat(["spell-roll-dialog"]);
    return options;
  }

  /**
   * @inheritDoc
   *
   * @param {{}} fields
   * @param {{}} data
   * @param {{}} options
   *
   * @returns {Promise<ScrollDialog>}
   */
  static async setup(fields = {}, data = {}, options = {}) {
    options.title = options.title || game.i18n.localize("Forien.Armoury.Scrolls.ScrollTest") + " - " + data.scroll.name;
    options.title += options.appendTitle || "";

    data.skill = data.skill ?? data.spell.skillToUse;
    data.characteristic = data.skill?.system?.characteristic?.key || "int";

    data.scripts = data.scripts.concat(data.spell?.getScripts("dialog"), data.skill?.getScripts("dialog") || [])

    return new Promise(resolve => {
      new this(data, fields, options, resolve).render(true);
    });
  }

  /**
   * @inheritDoc
   *
   * @returns {{}}
   * @protected
   */
  _getSubmissionData() {
    let data = super._getSubmissionData();

    data.item = this.data.spell;
    data.scroll = this.data.scroll;

    return data;
  }
}