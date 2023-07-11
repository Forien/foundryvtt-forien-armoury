let wounds = args.actor.status.wounds.value;
let woundLoss = args.totalWoundLoss;
let woundsAfter= wounds - woundLoss;

if (woundsAfter < 0) {
  args.totalWoundLoss = 0;
  let msg = `<strong>${game.i18n.localize('Forien.Armoury.Runes.RuneOfFate.name')}:</strong> ${game.i18n.localize('Forien.Armoury.Runes.RuneOfFate.effect')}`
  args.extraMessages.push(msg);

  this.effect.update({disabled: true});
}