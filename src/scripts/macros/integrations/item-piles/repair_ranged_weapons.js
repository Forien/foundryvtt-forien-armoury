const api = game.modules.get("forien-armoury")?.api.itemRepair;

if (api && scope.buyer && scope.userId) {
  api.checkInventoryForDamage(scope.buyer, {
    paid: true,
    type: "weapons",
    subtype: "bow,crossbow,entangling,sling,throwing"
    user: scope.userId
  });
}
