import {constants, flags, settings} from "../constants.mjs";
import Utility from "../utility/Utility.mjs";
import {debug} from "../utility/Debug.mjs";

export default class CombatFatigue {
  bindHooks() {
    Hooks.on("updateCombat", this.#processCombatTurn.bind(this));
  }

  /**
   * Processes Combat's turn in order to apply Combat Fatigue rules, if enabled.
   *
   * @param {Combat} combat
   * @param {{}} change
   * @param {{}} _options
   * @param {string} _userId
   *
   * @return {Promise<void>}
   */
  async #processCombatTurn(combat, change, _options, _userId) {
    if (change.turn === undefined) return;
    if (Utility.getSetting(settings.combatFatigue.enable) === false) return debug('Combat Fatigue is not enabled');
    if (!combat.previous || !combat.previous.combatantId) return;

    const previousCombatant = combat.combatants.get(combat.previous.combatantId);
    const actor = previousCombatant?.actor;

    if (!actor) return;
    if (!actor.isOwner)
      return debug('You are not an Owner of previous combatant', {previousCombatant, actor});

    if (game.user.isGM && !Utility.getSetting(settings.combatFatigue.enableNPC))
      return debug('You are a GM and Combat Fatigue has been disabled for NPCs');

    if (game.user.isGM && actor.hasPlayerOwner)
      return debug('You are a GM and previous combatant is Player Owned Actor', {previousCombatant, actor});

    await this.#processCombatFatigue(previousCombatant);
  }

  /**
   * Processes Combat Fatigue for specified Combatant
   *
   * @param {Combatant} previousCombatant
   *
   * @return {Promise<void>}
   */
  async #processCombatFatigue(previousCombatant) {
    /** @type {ActorWfrp4e} */
    const actor = previousCombatant.actor;
    let roundsBeforeTest = this.#getRoundsBeforeTest(previousCombatant, actor);
    roundsBeforeTest--;

    debug('Combat Fatigue status', {previousCombatant, actor, roundsBeforeTest});

    if (roundsBeforeTest <= 0) {
      const {outcome, SL} = await this.#performTest(actor);

      roundsBeforeTest = actor.characteristics.t.bonus;

      if (outcome === 'failure') {
        await actor.addCondition('fatigued');
      } else if (outcome === 'success') {
        roundsBeforeTest += parseInt(SL);
      }

      debug('Combat Fatigue Test result', {outcome, SL, roundsBeforeTest});
    }

    await previousCombatant.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest, roundsBeforeTest)
  }

  /**
   * Calls user to perform the Endurance/Toughness Dramatic Test in order to stave off the Fatigue
   *
   * @param {ActorWfrp4e} actor
   *
   * @return {Promise<{SL: *, outcome: *}>}
   */
  async #performTest(actor) {
    const appendTitle = game.i18n.localize("Forien.Armoury.CombatFatigue.CombatFatigueTest")
    const enduranceName = game.i18n.localize("NAME.Endurance");
    const skill = actor.itemCategories.skill.find(s => s.name === enduranceName);
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

  /**
   * Returns the number of Rounds before the Actor has to attempt another Test.
   *
   * Number of rounds is stored in Combatant's flag, if it's not present, the Toughness Bonus is returned.
   *
   * @param {Combatant} currentCombatant
   * @param {ActorWfrp4e} actor
   *
   * @return {number}
   */
  #getRoundsBeforeTest(currentCombatant, actor) {
    let roundsBeforeTest = currentCombatant.getFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest) ?? null;
    if (roundsBeforeTest === null)
      roundsBeforeTest = actor.characteristics.t.bonus;

    return roundsBeforeTest;
  }
}