import {constants} from '../constants.mjs';

export default class Utility {
  static notify(notification, {type = 'info', permanent = false, consoleOnly = false, data = ''} = {}) {
    // brand colour: '#3e1395' is too dark for dark mode console;
    const purple = 'purple';
    let colour;

    switch (type) {
      case 'error':
        colour = '#aa2222';
        break;
      case 'warning':
        colour = '#aaaa22';
        break;
      case 'debug':
        colour = '#5555ff';
        break;
      case 'info':
      default:
        colour = '#22aa22';
    }

    console.log(`🦊 %c${constants.moduleLabel}: %c${notification}`, `color: ${purple}`, `color: ${colour}`, data);

    if (!consoleOnly)
      ui?.notifications?.notify(notification, type, {permanent: permanent, console: false});
  }

  static getTemplate(template) {
    return `modules/${constants.moduleId}/templates/${template}`;
  }

  static preloadTemplates(templates = []) {
    Utility.notify("Preloading Templates.", {consoleOnly: true})

    templates = templates.map(Utility.getTemplate);
    loadTemplates(templates).then(() => {
      Utility.notify("Templates preloaded.", {consoleOnly: true})
    });
  }

  static getSetting(setting) {
    return game.settings.get(constants.moduleId, setting);
  }
}