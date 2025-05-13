const api = game.modules.get("forien-armoury")?.api.itemRepair;

if (api)
  api.checkInventoryForDamage(actor, {paid: true});
