let ablaze = this.actor.hasCondition("ablaze");

if (ablaze) {
  let name = game.i18n.localize('Forien.Armoury.Runes.RuneOfTheFurnace.name');
  let effect = game.i18n.localize('Forien.Armoury.Runes.RuneOfTheFurnace.effect');

  ablaze.delete();
  ui.notifications?.notify(`<strong>${name}</strong>  ${effect}`);
}