let name = game.i18n.localize('Forien.Armoury.Runes.RuneOfIron.name');
let effect = game.i18n.localize('Forien.Armoury.Runes.RuneOfIron.effect');

args.totalWoundLoss-= 1;
args.opposedTest.result.other.push(`<strong>${name}:</strong> ${effect}.`);