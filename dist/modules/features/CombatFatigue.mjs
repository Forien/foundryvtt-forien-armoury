import {constants, flags, settings} from "../constants.mjs";
import Utility from "../utility/Utility.mjs";
import {debug} from "../utility/Debug.mjs";
import ForienBaseModule from "../utility/ForienBaseModule.mjs";

export default class CombatFatigue extends ForienBaseModule {


  bindHooks() {
    Hooks.on("ready", this.#setupEndTurnScript.bind(this));
    Hooks.on("renderCombatTracker", this.#renderRoundsBeforeTest.bind(this));
  }

  #setupEndTurnScript() {
    let that = this;
    let f = async function(combat, combatant) {
      await that.#processCombatTurn(combat, combatant);
    }
    game.wfrp4e.combat.scripts.endTurn.push(f);
  }

  async #renderRoundsBeforeTest(app, html, options) {
    if (Utility.getSetting(settings.combatFatigue.enable) === false) return;

    if (game.combat) {
      const combatants = game.combat.combatants.filter(combatant => combatant.actor.ownership[game.userId] > CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER);
      
      combatants.forEach(c => {
        let $controls = html.find(`.combatant[data-combatant-id="${c.id}"] .token-effects`);
        const control = `<a class="combatant-control" role="textbox" data-control="combatFatigue">
                          <input data-tooltip="${game.i18n.localize("Forien.Armoury.CombatFatigue.CombatFatigueToolTip")}" type="text" name="flags.forien-armoury.roundsBeforeTest" value="${this.#getRoundsBeforeTest(c, c.actor)}">
                        </a>`;
        $controls.before(control);
        $controls.prev().children('input').change(c.id, function (event) { 
          let target = game.combat.combatants.find(x=>x.id == event.data);
          target.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest, this.value);
        });
        if (c.actor.status.wounds.value == 0) {
          const passOutControl = `<a class="combatant-control" role="textbox" data-control="combatPassOut">
                                  <input data-tooltip="${game.i18n.localize("Forien.Armoury.CombatFatigue.CombatPassOutToollTip")}" type="text" name="flags.forien-armoury.roundsBeforePassOut" value="${this.#getRoundsBeforePassOut(c, c.actor)}">
                                  </a>`
          $controls.before(passOutControl);
          $controls.prev().children('input').change(c.id, function (event) { 
            let target = game.combat.combatants.find(x=>x.id == event.data);
            target.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforePassOut, this.value);
          });
        }
      });
    }
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
  async #processCombatTurn(combat, previousCombatant) {
    if (Utility.getSetting(settings.combatFatigue.enable) === false) return debug('[CombatFatigue] Combat Fatigue is not enabled');
    const actor = previousCombatant?.actor;

    if (!actor) return;
    if (!actor.isOwner)
      return debug('[CombatFatigue] You are not an Owner of previous combatant', {previousCombatant, actor});

    if (game.user.isGM && !Utility.getSetting(settings.combatFatigue.enableNPC))
      return debug('[CombatFatigue] You are a GM and Combat Fatigue has been disabled for NPCs');

    if (game.user.isGM && actor.hasPlayerOwner)
      return debug('[CombatFatigue] You are a GM and previous combatant is Player Owned Actor', {previousCombatant, actor});

    await this.#processCombatFatigue(previousCombatant);
    await this.#processCombatPassOut(previousCombatant);
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

    debug('[CombatFatigue] Combat Fatigue status', previousCombatant, actor, roundsBeforeTest);

    if (roundsBeforeTest <= 0) {
      await previousCombatant.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest, 0)
      const {outcome, SL} = await this.#performTest(actor);

      roundsBeforeTest = actor.characteristics.t.bonus;

      if (outcome === 'failure') {
        await actor.addCondition('fatigued');
      } else if (outcome === 'success') {
        roundsBeforeTest += parseInt(SL);
      }

      debug('[CombatFatigue] Combat Fatigue Test result', {outcome, SL, roundsBeforeTest});
    }

    await previousCombatant.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest, roundsBeforeTest)
  }

  async #processCombatPassOut(previousCombatant) {
    /** @type {ActorWfrp4e} */
    const actor = previousCombatant.actor;
    if (actor.status.wounds.value != 0) return;

    let roundsBeforePassOut = this.#getRoundsBeforePassOut(previousCombatant, actor);
    roundsBeforePassOut--;

    if (roundsBeforePassOut <= 0 && !actor.hasCondition('unconscious')) {
      await previousCombatant.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforePassOut, 0);
      await actor.addCondition('unconscious');
    } else {
      await previousCombatant.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforePassOut, Math.max(roundsBeforePassOut, 0));
    }
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
    const skill = actor.itemTypes.skill.find(s => s.name === enduranceName);
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

  #getRoundsBeforePassOut(currentCombatant, actor) {
    let roundsBeforePassOut = currentCombatant.getFlag(constants.moduleId, flags.combatFatigue.roundsBeforePassOut) ?? null;
    if (roundsBeforePassOut === null)
      roundsBeforePassOut = actor.characteristics.t.bonus;

    return roundsBeforePassOut;
  }
}