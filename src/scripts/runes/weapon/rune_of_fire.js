if (args.opposedTest.attackerTest.weapon._id === this.item.id) {
  if (args.opposedTest.attackerTest.result.critical) {
    args.actor.addCondition("ablaze");
    let rune = game.i18n.localize("Forien.Armoury.Runes.RuneOfFire.name");
    let effect = game.i18n.localize("Forien.Armoury.Runes.RuneOfFire.effect");
    args.extraMessages.push(`<strong>${rune}:</strong> ${effect}.`);
  }
}
