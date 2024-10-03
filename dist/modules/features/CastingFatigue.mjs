import {debug} from "../utility/Debug.mjs";
import {constants, flags, settings} from "../constants.mjs";
import Utility from "../utility/Utility.mjs";
import MagicEnduranceDataModel from "../data-models/MagicEnduranceDataModel.js";
import ForienBaseModule from "../utility/ForienBaseModule.mjs";
import ScrollTest from "../tests/ScrollTest.mjs";

export default class CastingFatigue extends ForienBaseModule {
  #observer;
  #listeners = new Map();

  templates = {
    magicalEndurance: 'partials/actor-sheet-wfrp4e-magical-endurance.hbs',
  }

  /**
   * @inheritDoc
   */
  bindHooks() {
    Hooks.on("wfrp4e:rollChannelTest", this.#processRollChannelTest.bind(this));
    Hooks.on("wfrp4e:rollCastTest", this.#processRollCastTest.bind(this));
    Hooks.on("renderActorSheetWFRP4eCharacter", this.#onRenderActorSheet.bind(this));
    Hooks.on("renderActorSheetWFRP4eNPC", this.#onRenderActorSheet.bind(this));
    Hooks.on("renderActorSheetWFRP4eCharacterV2", this.#onRenderActorV2Sheet.bind(this));
    // Hooks.on("renderActorSheetWFRP4eNPCV2", this.#onRenderActorV2Sheet.bind(this));
    Hooks.on("ready", this.#registerAutoRegenListeners.bind(this));
  }

  /**
   * @return {number}
   */
  get costOfChanneling() {
    return Utility.getSetting(settings.magicalEndurance.costOfChanneling);
  }

  /**
   * @return {number}
   */
  get negativeMEPerStep() {
    return Utility.getSetting(settings.magicalEndurance.negativeMEPerStep);
  }


  /**
   * @return {boolean}
   */
  get useBaseCN() {
    return Utility.getSetting(settings.magicalEndurance.useBaseCN);
  }

  /**
   * @return {boolean}
   */
  get magicalEnduranceEnabled() {
    return Utility.getSetting(settings.magicalEndurance.enabled);
  }

  /**
   *
   * @param {ActorSheetWFRP4e} sheet
   * @param {jQuery} html
   * @param {{}} _options
   */
  #onRenderActorSheet(sheet, html, _options) {
    if (!this.magicalEnduranceEnabled) return;

    const tabMagic = html.find('.content .tab.magic');
    const actor = sheet.actor;
    const magicalEndurance = this.getMagicalEnduranceData(actor);

    renderTemplate(Utility.getTemplate(this.templates.magicalEndurance), magicalEndurance).then(content => {
      tabMagic.prepend(content);

      html.find('#magical-endurance-value').change((ev) => this.#onMagicalEnduranceValueChange(ev, actor));
    });
  }

  /**
   *
   * @param {ActorSheetWFRP4e} sheet
   * @param {HTMLElement} html
   * @param {{}} _options
   */
  #onRenderActorV2Sheet(sheet, html, _options) {
    if (!this.magicalEnduranceEnabled) return;

    const tabMagic = html.querySelector('.tab[data-tab="magic"]');
    const actor = sheet.actor;
    const magicalEndurance = this.getMagicalEnduranceData(actor);

    renderTemplate(Utility.getTemplate(this.templates.magicalEndurance), magicalEndurance).then(content => {
      const child = Utility.stringToHTMLElement(content)
      tabMagic.prepend(child);

      html.querySelector('#magical-endurance-value').addEventListener("change", (ev) => this.#onMagicalEnduranceValueChange(ev, actor));
    });
  }

  /**
   * @param {Event} ev
   * @param {ActorWFRP4e} actor
   *
   * @return {Promise<void>}
   */
  async #onMagicalEnduranceValueChange(ev, actor) {
    const value = ev.target.value;
    const magicalEndurance = this.getMagicalEnduranceData(actor);
    magicalEndurance.value = value;
    await this.saveMagicalEnduranceData(actor, magicalEndurance);
    actor.sheet?.render();
  }

  /**
   * @param {TestWFRP} test
   * @param {{}} options
   */
  #processRollCastTest(test, options) {
    if (!this.magicalEnduranceEnabled) return;

    debug('[CastingFatigue] Casting Test Rolled', {test, options, enabled: this.magicalEnduranceEnabled});

    if (!(test.actor instanceof ActorWFRP4e && test.actor.isOwner))
      return;

    if (test instanceof ScrollTest && Utility.getSetting(settings.scrolls.magicalEndurance) <= 0)
      return;

    this.spendMagicalEndurance(test.actor, this.getCnToUse(test));
  }

  /**
   * @param {TestWFRP} test
   * @param {{}} options
   */
  #processRollChannelTest(test, options) {
    if (!this.magicalEnduranceEnabled) return;
    debug('[CastingFatigue] Channeling Test Rolled', {test, options, enabled: this.magicalEnduranceEnabled});

    if (!(test.actor instanceof ActorWFRP4e && test.actor.isOwner))
      return;

    this.spendMagicalEndurance(test.actor, this.costOfChanneling);
  }

  /**
   * @param {TestWFRP} test
   *
   * @return {number}
   */
  getCnToUse(test) {
    if (test instanceof ScrollTest)
      return Utility.getSetting(settings.scrolls.magicalEndurance);

    return parseInt(this.useBaseCN ? test.spell?.cn.value : (test.spell?.cn.value - test.spell?.cn.SL));
  }

  /**
   *
   * @param {ActorWFRP4e} actor
   * @param {number} endurance
   *
   * @return {Promise<void>}
   */
  async spendMagicalEndurance(actor, endurance) {
    const magicalEndurance = this.getMagicalEnduranceData(actor);
    magicalEndurance.value -= endurance;

    await this.#processMagicalFatigue(actor, magicalEndurance);
    await this.saveMagicalEnduranceData(actor, magicalEndurance);
  }

  /**
   *
   * @param {MagicEnduranceDataModel} magicalEndurance
   *
   * @return {number|false}
   */
  checkMagicalEnduranceThreshold(magicalEndurance) {
    return magicalEndurance.value < 0 ? Math.floor(magicalEndurance.value / -this.negativeMEPerStep) : false;
  }

  /**
   *
   * @param {ActorWFRP4e} actor
   * @param {MagicEnduranceDataModel} magicalEndurance
   *
   * @return {TestWFRP|false}
   */
  async #processMagicalFatigue(actor, magicalEndurance) {
    const steps = this.checkMagicalEnduranceThreshold(magicalEndurance);

    if (steps === false) return false;

    const difficulty = this.getDifficultyFromSteps(steps);
    const test = await this.#performEnduranceTest(actor, difficulty);
    const outcome = test.outcome;

    if (outcome === 'failure')
      await actor.addCondition('fatigued');

    debug('[CastingFatigue] Magical Endurance dropped below 0', {magicalEndurance, steps, difficulty, test, outcome});

    return test;
  }

  /**
   *
   * @param {ActorWFRP4e} actor
   * @param {string} difficulty
   *
   * @return {Promise<TestWFRP>}
   */
  async #performEnduranceTest(actor, difficulty) {
    const enduranceSkill = game.i18n.localize("NAME.Endurance");
    const failure = [game.i18n.format("Forien.Armoury.CastingFatigue.TestFailure", {character: actor.name})];
    const success = [game.i18n.format("Forien.Armoury.CastingFatigue.TestSuccess", {character: actor.name})];
    const appendTitle = game.i18n.localize("Forien.Armoury.CastingFatigue.MagicalEnduranceTest");

    const test = await actor.setupSkill(enduranceSkill, {
      context: {failure, success},
      absolute: {difficulty},
      appendTitle: appendTitle
    })

    await test.roll();

    return test;
  }

  /**
   * @param {number} steps
   * @return {string}
   */
  getDifficultyFromSteps(steps) {
    const difficulties = this.#getNegativeDifficulties();
    const maxStep = difficulties.length - 1;
    const step = steps <= maxStep ? steps : maxStep;

    return difficulties[step];
  }

  /**
   * Returns array of difficulty KEYS, sorted from challenging (+0) to hardest (-??)
   *
   * @return {string[]}
   */
  #getNegativeDifficulties() {
    const difficultyModifiers = game.wfrp4e.config.difficultyModifiers;
    let difficulties = [];

    for (let difficulty in difficultyModifiers) {
      const modifier = difficultyModifiers[difficulty];
      if (modifier > 0) continue;

      difficulties.push({difficulty, modifier});
    }

    return difficulties.sort((a, b) => a.modifier < b.modifier ? 1 : -1).map(d => d.difficulty);
  }

  /**
   *
   * @param {ActorWFRP4e} actor
   *
   * @return {number}
   */
  getMaxMagicalEndurance(actor) {
    let value;

    switch (Utility.getSetting(settings.magicalEndurance.maxME)) {
      case settings.magicalEndurance.maxME_TBplus2WPB:
        value = actor.characteristics.t.bonus + (2 * actor.characteristics.wp.bonus);
        break;
      case settings.magicalEndurance.maxME_TBplusWPB:
        value = actor.characteristics.t.bonus + actor.characteristics.wp.bonus;
        break;
      case settings.magicalEndurance.maxME_TBtimesWPB:
      default:
        value = actor.characteristics.t.bonus * actor.characteristics.wp.bonus;
    }

    const talents = this.#countFortifiedMindTalent(actor);
    value += talents * actor.characteristics.wp.bonus;

    return value;
  }

  /**
   *
   * @param {ActorWFRP4e} actor
   *
   * @return {number}
   */
  getMagicalEnduranceRegeneration(actor) {
    let value = actor.characteristics.wp.bonus;
    const talents = this.#countFortifiedMindTalent(actor);
    value += talents;

    return value;
  }

  /**
   * @param {ActorWFRP4e} actor
   *
   * @return {MagicEnduranceDataModel}
   */
  getMagicalEnduranceData(actor) {
    const data = actor.getFlag(constants.moduleId, flags.magicalEndurance.flag);
    const model = new MagicEnduranceDataModel(data);

    model.virtual = (model.maximum === undefined);

    // always recalculate regen and maximum
    model.maximum = this.getMaxMagicalEndurance(actor);
    model.regen = this.getMagicalEnduranceRegeneration(actor);

    // if value was never set, set it to maximum
    if (model.value === undefined)
      model.value = model.maximum;

    // if lastRegen was never set, but autoRegen is enabled, set it to current world time
    if (model.lastRegen === undefined && Utility.getSetting(settings.magicalEndurance.autoRegen))
      model.lastRegen = game.time.worldTime;

    return model;
  }

  /**
   * @param {ActorWFRP4e} actor
   * @param {MagicEnduranceDataModel} data
   *
   * @return {MagicEnduranceDataModel}
   */
  async saveMagicalEnduranceData(actor, data) {
    await actor.setFlag(constants.moduleId, flags.magicalEndurance.flag, data.toObject());

    if (!this.#listeners.has(actor.id))
      this.#registerAutoRegenListener(actor, game.time.worldTime);
  }

  /**
   * @param {ActorWFRP4e} actor
   *
   * @return {number}
   */
  #countFortifiedMindTalent(actor) {
    const talentName = game.i18n.localize("Forien.Armoury.Settings.CastingFatigue.FortifiedMindTalent");

    return actor.itemTypes.talent.filter(t => t.name === talentName).length;
  }

  /**
   * On load, loop through all Actors and attempt to register listeners
   */
  #registerAutoRegenListeners() {
    if (!Utility.getSetting(settings.magicalEndurance.autoRegen)) return;

    this.#observer = game.modules.get(constants.moduleId).api.modules.get('worldTimeObserver');

    for (let actor of game.actors.contents) {
      if (!actor.isOwner) continue;
      if (!(actor.system instanceof StandardActorModel)) continue;
      this.#registerAutoRegenListener(actor);
    }
  }

  /**
   * Registers new listener with the WorldTimeObserver for Actors that use Magical Endurance Data
   *
   * @param {ActorWFRP4e} actor
   * @param {number|null} lastRegen
   */
  #registerAutoRegenListener(actor, lastRegen = null) {
    let data = this.getMagicalEnduranceData(actor);

    // No reason to listen on non-mage actors.
    if (data.virtual) return;
    if (data.value === data.maximum) return;

    let eventId = this.#observer.subscribe(this.#handleAutoRegenEvent.bind(this), {
      args: {id: actor.id},
      every: 3600,
      last: lastRegen ?? data.lastRegen
    });

    this.#listeners.set(actor.id, eventId);
  }

  /**
   * Handles regenerating ME whenever fired by WorldTimeObserver
   *
   * @param {{id: string}} args
   * @param {number} time
   *
   * @return {Promise<*>}
   */
  async #handleAutoRegenEvent(args, time) {
    const {id} = args;
    const actor = game.actors.get(id);

    if (!actor)
      return this.#unregisterListener(id);

    let data = this.getMagicalEnduranceData(actor);
    if (data.value >= data.maximum)
      return this.#unregisterListener(id);

    data.value += data.regen;
    data.lastRegen = time;
    await this.saveMagicalEnduranceData(actor, data);

    debug('[CastingFatigue] Handled Automated Regeneration event', {actor, magicalEndurance: data, listeners: this.#listeners})
  }

  /**
   * Unsubscribes specified listener from WorldTimeObserver
   *
   * @param {string} listenerId
   *
   * @return {boolean}
   */
  #unregisterListener(listenerId) {
    let eventId = this.#listeners.get(listenerId);
    this.#observer.unsubscribe(eventId);

    return this.#listeners.delete(listenerId);
  }
}