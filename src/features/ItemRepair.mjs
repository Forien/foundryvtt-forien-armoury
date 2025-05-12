import Utility            from "../utility/Utility.mjs";
import {constants, flags} from "../constants.mjs";
import {debug}            from "../utility/Debug.mjs";
import ForienBaseModule   from "../utility/ForienBaseModule.mjs";

export default class ItemRepair extends ForienBaseModule {
  templates = {
    chatMessage: 'repair-chat-message.hbs',
    repairItemEntry: 'partials/repair-item-entry.hbs',
    repairItemEntryWeapon: 'partials/repair-item-weapon.hbs',
    repairItemEntryArmour: 'partials/repair-item-armour.hbs'
  }

  bindHooks() {
    Hooks.on('renderChatLog', this.#setChatListeners.bind(this));
  }

  /**
   * @param log
   * @param html
   */
  #setChatListeners(log, html) {
    html.addEventListener("click", this.#onRepairItem.bind(this));
  }

  /**
   * Repairs Armour Item based on provided data
   *
   * @param {ItemWFRP4e} item Armour Item to Repair
   * @param {{armour: string, item: string, location: string, price: string, repair: number}} data
   */
  async #repairArmourItem(item, data) {
    let itemData = item.toObject();

    if (data.location === 'all') {
      for (let loc in itemData.system.APdamage) {
        itemData.system.APdamage[loc] = 0;
      }
    } else {
      itemData.system.APdamage[data.location] -= data.repair;
    }

    await item.actor.updateEmbeddedDocuments("Item", [itemData]);

    return true;
  }

  /**
   * Repairs Armour Item based on provided data
   *
   * @param {ItemWFRP4e} item Weapon Item to Repair
   * @param {{item: string, price: string, repair: number}} data
   */
  async #repairWeaponItem(item, data) {
    let itemData = item.toObject();
    itemData.system.damageToItem.value -= data.repair;

    await item.actor.updateEmbeddedDocuments("Item", [itemData]);

    return true;
  }

  /**
   * Function that handles clicking on a repair button in the Chat Card
   *
   * @param {MouseEvent} event
   * @return {Promise<void|undefined>}
   */
  async #onRepairItem(event) {
    if (!event.target.classList.contains("forien-repair-item")) return;

    /**
     * @type {{armour: string, item: string, location: string, price: string, repair: number, msg: string}}
     */
    let data = event.target.dataset;
    /**
     * @type {ItemWFRP4e|null}
     */
    let item = await fromUuid(data.item);
    let paid = data.price !== game.i18n.localize('Forien.Armoury.ItemRepair.Free');

    if (!item?.actor?.isOwner)
      return Utility.notify(game.i18n.localize('Forien.Armoury.ItemRepair.MustControlActor'), {type: "error"})

    let repaired;

    if (data.armour && data.armour === 'true')
      repaired = await this.#repairArmourItem(item, data);
    else
      repaired = await this.#repairWeaponItem(item, data);

    if (repaired) {
      if (paid) {
        let money = game.wfrp4e.market.payCommand(data.price, item.actor, {suppressMessage: true});
        if (!money)
          return;

        game.wfrp4e.audio.PlayContextAudio({item: {"type": "money"}, action: "lose"});
        await item.actor.updateEmbeddedDocuments("Item", money);
      }
      Utility.notify(game.i18n.format('Forien.Armoury.ItemRepair.Repaired', {name: item.name, repaired: data.repair}));
    }

    if (data.msg)
      return this.checkInventoryForDamage(item.actor, {paid: paid, chatMessageId: data.msg});
  }

  /**
   * Return Item's price in D (absolute value, 1 D = 1 Brass Penny)
   *
   * @param {ItemWFRP4e} item
   *
   * @return {number}
   */
  #getPriceInD(item) {
    return Number(item.price.gc || 0) * 240 + Number(item.price.ss || 0) * 12 + Number(item.price.bp || 0);
  }

  /**
   * Return's Money String (e.g. 2 GC 4 SS 1 BP) from the D value
   *
   * @param {number} amount An absolute value (called D) for money
   * @param {boolean} paid Whether service is "free"
   *
   * @return {string}
   */
  #getMoneyStringFromD(amount, paid) {
    if (!paid)
      return game.i18n.localize('Forien.Armoury.ItemRepair.Free');

    let string = ``;
    let money = {
      gc: 0,
      ss: 0,
      bp: 0
    }

    money.gc = Math.trunc(amount / 240);
    amount = amount % 240;
    money.ss = Math.trunc(amount / 12);
    amount = amount % 12;
    money.bp = Math.trunc(amount);

    if (money.gc > 0)
      string += `${money.gc} GC `;

    if (money.ss > 0)
      string += `${money.ss} SS `;

    if (money.bp > 0)
      string += `${money.bp} BP`;

    return string;
  }

  /**
   * Returns maximum amount of damage an Item can sustain
   *
   * @param {ItemWFRP4e} item
   * @return {number}
   * @private
   */
  #getMaxDamage(item) {
    let regex = /\d{1,3}/gm;

    if (item.type === 'weapon')
      return Number(regex.exec(item.damage.value)?.[0] || 0) + Number(item.properties.qualities.durable?.value || 0);

    return Number(item.properties.qualities.durable?.value || 0);
  }

  #getArmourItems(actor) {
    return actor.items.filter(i => i.system.isArmour);
  }

  #getWeaponItems(actor) {
    return actor.items.filter(i => i.system.isWeapon);
  }

  #getTrappingItems(actor) {
    return actor.items.filter(i => i.system.isTrapping);
  }

  /**
   * @param {ItemWFRP4e} item
   * @param {boolean} paid
   */
  checkWeaponDamage(item, paid) {
    return this.checkTrappingDamage(item, paid);
  }

  /**
   * Checks Item for sustained damage and returns relevant data
   *
   * @param {ItemWFRP4e} item Item to check the damage for
   * @param {boolean} paid Whether the service is Free
   *
   * @return {{damage: number, img, damaged: boolean, maxDamage: number, name, type, uuid, repairCost: string, singleRepairCost: string}}
   */
  checkTrappingDamage(item, paid) {
    let maxDamage = this.#getMaxDamage(item)
    let damage = Number(item.damageToItem?.value || 0)
    let price = this.#getPriceInD(item);
    let singleRepairCost = this.#getMoneyStringFromD(price * 0.1, paid);
    let repairCost = this.#getMoneyStringFromD(price * 0.1 * damage, paid);

    return {
      uuid: item.uuid,
      name: item.name,
      img: item.img,
      type: item.type,
      damaged: damage > 0,
      damage: damage,
      maxDamage: maxDamage,
      repairCost: repairCost,
      singleRepairCost: singleRepairCost
    };
  }

  /**
   *
   * Checks Armour Item for sustained damage and returns relevant data
   *
   * @param {ItemWFRP4e} item Armour Item to check the damage for
   * @param {boolean} paid Whether the service is Free
   *
   * @return {{damage: number, img, damaged: boolean, maxDamage: number, name, locations: *[], type, uuid, repairCost: string, singleRepairCost: string}}
   */
  checkArmourDamage(item, paid) {
    let durable = this.#getMaxDamage(item);
    let locationKeys = Object.keys(item.AP);
    let locations = [];
    let totalDamage = 0;
    let totalMaxDamage = 0;
    let repairCostInD = 0;
    let price = this.#getPriceInD(item) * 0.1;

    for (let i in locationKeys) {
      let location = locationKeys[i];
      let AP = item.AP[location];
      let damage = item.APdamage[location];
      let maxDamage = AP + durable;
      totalDamage += damage;
      totalMaxDamage += maxDamage;

      if (AP > 0 && damage > 0) {
        let damageToPayFor = damage;
        if (damage >= maxDamage)
          damageToPayFor += 1;

        repairCostInD += price * damageToPayFor;
        let locationLabel = game.i18n.localize(`WFRP4E.Locations.${location}`);
        let localRepairCost = this.#getMoneyStringFromD(price * damageToPayFor, paid);
        locations.push({
          name: location,
          label: locationLabel,
          ap: AP,
          damage: damage,
          maxDamage: maxDamage,
          repairCost: localRepairCost
        });
      }
    }
    let singleRepairCost = this.#getMoneyStringFromD(price, paid)
    let repairCost = this.#getMoneyStringFromD(repairCostInD, paid)

    return {
      uuid: item.uuid,
      name: item.name,
      img: item.img,
      type: item.type,
      damaged: locations.length > 0,
      locations: locations,
      damage: totalDamage,
      maxDamage: totalMaxDamage,
      repairCost: repairCost,
      singleRepairCost: singleRepairCost
    };
  }


  /**
   * Processes all weapons, checking each for sustained damage
   *
   * @param {ItemWFRP4e[]} items
   * @param {boolean} paid
   * @param {string|null} subtype
   *
   * @return {{damage: number, img, damaged: boolean, maxDamage: number, name, type, uuid, repairCost: string, singleRepairCost: string}[]}
   */
  processWeapons(items = [], {paid = true, subtype = null} = {}) {
    return this.processTrappings(items, {paid, subtype});
  }

  /**
   * Processes all trappings, checking each for sustained damage
   *
   * @param {ItemWFRP4e[]} items
   * @param {boolean} paid
   * @param {string|null} subtype
   *
   * @return {{damage: number, img, damaged: boolean, maxDamage: number, name, type, uuid, repairCost: string, singleRepairCost: string}[]}
   */
  processTrappings(items = [], {paid = true, subtype = null} = {}) {
    let damagedItems = [];
    items.forEach(item => {
      if (subtype && (!subtype.includes(item.system.weaponGroup?.value) || subtype.includes(item.system.trappingType?.value)))
        return;

      let damagedItem = this.checkTrappingDamage(item, paid);
      debug('[ItemRepair] Checking item for damage', {item, damagedItem});

      if (damagedItem?.damaged)
        damagedItems.push(damagedItem);
    });
    debug('[ItemRepair] Checked Items for damage', {damagedItems});

    return damagedItems;
  }

  /**
   * Processes all trappings, checking each for sustained damage
   *
   * @param {ItemWFRP4e[]} items
   * @param {boolean} paid
   * @param {string|null} subtype
   *
   * @return {{damage: number, img, damaged: boolean, maxDamage: number, name, locations: *[], type, uuid, repairCost: string, singleRepairCost: string}[]}
   */
  processArmour(items = [], {paid = true, subtype = null} = {}) {
    let damagedItems = [];
    items.forEach(item => {
      if (subtype && !subtype.includes(item.system.armorType.value))
        return;

      let damagedItem = this.checkArmourDamage(item, paid);
      debug('[ItemRepair] Checking Armour item for damage', {item, damagedItem});

      if (damagedItem?.damaged)
        damagedItems.push(damagedItem);
    });
    debug('[ItemRepair] Checked Armour for damage', {damagedItems});

    return damagedItems;
  }

  /**
   * Checks the specified Actor's inventory for damaged Items, and outputs results to Chat
   *
   * @param {Actor} actor
   * @param {boolean} paid
   * @param {string|null} chatMessageId
   * @param {string|null} type
   * @param {string|null} subtype
   * @param {string|null} user
   */
  async checkInventoryForDamage(actor, {
    paid = true,
    chatMessageId = null,
    type = null,
    subtype = null,
    user = null
  } = {}) {
    if (!actor || !(actor instanceof ActorWFRP4e)) {
      return Utility.notify(game.i18n.localize('Forien.Armoury.ItemRepair.NoActorSelected'), {type: 'warning'});
    }

    debug('[ItemRepair] Checking inventory for damaged items', {actor, paid, chatMessageId, type, subtype, user});

    let chatMessage;
    let content;
    let templateData = {
      armour: [],
      weapons: [],
      trappings: [],
      paid: paid,
      empty: false
    };

    if (chatMessageId) {
      chatMessage = await fromUuid(chatMessageId);
      type = chatMessage.getFlag(constants.moduleId, flags.itemRepair.type);
      subtype = chatMessage.getFlag(constants.moduleId, flags.itemRepair.subtype);
    }

    if (!type || type.includes('armour'))
      templateData.armour = this.processArmour(this.#getArmourItems(actor), {paid, subtype});
    if (!type || type.includes('weapons'))
      templateData.weapons = this.processWeapons(this.#getWeaponItems(actor), {paid, subtype});
    if (!type || type.includes('trappings'))
      templateData.trappings = this.processTrappings(this.#getTrappingItems(actor), {paid, subtype});

    if (templateData.armour.length === 0 && templateData.weapons.length === 0 && templateData.trappings.length === 0)
      templateData.empty = true;

    debug('[ItemRepair] Template Data ready', templateData);
    let html = await foundry.applications.handlebars.renderTemplate(Utility.getTemplate(this.templates.chatMessage), templateData);

    if (!chatMessageId) {
      let chatData = {
        user: user ?? game.user,
        speaker: {alias: actor.name, actor: actor._id},
        whisper: game.users.filter((u) => u.isGM).map((u) => u._id),
        content: html
      };

      chatMessage = await ChatMessage.create(chatData)
      await chatMessage.setFlag(constants.moduleId, flags.itemRepair.type, type);
      await chatMessage.setFlag(constants.moduleId, flags.itemRepair.subtype, subtype);
      content = chatMessage.content;
      debug('[ItemRepair] Chat Message created', {chatMessage, content});
    } else {
      content = html;
    }

    content = content.replaceAll('ChatMessageId', chatMessage._id);
    await chatMessage.update({content: content});
    debug('[ItemRepair] Chat Message updated', {chatMessage, content});
  }
}