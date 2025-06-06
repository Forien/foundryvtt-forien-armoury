fromUuid("Compendium.wfrp4e-core.talents.Item.eowbsW6oHGSNJmxV").then(item => Item.create(item.toObject(), {
  fromEffect: this.effect.id,
  parent: this.actor
}));
