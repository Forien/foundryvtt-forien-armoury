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
      },
      {
        type: "item",
        name: "Ha'penny",
        img: "icons/commodities/currency/coin-embossed-sword-copper.webp",
        abbreviation: "{#}BP",
        data: {
          item: {
            "name": "Ha'penny",
            "type": "money",
            "img": "icons/commodities/currency/coin-embossed-sword-copper.webp",
            "system": {
              "quantity": { "type": "Number", "label": "Quantity", "value": 1 },
              "encumbrance": { "type": "Number", "label": "Encumbrance", "value": 0.01 },
              "coinValue": { "label": "Value (in d)", "type": "Number", "value": 0.5 },
              "source": { "type": "String", "label": "Source" }
            }
          }
        },
        primary: false,
        exchangeRate: 0.5
      },
      {
        type: "item",
        name: "Farthing",
        img: "icons/commodities/currency/coin-inset-one-wood.webp",
        abbreviation: "{#}BP",
        data: {
          item: {
            "name": "Farthing",
            "type": "money",
            "img": "icons/commodities/currency/coin-inset-one-wood.webp",
            "system": {
              "quantity": { "type": "Number", "label": "Quantity", "value": 1 },
              "encumbrance": { "type": "Number", "label": "Encumbrance", "value": 0.01 },
              "coinValue": { "label": "Value (in d)", "type": "Number", "value": 0.25 },
              "source": { "type": "String", "label": "Source" }
            }
          }
        },
        primary: false,
        exchangeRate: 0.25
      }
    ]
  }
}