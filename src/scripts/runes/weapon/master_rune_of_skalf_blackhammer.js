if (args.item?._id === this.item?.id) {
  let regex = /\d{1,3}/gm;
  let damage = Number(regex.exec(args.item.system.damage.value)[0] || 0);

  args.item.system.qualities.value.push({name: "impact"});
  args.item.system.damage.value = args.item.system.damage.value.replace(damage, damage + 1);
}
