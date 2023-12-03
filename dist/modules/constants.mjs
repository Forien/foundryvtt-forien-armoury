const constants = {
  modulePath: 'modules/forien-armoury',
  moduleId: 'forien-armoury',
  moduleLabel: 'Forien\'s Armoury'
};

const defaults = {}

const flags = {
  ammoReplenish: 'ammoReplenish',
  roundsInFight: 'roundsInFight',
  itemRepair: {
    type: 'type',
    subtype: 'subtype'
  },
  integrations: {
    itemPiles: {
      isImportFolder: 'isImportFolder'
    }
  }
}

const settings = {
  runes: {
    enableDamage: 'runes.damageEnable'
  },
  arrowReclamation: {
    enable: 'arrowReclamation.Enable',
    enableArrows: 'arrowReclamation.EnableArrows',
    enableBolts: 'arrowReclamation.EnableBolts',
    enableBullets: 'arrowReclamation.EnableBullets',
    rule: 'arrowReclamation.Rule',
    percentage: 'arrowReclamation.Percentage'
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
  }
}

export {constants, defaults, flags, settings};
