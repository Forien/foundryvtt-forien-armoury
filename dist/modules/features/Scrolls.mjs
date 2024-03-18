import ForienBaseModule from "../utility/ForienBaseModule.mjs";
import Utility from "../utility/Utility.mjs";
import ScrollDialog from "../apps/ScrollDialog.mjs";
import ScrollTest from "../tests/ScrollTest.mjs";
import {dataTypes, settings} from "../constants.mjs";

export default class Scrolls extends ForienBaseModule {
  templates = {
    magicScrolls: 'partials/actor-sheet-wfrp4e-magic-scrolls.hbs',
  }

  /**
   * @inheritDoc
   */
  bindHooks() {
    Hooks.on("renderActorSheetWfrp4eCharacter", this.#onRenderActorSheet.bind(this));
    Hooks.on("renderActorSheetWfrp4eNPC", this.#onRenderActorSheet.bind(this));
    Hooks.on("wfrp4e:constructInventory", this.#onWfrp4eConstructInventory.bind(this));
  }

  /**
   * Add Scrolls to appropriate Inventory categories
   *
   * @param {ActorSheetWfrp4e} sheet
   * @param {{}} categories
   * @param {{}} collapsed
   */
  #onWfrp4eConstructInventory(sheet, categories, collapsed) {
    const scrolls = sheet.actor.itemTypes[dataTypes.scroll];
    if (scrolls) {
      if (Utility.getSetting(settings.scrolls.ownCategory)) {
        categories.scrolls = {
          label: game.i18n.localize("Forien.Armoury.Scrolls.MagicScrolls"),
          items: scrolls,
          show: true,
          collapsed: collapsed?.scrolls,
          dataType: dataTypes.scroll
        }
      } else {
        categories.booksAndDocuments.items.push(...scrolls);
      }
    }
  }

  /**
   * Adds scrolls to Magic tab and registers Scroll-specific Event Listeners
   *
   * @param {ActorSheetWfrp4e} sheet
   * @param {jQuery} html
   * @param {{}} _options
   *
   * @returns {Promise<void>}
   */
  async #onRenderActorSheet(sheet, html, _options) {
    const actor = sheet.actor;
    const scrolls = actor.itemTypes[dataTypes.scroll];

    let content = await renderTemplate(Utility.getTemplate(this.templates.magicScrolls), {
      scrolls,
      isOwner: sheet.document.isOwner,
      dataType: dataTypes.scroll
    })
    html.find('.content .tab.magic').append(content);

    // register listeners only if it's the first render of outer application:
    // @todo split into two hooks in Application v2 on Foundry v12
    if (html.hasClass('sheet')) {
      html.on("click", ".scroll-spell-link", (event) => this.#onScrollSpellLinkClick(event));
      html.on("click", ".scroll-spell-cast", (event) => this.#onScrollSpellCastClick(sheet, event));
      html.on("mousedown", ".scroll-roll", (event) => this.#onScrollRollClick(sheet, event));
    }
  }

  /**
   * When scroll is clicked to be used (for example by clicking on "Use Scroll" button), prepare the Test.
   *
   * @param {ActorSheetWfrp4e} sheet
   * @param {MouseEvent} event
   *
   * @returns {Promise<ScrollTest|false>}
   */
  async #onScrollSpellCastClick(sheet, event) {
    const id = event.currentTarget.closest('.item').dataset.id;
    const scroll = sheet.actor.items.get(id);

    if (!scroll) return false;

    if (!scroll.system.canUse)
      return Utility.notify(
        game.i18n.format("Forien.Armoury.Scrolls.ActorCanNotUse", {
          actor: sheet.actor.name,
          scroll: scroll.name,
          language: scroll.system.language
        }),
        {type: "warning"}
      );

    return scroll.system.prepareScrollTest();
  }

  /**
   * When Scroll is clicked directly on Magic tab, unveil the Item Summary (on right click) or use the scroll
   *
   * @param {ActorSheetWfrp4e} sheet
   * @param {MouseEvent} event
   *
   * @returns {Promise<ScrollTest|void|false>}
   */
  async #onScrollRollClick(sheet, event) {
    event.preventDefault();
    if (event.button === 2)
      return await sheet._onItemSummary(event);

    return await this.#onScrollSpellCastClick(sheet, event);
  }

  /**
   * When Spell's tag is clicked, render the Spell's Sheet
   *
   * @param {MouseEvent} event
   */
  #onScrollSpellLinkClick(event) {
    const uuid = event.currentTarget.dataset.uuid;

    fromUuid(uuid).then(item => item?.sheet.render(true));
  }

  /**
   * @inheritDoc
   */
  applyWfrp4eConfig() {
    foundry.utils.mergeObject(game.wfrp4e.rolls, {"ScrollTest": ScrollTest})

    return {};
  }

  /**
   * Prepares the Scroll Dialog and performs the Scroll Test
   *
   * @param {ItemWfrp4e} scroll
   *
   * @returns {Promise<ScrollTest>}
   */
  async prepareScrollTest(scroll) {
    /**
     * @type {ActorWfrp4e}
     */
    const actor = scroll.actor;
    const compendiumSpell = await scroll.system.loadSpell();
    const spellData = compendiumSpell.toObject();
    const skill = scroll.system.languageSkill;

    spellData.system.memorized.value = true;
    spellData.system.cn.value = 0;
    spellData.system.skill.value = skill.name;

    let difficulty = Utility.getSetting(settings.scrolls.difficulty);

    if (scroll.system.isMagick)
      difficulty = Utility.getSetting(settings.scrolls.difficultyMagick);

    const spell = new CONFIG.Item.documentClass(spellData, {parent: actor});
    spell.system.computeOvercastingData();

    const dialogData = {
      fields: {
        difficulty
      },
      data: {
        scroll,
        spell,
        hitLoc: !!spell.system.damage.value,
        skill: skill
      },
      options: {}
    }

    const test = await actor._setupTest(dialogData, ScrollDialog)
    return await test.roll();
  }
}