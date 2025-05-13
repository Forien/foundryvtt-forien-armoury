if (args.opposedTest.attackerTest.weapon._id === this.item.id) {
  if (args.opposedTest.defenderTest.actor.characteristics.t.bonus >= 5) {
    let rune = game.i18n.localize("Forien.Armoury.Runes.RuneOfMight.name");
    let effect = game.i18n.localize("Forien.Armoury.Runes.RuneOfMight.effect");
    args.damage += args.opposedTest.attackerTest.actor.characteristics.s.bonus;
    args.opposedTest.result.other.push(`<strong>${rune}:</strong> ${effect}`);
  }
}
