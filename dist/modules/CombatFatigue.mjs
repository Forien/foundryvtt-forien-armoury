import {constants, flags, settings} from "./constants.mjs";
import Utility from "./utility/Utility.mjs";

export default class CombatFatigue {
  bindHooks() {
    Hooks.on("combatRound", this.processCombatRound.bind(this));
  }

  async processCombatRound(combat) {
    if (Utility.getSetting(settings.combatFatigue.enable) === false) return;
    if (!combat.current || !combat.current.combatantId) return;

    const currentCombatant = combat.combatants.get(combat.current.combatantId);
    const actor = currentCombatant?.actor;

    if (!actor) return;
    if (!actor.isOwner) return;
    if (game.user.isGM && !Utility.getSetting(settings.combatFatigue.enableNPC)) return;
    if (game.user.isGM && actor.hasPlayerOwner) return;

    let roundsBeforeTest = this.getRoundsBeforeTest(currentCombatant, actor);

    if (roundsBeforeTest <= 0) {
      const {outcome, SL} = await this.performTest(actor);

      roundsBeforeTest = actor.characteristics.t.bonus;

      if (outcome === 'failure') {
        await actor.addCondition('fatigued');
      } else if (outcome === 'success') {
        roundsBeforeTest += parseInt(SL);
      }
    } else {
      roundsBeforeTest--;
    }

    await currentCombatant.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest, roundsBeforeTest)
  }

  async performTest(actor) {
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

  getRoundsBeforeTest(currentCombatant, actor) {
    let roundsBeforeTest = currentCombatant.getFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest) ?? null;
    if (roundsBeforeTest === null)
      roundsBeforeTest = actor.characteristics.t.bonus;

    return roundsBeforeTest;
  }
}