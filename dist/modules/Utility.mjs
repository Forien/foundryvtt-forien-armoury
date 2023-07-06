export default class Utility {
  static moduleName = '';
  static moduleId = '';

  static init(moduleId, moduleName) {
    Utility.moduleId = moduleId;
    Utility.moduleName = moduleName;
  }

  static notify(notification, {type = "info", permanent = false} = {}) {
    console.log(`🦊 %c${this.moduleName}: %c${notification}`, 'color: purple', 'color: #22aa22');

    ui?.notifications?.notify(notification, type, {permanent: permanent, console: false});
  }

  static getTemplate(template) {
    if (Utility.moduleId === ``)
      throw new Error(`Module ID must be specified before using Utility.getTemplate() method!`);

    return `modules/${Utility.moduleId}/templates/${template}`;
  }
}