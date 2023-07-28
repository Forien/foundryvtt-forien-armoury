import ForienArmoury from "./ForienArmoury.mjs";

Hooks.once("init", () => {
  game.modules.get('forien-armoury').api = new ForienArmoury();
})