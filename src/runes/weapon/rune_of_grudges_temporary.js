ChatMessage.create({
  user: game.user._id,
  speaker: ChatMessage.getSpeaker({token: actor}),
  content: `
		<h3>Rune of Grudges</h3>
		<p>Character wielding weapon Engraved with this Rune can, on the <em>first Round of Combat</em>, nominate an enemy as the Target of this Rune. For the remainder of the Combat, <strong>you can reroll all failed attacks against the Target</strong>.</p>
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
