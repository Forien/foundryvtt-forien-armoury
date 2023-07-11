fromUuid("Compendium.wfrp4e-core.talents.Item.eowbsW6oHGSNJmxV").then(item => Item.create(item.toObject(), {
  fromEffect: this.effect.id,
  parent: this.actor
}))

this.effect.update({
  disabled: false,
  duration: {
    seconds: 60,
    duration: 60,
    type: 'seconds'
  },
  flags: {
    wfrp4e: {
      effectTrigger: '',
      script: ''
    }
  }
});