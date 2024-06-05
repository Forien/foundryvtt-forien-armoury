import {constants} from "../constants.mjs";
import Utility from "../utility/Utility.mjs";


/**
 * @extends ItemSheetWfrp4e
 */
export default class GrimoireSheet extends ItemSheetWfrp4e {
  /**
   * @inheritDoc
   *
   * @returns {{}}
   */
  static get defaultOptions() {
    const options = super.defaultOptions;

    options.classes.push('forien-armoury', 'grimoire-sheet');

    return options;
  }

  /**
   * @inheritDoc
   *
   * @returns {string}
   */
  get template() {
    return `modules/${constants.moduleId}/templates/apps/grimoire/sheet.hbs`;
  }

  /**
   * @inheritDoc
   *
   * @returns {Promise<{}>}
   */
  async getData() {
    const data = await super.getData();

    data.width = 550;
    data.spells = await this.item.system.loadSpells();
    data.magicLores = game.wfrp4e.config.magicLores;
    data.hideSpells = this.item.system.hideSpells && !game.user.isGM;
    data.canEditLanguage = game.user.isGM || !this.item.system.language;

    return data;
  }

  /**
   * @inheritDoc
   *
   * @param {DragEvent} event
   * @returns {Promise<ItemWfrp4e|boolean>}
   * @protected
   */
  async _onDrop(event)
  {
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
   *
   * @param {jQuery} html
   */
  activateListeners(html) {
    super.activateListeners(html);

    if (this.item.system.hideSpells) return;

    html.on("click", ".spell img", this.#onSpellClick.bind(this))
    html.on("click", ".spells-remove", this.#onSpellsRemoveClick.bind(this))
    html.on("change", ".spell-name input", this.#onSpellLabelChange.bind(this))
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
   * Update name of the spell written in Grimoire
   */
  #onSpellLabelChange(event) {
    const uuid = event.currentTarget.closest('.spell').dataset.uuid;
    const value = event.currentTarget.value;

    this.item.system.changeSpellsName(uuid, value);
  }
}