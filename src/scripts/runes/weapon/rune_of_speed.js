args.initiative += ` + 1d10`;
let rune = game.i18n.localize('Forien.Armoury.Runes.RuneOfSpeed.name');
let effect = game.i18n.localize('Forien.Armoury.Runes.RuneOfSpeed.effect');

ChatMessage.create({
  user: game.user._id,
  speaker: ChatMessage.getSpeaker({token: actor}),
  content: `
		<h3>${rune}</h3>
		<p>${effect}</p>
	`
});