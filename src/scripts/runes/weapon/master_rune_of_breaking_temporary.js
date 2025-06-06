this.effect.update({
  flags: {
    wfrp4e: {
      effectTrigger: "opposedDefender",
      script: `

if (args.opposedTest.defenderTest.weapon?._id === this.item.id) {
  if (args.opposedTest.result.winner === "defender") {
    let effect = game.i18n.localize('Forien.Armoury.Runes.MasterRuneOfBreaking.effect');
    let rune = game.i18n.localize('Forien.Armoury.Runes.MasterRuneOfBreaking.name');
    args.opposedTest.result.other.push(\`<strong>${rune}:</strong> ${effect}\`);
    this.effect.update({disabled: true});
  }
}

`
    }
  }
});
