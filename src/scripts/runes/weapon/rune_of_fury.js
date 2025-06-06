if (args.opposedTest.attackerTest.weapon._id === this.item.id) {
  if (args.opposedTest.result.winner === "attacker") {
    let rune = game.i18n.localize("Forien.Armoury.Runes.RuneOfFury.name");
    let effect = game.i18n.localize("Forien.Armoury.Runes.RuneOfFury.effect");
    let text = `<strong>${rune}:</strong> ${effect}`;
    args.opposedTest.result.other.push(text);
  }
}
