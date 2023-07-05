export default class Utility
{
  static moduleName = '';

  static init(moduleName) {
    Utility.moduleName = moduleName;
  }

  static notify(notification, {type="info", permanent=false}={}) {
    console.log(`🦊 %c${this.moduleName}: %c${notification}`, 'color: purple', 'color: #22aa22');
    ui.notifications.notify(notification, type, {permanent: permanent, console: false});
  }
}