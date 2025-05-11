import {constants} from "constants";
import Utility     from "../utility/Utility.mjs";


/**
 * @extends BaseWFRP4eItemSheet
 */
export default class GrimoireSheet extends BaseWFRP4eItemSheet {
  static DEFAULT_OPTIONS = {
    classes: ['forien-armoury', 'grimoire-sheet'],
  }

  static PARTS = {
    header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/item/item-header.hbs', classes: ["sheet-header"] },
    tabs: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/item-tabs.hbs' },
    description: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/tabs/item-description.hbs' },
    details: { scrollable: [""], template: `modules/${constants.moduleId}/templates/apps/grimoire/details.hbs` },
    effects: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/tabs/item-effects.hbs' },
  }


  /**
   * @inheritDoc
   *
   * @returns {Promise<{}>}
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.spells = await this.item.system.loadSpells();
    context.magicLores = game.wfrp4e.config.magicLores;
    context.hideSpells = this.item.system.hideSpells && !game.user.isGM;
    context.canEditLanguage = game.user.isGM || !this.item.system.language;

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
      return Utility.notify(game.i18n.localize("Forien.Armoury.Scrolls.ItemNotFound"), {type: "error", data: {data, event}, trace: true});

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

    return this.item.system.addSpell(item).then(() => this.render());
  }

  /**
   * @inheritDoc
   */
  async _onRender(context, options) {
    await super._onRender(context, options);

    if (this.item.system.hideSpells) return;

    this.element.querySelectorAll(".spell img").forEach(e => e.addEventListener("click", this.#onSpellClick.bind(this)));
    this.element.querySelectorAll(".spells-remove").forEach(e => e.addEventListener("click", this.#onSpellsRemoveClick.bind(this)));
    this.element.querySelectorAll(".generate-description").forEach(e => e.addEventListener("click", this.#onGenerateDescriptionClick.bind(this)));
    this.element.querySelectorAll(".spell-name input").forEach(e => e.addEventListener("change", this.#onSpellLabelChange.bind(this)));
  }

  /**
   * Open Spell's Sheet when clicked on Spell
   *
   * @param {MouseEvent} event
   */
  #onSpellClick(event) {
    const uuid = event.currentTarget.closest('.spell').dataset.uuid;

    fromUuid(uuid).then(item => item?.sheet.render(true));
  }

  /**
   * Remove all Spells from Grimoire
   */
  #onSpellsRemoveClick(event) {
    this.item.update({"system.spells": []});
  }

  /**
   * Generates Grimoire's description
   */
  #onGenerateDescriptionClick(event) {
    this.item.system.generateDescription();
  }

  /**
   * Update name of the spell written in Grimoire
   */
  #onSpellLabelChange(event) {
    const uuid = event.currentTarget.closest('.spell').dataset.uuid;
    const value = event.currentTarget.value;

    this.item.system.changeSpellsName(uuid, value);
  }
}