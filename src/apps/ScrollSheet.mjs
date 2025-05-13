import {constants} from "../constants.mjs";
import Utility     from "../utility/Utility.mjs";


/**
 * @extends BaseWFRP4eItemSheet
 */
export default class ScrollSheet extends BaseWFRP4eItemSheet {
  static DEFAULT_OPTIONS = {
    classes: ["forien-armoury", "scroll-sheet"],
  };

  static PARTS = {
    header: {
      scrollable: [""],
      template: "systems/wfrp4e/templates/sheets/item/item-header.hbs",
      classes: ["sheet-header"],
    },
    tabs: {scrollable: [""], template: "systems/wfrp4e/templates/sheets/item/item-tabs.hbs"},
    description: {scrollable: [""], template: "systems/wfrp4e/templates/sheets/item/tabs/item-description.hbs"},
    details: {scrollable: [""], template: `modules/${constants.moduleId}/templates/apps/scroll/details.hbs`},
    effects: {scrollable: [""], template: "systems/wfrp4e/templates/sheets/item/tabs/item-effects.hbs"},
  };

  /**
   * @inheritDoc
   *
   * @returns {Promise<{}>}
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.spell = await fromUuid(this.item.system.spellUuid);
    context.magicLores = game.wfrp4e.config.magicLores;

    return context;
  }

  /**
   * @inheritDoc
   *
   * @param {DragEvent} event
   * @returns {Promise<ItemWFRP4e|boolean>}
   * @protected
   */
  async _onDrop(event) {
    let done = await super._onDrop(event);
    if (done) return done;

    let data = JSON.parse(event.dataTransfer.getData("text/plain"));

    if (data.type !== "Item")
      return false;

    let item = await Item.implementation.fromDropData(data);

    if (!item)
      return Utility.notify(
        game.i18n.localize("Forien.Armoury.Scrolls.ItemNotFound"),
        {type: "error", data: {data, event}, trace: true},
      );

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

  /**
   * @inheritDoc
   */
  async _onRender(context, options) {
    await super._onRender(context, options);

    this.element.querySelectorAll(".spell").forEach(e => e.addEventListener(
      "click",
      this.#onScrollSpellClick.bind(this),
    ));
    this.element.querySelectorAll(".spell-container .spell-refresh").forEach(e => e.addEventListener(
      "click",
      this.#onSpellRefreshClick.bind(this),
    ));
  }

  /**
   * Open Spell's Sheet when clicked on Spell
   *
   * @param {MouseEvent} event
   */
  #onScrollSpellClick(event) {
    const uuid = event.currentTarget.closest(".spell-container").dataset.uuid;

    fromUuid(uuid).then(item => item?.sheet.render(true));
  }

  /**
   * Reloads the Data for Spell.
   *
   * @param {MouseEvent} event
   */
  #onSpellRefreshClick(event) {
    const uuid = event.currentTarget.closest(".spell-container").dataset.uuid;

    fromUuid(uuid).then(() => this.render(true));
  }
}
