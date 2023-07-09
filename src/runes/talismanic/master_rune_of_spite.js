let name = game.i18n.localize('Forien.Armoury.Runes.MasterRuneOfSpite.name');
let effect = game.i18n.localize('Forien.Armoury.Runes.MasterRuneOfSpite.effect');

args.totalWoundLoss-= 2;
args.opposedTest.result.other.push(`<strong>${name}:</strong> ${effect}.`);