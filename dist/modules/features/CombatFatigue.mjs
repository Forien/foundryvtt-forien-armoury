import {constants, flags, settings} from "../constants.mjs";
import Utility from "../utility/Utility.mjs";
import {debug} from "../utility/Debug.mjs";
import ForienBaseModule from "../utility/ForienBaseModule.mjs";

export default class CombatFatigue extends ForienBaseModule {


  bindHooks() {
    Hooks.on("ready", this.#setupEndTurnScript.bind(this));
    Hooks.on("renderCombatTracker", this.#renderRoundsBeforeTest.bind(this));
    Hooks.on("wfrp4e:rollTest", this.#onRollTest.bind(this));
  }

  #setupEndTurnScript() {
    CombatHelpers.endTurn.push(this.#processCombatTurn.bind(this));
  }

  /**
   * Renders inputs in Combat Tracker that allow tracking and editing Rounds Before Test
   * and Rounds Before Pass Out.
   *
   * @param {CombatTracker} app
   * @param {jQuery} html
   * @param {{}} _options
   *
   * @returns {Promise<void>}
   */
  async #renderRoundsBeforeTest(app, html, _options) {
    if (Utility.getSetting(settings.combatFatigue.enable) === false) return;

    if (game.combat) {
      const combatants = game.combat.combatants.filter(combatant => combatant.actor.isOwner);

      for (let combatant of combatants) {
        let $controls = html.find(`.combatant[data-combatant-id="${combatant.id}"] .token-effects`);
        const control = `<a class="combatant-control" role="textbox" data-control="combatFatigue">
                          <input data-tooltip="${game.i18n.localize("Forien.Armoury.CombatFatigue.CombatFatigueToolTip")}" type="text" name="flags.forien-armoury.roundsBeforeTest" value="${this.#getRoundsBeforeTest(combatant, combatant.actor)}">
                        </a>`;
        $controls.before(control);
        $controls.prev().children('input').change(combatant.id, function (event) {
          let target = game.combat.combatants.find(x => x.id === event.data);
          target.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest, this.value);
        });

        if (Utility.getSetting(settings.combatFatigue.enableCorePassOut) === false)
          continue;

        if (combatant.actor.status.wounds.value === 0) {
          const passOutControl = `<a class="combatant-control" role="textbox" data-control="combatPassOut">
                                  <input data-tooltip="${game.i18n.localize("Forien.Armoury.CombatFatigue.CombatPassOutToollTip")}" type="text" name="flags.forien-armoury.roundsBeforePassOut" value="${this.#getRoundsBeforePassOut(combatant, combatant.actor)}">
                                  </a>`
          $controls.before(passOutControl);
          $controls.prev().children('input').change(combatant.id, function (event) {
            let target = game.combat.combatants.find(x => x.id === event.data);
            target.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforePassOut, this.value);
          });
        }
      }
    }
  }

  /**
   * Handles rerolls to Combat Fatigue tests, adjusting results accordingly
   *
   * @param {TestWFRP} test
   * @param {{}} options
   * @returns {Promise<void>}
   */
  async #onRollTest(test, options) {
    if (test.data?.preData?.options?.isCastingFatigue !== true) return;
    if (test.data?.context?.reroll !== true) return;

    const combatant = game.combat.combatants.find(combatant => combatant.actor === test.actor);
    const actor = combatant?.actor;

    if (!actor) return;

    const previousOutcome = test.data.context.previousResult.outcome;
    const outcome = test.data.result.outcome;
    const SL = test.data.result.SL;

    let roundsBeforeTest = actor.characteristics.t.bonus;

    if (previousOutcome === 'success' && outcome === 'failure') {
      await actor.addCondition('fatigued');
    } else if (previousOutcome === 'failure' && outcome === 'success') {
      roundsBeforeTest += parseInt(SL);
      await actor.removeCondition('fatigued', 1);
    }

    debug('[CombatFatigue] Combat Fatigue Test Reroll results', {outcome, SL, roundsBeforeTest, previousOutcome, combatant});

    await combatant?.setFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest, roundsBeforeTest);
  }

  /**
   * Processes Combat's turn in order to apply Combat Fatigue rules, if enabled.
   *
   * @param {Combat} combat
   * @param {{}} _update
   * @param {{}} _options
   * @param {string} _user
   *
   * @return {Promise<void>}
   */
  async #processCombatTurn(combat, _update, _options, _user) {
    if (Utility.getSetting(settings.combatFatigue.enable) === false) return debug('[CombatFatigue] Combat Fatigue is not enabled');

    const previousCombatant = combat.combatants.get(combat.previous.combatantId);
    const actor = previousCombatant?.actor;

    if (!actor) return;

    if (!actor.isOwner)
      return debug('[CombatFatigue] You are not an Owner of previous combatant', {previousCombatant, actor});

    if (game.user.isGM && !Utility.getSetting(settings.combatFatigue.enableNPC))
      return debug('[CombatFatigue] You are a GM and Combat Fatigue has been disabled for NPCs');

    const owner = warhammer.utility.getActiveDocumentOwner(actor);
    if (owner.id !== game.user.id) {
        return debug('[CombatFatigue] there is a other Player that owns previous combatant', {previousCombatant, actor});
    }

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
    /** @type {ActorWFRP4e} */
    const actor = previousCombatant.actor;
    let roundsBeforeTest = this.#getRoundsBeforeTest(previousCombatant, actor);
    roundsBeforeTest--;

    debug('[CombatFatigue] Combat Fatigue status', {previousCombatant, actor, roundsBeforeTest});

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

  /**
   * Processes Passing Out rule from CRB for specified Combatant
   *
   * @param {Combatant} previousCombatant
   *
   * @returns {Promise<void>}
   */
  async #processCombatPassOut(previousCombatant) {
    if (Utility.getSetting(settings.combatFatigue.enableCorePassOut) === false) return;
      /** @type {ActorWFRP4e} */
    const actor = previousCombatant.actor;
    if (actor.status.wounds.value !== 0) return;

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
   * @param {ActorWFRP4e} actor
   *
   * @return {Promise<{SL: *, outcome: *}>}
   */
  async #performTest(actor) {
    const appendTitle = game.i18n.localize("Forien.Armoury.CombatFatigue.CombatFatigueTest")
    const enduranceName = game.i18n.localize("NAME.Endurance");
    const skill = actor.itemTypes.skill.find(s => s.name === enduranceName);
    let test;

    const options = {
      appendTitle,
      isCastingFatigue: true,
      context: {
        failure: game.i18n.localize("Forien.Armoury.CombatFatigue.CombatFatigueTestFailure"),
        success: game.i18n.localize("Forien.Armoury.CombatFatigue.CombatFatigueTestSuccess"),
      }
    };

    if (skill)
      test = await actor.setupSkill(skill, options);
    else
      test = await actor.setupCharacteristic('t', options);

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
   * @param {ActorWFRP4e} actor
   *
   * @return {number}
   */
  #getRoundsBeforeTest(currentCombatant, actor) {
    let roundsBeforeTest = currentCombatant.getFlag(constants.moduleId, flags.combatFatigue.roundsBeforeTest) ?? null;
    if (roundsBeforeTest === null)
      roundsBeforeTest = actor.characteristics.t.bonus;

    return roundsBeforeTest;
  }

  /**
   * Returns the number of Rounds before the Actor falls unconscious.
   *
   * Number of Rounds is stored in Combatant's flag, if it's not present, the Toughness Bonus is returned.
   *
   * @param {Combatant} currentCombatant
   * @param {ActorWFRP4e} actor
   *
   * @returns {number}
   */
  #getRoundsBeforePassOut(currentCombatant, actor) {
    let roundsBeforePassOut = currentCombatant.getFlag(constants.moduleId, flags.combatFatigue.roundsBeforePassOut) ?? null;
    if (roundsBeforePassOut === null)
      roundsBeforePassOut = actor.characteristics.t.bonus;

    return roundsBeforePassOut;
  }
}