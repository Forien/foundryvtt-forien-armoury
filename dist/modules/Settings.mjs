import {constants, settings} from "./constants.mjs";

export default class Settings {

  /**
   * Registers settings with the Foundry
   */
  registerSettings() {
    // Add enable/disable setting for temporary runes damaging items
    game.settings.register(constants.moduleId, settings.runes.enableDamage, {
      name: 'Forien.Armoury.Settings.Runes.Enable',
      hint: 'Forien.Armoury.Settings.Runes.EnableHint',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean
    });

    // Add enable/disable setting for combat fatigue feature
    game.settings.register(constants.moduleId, settings.combatFatigue.enable, {
      name: 'Forien.Armoury.Settings.CombatFatigue.Enable',
      hint: 'Forien.Armoury.Settings.CombatFatigue.EnableHint',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean
    });

    // Add enable/disable setting for NPC combat fatigue
    game.settings.register(constants.moduleId, settings.combatFatigue.enableNPC, {
      name: 'Forien.Armoury.Settings.CombatFatigue.EnableNPC',
      hint: 'Forien.Armoury.Settings.CombatFatigue.EnableNPCHint',
      scope: 'world',
      config: true,
      default: true,
      type: Boolean
    });

    // Add enable/disable setting for arrow reclamation feature
    game.settings.register(constants.moduleId, settings.arrowReclamation.enable, {
      name: 'Forien.Armoury.Settings.ArrowReclamation.Enable',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.EnableHint',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean
    });

    // Add enable/disable recovery of Arrows
    game.settings.register(constants.moduleId, settings.arrowReclamation.enableArrows, {
      name: 'Forien.Armoury.Settings.ArrowReclamation.EnableArrows',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.EnableArrowsHint',
      scope: 'world',
      config: true,
      default: true,
      type: Boolean
    });
    // Add enable/disable recovery of Bolts
    game.settings.register(constants.moduleId, settings.arrowReclamation.enableBolts, {
      name: 'Forien.Armoury.Settings.ArrowReclamation.EnableBolts',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.EnableBoltsHint',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean
    });
    // Add enable/disable recovery of Bullets
    game.settings.register(constants.moduleId, settings.arrowReclamation.enableBullets, {
      name: 'Forien.Armoury.Settings.ArrowReclamation.EnableBullets',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.EnableBulletsHint',
      scope: 'world',
      config: true,
      default: true,
      type: Boolean
    });

    // Add setting that allows for different rules of arrow reclamation
    game.settings.register(constants.moduleId, settings.arrowReclamation.rule, {
      name: 'Forien.Armoury.Settings.ArrowReclamation.Rule',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.RuleHint',
      scope: 'world',
      config: true,
      default: 'default',
      type: String,
      choices: {
        'default': 'Forien.Armoury.Settings.ArrowReclamation.DefaultRule',
        'success': 'Forien.Armoury.Settings.ArrowReclamation.SuccessRule',
        'noCrit': 'Forien.Armoury.Settings.ArrowReclamation.NoCritRule',
        'successNoCrit': 'Forien.Armoury.Settings.ArrowReclamation.SuccessNoCritRule',
        'failure': 'Forien.Armoury.Settings.ArrowReclamation.FailureRule',
        'failureNoCrit': 'Forien.Armoury.Settings.ArrowReclamation.FailureNoCritRule',
        'percentage': 'Forien.Armoury.Settings.ArrowReclamation.PercentageRule',
        'percentageNoCrit': 'Forien.Armoury.Settings.ArrowReclamation.PercentageNoCritRule',
      }
    });

    // Add Percentage setting for Percentage rules
    game.settings.register(constants.moduleId, settings.arrowReclamation.percentage, {
      name: 'Forien.Armoury.Settings.ArrowReclamation.Percentage',
      hint: 'Forien.Armoury.Settings.ArrowReclamation.PercentageHint',
      scope: 'world',
      config: true,
      default: 50,
      type: Number
    });

    game.settings.register(constants.moduleId, settings.initialized, {
      scope: 'world',
      config: false,
      default: false,
      type: Boolean
    });
  }


}