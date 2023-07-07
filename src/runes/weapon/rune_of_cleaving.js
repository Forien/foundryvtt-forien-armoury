if (args.opposedTest.attackerTest.weapon._id === this.item.id) {
  args.damage += 1;
  args.opposedTest.result.other.push(`<strong>Rune of Cleaving:</strong> +1 Damage.`);
}