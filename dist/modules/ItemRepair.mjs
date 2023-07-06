import Utility from "./Utility.mjs";

export default class ItemRepair {

  static templates = {
    chatMessage: "repair-chat-message.hbs",
    repairItemEntry: "partials/repair-item-entry.hbs",
    repairItemEntryWeapon: "partials/repair-item-weapon.hbs",
    repairItemEntryArmour: "partials/repair-item-armour.hbs"
  }

  static bindHooks() {
    Hooks.on('renderChatLog', this._setChatListeners.bind(this));
  }

  static getTemplates() {
    return Object.values(this.templates);
  }

  /**
   * @param log
   * @param html
   * @private
   */
  static _setChatListeners(log, html) {
    html.on("click", ".chat-button.forien-repair-item", this._onRepairItem.bind(this));
  }


  /**
   * @param {ItemWfrp4e} item
   * @param {{armour: String, item: String, location: String, price: String, repair: Number}} data
   * @private
   */
  static async _repairArmourItem(item, data) {
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
   * @private
   */
  static async _repairWeaponItem(item, data) {
    let itemData = item.toObject();
    itemData.system.damageToItem.value -= data.repair;

    await item.actor.updateEmbeddedDocuments("Item", [itemData]);

    return true;
  }

  /**
   * @param event
   * @private
   */
  static async _onRepairItem(event) {
    /**
     * @type {{armour: String, item: String, location: String, price: String, repair: Number, msg: String}}
     */
    let data = event.currentTarget.dataset;
    /**
     * @type {ItemWfrp4e|null}
     */
    let item = await fromUuid(data.item);
    let paid = data.price !== "Free";

    if (!item?.actor?.isOwner)
      return Utility.notify(`Must control the character you want to repair items for.`, {type: "error"})

    let repaired;

    if (data.armour && data.armour === 'true')
      repaired = await this._repairArmourItem(item, data);
    else
      repaired = await this._repairWeaponItem(item, data);

    if (repaired) {
      if (paid) {
        let money = MarketWfrp4e.payCommand(data.price, item.actor, {suppressMessage: true});
        if (!money)
          return;

        WFRP_Audio.PlayContextAudio({item: {"type": "money"}, action: "lose"});
        await item.actor.updateEmbeddedDocuments("Item", money);
      }
      Utility.notify(`${item.name} has been repaired. Removed ${data.repair} damage from the item.`);
    }

    if (data.msg)
      return this.checkInventoryForDamage(item.actor, {paid: paid, chatMessageId: data.msg});
  }

  /**
   * @param {ItemWfrp4e} item
   * @private
   * @return {Number}
   */
  static _getPriceInD(item) {
    return Number(item.price.gc || 0) * 240 + Number(item.price.ss || 0) * 12 + Number(item.price.bp || 0);
  }

  /**
   * @param {Number} amount
   * @return {string}
   * @private
   */
  static _getMoneyStringFromD(amount) {
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
  static _getMaxDamage(item) {
    let regex = /\d{1,3}/gm;

    if (item.type === 'weapon')
      return Number(regex.exec(item.damage.value)[0] || 0) + Number(item.properties.qualities.durable?.value || 0);

    return Number(item.properties.qualities.durable?.value || 0);
  }

  /**
   * @param {ItemWfrp4e} item
   */
  static checkWeaponDamage(item, paid) {
    return this.checkTrappingDamage(item, paid);
  }

  /**
   * @param {ItemWfrp4e} item
   * @param {boolean} paid
   */
  static checkTrappingDamage(item, paid) {
    let maxDamage = this._getMaxDamage(item)
    let damage = Number(item.damageToItem?.value || 0)
    let price = this._getPriceInD(item);
    let singleRepairCost = paid ? this._getMoneyStringFromD(price * 0.1) : "Free";
    let repairCost = paid ? this._getMoneyStringFromD(price * 0.1 * damage) : "Free";

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
  static checkArmourDamage(item, paid) {
    let durable = this._getMaxDamage(item);
    let locationKeys = Object.keys(item.AP);
    let locations = [];
    let totalDamage = 0;
    let totalMaxDamage = 0;
    let price = this._getPriceInD(item) * 0.1;

    for (let i in locationKeys) {
      let location = locationKeys[i];
      let AP = item.AP[location];
      let damage = item.APdamage[location];
      let maxDamage = AP + durable;
      totalDamage += damage;
      totalMaxDamage += maxDamage;

      if (AP > 0 && damage > 0) {
        let damageToPayFor = damage;
        if (damage >= AP + durable)
          damageToPayFor += 1;

        let locationLabel = game.i18n.localize(`WFRP4E.Locations.${location}`);
        let localRepairCost = paid ? this._getMoneyStringFromD(price * damageToPayFor) : "Free";
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
    let singleRepairCost = paid ? this._getMoneyStringFromD(price) : "Free";
    let repairCost = paid ? this._getMoneyStringFromD(price * totalDamage) : "Free";

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
   */
  static processWeapons(items = [], paid) {
    return this.processTrappings(items, paid);
  }

  /**
   * @param {ItemWfrp4e[]} items
   * @param {boolean} paid
   */
  static processTrappings(items = [], paid) {
    let damagedItems = [];
    items.forEach(item => {
      let damagedItem = this.checkTrappingDamage(item, paid);
      if (damagedItem?.damaged)
        damagedItems.push(damagedItem);
    });

    return damagedItems;
  }

  /**
   * @param {ItemWfrp4e[]} items
   * @param {boolean} paid
   */
  static processArmour(items = [], paid) {
    let damagedItems = [];
    items.forEach(item => {
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
   */
  static async checkInventoryForDamage(actor, {paid = true, chatMessageId = null} = {}) {
    let templateData = {};
    templateData.armour = this.processArmour(actor.itemCategories.armour, paid);
    templateData.weapons = this.processWeapons(actor.itemCategories.weapon, paid);
    templateData.trappings = this.processTrappings(actor.itemCategories.trapping, paid);
    templateData.paid = paid;

    let html = await renderTemplate(Utility.getTemplate(this.templates.chatMessage), templateData);
    let chatMessage;
    let content;

    if (!chatMessageId) {
      let chatData = {
        user: game.user,
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