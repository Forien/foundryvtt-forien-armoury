const api = game.modules.get("forien-armoury")?.api.itemRepair;

if (api && scope.buyer && scope.userId) {
  api.checkInventoryForDamage(scope.buyer, {
    paid: true,
    type: "weapons",
    subtype: "basic,cavalry,fencing,brawling,flail,parry,polearm,twohanded",
    user: scope.userId
  });
}
