let name = game.i18n.localize("Forien.Armoury.Runes.RuneOfSpelleating.name");
let effect = game.i18n.localize("Forien.Armoury.Runes.RuneOfSpelleating.effect");

ChatMessage.create({
  user: game.user._id,
  speaker: this.actor.speaker,
  content: `
    <h2>${name}</h2>
    <p>${effect}</p>
`
});

this.effect.update({disabled: true});
