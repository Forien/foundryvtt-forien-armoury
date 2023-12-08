import ForienArmoury from "./ForienArmoury.mjs";
import {constants} from "./constants.mjs";
import {Debug} from "./utility/Debug.mjs";

Hooks.once("init", () => {
  game.modules.get(constants.moduleId).api = new ForienArmoury();
})

Hooks.once("ready", () => {
  game.modules.get(constants.moduleId).api.integrations.ready();

  Debug.logSettings();
})