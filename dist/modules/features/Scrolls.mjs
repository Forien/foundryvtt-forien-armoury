import ForienBaseModule from "../utility/ForienBaseModule.mjs";
import Utility from "../utility/Utility.mjs";
import ScrollDialog from "../apps/ScrollDialog.mjs";
import ScrollTest from "../tests/ScrollTest.mjs";

export default class Scrolls extends ForienBaseModule {
  bindHooks() {
    // Hooks.on("renderActorSheetWfrp4eCharacter", this.#onRenderActorSheet.bind(this));
    // Hooks.on("renderActorSheetWfrp4eNPC", this.#onRenderActorSheet.bind(this));
  }

  #onRenderActorSheet(sheet, html, _options) {
    // setting enabled
    // if (!this.magicalEnduranceEnabled) return;
    //
    // const tabMagic = html.find('.content .tab.magic');
    // const actor = sheet.actor;
    // const magicalEndurance = this.getMagicalEnduranceData(actor);
    //
    // renderTemplate(Utility.getTemplate(this.templates.magicalEndurance), magicalEndurance).then(content => {
    //   tabMagic.prepend(content);
    //
    //   html.find('#magical-endurance-value').change((ev) => this.#onMagicalEnduranceValueChange(ev, actor));
    // });
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