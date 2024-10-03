import ForienBaseModule from "../utility/ForienBaseModule.mjs";
import Utility from "../utility/Utility.mjs";
import ScrollDialog from "../apps/ScrollDialog.mjs";
import ScrollTest from "../tests/ScrollTest.mjs";
import {dataTypes, settings} from "../constants.mjs";

export default class Grimoires extends ForienBaseModule {
  /**
   * @inheritDoc
   */
  bindHooks() {
    Hooks.on("wfrp4e:constructInventory", this.#onWfrp4eConstructInventory.bind(this));
    Hooks.on("renderActorSheetWFRP4eCharacter", this.#onRenderActorSheet.bind(this));
    Hooks.on("renderActorSheetWFRP4eNPC", this.#onRenderActorSheet.bind(this));
  }

  /**
   * Add Scrolls to appropriate Inventory categories
   *
   * @param {ActorSheetWFRP4e} sheet
   * @param {{}} categories
   * @param {{}} collapsed
   */
  #onWfrp4eConstructInventory(sheet, categories, collapsed) {
    const grimoires = sheet.actor.itemTypes[dataTypes.grimoire];

    if (Utility.getSetting(settings.grimoires.ownCategory)) {
      categories.grimoires = {
        label: game.i18n.localize("Forien.Armoury.Grimoires.Grimoires"),
        items: grimoires,
        show: true,
        toggle: true,
        toggleName: game.i18n.localize("Equipped"),
        collapsed: collapsed?.grimoires,
        dataType: dataTypes.grimoire
      }
    } else {
      categories.booksAndDocuments.items.push(...grimoires);
    }
  }


  /**
   * Registers Grimoire-specific Event Listeners
   *
   * @param {ActorSheetWFRP4e} sheet
   * @param {jQuery} html
   * @param {{}} _options
   *
   * @returns {Promise<void>}
   */
  async #onRenderActorSheet(sheet, html, _options) {
    // register listeners only if it's the first render of outer application:
    // @todo split into two hooks in Application v2 on Foundry v12
    if (html.hasClass('sheet')) {
      html.on("click", ".grimoire-spell-link", (event) => this.#onSpellLinkClick(event));
    }
  }

  /**
   * When Spell's tag is clicked, render the Spell's Sheet
   *
   * @param {MouseEvent} event
   */
  #onSpellLinkClick(event) {
    const uuid = event.currentTarget.dataset.uuid;

    fromUuid(uuid).then(item => item?.sheet.render(true));
  }

  /**
   * @inheritDoc
   */
  applyWfrp4eConfig() {
    return {};
  }
}