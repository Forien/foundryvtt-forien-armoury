import ForienBaseModule from "../utility/ForienBaseModule.mjs";
import Utility from "../utility/Utility.mjs";
import ScrollDialog from "../apps/ScrollDialog.mjs";
import ScrollTest from "../tests/ScrollTest.mjs";
import {dataTypes} from "../constants.mjs";

export default class Scrolls extends ForienBaseModule {
  bindHooks() {
    Hooks.on("renderActorSheetWfrp4eCharacter", this.#onRenderActorSheet.bind(this));
    Hooks.on("renderActorSheetWfrp4eNPC", this.#onRenderActorSheet.bind(this));
    Hooks.on("wfrp4e:constructInventory", this.#onWfrp4eConstructInventory.bind(this));
  }

  #onWfrp4eConstructInventory(sheet, categories, collapsed) {
    categories.scrolls = {
      label: game.i18n.localize("Forien.Armoury.Scrolls.MagicScrolls"),
      items: sheet.actor.itemTypes[dataTypes.scroll],
      show: true,
      collapsed : collapsed?.scrolls,
      dataType: dataTypes.scroll
    }
  }

  #onRenderActorSheet(sheet, html, _options) {
    html.on("click", ".scroll-spell-link", (event) => this.#onScrollSpellLinkClick(event));
    html.on("click", ".scroll-spell-cast", (event) => this.#onScrollSpellCastClick(sheet, event));
  }

  #onScrollSpellCastClick(sheet, event) {
    const uuid = event.currentTarget.closest('.item').dataset.id;
    const actor = sheet.actor;
  }

  #onScrollSpellLinkClick(event) {
    const uuid = event.currentTarget.dataset.uuid;

    fromUuid(uuid).then(item => item?.sheet.render(true));
  }

  applyWfrp4eConfig() {
    foundry.utils.mergeObject(game.wfrp4e.rolls, {"ScrollTest": ScrollTest})

    return {};
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