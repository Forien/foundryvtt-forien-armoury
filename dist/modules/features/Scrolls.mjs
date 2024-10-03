import ForienBaseModule from "../utility/ForienBaseModule.mjs";
import Utility from "../utility/Utility.mjs";
import ScrollTest from "../tests/ScrollTest.mjs";
import {dataTypes, settings} from "../constants.mjs";

export default class Scrolls extends ForienBaseModule {
  templates = {
    magicScrolls: 'partials/actor-sheet-wfrp4e-magic-scrolls.hbs',
    magicScrollsV2: 'partials/actor-sheet-wfrp4e-magic-scrolls-v2.hbs',
  }

  /**
   * @inheritDoc
   */
  bindHooks() {
    Hooks.on("renderActorSheetWFRP4eCharacter", this.#onRenderActorSheet.bind(this));
    Hooks.on("renderActorSheetWFRP4eNPC", this.#onRenderActorSheet.bind(this));
    Hooks.on("renderActorSheetWFRP4eCharacterV2", this.#onRenderActorSheetV2.bind(this));
    Hooks.on("wfrp4e:constructInventory", this.#onWfrp4eConstructInventory.bind(this));
  }

  /**
   * Add Scrolls to appropriate Inventory categories
   *
   * @param {ActorSheetWFRP4e} sheet
   * @param {{}} categories
   * @param {{}} collapsed
   */
  #onWfrp4eConstructInventory(sheet, categories, collapsed) {
    const scrolls = sheet.actor.itemTypes[dataTypes.scroll];

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

  /**
   * Adds scrolls to Magic tab and registers Scroll-specific Event Listeners
   *
   * @param {ActorSheetWFRP4e} sheet
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
   * Adds scrolls to Magic tab and registers Scroll-specific Event Listeners
   *
   * @param {ActorSheetWFRP4e} sheet
   * @param {HTMLElement} html
   * @param {{}} _options
   *
   * @returns {Promise<void>}
   */
  async #onRenderActorSheetV2(sheet, html, _options) {
    const actor = sheet.actor;
    const scrolls = actor.itemTypes[dataTypes.scroll];

    const content = await renderTemplate(Utility.getTemplate(this.templates.magicScrollsV2), {
      scrolls,
      isOwner: sheet.document.isOwner,
      dataType: dataTypes.scroll
    });

    const tabMagic = html.querySelector('.tab[data-tab="magic"]');
    tabMagic.append(Utility.stringToHTMLElement(content));

    tabMagic.querySelectorAll(".scrolls .scroll-spell-link").forEach(element => {
      element.addEventListener("click", (event) => this.#onScrollSpellLinkClick(event))
    });
    tabMagic.querySelectorAll(".scrolls .scroll-spell-cast").forEach(element => {
      element.addEventListener("click", (event) => this.#onScrollSpellCastClick(sheet, event))
    });

    tabMagic.querySelectorAll(".scrolls .rollable").forEach(element => {
      element.addEventListener("mouseenter", ev => {
        let img = ev.target.matches("img") ? ev.target : ev.target.querySelector("img");
        if (img) {
          this._icon = img.src;
          img.src = "systems/wfrp4e/ui/buttons/d10.webp";
        }
      })
      element.addEventListener("mouseleave", ev => {
        let img = ev.target.matches("img") ? ev.target : ev.target.querySelector("img");
        if (img) {
          img.src = this._icon;
        }
      })
    });
  }

  /**
   * When scroll is clicked to be used (for example by clicking on "Use Scroll" button), prepare the Test.
   *
   * @param {ActorSheetWFRP4e} sheet
   * @param {MouseEvent} event
   *
   * @returns {Promise<ScrollTest|false>}
   */
  async #onScrollSpellCastClick(sheet, event) {
    const id = event.currentTarget.closest('.item').dataset.id;
    const scroll = sheet.actor.items.get(id);

    if (!scroll) return false;

    return scroll.system.prepareScrollTest();
  }

  /**
   * When Scroll is clicked directly on Magic tab, unveil the Item Summary (on right click) or use the scroll
   *
   * @param {ActorSheetWFRP4e} sheet
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
   *
   * @returns {Promise<Application|*>}
   */
  async generateRandomScroll() {
    const loreTable = game.wfrp4e.tables.findTable('scroll', 'lore');
    const cnTable = game.wfrp4e.tables.findTable('scroll', 'cn');

    const loreResult = (await loreTable.roll()).results[0];
    const match = loreResult?.text.match(/\{([a-zA-Z]+)}/);

    if (!match) return;
    const lore = match[1] ?? '';
    let lores = [lore.toLowerCase()];

    if (lores.includes("chaos magic"))
      lores = ["tzeentch", "nurgle", "slaanesh", "undivided"];

    const maxCNResult = (await cnTable.roll()).results[0];
    const maxCN = Number(maxCNResult?.text) || 0;

    const spells = await game.wfrp4e.utility.findAll("spell");
    const validSpells = [];

    for (const spell of spells) {
      if (spell.system.cn.value > maxCN) continue;
      if (
        !lores.includes(spell.system.lore.value) &&
        !(lores.includes("arcane") && spell.system.lore.value === '')
      ) {
        continue;
      }

      validSpells.push(spell);
    }

    if (!validSpells.length)
      return Utility.notify(game.i18n.format("Forien.Armoury.Scrolls.MacroCantFind", {lore, maxCN}));

    const selectedSpell = validSpells[Math.floor(CONFIG.Dice.randomUniform() * validSpells.length)];
    const item = await Item.implementation.create({name: 'Temporary Scroll Name', type: dataTypes.scroll});
    await item.update({"system.spellUuid": selectedSpell.uuid}, {skipAsk: true});

    setTimeout(() => item.sheet.render(true), 500);
  }
}