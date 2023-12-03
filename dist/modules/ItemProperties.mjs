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
      recoverable: 'Forien.Armoury.Arrows.Properties.Recoverable.Label',
    };

    config.weaponFlaws = {
      unrecoverable: 'Forien.Armoury.Arrows.Properties.Unrecoverable.Label',
    };

    config.propertyHasValue = {
      slashing: true,
      recoverable: false,
      unrecoverable: false,
    };

    config.qualityDescriptions = {
      slashing: 'Forien.Armoury.Arrows.Properties.Slashing.Description',
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