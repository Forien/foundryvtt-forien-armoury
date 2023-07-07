if (args.opposedTest.attackerTest.weapon._id === this.item.id) {
  if (args.opposedTest.defenderTest.actor.characteristics.t.bonus >= 5) {
    args.damage += args.opposedTest.attackerTest.actor.characteristics.s.bonus;
    args.opposedTest.result.other.push(`<strong>Rune of Might:</strong> SB doubled against enemies with TB equal to or higher than 5.`);
  }
}