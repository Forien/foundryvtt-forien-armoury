const constants = {
  modulePath: 'modules/forien-armoury',
  moduleId: 'forien-armoury',
  moduleLabel: 'Forien\'s Armoury',
  loopLimit: 100
};

const dataTypes = {
  scroll: `${constants.moduleId}.scroll`,
  grimoire: `${constants.moduleId}.grimoire`
}

const flags = {
  ammoReplenish: 'ammoReplenish',
  combatFatigue: {
    roundsBeforeTest: 'roundsBeforeTest',
    roundsBeforePassOut: 'roundsBeforePassOut'
  },
  diseases: {
    lastProgress: 'lastProgress'
  },
  effects: {
    target: 'target'
  },
  grimoires: {
    source: 'sourceGrimoire'
  },
  integrations: {
    itemPiles: {
      isImportFolder: 'isImportFolder'
    }
  },
  injuries: {
    lastProgress: 'lastProgress'
  },
  itemRepair: {
    type: 'type',
    subtype: 'subtype'
  },
  magicalEndurance: {
    flag: 'magical-endurance',
    value: 'value',
    regenPerHour: 'regen',
    lastRegen: 'lastRegen',
    maximum: 'maximum'
  },
  talents: {
    fightingStyle: 'fighting-style',
    fightingMaster: 'fighting-master'
  }
}

const settings = {
  actor: {
    rollToken: 'actor.rollOnTokenCreation',
    rollMoney: 'actor.rollMoney',
    defaultMoney: 'actor.defaultMoney',
    moneyMode: 'actor.moneyMode',
    rollMode: 'actor.rollMode',
    choices: {
      always: 'always',
      ask: 'ask',
      askNPC: 'askNPC',
    }
  },
  app: `${constants.moduleId}-settings-app`,
  arrowReclamation: {
    enable: 'arrowReclamation.Enable',
    enableArrows: 'arrowReclamation.EnableArrows',
    enableBolts: 'arrowReclamation.EnableBolts',
    enableBullets: 'arrowReclamation.EnableBullets',
    rule: 'arrowReclamation.Rule',
    percentage: 'arrowReclamation.Percentage',
    choices: {
      default: 'default',
      success: 'success',
      noCrit: 'noCrit',
      successNoCrit: 'successNoCrit',
      failure: 'failure',
      failureNoCrit: 'failureNoCrit',
      percentage: 'percentage',
      percentageNoCrit: 'percentageNoCrit'
    }
  },
  combatFatigue: {
    enable: 'combatFatigue.enable',
    enableNPC: 'combatFatigue.enableNPC',
    enableCorePassOut: 'combatFatigue.enableCorePassOut'
  },
  diseases: {
    autoProgress: 'diseases.automateProgression'
  },
  grimoires: {
    requireEquipped: 'grimoires.requireEquipped',
    transferWithoutLore: 'grimoires.transferWithoutLore',
    requireReadWrite: 'grimoires.requireReadWrite',
    hideSpellsWithoutLanguage: 'grimoires.hideSpellsWithoutLanguage',
    ownCategory: 'grimoires.ownCategory',
    defaultEncumbrance: 'grimoires.defaultEncumbrance',
    defaultAvailability: 'grimoires.defaultAvailability'
  },
  initialized: 'module.initialized',
  injuries: {
    autoProgress: 'injuries.automateProgression'
  },
  integrations: {
    atl: {
      resetPresets: 'atl.resetPresets'
    },
    itemPiles: {
      setCurrencies: 'itempiles.setCurrencies',
      rolltablesImported: 'itempiles.rolltablesImported',
      reimportRolltables: 'itempiles.rolltablesImport',
    }
  },
  magicalEndurance: {
    enabled: 'magicalEndurance.enabled',
    maxME: 'magicalEndurance.maxME',
    maxME_TBtimesWPB: 'TBtimesWPB',
    maxME_TBplusWPB: 'TBplusWPB',
    maxME_TBplus2WPB: 'TBplus2WPB',
    costOfChanneling: 'magicalEndurance.costOfChanneling',
    negativeMEPerStep: 'magicalEndurance.negativeMEPerStep',
    useBaseCN: 'magicalEndurance.useBaseCN',
    autoRegen: 'magicalEndurance.automateRegen'
  },
  properties: {
    enabled: 'properties.enabled'
  },
  runes: {
    enableDamage: 'runes.damageEnable'
  },
  scrolls: {
    allowOvercasting: 'scrolls.allowOvercasting',
    allowOvercastingMagick: 'magick',
    ownCategory: 'scrolls.ownCategory',
    difficultyMagick: 'scrolls.difficultyMagick',
    difficulty: 'scrolls.difficulty',
    magicalEndurance: 'scrolls.magicalEndurance',
    updateName: 'scrolls.updateName',
    ask: 'ask',
    always: 'always',
    never: 'never',
    replaceDescription: 'scrolls.replaceDescription',
    defaultEncumbrance: 'scrolls.defaultEncumbrance',
    defaultAvailability: 'scrolls.defaultAvailability'
  }
}

const defaults = {
  actor: {
    rollToken: false,
    rollMoney: false,
    defaultMoney: '4d12',
    moneyMode: settings.actor.choices.askNPC,
    rollMode: settings.actor.choices.askNPC
  },
  arrowReclamation: {
    enable: false,
    enableArrows: true,
    enableBolts: false,
    enableBullets: true,
    rule: settings.arrowReclamation.choices.default,
    percentage: 50
  },
  combatFatigue: {
    enable: false,
    enableNPC: true,
    enableCorePassOut: false,
  },
  diseases: {
    autoProgress: false
  },
  grimoires: {
    requireEquipped: true,
    transferWithoutLore: false,
    requireReadWrite: true,
    hideSpellsWithoutLanguage: true,
    ownCategory: true,
    defaultEncumbrance: 1,
    defaultAvailability: "exotic",
  },
  injuries: {
    autoProgress: false
  },
  magicalEndurance: {
    enabled: false,
    costOfChanneling: 1,
    negativeMEPerStep: 5,
    useBaseCN: true,
    maxME: settings.magicalEndurance.maxME_TBtimesWPB,
    autoRegen: false
  },
  properties: {
    enabled: true
  },
  runes: {
    enableDamage: false
  },
  scrolls: {
    allowOvercasting: settings.scrolls.allowOvercastingMagick,
    difficulty: 'hard',
    difficultyMagick: 'challenging',
    ownCategory: true,
    magicalEndurance: 0,
    updateName: settings.scrolls.ask,
    replaceDescription: true,
    defaultEncumbrance: 0.05,
    defaultAvailability: "exotic",
  }
}

export {constants, dataTypes, defaults, flags, settings};
