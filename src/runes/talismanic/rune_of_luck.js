let luck = `@UUID[Compendium.wfrp4e-core.talents.Item.u0CFf3xwiyidD9T5]{Luck}`;
let name = game.i18n.localize('Forien.Armoury.Runes.RuneOfLuck.name');
let effect = game.i18n.format('Forien.Armoury.Runes.RuneOfLuck.effect', {luck: luck});

ChatMessage.create({
  user: game.user._id,
  speaker: this.actor.speaker,
  content: `
    <h2>${name}</h2>
    <p>${effect}</p>
`
})