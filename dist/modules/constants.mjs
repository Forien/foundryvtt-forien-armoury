const constants = {
  modulePath: 'modules/forien-armoury',
  moduleId: 'forien-armoury',
  moduleLabel: 'Forien\'s Armoury',
  loopLimit: 100
};

const dataTypes = {
  scroll: `${constants.moduleId}.scroll`
}

const flags = {
  ammoReplenish: 'ammoReplenish',
  combatFatigue: {
    roundsBeforeTest: 'roundsBeforeTest'
  },
  itemRepair: {
    type: 'type',
    subtype: 'subtype'
  },
  integrations: {
    itemPiles: {
      isImportFolder: 'isImportFolder'
    }
  },
  talents: {
    fightingStyle: 'fighting-style',
    fightingMaster: 'fighting-master'
  },
  effects: {
    target: 'target'
  },
  magicalEndurance: {
    flag: 'magical-endurance',
    value: 'value',
    regenPerHour: 'regen',
    lastRegen: 'lastRegen',
    maximum: 'maximum'
  },
  diseases: {
    lastProgress: 'lastProgress'
  }
}

const settings = {
  app: `${constants.moduleId}-settings-app`,
  arrowReclamation: {
    enable: 'arrowReclamation.Enable',
    enableArrows: 'arrowReclamation.EnableArrows',
    enableBolts: 'arrowReclamation.EnableBolts',
    enableBullets: 'arrowReclamation.EnableBullets',
    rule: 'arrowReclamation.Rule',
    percentage: 'arrowReclamation.Percentage'
  },
  combatFatigue: {
    enable: 'combatFatigue.enable',
    enableNPC: 'combatFatigue.enableNPC'
  },
  initialized: 'module.initialized',
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
  runes: {
    enableDamage: 'runes.damageEnable'
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
  diseases: {
    autoProgress: 'diseases.automateProgression'
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
  },
  socketTests: {
    always: 'always',
    never: 'never',
    onKeyPress: 'onKeyPress',
    mode: 'socketTests.mode'
  }
}

const defaults = {
  scrolls: {
    allowOvercasting: settings.scrolls.allowOvercastingMagick,
    difficulty: 'hard',
    difficultyMagick: 'challenging'
  }
}

export {constants, dataTypes, defaults, flags, settings};
