import ForienBaseModule from "../utility/ForienBaseModule.mjs";

export default class Diseases extends ForienBaseModule {
  /**
   * Applies the symptoms to WFRP4e System.
   *
   * Symptoms designed and coded by RassilonMonk, as a part of the `RassilonMonk's Cauldron of Nurgle`
   *
   * @inheritDoc
   * @return {{}}
   */
  applyWfrp4eConfig() {
    const config = {};

    //#region Vertigo
    config.symptoms["vertigo"] = game.i18n.localize("Forien.Armoury.Symptoms.Vertigo.Name");
    config.symptomDescriptions["vertigo"] = game.i18n.localize("Forien.Armoury.Symptoms.Vertigo.Description");
    config.symptomTreatment["vertigo"] = game.i18n.localize("Forien.Armoury.Symptoms.Vertigo.Treatment");
    config.symptomEffects["vertigo"] = {
      name: game.i18n.localize("Forien.Armoury.Symptoms.Vertigo.Name"),
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          "effectApplication": "actor",
          "effectTrigger": "prefillDialog",
          "symptom": true,
          "script": `
            let applicableCharacteristics = ["ag", "int", "dex"];

            if (args.type === "weapon") {
              args.prefillModifiers.slBonus -= 2;
            } else if (args.type === "characteristic" && applicableCharacteristics.includes(args.item)) {
              args.prefillModifiers.slBonus -= 2;
            } else if (args.type === "skill" && applicableCharacteristics.includes(args.item.characteristic.key)) {
              args.prefillModifiers.slBonus -= 2;
            }
          `
        }
      }
    };
    //#endregion

    //#region Scarring
    config.symptoms["scarring"] = game.i18n.localize("Forien.Armoury.Symptoms.Scarring.Name");
    config.symptomDescriptions["scarring"] = game.i18n.localize("Forien.Armoury.Symptoms.Scarring.Description");
    config.symptomTreatment["scarring"] = game.i18n.localize("Forien.Armoury.Symptoms.Scarring.Treatment");
    config.symptomEffects["scarring"] = {
      name: game.i18n.localize("Forien.Armoury.Symptoms.Scarring.Name"),
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          "effectApplication": "actor",
          "effectTrigger": "prePrepareData",
          "symptom": true,
          "script": `args.actor.system.characteristics.fel.modifier -= 10;`
        }
      }
    };
    //#endregion

    //#region Rashes
    config.symptoms["rashes"] = game.i18n.localize("Forien.Armoury.Symptoms.Rashes.Name");
    config.symptomDescriptions["rashes"] = game.i18n.localize("Forien.Armoury.Symptoms.Rashes.Description");
    config.symptomTreatment["rashes"] = game.i18n.localize("Forien.Armoury.Symptoms.Rashes.Treatment");
    config.symptomEffects["rashes"] = {
      name: game.i18n.localize("Forien.Armoury.Symptoms.Rashes.Name"),
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          "effectApplication": "actor",
          "effectTrigger": "prePrepareData",
          "symptom": true,
          "script": `
            args.actor.system.characteristics.fel.modifier -= 5;
            args.actor.system.characteristics.dex.modifier -= 5;
          `
        }
      }
    }
    //#endregion

    //#region Taint
    config.symptoms["taint"] = game.i18n.localize("Forien.Armoury.Symptoms.Taint.Name");
    config.symptomDescriptions["taint"] = game.i18n.localize("Forien.Armoury.Symptoms.Taint.Description");
    config.symptomTreatment["taint"] = game.i18n.localize("Forien.Armoury.Symptoms.Taint.Treatment");
    config.symptomEffects["taint"] = {
      name: game.i18n.localize("Forien.Armoury.Symptoms.Taint.Name"),
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: false,
      flags: {
        wfrp4e: {
          "effectApplication": "actor",
          "effectTrigger": "invoke",
          "symptom": true,
          "script": `
            const difficulty = "challenging";
            
            if (this.actor.isOwner) {
              const setupData = await args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {
                context: {failure: game.i18n.format("Forien.Armoury.Symptoms.Taint.Failure", {character: args.actor.name})},
                absolute: {difficulty},
                appendTitle: " – " + game.i18n.localize("Forien.Armoury.Symptoms.Taint.Name"),
              })
            
              const test = await args.actor.basicTest(setupData);
            
              if (test.result.outcome === "failure") {
                const newCorruption = args.actor.system.status.corruption.value + 1;
                await args.actor.update({"system.status.corruption.value": newCorruption});
              }
            }
          `
        }
      }
    }
    //#endregion

    return config;
  }
}