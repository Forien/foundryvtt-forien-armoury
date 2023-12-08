import {constants} from "../constants.mjs";
import Utility from "./Utility.mjs";

class Debug {
  static #debugSetting = 'debug';


  static logSettings() {
    Debug.debug('Current game settings:', Debug.summarizeSettings);
  }

  static debug(msg, data = '') {
    if (Debug.enabled)
      Utility.notify(msg, {type: 'debug', consoleOnly: true, data: data});
  }

  static registerSetting() {
    game.settings.register(constants.moduleId, Debug.#debugSetting, {
      name: 'Forien.Settings.Debug.Enable',
      hint: 'Forien.Settings.Debug.EnableHint',
      scope: 'client',
      config: true,
      default: false,
      type: Boolean
    });
  }

  static get enabled() {
    return game.settings.get(constants.moduleId, Debug.#debugSetting);
  }

  static get summarizeSettings() {
    const moduleSettings = {}
    for (let [key, setting] of game.settings.settings.entries()) {
      if (setting.namespace !== constants.moduleId) continue;

      const name = setting.name ? game.i18n.localize(setting.name) : setting.key;
      moduleSettings[name] = game.settings.get(constants.moduleId, setting.key);
    }

    return moduleSettings;
  }
}

/**
 * @param {String} msg
 * @param {any} data
 */
function debug(msg, data = '') {
  Debug.debug(msg, data);
}

export {Debug, debug};