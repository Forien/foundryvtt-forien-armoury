import {dataTypes, settings} from "../constants.mjs";
import ForienBaseModule      from "../utility/ForienBaseModule.mjs";
import Utility               from "../utility/Utility.mjs";

export default class Grimoires extends ForienBaseModule {
  /**
   * @inheritDoc
   */
  bindHooks() {
    Hooks.on("wfrp4e:constructInventory", this.#onWfrp4eConstructInventory.bind(this));
    Hooks.on("renderBaseWFRP4eActorSheet", this.#onRenderActorSheet.bind(this));
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
        dataType: dataTypes.grimoire,
      };
    } else {
      categories.booksAndDocuments.items.push(...grimoires);
    }
  }


  /**
   * Registers Grimoire-specific Event Listeners
   *
   * @param {BaseWFRP4eActorSheet} sheet
   * @param {HTMLElement} html
   * @param {{}} context
   * @param {{}} options
   *
   * @returns {Promise<void>}
   */
  async #onRenderActorSheet(sheet, html, context, options) {
    if (options.isFirstRender === true) {
      html.addEventListener("click", event => this.#onSpellLinkClick(event));
    }
  }

  /**
   * When Spell's tag is clicked, render the Spell's Sheet
   *
   * @param {MouseEvent} event
   */
  #onSpellLinkClick(event) {
    if (!event.target.classList.contains("grimoire-spell-link")) return;
    const uuid = event.target.dataset.uuid;

    fromUuid(uuid).then(item => item?.sheet.render(true));
  }

  /**
   * @inheritDoc
   */
  applyWfrp4eConfig() {
    return {};
  }
}
