let rune = game.i18n.localize('Forien.Armoury.Runes.RuneOfGrudges.name');
let effect = game.i18n.localize('Forien.Armoury.Runes.RuneOfGrudges.effect');
ChatMessage.create({
  user: game.user._id,
  speaker: ChatMessage.getSpeaker({token: actor}),
  content: `
		<h3>${rune}</h3>
		<p>${effect}</p>
	`
});

this.effect.update({
  flags: {
    wfrp4e: {
      effectTrigger: "endCombat",
      script: "this.effect.update({disabled: true});"
    }
  }
});
