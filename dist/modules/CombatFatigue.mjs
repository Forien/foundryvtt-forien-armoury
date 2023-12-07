import {constants, flags, settings} from "./constants.mjs";
import Utility from "./utility/Utility.mjs";

export default class CombatFatigue {
  bindHooks() {
    Hooks.on("updateCombat", this.#processCombatTurn.bind(this));
  }

  async #processCombatTurn(combat, change, options, userId) {
    if (change.turn === undefined) return;
    if (Utility.getSetting(settings.combatFatigue.enable) === false) return;
    if (!combat.previous || !combat.previous.combatantId) return;

    const previousCombatant = combat.combatants.get(combat.previous.combatantId);
    const actor = previousCombatant?.actor;

    if (!actor) return;
    if (!actor.isOwner) return;
    if (game.user.isGM && !Utility.getSetting(settings.combatFatigue.enableNPC)) return;
    if (game.user.isGM && actor.hasPlayerOwner) return;

    let roundsBeforeTest = this.#getRoundsBeforeTest(previousCombatant, actor);
    roundsBeforeTest--;

    if (roundsBeforeTest <= 0) {
      const {outcome, SL} = await this.#performTest(actor);

      roundsBeforeTest = actor.characteristics.t.bonus;

      if (outcome === 'failure') {
        await actor.addCondition('fatigued');
      } else if (outcome === 'success') {
        roundsBeforeTest += parseInt(SL);
      }
    }

    await previousCombatant.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest, roundsBeforeTest)
  }

  async #performTest(actor) {
    const appendTitle = game.i18n.localize("Forien.Armoury.CombatFatigue.CombatFatigueTest")
    const skill = actor.itemCategories.skill.find(s => s.name === game.i18n.localize("Forien.Armoury.CombatFatigue.EnduranceSkillName"));
    let test;

    if (skill)
      test = await actor.setupSkill(skill, {appendTitle});
    else
      test = await actor.setupCharacteristic('t', {appendTitle});

    await test.roll();

    const outcome = test.data.result.outcome;
    const SL = test.data.result.SL;

    return {outcome, SL};
  }

  #getRoundsBeforeTest(currentCombatant, actor) {
    let roundsBeforeTest = currentCombatant.getFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest) ?? null;
    if (roundsBeforeTest === null)
      roundsBeforeTest = actor.characteristics.t.bonus;

    return roundsBeforeTest;
  }
}