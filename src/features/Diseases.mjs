import {constants, flags, settings} from "../constants.mjs";
import {debug}                      from "../utility/Debug.mjs";
import ForienBaseModule             from "../utility/ForienBaseModule.mjs";
import Utility                      from "../utility/Utility.mjs";

export default class Diseases extends ForienBaseModule {
  #observer;
  #listeners = new Map();

  /**
   * @inheritDoc
   */
  bindHooks() {
    Hooks.on("ready", this.#registerActorDiseaseListeners.bind(this));
    Hooks.on("createItem", this.#registerCreatedDiseaseListener.bind(this));
  }

  /**
   * Applies the symptoms to WFRP4e System.
   *
   * Symptoms designed and coded by RassilonMonk, as a part of the `RassilonMonk's Cauldron of Nurgle`
   *
   * @inheritDoc
   * @return {{}}
   */
  applyWfrp4eConfig() {
    const config = {
      symptoms: {},
      symptomDescriptions: {},
      symptomTreatment: {},
      symptomEffects: {},
    };

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
          symptom: true,
          applicationData: {
            type: "document",
            documentType: "Actor",
          },
          scriptData: [
            {
              label: "Vertigo",
              trigger: "dialog",
              script: "args.fields.slBonus -= 2;",
              options: {
                dialog: {
                  activateScript: "return true;",
                  hideScript: `
                      const applicableCharacteristics = ["ag", "int", "dex"];
                      
                      return args.type !== "weapon" && !applicableCharacteristics.includes(args.data.characteristic);
                    `,
                  submissionScript: "",
                  targeter: false,
                },
              },
            },
          ],
        },
      },
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
          symptom: true,
          applicationData: {
            type: "document",
            documentType: "Actor",
          },
          scriptData: [
            {
              label: "Scarring",
              trigger: "prePrepareData",
              script: "args.actor.system.characteristics.fel.modifier -= 10",
            },
          ],
        },
      },
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
          symptom: true,
          applicationData: {
            type: "document",
            documentType: "Actor",
          },
          scriptData: [
            {
              label: "Scarring",
              trigger: "prePrepareData",
              script: `
                args.actor.system.characteristics.fel.modifier -= 5;
                args.actor.system.characteristics.dex.modifier -= 5;
              `,
            },
          ],
        },
      },
    };
    //#endregion

    //#region Taint
    config.symptoms["taint"] = game.i18n.localize("Forien.Armoury.Symptoms.Taint.Name");
    config.symptomDescriptions["taint"] = game.i18n.localize("Forien.Armoury.Symptoms.Taint.Description");
    config.symptomTreatment["taint"] = game.i18n.localize("Forien.Armoury.Symptoms.Taint.Treatment");
    config.symptomEffects["taint"] = {
      name: game.i18n.localize("Forien.Armoury.Symptoms.Taint.Name"),
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          symptom: true,
          applicationData: {
            type: "document",
            documentType: "Actor",
          },
          scriptData: [
            {
              label: "Taint",
              trigger: "manual",
              script: `
                const difficulty = "challenging";
                
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
              `,
            },
          ],
        },
      },
    };
    //#endregion

    //#region Purblind
    config.symptoms["purblind"] = game.i18n.localize("Forien.Armoury.Symptoms.Purblind.Name");
    config.symptomDescriptions["purblind"] = game.i18n.localize("Forien.Armoury.Symptoms.Purblind.Description");
    config.symptomTreatment["purblind"] = game.i18n.localize("Forien.Armoury.Symptoms.Purblind.Treatment");
    config.symptomEffects["purblind"] = {
      name: game.i18n.localize("Forien.Armoury.Symptoms.Purblind.Name"),
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: false,
      flags: {
        wfrp4e: {
          symptom: true,
          applicationData: {
            type: "document",
            documentType: "Actor",
          },
          scriptData: [
            {
              label: "Sight-based Tests from Purblind",
              trigger: "dialog",
              script: `
                let modifier = -10;
                if (this.effect.name.includes("Moderate"))
                  modifier = -20;
                else if (this.effect.name.includes("Severe"))
                  modifier = -30;
                
                args.fields.modifier += modifier;
              `,
              options: {
                dialog: {
                  activateScript: "return true;",
                  hideScript: `
                    let applicableSkills = ["NAME.Art",  "NAME.Dodge",  "NAME.Drive",  "NAME.Evaluate",  "NAME.Melee",  "NAME.Navigation",  "NAME.Perception",  "NAME.PickLock",  "NAME.Ranged",  "NAME.Research",  "NAME.Ride",  "NAME.Row",  "NAME.Sail",  "NAME.SecretSigns",  "NAME.SetTrap",  "NAME.Stealth",  "NAME.Track"];
                    applicableSkills = applicableSkills.map(s => game.i18n.localize(s));
                    let applicableCharacteristics = ["ws", "bs", "ag", "dex"];
                    
                    return !(
                      (args.type === "weapon") ||
                      (args.type === "characteristic" && applicableCharacteristics.includes(args.item)) ||
                      (args.type === "skill" && applicableSkills.includes(args.item.name))
                    )
                  `,
                  submissionScript: "",
                },
              },
            },
          ],
        },
      },
    };
    //#endregion

    //#region Wasting
    config.symptoms["wasting"] = game.i18n.localize("Forien.Armoury.Symptoms.Wasting.Name");
    config.symptomDescriptions["wasting"] = game.i18n.localize("Forien.Armoury.Symptoms.Wasting.Description");
    config.symptomTreatment["wasting"] = game.i18n.localize("Forien.Armoury.Symptoms.Wasting.Treatment");
    config.symptomEffects["wasting"] = {
      name: game.i18n.localize("Forien.Armoury.Symptoms.Wasting.Name"),
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          symptom: true,
          applicationData: {
            type: "document",
            documentType: "Actor",
          },
          scriptData: [
            {
              label: "Wasting",
              trigger: "dialog",
              script: `
                  let modifier = -10;
                  if (this.effect.name.includes("Moderate"))
                    modifier = -20;
                  else if (this.effect.name.includes("Severe"))
                    modifier = -30;
                  
                  args.fields.modifier += modifier;
                `,
              options: {
                dialog: {
                  activateScript: "return true;",
                  hideScript: `
                    const applicableCharacteristics = ["ws", "bs", "s", "t", "ag", "dex"];

                    return args.type !== "weapon" && !applicableCharacteristics.includes(args.data.characteristic);
                  `,
                  submissionScript: "",
                },
              },
            },
          ],
        },
      },
    };
    //#endregion

    //#region Dementia
    config.symptoms["dementia"] = game.i18n.localize("Forien.Armoury.Symptoms.Dementia.Name");
    config.symptomDescriptions["dementia"] = game.i18n.localize("Forien.Armoury.Symptoms.Dementia.Description");
    config.symptomTreatment["dementia"] = game.i18n.localize("Forien.Armoury.Symptoms.Dementia.Treatment");
    config.symptomEffects["dementia"] = {
      name: game.i18n.localize("Forien.Armoury.Symptoms.Dementia.Name"),
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          symptom: true,
          applicationData: {
            type: "document",
            documentType: "Actor",
          },
          scriptData: [
            {
              label: "Dementia",
              trigger: "prePrepareData",
              script: `
                args.actor.system.characteristics.i.modifier -= 15;
                args.actor.system.characteristics.int.modifier -= 20;
              `,
            },
          ],
        },
      },
    };
    //#endregion

    return config;
  }


  /**
   * On load, loop through all Actors and attempt to register listeners
   */
  async #registerActorDiseaseListeners() {
    if (!game.user.isGM || game.user !== game.users.activeGM) return;
    if (!Utility.getSetting(settings.diseases.autoProgress)) return;

    this.#observer = game.modules.get(constants.moduleId).api.modules.get("worldTimeObserver");

    for (let actor of game.actors.contents) {
      await this.#registerActorDiseaseListener(actor);
    }

    debug("[Diseases] Registered disease listeners", {listeners: this.#listeners});
  }

  /**
   * Registers new listener with the WorldTimeObserver for Actors that have diseases
   *
   * @param {ActorWFRP4e} actor
   */
  async #registerActorDiseaseListener(actor) {
    let diseases = actor.itemTypes.disease;

    for (let disease of diseases) {
      await this.#registerDiseaseListener(actor, disease);
    }
  }

  /**
   * Registers new listener with the WorldTimeObserver for Actors that got a new disease
   *
   * @param disease
   *
   * @return {Promise<void>}
   */
  async #registerCreatedDiseaseListener(disease) {
    if (!game.user.isGM || game.user !== game.users.activeGM) return;
    if (!Utility.getSetting(settings.diseases.autoProgress)) return;
    if (disease.type !== "disease") return;
    let actor = disease.actor;

    if (!(actor instanceof ActorWFRP4e)) return;

    await this.#registerDiseaseListener(actor, disease);
    debug("[Diseases] Registered a listener for newly created disease", {actor, disease, listeners: this.#listeners});
  }

  /**
   * Actually handle registering the listener for a specific disease
   *
   * @param {ActorWFRP4e} actor
   * @param {ItemWFRP4e} disease
   *
   * @return {Promise<void>}
   */
  async #registerDiseaseListener(actor, disease) {
    let type = disease.system.duration.active ? "duration" : "incubation";
    let unit = disease.system[type].unit;
    let unitSeconds = this.#getUnitSeconds(unit);
    if (unitSeconds === false) return;

    if (isNaN(disease.system[type].value))
      await this.#rollDisease(actor, disease, type);

    let {lastProgress, saved} = this.#getLastProgress(disease);

    this.#subscribeToObserver(actor, disease, type, unitSeconds, lastProgress);

    if (!saved)
      await this.#saveLastProgress(disease, lastProgress);
  }

  /**
   * Register listener to the WorldTimeObserver
   *
   * @param {ActorWFRP4e} actor
   * @param {ItemWFRP4e} disease
   * @param {string} type
   * @param {number} unitSeconds
   * @param {number} lastProgress
   */
  #subscribeToObserver(actor, disease, type, unitSeconds, lastProgress) {
    let listenerId = this.#observer.subscribe(this.#handleAutoProgressEvent.bind(this), {
      args: {actorId: actor.id, diseaseId: disease.id, type},
      every: unitSeconds,
      last: lastProgress,
    });

    this.#listeners.set(disease.uuid, listenerId);
  }

  /**
   * Roll disease value for duration or incubation.
   *
   * @param {ActorWFRP4e} actor
   * @param {ItemWFRP4e} disease
   * @param {string} type
   *
   * @return {Promise<ItemWFRP4e|false>}
   */
  async #rollDisease(actor, disease, type) {
    debug("[Diseases] Disease value is NaN, attempting to roll on it", {actor, disease, type});
    disease = disease.toObject();
    try {
      disease.system[type].value = (await new Roll(disease.system[type].value).roll()).total;

      if (type === "duration")
        disease.system.duration.active = true;
    } catch {
      ui.notifications.error(game.i18n.localize("ERROR.ParseDisease"));

      return false;
    }

    return await actor.updateEmbeddedDocuments("Item", [disease]);
  }

  /**
   * Retrieves last time a disease progressed, or current World Time if it hasn't,
   * along with boolean telling if the value was saved before.
   *
   * @param {ItemWFRP4e} disease
   *
   * @return {{saved: boolean, lastProgress: number}}
   */
  #getLastProgress(disease) {
    let lastProgress = disease.getFlag(constants.moduleId, flags.diseases.lastProgress);
    if (lastProgress)
      return {lastProgress, saved: true};

    return {lastProgress: game.time.worldTime, saved: false};
  }

  /**
   * Saves timestamp of the last progression of the disease.
   *
   * @param {ItemWFRP4e} disease
   * @param {number} lastProgress
   *
   * @return {Promise<void>}
   */
  async #saveLastProgress(disease, lastProgress) {
    await disease.setFlag(constants.moduleId, flags.diseases.lastProgress, lastProgress);
  }

  /**
   * Converts string time unit to its representation in seconds.
   *
   * @param {string} unit
   *
   * @return {number|false}
   */
  #getUnitSeconds(unit) {
    switch (unit) {
      case game.i18n.localize("Days"):
        return 86400;
      case game.i18n.localize("Hours"):
        return 3600;
      case game.i18n.localize("Minutes"):
        return 60;
      default:
        return false;
    }
  }

  /**
   * Handles progression of diseases, whenever fired by WorldTimeObserver
   *
   * @param {{id: string}} args
   * @param {number} time
   *
   * @return {Promise<*>}
   */
  async #handleAutoProgressEvent(args, time) {
    const {actorId, diseaseId, type} = args;
    const uuid = `Actor.${actorId}.Item.${diseaseId}`;
    const actor = game.actors.get(actorId);
    const disease = actor?.items.get(diseaseId);

    if (!actor || !disease) {
      return this.#removeListener(uuid);
    }

    await this.#saveLastProgress(disease, time);

    let newDisease = await disease.system.decrement();
    let newType = newDisease?.system.duration.active ? "duration" : "incubation";

    if (newType !== type) {
      this.#removeListener(uuid);

      if (newType === null) return;

      let unit = disease.system[newType].unit;
      let unitSeconds = this.#getUnitSeconds(unit);

      if (unitSeconds === false) return;

      this.#subscribeToObserver(actor, disease, newType, unitSeconds, time);
    }

    debug("[Diseases] Handled disease progression event", {actor, disease, type, newType, listeners: this.#listeners});
  }

  /**
   * Removes the listener and unsubscribes from WorldTimeObserver
   *
   * @param {string} uuid
   *
   * @return {boolean}
   */
  #removeListener(uuid) {
    let listenerId = this.#listeners.get(uuid);
    this.#observer.unsubscribe(listenerId);

    return this.#listeners.delete(uuid);
  }

  /**
   * Just a better and properly working version of `ActorWFRP4e.decrementDisease()`.
   * @todo Remove this after fixing the methods in WFRP4e.
   *
   * @param {ActorWFRP4e} actor
   * @param {ItemWFRP4e} disease
   * @param {string} type
   *
   * @return {Promise<string>}
   */
  async #decrementDisease(actor, disease, type) {
    disease = disease.toObject();
    let newType = type;

    if (Number.isNumeric(disease.system[type].value)) {
      disease.system[type].value--;

      if (disease.system[type].value <= 0) {
        disease.system[type].value = 0;

        if (type === "incubation") {
          await actor.activateDisease(disease);
          newType = "duration";
        }

        if (type === "duration") {
          await actor.finishDisease(disease);
          newType = null;
        }
      }
    } else {
      let chatData = game.wfrp4e.utility.chatDataSetup(
        `Attempted to decrement ${disease.name} ${type} but value is non-numeric`,
        "gmroll",
        false,
      );
      chatData.speaker = {alias: actor.name};
      ChatMessage.create(chatData);
    }

    await actor.updateEmbeddedDocuments("Item", [disease]);

    return newType;
  }
}