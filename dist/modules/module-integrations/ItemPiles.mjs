

export default class ItemPiles {
  /**
   * Register Settings for Item Piles integration with WFRP4e/Forien's Armoury
   */
  registerSettings() {
    let self = this;

    game.settings.register('forien-armoury', 'itempiles.setCurrencies', {
      name: 'Forien.Armoury.Settings.ItemPiles.SetCurrencies',
      hint: 'Forien.Armoury.Settings.ItemPiles.SetCurrenciesHint',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
      onChange: async (value) =>
      {
        if (value) {
          self.setCurrencies();
          game.settings.set('forien-armoury', 'itempiles.setCurrencies', false);
        }
      }
    });

    game.settings.register('forien-armoury', 'itempiles.rolltablesImported', {
      scope: 'world',
      default: false,
      type: Boolean
    });

    game.settings.register('forien-armoury', 'itempiles.rolltablesImport', {
      name: 'Forien.Armoury.Settings.ItemPiles.RolltablesImport',
      hint: 'Forien.Armoury.Settings.ItemPiles.RolltablesImportHint',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
      onChange: async (value) =>
      {
        if (value) {
          self.#importRollTables();
          game.settings.set('forien-armoury', 'itempiles.rolltablesImport', false);
        }
      }
    });
  }

  initialize() {
    let imported = game.settings.get('forien-armoury', 'itempiles.rolltablesImported')
    if (imported === false)
      this.#importRollTables();
  }

  /**
   * Set Currencies to prepared by Forien
   */
  setCurrencies() {
    game.itempiles.API.setCurrencies(this.#getCurrenciesConfig())
  }

  #getCurrenciesConfig() {
    return [
      {
        type: "item",
        name: "Sovereign",
        img: "icons/commodities/currency/coin-embossed-ruby-gold.webp",
        abbreviation: "{#}V",
        data: {
          item: {
            "name": "Sovereign",
            "type": "money",
            "img": "icons/commodities/currency/coin-embossed-ruby-gold.webp",
            "system": {
              "quantity": {"type": "Number", "label": "Quantity", "value": 1},
              "encumbrance": {"type": "Number", "label": "Encumbrance", "value": 0.005},
              "coinValue": {"label": "Value (in d)", "type": "Number", "value": 960},
              "source": {"type": "String", "label": "Source"}
            }
          }
        },
        primary: false,
        exchangeRate: 960
      },
      {
        type: "item",
        name: "Angel",
        img: "icons/commodities/currency/coin-embossed-star-gold.webp",
        abbreviation: "{#}A",
        data: {
          item: {
            "name": "Angel",
            "type": "money",
            "img": "icons/commodities/currency/coin-embossed-star-gold.webp",
            "system": {
              "quantity": {"type": "Number", "label": "Quantity", "value": 1},
              "encumbrance": {"type": "Number", "label": "Encumbrance", "value": 0.005},
              "coinValue": {"label": "Value (in d)", "type": "Number", "value": 480},
              "source": {"type": "String", "label": "Source"}
            }
          }
        },
        primary: false,
        exchangeRate: 480
      },
      {
        type: "item",
        name: "Gold Crown",
        img: "icons/commodities/currency/coin-inset-crown-gold.webp",
        abbreviation: "{#}GC",
        data: {
          item: {
            "name": "Gold Crown",
            "type": "money",
            "img": "icons/commodities/currency/coin-inset-crown-gold.webp",
            "system": {
              "quantity": { "type": "Number", "label": "Quantity", "value": 1 },
              "encumbrance": { "type": "Number", "label": "Encumbrance", "value": 0.005 },
              "coinValue": { "label": "Value (in d)", "type": "Number", "value": 240 },
              "source": { "type": "String", "label": "Source" }
            }
          }
        },
        primary: false,
        exchangeRate: 240
      },
      {
        type: "item",
        name: "Half-a-crown",
        img: "icons/commodities/currency/coin-engraved-slot-one-copper.webp",
        abbreviation: "{#}HC",
        data: {
          item: {
            "name": "Half-a-crown",
            "type": "money",
            "img": "icons/commodities/currency/coin-engraved-slot-one-copper.webp",
            "system": {
              "quantity": { "type": "Number", "label": "Quantity", "value": 1 },
              "encumbrance": { "type": "Number", "label": "Encumbrance", "value": 0.005 },
              "coinValue": { "label": "Value (in d)", "type": "Number", "value": 120 },
              "source": { "type": "String", "label": "Source" }
            }
          }
        },
        primary: false,
        exchangeRate: 120
      },
      {
        type: "item",
        name: "Noble",
        img: "icons/commodities/currency/coin-inset-compass-silver.webp",
        abbreviation: "{#}N",
        data: {
          item: {
            "name": "Noble",
            "type": "money",
            "img": "icons/commodities/currency/coin-inset-compass-silver.webp",
            "system": {
              "quantity": { "type": "Number", "label": "Quantity", "value": 1 },
              "encumbrance": { "type": "Number", "label": "Encumbrance", "value": 0.01 },
              "coinValue": { "label": "Value (in d)", "type": "Number", "value": 80 },
              "source": { "type": "String", "label": "Source" }
            }
          }
        },
        primary: false,
        exchangeRate: 80
      },
      {
        type: "item",
        name: "Silver Shilling",
        img: "icons/commodities/currency/coin-engraved-moon-silver.webp",
        abbreviation: "{#}SS",
        data: {
          item: {
            "name": "Silver Shilling",
            "type": "money",
            "img": "icons/commodities/currency/coin-engraved-moon-silver.webp",
            "system": {
              "quantity": { "type": "Number", "label": "Quantity", "value": 1 },
              "encumbrance": { "type": "Number", "label": "Encumbrance", "value": 0.01 },
              "coinValue": { "label": "Value (in d)", "type": "Number", "value": 12 },
              "source": { "type": "String", "label": "Source" }
            }
          }
        },
        primary: false,
        exchangeRate: 12
      },
      {
        type: "item",
        name: "Tuppence",
        img: "icons/commodities/currency/coin-inset-copper-axe.webp",
        abbreviation: "{#}TP",
        data: {
          item: {
            "name": "Tuppence",
            "type": "money",
            "img": "icons/commodities/currency/coin-inset-copper-axe.webp",
            "system": {
              "quantity": {"type": "Number", "label": "Quantity", "value": 1},
              "encumbrance": {"type": "Number", "label": "Encumbrance", "value": 0.01},
              "coinValue": {"label": "Value (in d)", "type": "Number", "value": 2},
              "source": {"type": "String", "label": "Source"}
            }
          }
        },
        primary: false,
        exchangeRate: 2
      },
      {
        type: "item",
        name: "Brass Penny",
        img: "icons/commodities/currency/coin-engraved-waves-copper.webp",
        abbreviation: "{#}BP",
        data: {
          item: {
            "name": "Brass Penny",
            "type": "money",
            "img": "icons/commodities/currency/coin-engraved-waves-copper.webp",
            "system": {
              "quantity": { "type": "Number", "label": "Quantity", "value": 1 },
              "encumbrance": { "type": "Number", "label": "Encumbrance", "value": 0.01 },
              "coinValue": { "label": "Value (in d)", "type": "Number", "value": 1 },
              "source": { "type": "String", "label": "Source" }
            }
          }
        },
        primary: true,
        exchangeRate: 1
      }
    ]
  }

  async #createFolder() {
    let folder = game.folders.find(f => f.type === "RollTable" && f.getFlag('forien-armoury', 'isImportFolder'));
    if (folder) {
      let rollTables = folder.contents.map(d => d._id);
      await RollTable.deleteDocuments(rollTables);

      return folder
    }

    return Folder.create({
      name: 'Merchant Rolltables (Forien\'s Armoury)',
      type: 'RollTable',
      color: "#3e1395"
    });
  }

  async #importRollTables() {
    const coreModule = game.modules.get('wfrp4e-core');
    const coreModuleActive = coreModule?.active || false;
    if (!coreModuleActive) return;

    const coreCollectionName = isNewerVersion(coreModule.version, '3.999') ? 'wfrp4e-core.items' : 'wfrp4e-core.trappings';
    const coreCollection = coreModuleActive ? game.packs.get(coreCollectionName) : null;
    const folder = await this.#createFolder();
    const rolltableCompendium = await game.packs.get("forien-armoury.merchant-rolltables");
    const rollTables = await rolltableCompendium.importAll({folderId: folder._id, keepId: true});


    for (let rollTable of rollTables) {
      let entriesToRemove = [];

      for (let entry of rollTable.results) {
        let entryKey = entry._id;
        let pack = game.packs.get(entry.documentCollection);
        if (pack) continue;
        if (!pack && coreModuleActive) {
          let coreItem = coreCollection?.index.find(index => index.name === entry.text)
          if (coreItem) {
            entry.documentCollection = coreCollectionName;
            entry.documentId = coreItem._id;
            continue;
          }
        }

        entriesToRemove.push(entryKey)
      }
      entriesToRemove.forEach(key => rollTable.results.delete(key));
    }
    await RollTable.updateDocuments(rollTables);
    game.settings.set('forien-armoury', 'itempiles.rolltablesImported', true);
    return folder.setFlag('forien-armoury', 'isImportFolder', true)
  }
}