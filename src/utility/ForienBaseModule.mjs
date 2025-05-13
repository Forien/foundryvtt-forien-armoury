export default class ForienBaseModule {
  camelName;
  templates = {};
  socket;

  constructor() {
    this.camelName = this.#camelName;
  }

  /**
   * Returns class' name in camelCase
   *
   * @private
   * @return {string}
   */
  get #camelName() {
    return this.constructor.name[0].toLowerCase() + this.constructor.name.slice(1);
  }

  /**
   * Registers listeners for the Foundry Hooks
   */
  bindHooks() {}

  getTemplates() {
    return this.templates;
  }

  /**
   * Registers sockets used by this module
   *
   * @param {SocketlibSocket} socket
   */
  registerSockets(socket) {
    this.socket = socket;
    this.registerSocketMethods();
  }

  /**
   * Registers socket methods used by this module
   */
  registerSocketMethods() {}

  /**
   * Registers Settings with the Foundry
   */
  registerSettings() {}

  /**
   * Handles initial configuration if needed
   */
  initialConfig() {}

  /**
   * Returns object that will be merged into `game.wfrp4e.config` on `init`
   *
   * @return {{}}
   */
  applyWfrp4eConfig() {
    return {};
  }
}
