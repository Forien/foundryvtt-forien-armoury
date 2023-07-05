import ForienArmoury from "./modules/ForienArmoury.mjs";

Hooks.once("init", () => {
  game.modules.get("forien-armoury").api = new ForienArmoury();
})