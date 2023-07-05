import ForienArmoury from "./modules/ForienArmoury.mjs";

Hooks.once("ready", () => {
  console.log("Forien Ready");
  game.modules.get("forien-armoury").api = new ForienArmoury();
})