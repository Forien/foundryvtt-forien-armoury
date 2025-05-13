import {constants} from "../constants.mjs";
import Utility     from "./Utility.mjs";

class Debug {
  static #debugSetting = "debug";

  static get setting() {
    return Debug.#debugSetting;
  }

  /**
   * Prints current module's settings to console for reference
   */
  static logSettings() {
    Debug.debug("Current game settings:", Debug.summarizeSettings);
  }

  /**
   * Prints out the debug message along with additional data (if provided)
   *
   * @param {String} msg   Debug message
   * @param {any} data     Additional data to output next to the message
   */
  static debug(msg, data = "") {
    if (Debug.enabled)
      Utility.notify(msg, {type: "debug", consoleOnly: true, data: data});
  }

  /**
   * Registers the setting with the Foundry to allow users to enable Debug mode
   */
  static registerSetting() {
    game.settings.register(constants.moduleId, Debug.setting, {
      name: "Forien.Settings.Debug.Enable",
      hint: "Forien.Settings.Debug.EnableHint",
      scope: "client",
      config: false,
      default: false,
      type: Boolean,
    });
  }

  /**
   * Returns value of the "Debug mode enable" setting
   *
   * @return {boolean}
   */
  static get enabled() {
    return game.settings.get(constants.moduleId, Debug.#debugSetting);
  }

  /**
   * Returns object of a quick settings summary
   *
   * @return {{}}
   */
  static get summarizeSettings() {
    const moduleSettings = {};
    for (let [_key, setting] of game.settings.settings.entries()) {
      if (setting.namespace !== constants.moduleId) continue;

      const name = setting.name ? game.i18n.localize(setting.name) : setting.key;
      moduleSettings[name] = game.settings.get(constants.moduleId, setting.key);
    }

    return moduleSettings;
  }
}

/**
 * Facade for the Debug.debug() function
 *
 * @param {String} msg   Debug message
 * @param {any} data     Additional data to output next to the message
 */
function debug(msg, data = "") {
  Debug.debug(msg, data);
}

export {Debug, debug};