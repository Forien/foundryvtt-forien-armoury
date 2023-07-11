let fortuneJournal = `@UUID[JournalEntry.NS3YGlJQxwTggjRX.JournalEntryPage.pa22HaRw1OBBQaDg#spending-fortune]{Spending Fortune}`;
let name = game.i18n.localize('Forien.Armoury.Runes.RuneOfLuckTemporary.name');
let effect = game.i18n.localize('Forien.Armoury.Runes.RuneOfLuckTemporary.effectActivated');
let checkPrompt = game.i18n.format('Forien.Armoury.Runes.RuneOfLuckTemporary.checkPrompt', {journal: fortuneJournal});

ChatMessage.create({
  user: game.user._id,
  speaker: this.actor.speaker,
  content: `
    <h2>${name}</h2>
    <p>${effect}</p>
    <p>${checkPrompt}</p>
`
})

this.effect.update({disabled: true});