if (args.opposedTest.attackerTest.weapon._id === this.item.id) {
  args.damage += 1;
  let rune = game.i18n.localize("Forien.Armoury.Runes.RuneOfCleaving.name");
  let effect = game.i18n.localize("Forien.Armoury.Runes.RuneOfCleaving.effect");
  args.opposedTest.result.other.push(`<strong>${rune}:</strong> ${effect}.`);
}
