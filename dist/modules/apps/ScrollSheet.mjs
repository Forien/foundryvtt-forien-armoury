import {constants} from "../constants.mjs";
import Utility from "../utility/Utility.mjs";


/**
 * @extends ItemSheetWfrp4e
 */
export default class ScrollSheet extends ItemSheetWfrp4e {
  static get defaultOptions() {
    const options = super.defaultOptions;

    options.classes.push('forien-armoury', 'scroll-sheet', 'item-sheet');

    return options;
  }

  get template() {
    return `modules/${constants.moduleId}/templates/apps/scroll/sheet.hbs`;
  }

  async getData() {
    const data = await super.getData();

    data.width = 550;
    data.spell = await fromUuid(this.item.system.spellUuid);
    data.magicLores = game.wfrp4e.config.magicLores;

    return data;
  }

  async _onDrop(event)
  {
    let done = await super._onDrop(event);
    if (done) return done;

    let data = JSON.parse(event.dataTransfer.getData("text/plain"));

    if (data.type !== "Item")
      return false;

    let item = await Item.implementation.fromDropData(data);

    if (!item)
      return Utility.notify(game.i18n.localize("Forien.Armoury.Scrolls.ItemNotFound"), {type: "error"});

    // If dragged a Spell from Actor, retrieve the original World/Compendium Spell
    if (item.parent instanceof Actor) {
      const sourceUuid = item.flags.core.sourceId;
      let sourceItem = await fromUuid(sourceUuid);

      if (!sourceItem || item.uuid === item.flags.core.sourceId)
        return Utility.notify(game.i18n.localize("Forien.Armoury.Scrolls.MustHaveSource"), {type: "warning"});

      item = sourceItem;
    }

    if (item.type !== "spell")
      return Utility.notify(game.i18n.localize("Forien.Armoury.Scrolls.NotASpell"), {type: "warning"});

    if (!item.system.lore?.value)
      return Utility.notify(game.i18n.localize("Forien.Armoury.Scrolls.MustHaveLore"), {type: "warning"});

    return this.item.update({"system.spellUuid": item.uuid}).then(() => this.render());
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.on("click", ".scroll-spell", this.#onScrollSpellClick.bind(this))
    html.on("click", ".spell .spell-refresh", this.#onSpellRefreshClick.bind(this))
  }

  #onScrollSpellClick(event) {
    const uuid = event.currentTarget.closest('.spell').dataset.uuid;

    fromUuid(uuid).then(item => item?.sheet.render(true));
  }

  #onSpellRefreshClick(event) {
    const uuid = event.currentTarget.closest('.spell').dataset.uuid;

    fromUuid(uuid).then(() => this.render(true));
  }
}