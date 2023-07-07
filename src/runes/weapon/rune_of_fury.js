if (args.opposedTest.attackerTest.weapon._id === this.item.id) {
  let text = `<strong>Rune of Fury:</strong> Once per Round, if you hit an opponent in close combat, you may immediately spend an Advantage or your Move to make an extra attack (assuming you have your Move remaining).`;
  if (args.opposedTest.result.winner === "attacker") {
    args.opposedTest.result.other.push(text);
  }
}
