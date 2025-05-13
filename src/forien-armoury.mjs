import "../styles/forien-armoury.scss";
import {constants} from "./constants.mjs";

import ForienArmoury from "./ForienArmoury.mjs";
import {Debug}       from "./utility/Debug.mjs";

Hooks.once("init", () => {
  game.modules.get(constants.moduleId).api = new ForienArmoury();
});

Hooks.once("ready", () => {
  game.modules.get(constants.moduleId).api.modules.get("integrations").onReady();

  Debug.logSettings();
});