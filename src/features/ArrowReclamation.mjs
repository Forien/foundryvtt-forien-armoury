import {constants, flags, settings} from "../constants.mjs";
import {debug}                      from "../utility/Debug.mjs";
import ForienBaseModule             from "../utility/ForienBaseModule.mjs";
import Utility                      from "../utility/Utility.mjs";

/**
 * ArrowReclamation class is mostly repurposed code from the legacy version of Forien's Armoury module
 * It works, but most likely isn't done the best way it could've.
 *
 * All rules about ammo Qualities/Flaws are disabled for now.
 */
export default class ArrowReclamation extends ForienBaseModule {
  templates = {
    ammoRecovery: "ammo-recovery.hbs",
  };

  bindHooks() {
    Hooks.on("wfrp4e:rollWeaponTest", this.checkRollWeaponTest.bind(this));
    Hooks.on("deleteCombat", this.processEndOfCombat.bind(this));
  }

  registerSocketMethods(socket) {
    this.socket.register("addArrowToReclaim", this.addAmmoToReplenish);
    this.socket.register("removeArrowFromReclaim", this.removeArrowFromReclaim);
  }

  /**
   * Gets a type of projectile based on ammunition group of a weapon
   * if ammo is not allowed by configuration, or is not supported, returns null
   *
   * @param weapon
   * @param ammo
   *
   * @returns string|null
   */
  #getAmmoType(weapon, ammo) {
    let allowArrows = game.settings.get(constants.moduleId, settings.arrowReclamation.enableArrows);
    let allowBolts = game.settings.get(constants.moduleId, settings.arrowReclamation.enableBolts);
    let allowBullets = game.settings.get(constants.moduleId, settings.arrowReclamation.enableBullets);
    let recoverable = ammo.properties.qualities.recoverable || false;
    let unrecoverable = ammo.properties.flaws.unrecoverable || false;
    let allowed = null;
    let type = null;

    if (unrecoverable)
      return null;

    if (weapon.system.ammunitionGroup.value === "bow") {
      allowed = allowArrows;
      type = "Arrow";
    } else if (weapon.system.ammunitionGroup.value === "crossbow") {
      allowed = allowBolts;
      type = "Bolt";
    } else if (weapon.system.ammunitionGroup.value === "sling") {
      allowed = allowBullets;
      type = "Bullet";
    }

    if (allowed || recoverable)
      return type;

    return null;
  }

  /**
   * Applies rules to see if projectile can be recovered
   *
   * @param {WeaponTest} roll
   * @param {ItemWFRP4e} ammo
   *
   * @returns {Promise<{recovered: boolean, percentageTarget: number|null, rule, percentageTotal: number|null}>}
   */
  async #isProjectileSaved(roll, ammo) {
    const unbreakable = ammo.properties.qualities.unbreakable || false;
    if (unbreakable) return {recovered: true, rule: null, percentageTotal: null, percentageTarget: null};
    const percentageTarget = game.settings.get(constants.moduleId, settings.arrowReclamation.percentage);
    const crit = (roll.isCritical !== undefined || roll.isFumble !== undefined);
    const even = roll.result.roll % 2 === 0;
    const success = roll.result.roll <= roll.result.target;
    let recovered;
    let sturdy;
    let frail;
    let formula = "1d100";

    if (sturdy) {
      formula = "2d100kl";
    } else if (frail) {
      formula = "2d100kh";
    }

    const percentageTotal = (await new Roll(formula).evaluate({allowInteractive: false})).total;
    const percentage = percentageTotal <= percentageTarget;
    const sturdyRoll = (await new Roll("1d100").evaluate({allowInteractive: false})).total <= percentageTarget;
    const rule = game.settings.get(constants.moduleId, settings.arrowReclamation.rule);

    switch (rule) {
      case "success":
        if (sturdy) recovered = even; else recovered = even && success;
        if (frail && recovered) recovered = sturdyRoll;
        break;
      case "noCrit":
        recovered = even && !crit;
        if (sturdy && !recovered) recovered = sturdyRoll;
        if (frail && recovered) recovered = sturdyRoll;
        break;
      case "successNoCrit":
        if (sturdy) recovered = even && !crit; else recovered = even && success && !crit;
        if (frail && recovered) recovered = sturdyRoll;
        break;
      case "failure":
        if (sturdy) recovered = even; else recovered = even && !success;
        if (frail && recovered) recovered = sturdyRoll;
        break;
      case "failureNoCrit":
        if (sturdy) recovered = even && !crit; else recovered = even && !success && !crit;
        if (frail && recovered) recovered = sturdyRoll;
        break;
      case "percentage":
        recovered = percentage;
        break;
      case "percentageNoCrit":
        recovered = percentage && !crit;
        break;
      case "default":
      default:
        recovered = even;
        if (sturdy && !recovered) recovered = sturdyRoll;
        if (frail && recovered) recovered = sturdyRoll;
    }

    return {recovered, rule, percentageTotal, percentageTarget};
  }

  /**
   *
   * @param {WeaponTest} roll
   * @param _cardOptions
   */
  async checkRollWeaponTest(roll, _cardOptions) {
    // if feature not enabled, do nothing
    if (!game.settings.get(constants.moduleId, settings.arrowReclamation.enable))
      return debug("[ArrowReclamation] Arrow Reclamation is not enabled");

    const isReroll = roll.context?.reroll || false;
    const wasRecovered = roll.result?.options?.recovered || false;

    // if there is no ammo, do nothing
    const weapon = roll.weapon;
    if (weapon === undefined || weapon.ammo === undefined || weapon.system.currentAmmo === undefined) return;

    const ammo = weapon?.ammo;
    let type = this.#getAmmoType(weapon, ammo);

    // if type is not recognized or not allowed, do nothing
    if (type === null)
      return debug("[ArrowReclamation] Ammunition cannot be recovered", {type, ammo});

    // define chat messages
    type = game.i18n.localize("Forien.Armoury.Arrows." + type);
    let messageNow = game.i18n.format("Forien.Armoury.Arrows.recovered", {type});
    let messageFuture = game.i18n.format("Forien.Armoury.Arrows.recoveredFuture", {type});

    const {recovered, rule, percentageTotal, percentageTarget} = await this.#isProjectileSaved(roll, ammo);
    debug(
      "[ArrowReclamation] Ammunition recovery status:",
      {recovered, rule, roll, percentageTarget, percentageTotal, type, ammo},
    );

    const ammoId = weapon.system.currentAmmo.value;
    const actorId = roll.actor._id;
    let message = ``;
    if (recovered === true && (!isReroll || !wasRecovered)) {
      if (game.combat == null) {
        message = messageNow;
        this.replenishAmmo(actorId, ammoId, 1);
      } else {
        message = messageFuture;
        if (game.user.isGM) {
          this.addAmmoToReplenish(actorId, ammoId, game.user._id);
        } else {
          this.socket?.executeAsGM("addArrowToReclaim", actorId, ammoId, game.user._id);
        }
      }

      roll.result.other.push(message);
      roll.data.preData.options.recovered = true;
    }

    if (wasRecovered && recovered === false) {
      if (game.combat == null) {
        message = messageNow;
        this.spendAmmo(actorId, ammoId, 1);
      } else {
        message = messageFuture;
        if (game.user.isGM) {
          this.removeArrowFromReclaim(actorId, ammoId, game.user._id);
        } else {
          this.socket?.executeAsGM("removeArrowFromReclaim", actorId, ammoId, game.user._id);
        }
      }

      roll.result.other = roll.result.other.filter(v => v !== message);
      await roll.renderRollCard();
    }
  }

  /**
   * Adds information about Ammunition entity and Actor entity to Combat Tracker
   * allows for tracking which ammo and in what quantity has to be returned
   *
   * @param {string} actorId
   * @param {string} ammoId
   * @param {string} userId
   */
  addAmmoToReplenish(actorId, ammoId, userId) {
    // retrieve existing data or initialize it
    let ammoReplenish = game.combat.getFlag(constants.moduleId, flags.ammoReplenish) || {};
    let actorData = ammoReplenish[actorId] || [];
    let ammoData = actorData.find(a => a._id === ammoId);

    // if ammo object doesn't exist, create one
    if (ammoData === undefined) {
      ammoData = {
        "_id": ammoId, "user": userId, "quantity": 0,
      };
      actorData.push(ammoData);
    }
    ammoData.quantity += 1;

    // overwrite actor data
    ammoReplenish[actorId] = actorData;

    // set flag with updated data
    game.combat.setFlag(constants.moduleId, flags.ammoReplenish, ammoReplenish);
  }

  /**
   * @param {string} actorId
   * @param {string} ammoId
   */
  removeArrowFromReclaim(actorId, ammoId) {
    let ammoReplenish = game.combat.getFlag(constants.moduleId, flags.ammoReplenish) || {};
    let actorData = ammoReplenish[actorId] || [];
    let ammoData = actorData.find(a => a._id === ammoId);

    if (ammoData === undefined) return;

    ammoData.quantity -= 1;
    ammoReplenish[actorId] = actorData;

    game.combat.setFlag(constants.moduleId, flags.ammoReplenish, ammoReplenish);
  }

  /**
   * Finds ammo in possession of an Actor and replenishes given amount
   *
   * @param {string} actorId
   * @param {string} ammoId
   * @param {string} quantity
   * @param {string} userId
   * @param {boolean} bulk
   */
  replenishAmmo(actorId, ammoId, quantity, userId = null, bulk = false) {
    let timeout = bulk ? 0 : 300;
    setTimeout(() => {
      let actor = game.actors.find(a => a._id === actorId);
      let ammoEntity = actor.getEmbeddedDocument("Item", ammoId).toObject();

      ammoEntity.system.quantity.value += quantity;
      actor.updateEmbeddedDocuments("Item", [{_id: ammoId, "system.quantity.value": ammoEntity.system.quantity.value}]);
      debug(
        "[ArrowReclamation] Ammunition recovered:",
        {ammoId, recoveredQuantity: quantity, newQuantity: ammoEntity.system.quantity.value},
      );

      if (bulk) this.notifyAmmoReturned(actor, ammoEntity, userId, quantity);
    }, timeout);
  }

  /**
   * Finds ammo in possession of an Actor and take away given amount
   *
   * @param {string} actorId
   * @param {string} ammoId
   * @param {string} quantity
   */
  spendAmmo(actorId, ammoId, quantity) {
    let actor = game.actors.find(a => a._id === actorId);
    let ammoEntity = actor.getEmbeddedDocument("Item", ammoId).toObject();

    ammoEntity.system.quantity.value -= quantity;
    actor.updateEmbeddedDocuments("Item", [{_id: ammoId, "system.quantity.value": ammoEntity.system.quantity.value}]);
    debug(
      "[ArrowReclamation] Ammunition spent:",
      {ammoId, recoveredQuantity: quantity, newQuantity: ammoEntity.system.quantity.value},
    );
  }

  /**
   * When combat ends, check Combat Tracker for any ammunition to recover.
   *
   * @param {Combat} combat
   */
  processEndOfCombat(combat) {
    if (!game.user.isGM || game.user !== game.users.activeGM) return;

    let ammoReplenish = combat.getFlag(constants.moduleId, flags.ammoReplenish);

    for (let actorId in ammoReplenish) {
      if (Array.isArray(ammoReplenish[actorId])) {
        let self = this;
        ammoReplenish[actorId].forEach(function (ammo) {
          self.replenishAmmo(actorId, ammo._id, ammo.quantity, ammo.user, true);
        });
      }
    }
  }

  /**
   * @param {ActorWFRP4e} actor
   * @param {ItemWFRP4e} ammo
   * @param {User} user
   * @param {number} quantity
   */
  async notifyAmmoReturned(actor, ammo, user, quantity) {
    let templateData = {
      img: actor.img,
      name: actor.name,
      ammo: {
        img: ammo.img,
        name: ammo.name,
      },
      quantity: quantity,
    };

    // Don't post any image for the item (which would leave a large gap) if the default image is used
    if (templateData.img.includes("/unknown.png"))
      templateData.img = null;
    if (templateData.ammo.img.includes("/blank.png"))
      templateData.ammo.img = null;

    foundry.applications.handlebars.renderTemplate(Utility.getTemplate(this.templates.ammoRecovery), templateData).then(
      html => {
        let chatData = {
          user: user,
          speaker: {alias: actor.name, actor: actor._id},
          whisper: game.users.filter((u) => u.isGM).map((u) => u._id),
          content: html,
        };
        ChatMessage.create(chatData);
      });
  }
}