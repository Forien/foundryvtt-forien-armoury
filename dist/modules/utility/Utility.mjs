import {constants} from '../constants.mjs';

export default class Utility {

  /**
   * Provides a single point of entry to handle all Module's notifications in a consistent manner
   *
   * @param {string} notification                       Text of the notification
   * @param {'error'|'warning'|'info'|'debug'} type     type of the notification
   * @param {boolean} permanent                         should the notification stay until closed?
   * @param {boolean} consoleOnly                       should the notification be suppressed and only shown in console?
   * @param {*} data                                    additional data to output in the console
   * @param {boolean} trace                             whether to use `console.trace()` instead of `console.log()`
   *
   * @return {false}
   */
  static notify(notification, {type = 'info', permanent = false, consoleOnly = false, data = '', trace = false} = {}) {
    // brand colour: '#3e1395' is too dark for dark mode console;
    const purple = 'purple';
    let colour;

    switch (type) {
      case 'error':
        colour = '#aa2222';
        trace = true;
        break;
      case 'warning':
        colour = '#aaaa22';
        trace = true;
        break;
      case 'debug':
        colour = '#5555ff';
        break;
      case 'info':
      default:
        colour = '#22aa22';
    }

    if (trace)
      console.trace(`🦊 %c${constants.moduleLabel}: %c${notification}`, `color: ${purple}`, `color: ${colour}`, data);
    else
      console.log(`🦊 %c${constants.moduleLabel}: %c${notification}`, `color: ${purple}`, `color: ${colour}`, data);

    if (!consoleOnly)
      ui?.notifications?.notify(notification, type, {permanent: permanent, console: false, localize: true});

    return false;
  }

  /**
   * Provides a single point of entry to handle all Module's errors in a consistent manner
   *
   * @param {string} notification         Text of the notification
   * @param {Error} error                 original error object
   * @param {boolean} permanent           should the notification stay until closed?
   * @param {*} data                      additional data to output in the console
   *
   * @return {false}
   */
  static error(notification, {permanent = false, data = {}, error = null} = {}) {
    Utility.notify(notification, {type: 'error', consoleOnly: false, permanent, data});

    if (error)
      console.error(error);

    return false;
  }

  /**
   * Returns full module path for the template based on relative path/name only
   *
   * @param {string} template relative path / template's name
   *
   * @return {string}
   */
  static getTemplate(template) {
    if (typeof template !== 'string')
      return undefined;

    return `modules/${constants.moduleId}/templates/${template}`;
  }

  /**
   * Preloads provided templates
   *
   * @param {{}} templates
   */
  static preloadTemplates(templates = {}) {
    Utility.notify("Preloading Templates.", {consoleOnly: true})
    templates = foundry.utils.flattenObject(templates)

    for (let [key, template] of Object.entries(templates)) {
      templates[key] = Utility.getTemplate(template);
      if (templates[key] === undefined) delete templates[key];
    }

    loadTemplates(templates).then(() => {
      Utility.notify("Templates preloaded.", {consoleOnly: true})
    });
  }

  /**
   * Returns Module's setting
   *
   * @param {string} setting name of the setting to retrieve
   *
   * @return {*}
   */
  static getSetting(setting) {
    return game.settings.get(constants.moduleId, setting);
  }

  /**
   * Converts a string representing a HTML containing a single top level node to ChildNode.
   *
   * @param {string} string
   * @returns {ChildNode}
   */
  static stringToHTMLElement(string) {
    const element = document.createElement('template');
    element.innerHTML = string.trim();
    return element.content.firstChild;
  }
}