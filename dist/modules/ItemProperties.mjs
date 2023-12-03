export default class ItemProperties {
  constructor() {
    this.appendProperties();
  }

  bindHooks() {
    // Append Properties on `setup` Hook to make sure we are after all official modules
    // Hooks.on("setup", this.appendProperties.bind(this));
    Hooks.on("wfrp4e:applyDamage", this.onApplyDamage.bind(this));
  }

  appendProperties() {
    const config = {};

    config.weaponQualities = {
      slashing: 'Forien.Armoury.Arrows.Properties.Slashing.Label',
      incendiary: 'Forien.Armoury.Arrows.Properties.Incendiary.Label',
      poisonous: 'Forien.Armoury.Arrows.Properties.Poisonous.Label',
      blinding: 'Forien.Armoury.Arrows.Properties.Blinding.Label',
      recoverable: 'Forien.Armoury.Arrows.Properties.Recoverable.Label',
    };

    config.weaponFlaws = {
      unrecoverable: 'Forien.Armoury.Arrows.Properties.Unrecoverable.Label',
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
      slashing: 'Forien.Armoury.Arrows.Properties.Slashing.Description',
      incendiary: 'Forien.Armoury.Arrows.Properties.Incendiary.Description',
      blinding: 'Forien.Armoury.Arrows.Properties.Blinding.Description',
      poisonous: 'Forien.Armoury.Arrows.Properties.Poisonous.Description',
      recoverable: 'Forien.Armoury.Arrows.Properties.Recoverable.Description',
    };

    config.flawDescriptions = {
      unrecoverable: 'Forien.Armoury.Arrows.Properties.Unrecoverable.Description',
    };

    foundry.utils.mergeObject(game.wfrp4e.config, config)
  }

  onApplyDamage(args) {
    const {
      actor,
      opposedTest,
      AP,
      extraMessages
    } = args;

    console.log(args);
    this.#checkForSlashing(opposedTest, AP, actor, extraMessages);
    this.#checkForIncendiary(opposedTest, actor, extraMessages);
    this.#checkForBlinding(opposedTest, actor, extraMessages);
    this.#checkForPoisonous(opposedTest, actor, extraMessages);
  }

  #checkForBlinding(opposedTest, actor, extraMessages) {
    const blinding = opposedTest.attackerTest.weapon?.properties.qualities.blinding?.value ?? null;
    if (blinding === null) return;

    actor.addCondition("blinded", blinding);
    extraMessages.push(game.i18n.format("Forien.Armoury.Arrows.Properties.Blinding.Message", {rating: blinding}));
  }

  #checkForIncendiary(opposedTest, actor, extraMessages) {
    const incendiary = opposedTest.attackerTest.weapon?.properties.qualities.incendiary?.value ?? null;
    if (incendiary === null) return;
    const die = opposedTest.attackerTest.result.roll % 10;
    if (die > incendiary) return;

    actor.addCondition("ablaze");
    extraMessages.push(game.i18n.format("Forien.Armoury.Arrows.Properties.Incendiary.Message", {die, rating: incendiary}));
  }

  #checkForPoisonous(opposedTest, actor, extraMessages) {
    const poisonous = opposedTest.attackerTest.weapon?.properties.qualities.poisonous?.value ?? null;
    if (poisonous === null) return;
    const sl = parseInt(opposedTest.attackerTest.result.SL);
    if (sl > poisonous) return;

    actor.addCondition("poisoned");
    extraMessages.push(game.i18n.format("Forien.Armoury.Arrows.Properties.Poisonous.Message", {sl, rating: poisonous}));
  }

  #checkForSlashing(opposedTest, AP, actor, extraMessages) {
    const slashing = opposedTest.attackerTest.weapon?.properties.qualities.slashing?.value ?? null;
    if (slashing === null) return;
    if (slashing < AP.used) return;

    actor.addCondition('bleeding');
    extraMessages.push(game.i18n.format("Forien.Armoury.Arrows.Properties.Slashing.Message", {
      location: AP.label,
      ap: AP.used,
      rating: slashing
    }));
  }
}