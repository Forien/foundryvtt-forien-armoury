import ForienBaseModule from "../utility/ForienBaseModule.mjs";
import Utility from "../utility/Utility.mjs";
import ScrollDialog from "../apps/ScrollDialog.mjs";
import ScrollTest from "../tests/ScrollTest.mjs";
import {dataTypes, settings} from "../constants.mjs";

export default class Scrolls extends ForienBaseModule {
  templates = {
    magicScrolls: 'partials/actor-sheet-wfrp4e-magic-scrolls.hbs',
  }

  bindHooks() {
    Hooks.on("renderActorSheetWfrp4eCharacter", this.#onRenderActorSheet.bind(this));
    Hooks.on("renderActorSheetWfrp4eNPC", this.#onRenderActorSheet.bind(this));
    Hooks.on("wfrp4e:constructInventory", this.#onWfrp4eConstructInventory.bind(this));
  }

  #onWfrp4eConstructInventory(sheet, categories, collapsed) {
    const scrolls = sheet.actor.itemTypes[dataTypes.scroll];

    if (Utility.getSetting(settings.scrolls.ownCategory)) {
      categories.scrolls = {
        label: game.i18n.localize("Forien.Armoury.Scrolls.MagicScrolls"),
        items: scrolls,
        show: true,
        collapsed : collapsed?.scrolls,
        dataType: dataTypes.scroll
      }
    } else {
      categories.booksAndDocuments.items.push(...scrolls);
    }
  }

  async #onRenderActorSheet(sheet, html, _options) {
    const actor = sheet.actor;
    const scrolls = actor.itemTypes[dataTypes.scroll];

    let content = await renderTemplate(Utility.getTemplate(this.templates.magicScrolls), {scrolls, isOwner: sheet.document.isOwner, dataType: dataTypes.scroll})
    html.find('.content .tab.magic').append(content);

    // register listeners only if it's the first render of outer application:
    // @todo split into two hooks in Application v2 on Foundry v12
    if (html.hasClass('sheet')) {
      html.on("click", ".scroll-spell-link", (event) => this.#onScrollSpellLinkClick(event));
      html.on("click", ".scroll-spell-cast", (event) => this.#onScrollSpellCastClick(sheet, event));
      html.on("mousedown", ".scroll-roll", (event) => this.#onScrollRollClick(sheet, event));
    }
  }

  #onScrollSpellCastClick(sheet, event) {
    const id = event.currentTarget.closest('.item').dataset.id;
    const actor = sheet.actor;
    const scroll = actor.items.get(id);

    if (!scroll) return;

    if (!scroll.system.canUse)
      return Utility.notify(game.i18n.format("Forien.Armoury.Scrolls.ActorCanNotUse", {scroll: scroll.name, language: scroll.system.language}));


    this.#prepareScrollTest(actor, scroll);
  }

  #onScrollRollClick(sheet, event) {
    event.preventDefault();
    if (event.button === 2)
      return sheet._onItemSummary(event);

    this.#onScrollSpellCastClick(sheet, event);
  }

  #onScrollSpellLinkClick(event) {
    console.log('renderActorSheetWfrp4eNPC, onScrollSpellLinkClick');
    const uuid = event.currentTarget.dataset.uuid;

    fromUuid(uuid).then(item => item?.sheet.render(true));
  }

  applyWfrp4eConfig() {
    foundry.utils.mergeObject(game.wfrp4e.rolls, {"ScrollTest": ScrollTest})

    return {};
  }

  async #prepareScrollTest(actor, scroll) {
    const compendiumSpell = await scroll.system.loadSpell();
    const spellData = compendiumSpell.toObject();
    const skill = scroll.system.languageSkill;

    spellData.system.memorized.value = true;
    spellData.system.cn.value = 0;
    spellData.system.skill.value = skill.name;

    let difficulty = 'hard';

    if (scroll.system.isMagick)
      difficulty = 'challenging';

    const spell = new CONFIG.Item.documentClass(spellData, { parent: actor });
    spell.system.computeOvercastingData();


    console.log("#prepareScrollTest", actor, scroll, spell, skill)
    let dialogData = {
      fields : {
        difficulty
      },
      data : {
        scroll,
        spell,
        hitLoc : !!spell.system.damage.value,
        skill: skill
      },
      options : {}
    }
    let test = await actor._setupTest(dialogData, ScrollDialog)
    await test.roll();
  }

  async test() {
    const actor = game.actors.get("ajqitmwP2dWjFZUm");

    /**
     *
     * @type {ItemWfrp4e}
     */
    let compendiumSpell = await fromUuid("Compendium.wfrp4e-core.items.Item.1RjTFiv9ooOW35LV");
    let spellData = compendiumSpell.toObject();

    spellData.system.memorized.value = true;
    spellData.system.cn.value = 0;
    spellData.system.skill.value = "Language (Reikspiel)";

    let spell = new CONFIG.Item.documentClass(spellData, { parent: actor });

    // console.log("Scrolls.test()", spell)
    //
    // let created = await actor.createEmbeddedDocuments("Item", [spell]);
    // spell = created[0];
    // actor.system.computeItems();
    // actor.prepareDerivedData();

    // console.log("Scrolls.test() overcast before", foundry.utils.deepClone(spell.system.overcast));
    spell.system.computeOvercastingData();
    // console.log("Scrolls.test() overcast after", foundry.utils.deepClone(spell.system.overcast));

    console.log("Scrolls.test()", foundry.utils.deepClone(spell))

    let dialogData = {
      fields : {},  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        spell,
        hitLoc : !!spell.system.damage.value,
        skill: actor.items.find(i => i.type === "skill")
      },
      options : {}         // Application/optional properties
    }
    let setupData = await actor._setupTest(dialogData, ScrollDialog)
    console.log("Scrolls.test()", setupData);
    let test = await actor.castTest(setupData);
    console.log("Scrolls.test()", test);

    // await actor.deleteEmbeddedDocuments("Item", [spell._id]);
  }
}