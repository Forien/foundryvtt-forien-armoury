if (args.item?._id === this.item?.id) {
  args.item.system.range.value = "24";
  args.item.system.modeOverride.value = "ranged";
  args.item.system.skill.value = "Ranged (Throwing)";
  args.item.system.consumesAmmo.value = false;
}
