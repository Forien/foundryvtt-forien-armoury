import ScrollTest from "../tests/ScrollTest.mjs";
import Utility from "../utility/Utility.mjs";


export default class ScrollDialog extends CastDialog {

  testClass = ScrollTest;
  chatTemplate = Utility.getTemplate("chat-rolls/scroll-card.hbs");

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes = options.classes.concat(["spell-roll-dialog"]);
    return options;
  }

  static async setup(fields = {}, data = {}, options = {}) {
    let spell = data.spell;
    options.title = options.title || game.i18n.localize("Forien.Armoury.Scrolls.ScrollTest") + " - " + spell.name;
    options.title += options.appendTitle || "";

    data.skill = data.skill ?? spell.skillToUse;
    data.characteristic = data.skill?.system?.characteristic?.key || "int";

    data.scripts = data.scripts.concat(data.spell?.getScripts("dialog"), data.skill?.getScripts("dialog") || [])

    console.log("ScrollDialog.setup()", data.skill, data.characteristic)
    return new Promise(resolve => {
      new this(fields, data, resolve, options).render(true);
    });
  }

  _constructTestData() {
    let data = super._constructTestData();

    data.item = this.data.spell;

    return data;
  }
}