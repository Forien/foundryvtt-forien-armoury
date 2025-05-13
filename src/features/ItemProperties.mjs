import {settings}       from "../constants.mjs";
import {debug}          from "../utility/Debug.mjs";
import ForienBaseModule from "../utility/ForienBaseModule.mjs";
import Utility          from "../utility/Utility.mjs";

export default class ItemProperties extends ForienBaseModule {
  /**
   * @inheritDoc
   */
  bindHooks() {
    Hooks.on("wfrp4e:applyDamage", this.onApplyDamage.bind(this));
  }

  /**
   * Appends new qualities and flaws to WFRP4e's config, so it's recognized by the system
   *
   * @inheritDoc
   */
  applyWfrp4eConfig() {
    const config = {};

    if (!Utility.getSetting(settings.properties.enabled)) return config;

    config.weaponQualities = {
      slashing: "Forien.Armoury.Arrows.Properties.Slashing.Label",
      incendiary: "Forien.Armoury.Arrows.Properties.Incendiary.Label",
      poisonous: "Forien.Armoury.Arrows.Properties.Poisonous.Label",
      blinding: "Forien.Armoury.Arrows.Properties.Blinding.Label",
      recoverable: "Forien.Armoury.Arrows.Properties.Recoverable.Label",
    };

    config.weaponFlaws = {
      unrecoverable: "Forien.Armoury.Arrows.Properties.Unrecoverable.Label",
    };

    config.propertyHasValue = {
      slashing: true,
      blinding: true,
      poisonous: true,
      incendiary: true,
      recoverable: false,
      unrecoverable: false,
    };

    config.qualityDescriptions = {
      slashing: "Forien.Armoury.Arrows.Properties.Slashing.Description",
      incendiary: "Forien.Armoury.Arrows.Properties.Incendiary.Description",
      blinding: "Forien.Armoury.Arrows.Properties.Blinding.Description",
      poisonous: "Forien.Armoury.Arrows.Properties.Poisonous.Description",
      recoverable: "Forien.Armoury.Arrows.Properties.Recoverable.Description",
    };

    config.flawDescriptions = {
      unrecoverable: "Forien.Armoury.Arrows.Properties.Unrecoverable.Description",
    };

    return config;
  }

  /**
   * Whenever 'wfrp4e:applyDamage' Hook is called, checks for presence of certain weapon properties and applies their
   * effects
   * @param {{
   *   AP: {},
   *   abort: boolean,
   *   actor: ActorWFRP4e,
   *   applyAP: boolean,
   *   applyTB: boolean,
   *   attacker: ActorWFRP4e,
   *   damageType: number,
   *   extraMessages: string[],
   *   modifiers: {
   *     tb: number,
   *     ap: {
   *         value: number,
   *         used: number,
   *         ignored: number,
   *         metal: number,
   *         nonmetal: number,
   *         magical: number,
   *         shield: number,
   *         details: []
   *     },
   *     other: [],
   *     minimumOne: boolean,
   *     total: number
   * }
   *   opposedTest: OpposedTest,
   *   totalWoundLoss: number,
   *   updateMsg: string,
   *   ward: number,
   *   wardRoll: number
   * }} args arguments passed from WFRP4e system
   */
  onApplyDamage(args) {
    const {
      actor,
      AP,
      opposedTest,
      modifiers,
      extraMessages,
    } = args;

    debug("[ItemProperties] onApplyDamage arguments:", args);
    this.#checkForSlashing(opposedTest, AP, modifiers, actor, extraMessages);
    this.#checkForIncendiary(opposedTest, actor, extraMessages);
    this.#checkForBlinding(opposedTest, actor, extraMessages);
    this.#checkForPoisonous(opposedTest, actor, extraMessages);
  }

  /**
   * Checks if weapon used by attacker has Blinding Quality
   *
   * @param {OpposedTest} opposedTest Opposed Test of the attack
   * @param {ActorWFRP4e} actor Actor receiving the damage
   * @param {string[]} extraMessages Array containing additional messages that appear on the Chat Card
   */
  #checkForBlinding(opposedTest, actor, extraMessages) {
    const blinding = opposedTest.attackerTest.weapon?.properties.qualities.blinding?.value ?? null;
    if (blinding === null) return;

    debug("[ItemProperties] Blinding property used:", {opposedTest, actor, extraMessages, rating: blinding});
    actor.addCondition("blinded", blinding);
    extraMessages.push(game.i18n.format("Forien.Armoury.Arrows.Properties.Blinding.Message", {rating: blinding}));
  }

  /**
   * Checks if weapon used by attacker has Incendiary Quality
   *
   * @param {OpposedTest} opposedTest Opposed Test of the attack
   * @param {ActorWFRP4e} actor Actor receiving the damage
   * @param {string[]} extraMessages Array containing additional messages that appear on the Chat Card
   */
  #checkForIncendiary(opposedTest, actor, extraMessages) {
    const incendiary = opposedTest.attackerTest.weapon?.properties.qualities.incendiary?.value ?? null;
    if (incendiary === null) return;

    const die = opposedTest.attackerTest.result.roll % 10;
    debug("[ItemProperties] Incendiary property used:", {opposedTest, actor, extraMessages, die, rating: incendiary});
    if (die > incendiary) return;

    actor.addCondition("ablaze");
    extraMessages.push(game.i18n.format("Forien.Armoury.Arrows.Properties.Incendiary.Message", {
      die,
      rating: incendiary,
    }));
  }

  /**
   * Checks if weapon used by attacker has Poisonous Quality
   *
   * @param {OpposedTest} opposedTest Opposed Test of the attack
   * @param {ActorWFRP4e} actor Actor receiving the damage
   * @param {string[]} extraMessages Array containing additional messages that appear on the Chat Card
   */
  #checkForPoisonous(opposedTest, actor, extraMessages) {
    const poisonous = opposedTest.attackerTest.weapon?.properties.qualities.poisonous?.value ?? null;
    if (poisonous === null) return;

    const sl = parseInt(opposedTest.attackerTest.result.SL);
    debug("[ItemProperties] Poisonous property used:", {opposedTest, actor, extraMessages, sl, rating: poisonous});
    if (sl < poisonous) return;

    actor.addCondition("poisoned");
    extraMessages.push(game.i18n.format("Forien.Armoury.Arrows.Properties.Poisonous.Message", {sl, rating: poisonous}));
  }

  /**
   * Checks if weapon used by attacker has Slashing Quality
   *
   * @param {OpposedTest} opposedTest Opposed Test of the attack
   * @param {{}} AP abstract object containing information about Armour Points
   * @param {{}} modifiers abstract object containing information about damage modifiers
   * @param {ActorWFRP4e} actor Actor receiving the damage
   * @param {string[]} extraMessages Array containing additional messages that appear on the Chat Card
   */
  #checkForSlashing(opposedTest, AP, modifiers, actor, extraMessages) {
    const slashing = opposedTest.attackerTest.weapon?.properties.qualities.slashing?.value ?? null;
    if (slashing === null) return;

    let apUsed = modifiers.ap.used;
    debug(
      "[ItemProperties] Slashing property used:",
      {opposedTest, actor, extraMessages, rating: slashing, ap: apUsed},
    );
    if (slashing < apUsed) return;

    actor.addCondition("bleeding");
    extraMessages.push(game.i18n.format("Forien.Armoury.Arrows.Properties.Slashing.Message", {
      location: AP.label,
      ap: apUsed,
      rating: slashing,
    }));
  }
}