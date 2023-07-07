args.initiative += ` + 1d10`;

ChatMessage.create({
  user: game.user._id,
  speaker: ChatMessage.getSpeaker({token: actor}),
  content: `
		<h3>Rune of Speed</h3>
		<p>Character wielding weapon Engraved with this Rune adds a +1d10 to their Initiative Score during the Combat.</p>
	`
});