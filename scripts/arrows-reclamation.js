ForienArmoury.ArrowReclamation = class ArrowReclamation {
  /**
   * Adds information about Ammunition entity and Actor entity to Combat Tracker
   * allows for tracking which ammo and in what quantity has to be returned
   *
   * @param actorId
   * @param ammoId
   * @param userId
   */
  static addAmmoToReplenish(actorId, ammoId, userId) {
    // retrieve existing data or initialize it
    let ammoReplenish = game.combat.getFlag('forien-armoury', 'ammoReplenish') || {};
    let actorData = ammoReplenish[actorId] || [];
    let ammoData = actorData.find(a => a._id === ammoId);

    // if ammo object doesn't exist, create one
    if (ammoData === undefined) {
      ammoData = {
        "_id": ammoId,
        "user": userId,
        "quantity": 0
      };
      actorData.push(ammoData);
    }
    ammoData.quantity += 1;

    // overwrite actor data
    ammoReplenish[actorId] = actorData;

    // set (overwrite) flag with updated data
    game.combat.unsetFlag('forien-armoury', 'ammoReplenish').then(() => {
      game.combat.setFlag('forien-armoury', 'ammoReplenish', ammoReplenish);
    });
  }

  /**
   * Finds ammo in possession of an Actor and replenishes given amount
   *
   * @param actorId
   * @param ammoId
   * @param quantity
   * @param userId
   * @param bulk
   */
  static replenishAmmo(actorId, ammoId, quantity, userId, bulk = false, ) {
    let timeout = bulk ? 0 : 300;
    setTimeout(() => {
      let actor = game.actors.find(a => a._id === actorId);
      let ammoEntity = duplicate(actor.getEmbeddedEntity("OwnedItem", ammoId));

      ammoEntity.data.quantity.value += quantity;
      actor.updateEmbeddedEntity("OwnedItem", {_id: ammoId, "data.quantity.value": ammoEntity.data.quantity.value});

      if (bulk)
        this.notifyAmmoReturned(actor, ammoEntity, userId, quantity);
    }, timeout);
  }

  /**
   * When combat ends, check Combat Tracker for any ammunition to recover.
   *
   * @param combat
   */
  static processEndOfCombat(combat) {
    let ammoReplenish = combat.getFlag('forien-armoury', 'ammoReplenish');

    for (let actorId in ammoReplenish) {
      if (Array.isArray(ammoReplenish[actorId])) {
        ammoReplenish[actorId].forEach(function (ammo) {
          ForienArmoury.ArrowReclamation.replenishAmmo(actorId, ammo._id, ammo.quantity, ammo.user, true);
        });
      }
    }
  }

  /**
   *
   * @param actor
   * @param ammo
   * @param user
   * @param quantity
   */
  static async notifyAmmoReturned(actor, ammo, user, quantity) {
    let templateData = duplicate(actor.data);
    templateData.ammo = ammo;

    // Don't post any image for the item (which would leave a large gap) if the default image is used
    if (templateData.img.includes("/unknown.png"))
      templateData.img = null;
    if (templateData.ammo.img.includes("/blank.png"))
      templateData.ammo.img = null;

    templateData.quantity = quantity;

    renderTemplate('modules/forien-armoury/templates/ammo-recovery.html', templateData).then(html => {
      let chatData = {
        user: user,
        speaker: {alias: actor.name, actor: actor._id},
        whisper: game.users.entities.filter((u) => u.isGM).map((u) => u._id),
        content: html
      };
      ChatMessage.create(chatData);
    });
  }

  /**
   *
   * @param roll
   * @param cardOptions
   */
  static checkRollWeaponTest(roll, cardOptions) {
    // if feature not enabled, do nothing
    if (!game.settings.get("forien-armoury", "arrowReclamation.Enable"))
      return;

    // if there is no ammo, do nothing
    let weapon = roll.weapon;
    if (weapon === undefined || weapon.ammo === undefined || weapon.data.currentAmmo === undefined)
      return;

    let ammoId = weapon.data.currentAmmo.value;
    let actorId = cardOptions.speaker.actor;
    let recovered = false;
    let message = "";
    let percentageTarget = game.settings.get("forien-armoury", "arrowReclamation.Percentage");
    let ammo = weapon.ammo.find(a => a._id === ammoId);
    let ammoQualities = ammo.data.qualities;

    let type = this.getAmmoType(weapon, ammo);

    // if type is not recognized or not allowed, do nothing
    if (type == null) {
      return;
    }

    // define chat messages
    type = game.i18n.localize("FArmoury." + type);
    let messageNow = game.i18n.format("FArmoury.recovered", {type});
    let messageFuture = game.i18n.format("FArmoury.recoveredFuture", {type});


    // if unbreakable, recover, if not, apply rules
    if (ammoQualities.value.includes(game.i18n.localize("PROPERTY.Unbreakable"))) {
      recovered = true;
    } else {
      recovered = this.isProjectileSaved(roll, percentageTarget, ammo);
    }

    // if recovered and hard to find, try again with -10
    if (recovered && ammoQualities.value.includes(game.i18n.localize("FArmoury.Properties.HardToFind"))) {
      recovered = (new Roll("1d100").roll().total <= (percentageTarget - 10));
    }

    if (recovered === true) {
      if (game.combat == null) {
        // return; // broken at the moment
        message = messageNow;
        ForienArmoury.ArrowReclamation.replenishAmmo(actorId, ammoId, 1);
      } else {
        message = messageFuture;
        if (game.user.isGM) {
          ForienArmoury.ArrowReclamation.addAmmoToReplenish(actorId, ammoId);
        } else {
          game.socket.emit("module.forien-armoury", {
            type: "arrowToReclaim",
            payload: {actorId: actorId, ammoId: ammoId, userId: game.user._id}
          })
        }
      }

      if (Array.isArray(roll.other)) {
        roll.other.push(message)
      } else {
        roll.other = [message];
      }
    }
  }

  /**
   * Get's type of a projectile based on ammunition group of a weapon
   * if ammo is not allowed by configuration, or is not supported, returns null
   *
   * @param weapon
   * @param ammo
   *
   * @returns string|null
   */
  static getAmmoType(weapon, ammo) {
    let allowArrows = game.settings.get("forien-armoury", "arrowReclamation.EnableArrows");
    let allowBolts = game.settings.get("forien-armoury", "arrowReclamation.EnableBolts");
    let allowBullets = game.settings.get("forien-armoury", "arrowReclamation.EnableBullets");
    let recoverable = ammo.data.qualities.value.includes(game.i18n.localize("FArmoury.Properties.Recoverable"));
    let unrecoverable = ammo.data.flaws.value.includes(game.i18n.localize("FArmoury.Properties.Unrecoverable"));
    let allowed = null;
    let type = null;

    if (unrecoverable)
      return null;

    if (weapon.data.ammunitionGroup.value === 'bow') {
      allowed = allowArrows;
      type = 'Arrow';
    } else if (weapon.data.ammunitionGroup.value === 'crossbow') {
      allowed = allowBolts;
      type = 'Bolt';
    } else if (weapon.data.ammunitionGroup.value === 'sling') {
      allowed = allowBullets;
      type = 'Bullet';
    }

    if (allowed || recoverable)
      return type;

    return null;
  }

  /**
   * Applies rules to see if projectile can be recovered
   *
   * @param roll
   * @param percentageTarget
   * @param ammo
   *
   * @returns boolean
   */
  static isProjectileSaved(roll, percentageTarget, ammo) {
    let crit = (roll.extra.critical !== undefined || roll.extra.fumble !== undefined);
    let even = roll.roll % 2 === 0;
    let success = roll.roll <= roll.target;
    let recovered;
    let sturdy = ammo.data.qualities.value.includes(game.i18n.localize("FArmoury.Properties.Sturdy"));
    let frail = ammo.data.flaws.value.includes(game.i18n.localize("FArmoury.Properties.Frail"));
    let formula = "1d100";

    if (sturdy) {
      formula = "2d100kl";
    } else if (frail) {
      formula = "2d100kh";
    }

    let percentage = (new Roll(formula).roll().total <= percentageTarget);
    let sturdyRoll = (new Roll("1d100").roll().total <= percentageTarget);

    switch (game.settings.get("forien-armoury", "arrowReclamation.Rule")) {
      case 'success':
        if (sturdy)
          recovered = even;
        else
          recovered = even && success;
        if (frail && recovered)
          recovered = sturdyRoll;
        break;
      case 'noCrit':
        recovered = even && !crit;
        if (sturdy && !recovered)
          recovered = sturdyRoll;
        if (frail && recovered)
          recovered = sturdyRoll;
        break;
      case 'successNoCrit':
        if (sturdy)
          recovered = even && !crit;
        else
          recovered = even && success && !crit;
        if (frail && recovered)
          recovered = sturdyRoll;
        break;
      case 'failure':
        if (sturdy)
          recovered = even;
        else
          recovered = even && !success;
        if (frail && recovered)
          recovered = sturdyRoll;
        break;
      case 'failureNoCrit':
        if (sturdy)
          recovered = even && !crit;
        else
          recovered = even && !success && !crit;
        if (frail && recovered)
          recovered = sturdyRoll;
        break;
      case 'percentage':
        recovered = percentage;
        break;
      case 'percentageNoCrit':
        recovered = percentage && !crit;
        break;
      case 'default':
      default:
        recovered = even;
        if (sturdy && !recovered)
          recovered = sturdyRoll;
        if (frail && recovered)
          recovered = sturdyRoll;
    }

    return recovered;
  }

  /**
   * Automatically applies Bleeding Condition, when struck with Slashing weapon on body part
   * that is not protected by more than 1 AP.
   * Modified by Forien — refactoring mostly.
   *
   * @author DasSauerkraut
   * @param result
   */
  static applyBleedingOnSlashing(result) {
    let data = result;
    if (data.winner === "defender")
      return;

    let target = canvas.tokens.get(data.speakerDefend.token);
    let armor = target.actor.prepareItems().AP;
    let hitLocation = data.hitloc.value;

    if (armor[hitLocation].value <= 1) {
      let bleedAmtOld = 0;
      let effects = target.data.effects;
      let newEffects = [];

      target.data.effects.forEach(effect => {
        if (typeof (effect) == 'string' && effect.includes('bleeding')) {
          let str = effect.slice(32);
          bleedAmtOld += parseInt(str.replace(/^\D+/g, ''));
        } else {
          newEffects.push(effect);
        }
      });

      let bleedAmt = bleedAmtOld + 1;

      if (bleedAmt < 5) {
        newEffects.push(`systems/wfrp4e/icons/conditions/bleeding${bleedAmt}.png`)
      } else {
        let availableStatuses = [4, 3, 2, 1];
        let bleedLeft = bleedAmt;
        while (availableStatuses.length > 0) {
          if (bleedLeft <= availableStatuses[0]) {
            break;
          }
          bleedLeft -= availableStatuses[0];
          newEffects.push(`systems/wfrp4e/icons/conditions/bleeding${availableStatuses[0]}.png`);
          availableStatuses.shift()
        }
        newEffects.push(`systems/wfrp4e/icons/conditions/bleeding${bleedLeft}.png`);
      }

      hitLocation = WFRP4E.locations[hitLocation];
      let message = game.i18n.format('FArmoury.SlashingApplied', {hitLocation, bleedAmt, bleedAmtOld});

      let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: `<p>${message}</p>`
      };

      ChatMessage.create(chatData, {});
      target.update({
        effects: newEffects
      });
    }
  }

  /**
   * Registers new qualities and flaws and their descriptions
   */
  static registerQualitiesAndFlaws() {
    WFRP4E.weaponQualities["slashing"] = "FArmoury.Properties.Slashing.Label";
    WFRP4E.qualityDescriptions["slashing"] = "FArmoury.Properties.Slashing.Description";

    WFRP4E.itemQualities["sturdy"] = "FArmoury.Properties.Sturdy.Label";
    WFRP4E.qualityDescriptions["sturdy"] = "FArmoury.Properties.Sturdy.Description";
    WFRP4E.itemQualities["recoverable"] = "FArmoury.Properties.Recoverable.Label";
    WFRP4E.qualityDescriptions["recoverable"] = "FArmoury.Properties.Recoverable.Description";

    WFRP4E.itemFlaws["frail"] = "FArmoury.Properties.Frail.Label";
    WFRP4E.flawDescriptions["frail"] = "FArmoury.Properties.Frail.Description";
    WFRP4E.itemFlaws["unrecoverable"] = "FArmoury.Properties.Unrecoverable.Label";
    WFRP4E.flawDescriptions["unrecoverable"] = "FArmoury.Properties.Unrecoverable.Description";
    WFRP4E.itemFlaws["hard-to-find"] = "FArmoury.Properties.HardToFind.Label";
    WFRP4E.flawDescriptions["hard-to-find"] = "FArmoury.Properties.HardToFind.Description";
  }
};
