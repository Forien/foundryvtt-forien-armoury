import {constants, settings} from "../constants.mjs";
import {debug}               from "../utility/Debug.mjs";

export default class ATL {
  /**
   * Register Settings for ATL integration with WFRP4e/Forien's Armoury
   */
  registerSettings() {
    let self = this;

    game.settings.register(constants.moduleId, settings.integrations.atl.resetPresets, {
      name: "Forien.Armoury.Settings.ATL.ResetPresets",
      hint: "Forien.Armoury.Settings.ATL.ResetPresetsHint",
      scope: "world",
      config: false,
      default: false,
      type: Boolean,
      onChange: async (value) => {
        if (value) {
          self.setPresets();
          game.settings.set(constants.moduleId, settings.integrations.atl.resetPresets, false);
        }
      },
    });
  }

  setPresets() {
    const presets = this.getWFRP4ePresets();
    game.settings.set("ATL", "presets", presets);
    debug("[Integrations.ATL] ATL presets have been overwritten with custom presets:", presets);
  }

  getWFRP4ePresets() {
    return [
      {
        "name": "candle",
        "light": {
          "dim": 6,
          "bright": 2,
          "color": "#a2642a",
          "animation": {
            "type": "torch",
            "speed": 5,
            "intensity": 2,
          },
          "alpha": 0.2,
          "coloration": 1,
        },
        "id": "ATLPresetCandle",
      },
      {
        "name": "torch",
        "light": {
          "dim": 16,
          "bright": 6,
          "color": "#a2642a",
          "animation": {
            "type": "flame",
            "speed": 3,
            "intensity": 2,
          },
          "alpha": 0.7,
          "coloration": 1,
        },
        "id": "ATLPresetTorch",
      },
      {
        "name": "lantern",
        "light": {
          "dim": 20,
          "bright": 10,
          "color": "#a2642a",
          "animation": {
            "type": "torch",
            "speed": 1,
            "intensity": 1,
          },
          "alpha": 0.4,
          "coloration": 1,
        },
        "id": "ATLPresetLantern",
      },
      {
        "name": "directedLantern",
        "light": {
          "dim": 30,
          "bright": 15,
          "color": "#a2642a",
          "animation": {
            "type": "torch",
            "speed": 1,
            "intensity": 1,
          },
          "alpha": 0.5,
          "coloration": 1,
          "angle": 90,
        },
        "id": "nOlPYdU1RgRaOaBq",
      },
    ];
  }
}