import Utility from "../utility/Utility.mjs";
import {constants, settings} from "../constants.mjs";
import {debug} from "../utility/Debug.mjs";
import ForienBaseModule from "../utility/ForienBaseModule.mjs";

export default class TemporaryRunes extends ForienBaseModule {
  /**
   * Binds hooks
   */
  bindHooks() {
    Hooks.on("updateActiveEffect", this.#onEffectUpdate.bind(this));
  }

  /**
   * Whenever an Active Effect is updated, check if it's a Temporary Rune embedded in an Actor Document.
   * If yes, proceed to remove it.
   *
   * @param {ActiveEffect} effect
   * @param {{}} update
   * @param {{}} _data
   */
  #onEffectUpdate(effect, update, _data) {
    if (this.#isRuneTemporary(effect) && effect.parent instanceof Actor || effect.parent?.parent instanceof Actor) {
      debug('[TemporaryRunes] Effect Updated is a rune', {effect, update, _data});

      if (update.disabled === true) {
        this.processRemovingRune(effect).then(msg => {
          Utility.notify(msg, {permanent: true})
        });
      }
    }
  }

  /**
   * Returns true if provided Effect is a "Temporary Rune", either by checking flags, or by matching name
   *
   * @param {ActiveEffect} effect
   * @return {boolean}
   */
  #isRuneTemporary(effect) {
    if (effect.flags[constants.moduleId]?.isTemporary === true)
      return true;

    // fallback to checking name
    let effectName = effect.name.toLowerCase();
    let runeOf = game.i18n.localize('Forien.Armoury.Runes.effectNameIncludes.RuneOf');
    let temporary = game.i18n.localize('Forien.Armoury.Runes.effectNameIncludes.Temporary');

    return effectName.includes(runeOf) && effectName.includes(temporary);
  }

  /**
   * Removes the Rune from Actor and the Item and returns the notification string
   *
   * @param {ActiveEffect} effect
   * @return {Promise<string>}
   */
  async processRemovingRune(effect) {
    let actor = effect.parent;
    let itemUuid = effect.origin;
    /**
     * @type {ActorWfrp4e|null}
     */
    await actor.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
    debug('[TemporaryRunes] Deleted ActiveEffect from Actor', {actor, effect});

    /**
     * @type {ItemWfrp4e|null}
     */
    let item = await fromUuid(itemUuid);
    let itemEffect = item.effects.find(e => e.name === effect.name);

    await item.deleteEmbeddedDocuments("ActiveEffect", [itemEffect._id]);
    debug('[TemporaryRunes] Deleted ActiveEffect from Item', {item, itemEffect});

    let itemDamaged = ``;
    if (game.settings.get(constants.moduleId, settings.runes.enableDamage)) {
      itemDamaged = await this.damageFromRune(item, actor);
      debug('[TemporaryRunes] Item damaged because of dissipated Rune', {actor, item, message: itemDamaged});
    } else {
      debug('[TemporaryRunes] Item Damage from dissipating Runes is disabled');
    }

    let msg = game.i18n.format('Forien.Armoury.Runes.RemovedEffectTemporaryRuneDisabled', {
      effectName: effect.name,
      actorName: actor.name,
      itemName: item.name
    });

    return `${msg} ${itemDamaged}`;
  }

  /**
   * Process receiving Damage from destroyed Rune, depending on Item's type
   *
   * @param {ItemWfrp4e} item
   * @param {ActorWfrp4e} actor
   *
   * @returns {Promise<string>}
   */
  async damageFromRune(item, actor) {
    switch (item.type) {
      case 'weapon':
        return await this.damageWeapon(item, actor);
      case 'armour':
        return await this.damageArmour(item, actor);
      default:
        return await this.damageTrapping(item, actor);
    }
  }

  /**
   * Process receiving Damage from destroyed Rune on a Weapon
   *
   * @param {ItemWfrp4e} item
   * @param {ActorWfrp4e} actor
   *
   * @returns {Promise<string>}
   */
  async damageWeapon(item, actor) {
    let itemDamaged = ``;

    let itemData = item.toObject();
    let regex = /\d{1,3}/gm;
    let maxDamage = Number(regex.exec(item.damage.value)[0] || 0) + Number(item.properties.qualities.durable?.value || 0) || 999;
    itemData.system.damageToItem.value = Math.min(maxDamage, itemData.system.damageToItem.value + 1);

    itemDamaged += game.i18n.localize('Forien.Armoury.Runes.Weapon');
    itemDamaged += ` ${game.i18n.localize('Forien.Armoury.Runes.Received1Damage')}`;

    if (maxDamage === itemData.system.damageToItem.value) {
      itemData.system.equipped = false;
      itemData.name += ` (${game.i18n.localize('Forien.Armoury.Runes.ItemDamagedInName')})`;
      itemDamaged += ` ${game.i18n.localize('Forien.Armoury.Runes.AndGotUnequipped')}`
      itemDamaged += ` (${game.i18n.localize('Forien.Armoury.Runes.ItsNowImprovisedWeapon')})`
    }

    itemDamaged += `.`;
    await actor.updateEmbeddedDocuments("Item", [itemData]);

    return itemDamaged;
  }

  /**
   * Process receiving Damage from destroyed Rune on an Armour
   *
   * @param {ItemWfrp4e} item
   * @param {ActorWfrp4e} actor
   *
   * @returns {Promise<string>}
   */
  async damageArmour(item, actor) {
    let itemDamaged = ``;

    let durable = item.properties.qualities.durable;
    let armourToDamage = item.toObject();

    let locationKeys = Object.keys(armourToDamage.system.AP);
    let locations = [];

    for (let key in locationKeys) {
      let location = locationKeys[key];
      let AP = armourToDamage.system.AP[location];
      let damage = armourToDamage.system.APdamage[location];

      if (AP > 0 && AP > damage) {
        locations.push(locationKeys[key]);
      }
    }

    if (locations.length === 0) {
      return `${game.i18n.localize('Forien.Armoury.Runes.ArmourCouldNotBeDamagedMore')}.`;
    }

    let location = locations[Math.floor((Math.random() * locations.length))];
    armourToDamage.system.APdamage[location] = Math.min(armourToDamage.system.AP[location] + (Number(durable?.value) || 0), armourToDamage.system.APdamage[location] + 1);

    let locationName = game.i18n.localize(`WFRP4E.Locations.${location}`);
    itemDamaged = `${game.i18n.format('Forien.Armoury.Runes.ArmourReceived1DamageOnLocation', {locationName: locationName})}.`;

    await actor.updateEmbeddedDocuments("Item", [armourToDamage]);

    return itemDamaged;
  }


  /**
   * Process receiving Damage from destroyed Rune on a Trapping
   *
   * @param {ItemWfrp4e} item
   * @param {ActorWfrp4e} actor
   *
   * @returns {Promise<string>}
   */
  async damageTrapping(item, actor) {
    let itemDamaged = ``;

    let itemData = item.toObject();
    let maxDamage = Number(item.properties.qualities.durable?.value || 0);

    if (itemData.system.damageToItem === undefined) {
      itemData.system.damageToItem = {type: 'Number', value: 0, shield: 0};
    }

    if (maxDamage > 0 && maxDamage > itemData.system.damageToItem.value) {
      itemData.system.damageToItem.value = Math.min(maxDamage, itemData.system.damageToItem.value + 1);

      itemDamaged += game.i18n.localize('Forien.Armoury.Runes.Item');
      itemDamaged += ` ${game.i18n.localize('Forien.Armoury.Runes.Received1Damage')}`;
    } else {
      itemDamaged += game.i18n.localize('Forien.Armoury.Runes.ItemGotDamaged');
    }

    if (itemData.system.damageToItem.value >= maxDamage) {
      itemData.name += ` (${game.i18n.localize('Forien.Armoury.Runes.ItemDamagedInName')})`;

      if (itemData.system.worn) {
        itemData.system.worn = false;
        itemDamaged += ` ${game.i18n.localize('Forien.Armoury.Runes.AndGotUnequipped')}`;
      }
    }

    itemDamaged += `.`;
    await actor.updateEmbeddedDocuments("Item", [itemData]);

    return itemDamaged;
  }
}