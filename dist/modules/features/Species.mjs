import ForienBaseModule from "../utility/ForienBaseModule.mjs";

export default class Species extends ForienBaseModule {

  applyWfrp4eConfig() {
    let config = {};

    config = foundry.utils.mergeObject(config, this.#species());
    config = foundry.utils.mergeObject(config, this.#subspecies());

    this.#mergeCareerReplacements();

    return config;
  }

  #species() {
    const config = {
      species: {},
      speciesCharacteristics: {},
      speciesSkills: {},
      speciesTalents: {},
      speciesFate: {},
      speciesRes: {},
      speciesExtra: {},
      speciesMovement: {},
      speciesAge: {},
      speciesHeight: {},
      speciesRandomTalents: {},
    };

    /**#region Runebound */

    config.species["runebound"] = "Runebound";
    config.speciesCharacteristics["runebound"] = {
      "ws":  "2d10+25",
      "bs":  "2d10+25",
      "s":   "2d10+25",
      "t":   "2d10+25",
      "i":   "2d10+25",
      "ag":  "2d10+25",
      "dex": "2d10+25",
      "int": "2d10+15",
      "wp":  "2d10+25",
      "fel": "2d10+15"
    };
    config.speciesSkills["runebound"] = [
      "Animal Care",
      "Charm",
      "Cool",
      "Consume Alcohol",
      "Evaluate",
      "Gossip",
      "Haggle",
      "Language (Wastelander)",
      "Leadership",
      "Lore (local)",
      "Melee (Basic)",
      "Ranged (Bow)"
    ];
    config.speciesTalents["runebound"] = [
      "Doomed",
      "Runebound Mutation",
      "Savvy, Suave",
    ];
    config.speciesRandomTalents["runebound"] = {
      'runebound-talents': 4
    };
    config.speciesFate["runebound"] = 1;
    config.speciesRes["runebound"] = 2;
    config.speciesExtra["runebound"] = 1;
    config.speciesMovement["runebound"] = 4;
    config.speciesAge["runebound"] = "2d6 + 10";
    config.speciesHeight["runebound"] = {
      feet: 4,
      inches: 10,
      die: "2d10"
    };

    /**#endregion Runebound */

    return config;
  }

  #subspecies() {
    let config = {
      subspecies: {
        runebound: {}
      }
    }

    /**#region Runebound */

    config.subspecies.runebound['reiklander'] = {
      name: "Reiklander",
      skills: [
        "Animal Care",
        "Charm",
        "Cool",
        "Evaluate",
        "Gossip",
        "Haggle",
        "Language (Bretonnian)",
        "Language (Wastelander)",
        "Leadership",
        "Lore (Reikland)",
        "Melee (Basic)",
        "Ranged (Bow)"
      ],
      talents: [
        "Doomed",
        "Runebound Mutation",
        "Savvy, Suave",
      ],
      randomTalents: {
        talents: 2,
        'runebound-talents': 3
      }
    }

    config.subspecies.runebound['orphaned'] = {
      name: "Orphaned",
      skills: [
        "Animal Care",
        "Bribery",
        "Charm",
        "Climb",
        "Cool",
        "Evaluate",
        "Gossip",
        "Haggle",
        "Melee (Basic)",
        "Melee (Brawling)",
        "Ranged (Sling)",
        "Stealth (Urban)"
      ],
      talents: [
        "Doomed",
        "Flee!, Stone Soup",
        "Small, random[1][runebound-talents]"
      ],
      randomTalents: {
        'runebound-talents': 3
      }
    }

    /**#endregion Runebound */

    return config;
  }

  #mergeCareerReplacements() {
    game.wfrp4e.utility.mergeCareerReplacements({
      runebound: {
        "Cavalryman": ["Monster Hunter"],
        "Engineer": ["Runebound Ranger"],
        "Guard": ["Monster Hunter"],
        "Hedge Witch": ["Runebound Ranger"],
        "Hunter": ["Runebound Ranger"],
        "Knight": ["Monster Hunter"],
        "Mystic": ["Runebound Ranger"],
        "Nun": ["Runebound Ranger"],
        "Priest": ["Runebound Ranger"],
        "Protagonist": ["Monster Hunter"],
        "Road Warden": ["Monster Hunter", "Runebound Ranger"],
        "Scout": ["Runebound Ranger"],
        "Soldier": ["Monster Hunter", "Runebound Ranger"],
        "Warrior Priest": ["Runebound Ranger"],
        "Watchman": ["Runebound Ranger"],
        "Witch": ["Runebound Ranger"],
        "Wizard": ["Runebound Ranger"],
      },
    });
  }
}