const constants = {
  modulePath: 'modules/forien-armoury',
  moduleId: 'forien-armoury',
  moduleLabel: 'Forien\'s Armoury'
};

const defaults = {}

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
  }
}

const settings = {
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
  }
}

export {constants, defaults, flags, settings};
