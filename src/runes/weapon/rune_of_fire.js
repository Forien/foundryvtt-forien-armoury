if (args.opposedTest.attackerTest.weapon._id === this.item.id) {
  if (args.opposedTest.attackerTest.result.critical) {
    args.actor.addCondition("ablaze");
    args.extraMessages.push(`<strong>Rune of Fire:</strong> +1 @Condition[Ablaze] Condition.`);
  }
}