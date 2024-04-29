import {constants, settings} from "../constants.mjs";
import Utility from "../utility/Utility.mjs";
import {Debug} from "../utility/Debug.mjs";

export default class SettingsApp extends FormApplication {

  static #templates = {
    app: 'apps/settings/settings.hbs',
    tab: 'apps/settings/tab.hbs',
    promo: 'apps/settings/promo.hbs',
    setting: 'apps/settings/setting.hbs'
  }

  /**
   * Returns key->path pairs for Handlebar partials
   *
   * @return {{app: string, promo: string, tab: string, setting: string}}
   */
  static get partials() {
    return SettingsApp.#templates;
  }

  /**
   * @inheritDoc
   */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = settings.app;
    options.template = Utility.getTemplate(this.partials.app)
    options.width = 600;
    options.height = 650;
    options.minimizable = true;
    options.resizable = false;
    options.tabs = [{navSelector: ".tabs", contentSelector: ".content", initial: "main"}]
    options.title = `${constants.moduleLabel} – ${game.i18n.localize("SETTINGS.Configure")}`;
    return options;
  }

  /**
   * @inheritDoc
   */
  getData(options = {}) {
    let data = super.getData(options);

    data.tabs = this.processSettingTabs();

    return data;
  }

  /**
   * Returns setting's configuration data along with value and other useful properties
   *
   * @param {string} settingName
   *
   * @return {*|null}
   */
  prepareSetting(settingName) {
    const setting = game.settings.settings.get(`${constants.moduleId}.${settingName}`);

    if (!setting) return null;
    if (setting.scope === "world" && !game.user.isGM) return null;

    const s = foundry.utils.deepClone(setting);

    s.id = `${s.namespace}.${s.key}`;
    s.name = game.i18n.localize(s.name);
    s.hint = game.i18n.localize(s.hint);
    s.value = game.settings.get(s.namespace, s.key);
    s.type = setting.type instanceof Function ? setting.type.name : "String";
    s.isCheckbox = setting.type === Boolean;
    s.isSelect = s.choices !== undefined;
    s.isNumber = setting.type === Number;

    return s;
  }

  /**
   * Transforms Tab Structure Definition from `SettingsApp.settingTabs()` by filling it with settings' data and pruning out empty arrays and objects
   *
   * @return {{castingFatigue: {always: [string], enable: {settings: [string,string,string,string], when: string}}, arrow: {always: [string], enable: {settings: [string,string,string,string,string], when: string}}, combatFatigue: {always: [string], enable: {settings: [string], when: string}}, main: {always: [string,string]}, integrations: {groups: [[string],[string,string]]}}}
   */
  processSettingTabs() {
    const tabsData = this.settingTabs;

    for (const key in tabsData) {
      const tab = tabsData[key];

      if (tab.always) {
        tab.always = tab.always.map(this.prepareSetting).filter(s => !!s);
        if (tab.always.length === 0)
          delete tab.always;
      }

      if (tab.enable) {
        tab.enable.settings = tab.enable.settings.map(this.prepareSetting).filter(s => !!s);

        if (tab.enable.settings.length === 0)
          delete tab.enable;
      }

      if (tab.groups) {
        for (let i in tab.groups) {
          tab.groups[i] = tab.groups[i].map(this.prepareSetting).filter(s => !!s);
        }

        tab.groups = tab.groups.filter(g => g.length);
        if (tab.groups.length === 0)
          delete tab.groups;
      }

      if (foundry.utils.isEmpty(tab)) {
        delete tabsData[key];
      }
    }

    return tabsData;
  }

  /**
   * Returns Tab Definiton which is used to build tabs and sorting settings into proper places
   *
   * @return {{castingFatigue: {always: string[], enable: {settings: (string)[], when: string}}, arrow: {always: string[], enable: {settings: (string)[], when: string}}, combatFatigue: {always: string[], enable: {settings: string[], when: string}}, main: {always: (string)[]}, integrations: {groups: (string[]|(string)[])[]}}}
   */
  get settingTabs() {
    return {
      main: {
        always: [
          settings.runes.enableDamage,
          settings.diseases.autoProgress,
          Debug.setting,
        ]
      },

      arrow: {
        always: [
          settings.arrowReclamation.enable,
        ],
        enable: {
          when: settings.arrowReclamation.enable,
          settings: [
            settings.arrowReclamation.enableArrows,
            settings.arrowReclamation.enableBolts,
            settings.arrowReclamation.enableBullets,
            settings.arrowReclamation.rule,
            settings.arrowReclamation.percentage,
          ]
        }
      },

      combatFatigue: {
        always: [
          settings.combatFatigue.enable,
        ],
        enable: {
          when: settings.combatFatigue.enable,
          settings: [
            settings.combatFatigue.enableNPC,
            settings.combatFatigue.enableCorePassOut
          ]
        }
      },

      castingFatigue: {
        always: [
          settings.magicalEndurance.enabled
        ],
        enable: {
          when: settings.magicalEndurance.enabled,
          settings: [
            settings.magicalEndurance.maxME,
            settings.magicalEndurance.costOfChanneling,
            settings.magicalEndurance.negativeMEPerStep,
            settings.magicalEndurance.useBaseCN,
            settings.magicalEndurance.autoRegen,
          ]
        }
      },

      scrolls: {
        always: [
          settings.scrolls.allowOvercasting,
          settings.scrolls.ownCategory,
          settings.scrolls.difficultyMagick,
          settings.scrolls.difficulty,
          settings.scrolls.magicalEndurance,
          settings.scrolls.updateName,
          settings.scrolls.replaceDescription,
        ]
      },

      integrations: {
        groups: [
          [
            settings.integrations.atl.resetPresets,
          ],
          [
            settings.integrations.itemPiles.setCurrencies,
            settings.integrations.itemPiles.reimportRolltables,
          ],
        ]
      }
    }
  }

  /**
   * @inheritDoc
   */
  activateListeners(html) {
    const checkboxes = html.find('input[type="checkbox"]');

    checkboxes.change((ev) => {
      this.toggleActiveClass(ev.target, html);
    });

    checkboxes.each((i, e) => {
      this.toggleActiveClass(e, html);
    });
  }

  /**
   * Toggles Active Class on a element with proper `data-show-when` attribute based on Checkbox's status
   *
   * @param element
   * @param html
   */
  toggleActiveClass(element, html) {
    let name = element.name;
    let div = html.find(`[data-show-when="${name}"]`);
    div.toggleClass('active', element.checked);
  }

  /**
   * @inheritDoc
   */
  async _updateObject(event, formData) {
    for (let setting in formData)
      await game.settings.set(constants.moduleId, setting, formData[setting])
  }
}