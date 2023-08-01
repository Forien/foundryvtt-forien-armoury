import Utility from "./Utility.mjs";

export default class ItemRepair {

  templates = {
    chatMessage: 'repair-chat-message.hbs',
    repairItemEntry: 'partials/repair-item-entry.hbs',
    repairItemEntryWeapon: 'partials/repair-item-weapon.hbs',
    repairItemEntryArmour: 'partials/repair-item-armour.hbs'
  }

  bindHooks() {
    Hooks.on('renderChatLog', this.#setChatListeners.bind(this));
  }

  getTemplates() {
    return Object.values(this.templates);
  }

  /**
   * @param log
   * @param html
   */
  #setChatListeners(log, html) {
    html.on("click", ".chat-button.forien-repair-item", this.#onRepairItem.bind(this));
  }


  /**
   * @param {ItemWfrp4e} item
   * @param {{armour: String, item: String, location: String, price: String, repair: Number}} data
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
   * @param {ItemWfrp4e} item
   * @param {{item: String, price: String, repair: Number}} data
   */
  async #repairWeaponItem(item, data) {
    let itemData = item.toObject();
    itemData.system.damageToItem.value -= data.repair;

    await item.actor.updateEmbeddedDocuments("Item", [itemData]);

    return true;
  }

  /**
   * @param event
   */
  async #onRepairItem(event) {
    /**
     * @type {{armour: String, item: String, location: String, price: String, repair: Number, msg: String}}
     */
    let data = event.currentTarget.dataset;
    /**
     * @type {ItemWfrp4e|null}
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
        let money = MarketWfrp4e.payCommand(data.price, item.actor, {suppressMessage: true});
        if (!money)
          return;

        WFRP_Audio.PlayContextAudio({item: {"type": "money"}, action: "lose"});
        await item.actor.updateEmbeddedDocuments("Item", money);
      }
      Utility.notify(game.i18n.format('Forien.Armoury.ItemRepair.Repaired', {name: item.name, repaired: data.repair}));
    }

    if (data.msg)
      return this.checkInventoryForDamage(item.actor, {paid: paid, chatMessageId: data.msg});
  }

  /**
   * @param {ItemWfrp4e} item
   * @return {Number}
   */
  #getPriceInD(item) {
    return Number(item.price.gc || 0) * 240 + Number(item.price.ss || 0) * 12 + Number(item.price.bp || 0);
  }

  /**
   * @param {Number} amount
   * @param {boolean} paid
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
   * @param {ItemWfrp4e} item
   * @return {number}
   * @private
   */
  #getMaxDamage(item) {
    let regex = /\d{1,3}/gm;

    if (item.type === 'weapon')
      return Number(regex.exec(item.damage.value)[0] || 0) + Number(item.properties.qualities.durable?.value || 0);

    return Number(item.properties.qualities.durable?.value || 0);
  }

  /**
   * @param {ItemWfrp4e} item
   * @param {boolean} paid
   */
  checkWeaponDamage(item, paid) {
    return this.checkTrappingDamage(item, paid);
  }

  /**
   * @param {ItemWfrp4e} item
   * @param {boolean} paid
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
   * @param {ItemWfrp4e} item
   * @param {boolean} paid
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
   * @param {ItemWfrp4e[]} items
   * @param {boolean} paid
   * @param {String} subtype
   */
  processWeapons(items = [], {paid = true, subtype = null} = {}) {
    return this.processTrappings(items, {paid, subtype});
  }

  /**
   * @param {ItemWfrp4e[]} items
   * @param {boolean} paid
   * @param {String} subtype
   */
  processTrappings(items = [], {paid = true, subtype = null} = {}) {
    let damagedItems = [];
    items.forEach(item => {
      if (subtype && (!subtype.includes(item.system.weaponGroup?.value) || subtype.includes(item.system.trappingType?.value)))
        return;
      let damagedItem = this.checkTrappingDamage(item, paid);
      if (damagedItem?.damaged)
        damagedItems.push(damagedItem);
    });

    return damagedItems;
  }

  /**
   * @param {ItemWfrp4e[]} items
   * @param {boolean} paid
   * @param {String} subtype
   */
  processArmour(items = [], {paid = true, subtype = null} = {}) {
    let damagedItems = [];
    items.forEach(item => {
      if (subtype && !subtype.includes(item.system.armorType.value))
        return;
      let damagedItem = this.checkArmourDamage(item, paid);
      if (damagedItem?.damaged)
        damagedItems.push(damagedItem);
    });

    return damagedItems;
  }

  /**
   * @param {ActorWfrp4e} actor
   * @param {boolean} paid
   * @param {String} chatMessageId
   * @param {String} type
   * @param {String} subtype
   */
  async checkInventoryForDamage(actor, {paid = true, chatMessageId = null, type = null, subtype = null, user = null} = {}) {
    let templateData = {
      armour: [],
      weapons: [],
      trappings: [],
      paid: paid
    };
    if (user && !(user instanceof User)) user = game.users.get(user);

    if (type.includes('armour'))
      templateData.armour = this.processArmour(actor.itemCategories.armour, {paid, subtype});
    if (type.includes('weapons'))
      templateData.weapons = this.processWeapons(actor.itemCategories.weapon, {paid, subtype});
    if (type.includes('trappings'))
      templateData.trappings = this.processTrappings(actor.itemCategories.trapping, {paid, subtype});

    let html = await renderTemplate(Utility.getTemplate(this.templates.chatMessage), templateData);
    let chatMessage;
    let content;

    if (!chatMessageId) {
      let chatData = {
        user: user || game.user,
        speaker: {alias: actor.name, actor: actor._id},
        whisper: game.users.filter((u) => u.isGM).map((u) => u._id),
        content: html
      };
      chatMessage = await ChatMessage.create(chatData)
      content = chatMessage.content;
    } else {
      chatMessage = await fromUuid(chatMessageId);
      content = html;
    }

    content = content.replaceAll('ChatMessageId', chatMessage._id);
    await chatMessage.update({content: content});
  }
}