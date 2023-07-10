let weapon = args.attackerTest?.weapon
if (!weapon && args.attackerTest?.trait)
  weapon = args.attackerTest.trait

if (weapon) {
  let name = game.i18n.localize('Forien.Armoury.Runes.MasterRuneOfSteel.name');
  let effect = game.i18n.localize('Forien.Armoury.Runes.MasterRuneOfSteel.effect');

  weapon.system.flaws.value.push({name: "undamaging"});
  args.opposedTest.result.other.push(`<strong>${name}:</strong> ${effect}`);
}