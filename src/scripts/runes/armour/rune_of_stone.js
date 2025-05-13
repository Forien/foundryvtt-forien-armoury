if (args.item?._id === this.item?.id) {
  let ap = args.item.system.AP;

  for (let loc in ap) {
    let location = args.item.system.AP[loc];
    if (location > 0)
      args.item.system.AP[loc] += 1;
  }
}
