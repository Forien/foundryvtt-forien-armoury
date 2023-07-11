import ForienArmoury from "./ForienArmoury.mjs";

Hooks.once("init", () => {
  game.modules.get('forien-armoury').api = new ForienArmoury();
})
//
// Hooks.once('socketlib.ready', () => {
//   console.log("FORIEN SOCKETLIB");
//   game.modules.get('forien-armoury').socket = socketlib.registerModule('forien-armoury');
// });