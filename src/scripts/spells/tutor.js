let attackerSize = args.attacker.sizeNum;
let mySize = args.actor.sizeNum;

if (attackerSize > mySize) {
  let sizeDiff = (attackerSize - mySize) * 2;
  args.AP.value += sizeDiff;

  let name = game.i18n.localize("Forien.Armoury.Runebound.Tutor.Name");
  let effect = game.i18n.format("Forien.Armoury.Runebound.Tutor.Effect", {num: sizeDiff});
  args.extraMessages.push(`<strong>${name}</strong> ${effect}`);
}

