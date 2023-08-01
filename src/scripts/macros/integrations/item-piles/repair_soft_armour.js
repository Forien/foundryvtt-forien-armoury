const api = game.modules.get("forien-armoury")?.api.itemRepair;

if (api && scope.buyer && scope.userId) {
  api.checkInventoryForDamage(scope.buyer, {
    paid: true,
    type: "armour",
    subtype: "softLeather"
    user: scope.userId
  });
}
