import Utility                      from "../utility/Utility.mjs";
import {constants, flags, settings} from "../constants.mjs";
import WorkshopError                from "../utility/Error.mjs";

const fields = foundry.data.fields;

/**
 * @extends EquippableItemModel
 * @mixes PropertiesMixin
 */
export default class GrimoireModel extends PropertiesMixin(EquippableItemModel) {
  static LOCALIZATION_PREFIXES = ["WH.Models.weapon"];

  /**
   * @inheritDoc
   *
   * @returns {DataSchema}
   */
  static defineSchema() {
    let schema = super.defineSchema();

    schema.spells = new fields.ArrayField(new fields.SchemaField({
      name: new fields.StringField(),
      uuid: new fields.StringField(),
    }));
    schema.language = new fields.StringField({blank: true, nullable: true, initial: "Magick"});
    schema.twohanded = new fields.SchemaField({
      value: new fields.BooleanField({initial: false})
    });

    return schema;
  }

  /**
   *
   * @returns {ItemWFRP4e|{folder:string,img:string,name:string,pack:string,sort:number,type:string,uuid:string,_id:string}}
   */
  get Spells() {
    return this.spells.map(s => fromUuidSync(s.uuid));
  }

  /**
   * @returns {Promise<ItemWFRP4e[]>}
   */
  async loadSpells() {
    const spells = [];
    for (let spell of this.spells) {
      const spellItem = await fromUuid(spell.uuid)
      if (!spellItem || spellItem.type !== "spell") continue;

      spellItem.grimoireCN = spellItem.system.cn.value * 2;
      spellItem.name = spell.name || spellItem.name;

      spells.push(spellItem);
    }

    return spells;
  }

  async addSpell(item) {
    if (!this.parent.isOwner) return;

    if (!item)
      throw new WorkshopError("GrimoireModel.addSpell expects `item` argument");

    if (!(item instanceof ItemWFRP4e))
      throw new WorkshopError("GrimoireModel.addSpell `item` argument must be an instance of ItemWFRP4e");

    if (!(item.system instanceof SpellModel))
      throw new WorkshopError("GrimoireModel.addSpell `item` argument must be an Item implementing SpellModel");

    if (item.parent !== null)
      throw new WorkshopError("GrimoireModel.addSpell `item` argument cannot belong to an Actor. Use World Item or Compendium Item");

    const spells = this.spells;
    spells.push({
      label: item.name,
      uuid: item.uuid
    });

    return this.parent.update({"system.spells": spells});
  }

  async changeSpellsName(uuid, name) {
    const spells = this.spells;

    for (let i in spells) {
      if (spells[i].uuid === uuid)
        spells[i].name = name;
    }

    return this.parent.update({"system.spells": spells});
  }

  get equipPoints() {
    return this.twohanded.value ? 2 : 1;
  }

  get canEquip() {
    const actor = this.parent.actor;
    if (game.settings.get("wfrp4e", "limitEquippedWeapons") && actor.type !== "vehicle") {
      return actor.equipPointsUsed + this.equipPoints <= actor.equipPointsAvailable;
    }

    return true;
  }

  /**
   * @returns {boolean}
   */
  get canUse() {
    const knowsLanguage = this.languageSkill;

    return this.isEquipped && knowsLanguage;
  }

  /**
   *
   * @returns {ItemWFRP4e|undefined}
   */
  get languageSkill() {
    return this.reader?.itemTypes.skill.find(skill => skill.name.toLowerCase() === this.languageSkillName.toLowerCase());
  }

  /**
   *
   * @returns {string}
   */
  get languageSkillName() {
    return `${game.i18n.localize("NAME.Language")} (${this.language})`;
  }

  /**
   * @inheritDoc
   *
   * @param data
   * @param options
   * @param user
   * @returns {Promise<{}>}
   */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    if (!data.img || data.img === "icons/svg/item-bag.svg" || data.img === "systems/wfrp4e/icons/blank.png") {
      this.parent.updateSource({"img": "icons/sundries/books/book-worn-brown-grey.webp"});
    }

    if (!data.system?.encumbrance?.value) {
      this.updateSource({"encumbrance.value": Utility.getSetting(settings.grimoires.defaultEncumbrance)});
    }

    if (!data.system?.availability?.value) {
      this.updateSource({"availability.value": Utility.getSetting(settings.grimoires.defaultAvailability)});
    }
  }

  /**
   * @inheritDoc
   *
   * @param htmlOptions
   * @returns {Promise<{}>}
   */
  async expandData(htmlOptions) {
    let data = await super.expandData(htmlOptions);

    data.properties.push(game.i18n.format("Forien.Armoury.Grimoires.WrittenIn", {language: this.language}).capitalize());

    let lores = new Set();

    if (!this.hideSpells) {
      for (let spell of await this.loadSpells()) {
        data.properties.push(`<a class="grimoire-spell-link" data-uuid="${spell.uuid}">${spell.name}</a>`);

        const lore = game.wfrp4e.config.magicLores[spell.system?.lore?.value] ?? null;
        const loreLabel = game.i18n.format("Forien.Armoury.Scrolls.LoreOf", {lore});
        if (lore)
          lores.add(loreLabel);
      }

      for (let lore of lores)
        data.properties.push(lore);
    }

    let itemProperties = this.OriginalQualities.concat(this.OriginalFlaws);
    for (let prop of itemProperties)
      data.properties.push("<a class='item-property'>" + prop + "</a>");

    data.properties = data.properties.filter(p => !!p);

    return data;
  }

  async applySpells() {
    if (this.hideSpells) return;

    const spells = this.spells;
    const actor = this.parent.actor;
    const items = [];

    for (const spell of spells) {
      const item = await fromUuid(spell.uuid);
      if (!item || actor.itemTypes.spell.find(s => s.name === spell.name || s.flags.core?.sourceId === spell.uuid))
        continue;

      if (
        !Utility.getSetting(settings.grimoires.transferWithoutLore) &&
        !this.doesActorKnowLore(item.system?.lore?.value)
      ) continue;

      const data = item.toObject();

      if (spell.name)
        data.name = spell.name;

      foundry.utils.setProperty(data, `flags.${constants.moduleId}.${flags.grimoires.source}`, this.parent.id);
      foundry.utils.setProperty(data, `flags.core.sourceId`, spell.uuid);

      items.push(data);
    }

    await actor.createEmbeddedDocuments("Item", items);
  }

  async removeSpells() {
    const actor = this.parent.actor;
    if (!actor) return;

    let spells = actor.itemTypes.spell.filter(s =>
      s.flags[constants.moduleId]?.[flags.grimoires.source] === this.parent.id &&
      s.system.memorized.value === false
    );

    const deletes = spells.map(s => s.id);
    await actor.deleteEmbeddedDocuments("Item", deletes);
  }

  async onEquipToggle(data, options, user) {
    if (!Utility.getSetting(settings.grimoires.requireEquipped)) return;
    if (user !== game.user.id) return;

    if (data.system.equipped.value) {
      await this.applySpells();
    } else {
      await this.removeSpells();
    }
  }

  async _onCreate(data, options, user) {
    if (Utility.getSetting(settings.grimoires.requireEquipped)) return;
    if (user !== game.user.id) return;

    await this.applySpells();
  }

  async _onDelete(options, user) {
    if (user !== game.user.id) return;

    await this.removeSpells();
  }

  /**
   * @param {string} lore
   *
   * @returns {boolean}
   */
  doesActorKnowLore(lore) {
    lore = game.wfrp4e.config.magicLores[lore] ?? lore;
    const talent = game.i18n.format("Forien.Armoury.Grimoires.ArcaneMagicTalent", {lore});

    return this.parent.actor?.itemTypes.talent.some(t => t.name === talent) || false;
  }

  async generateDescription() {
    const lores = new Map();

    if (this.hideSpells) return;

    for (let spell of await this.loadSpells()) {
      const lore = game.wfrp4e.config.magicLores[spell.system?.lore?.value] ?? null;
      const loreLabel = game.i18n.format("Forien.Armoury.Scrolls.LoreOf", {lore});

      if (lores.has(lore)) {
        lores.get(lore).spells.push(spell.link);
      } else {
        lores.set(lore, {label: loreLabel, spells: [spell.link]});
      }
    }

    let loresSummary = [];
    let spells = '';
    for (let [key, lore] of lores) {
      const summary = game.i18n.format('Forien.Armoury.Grimoires.LoreSummary', {
        num: lore.spells.length,
        lore: lore.label
      });
      loresSummary.push(summary);

      spells += `<ul><li>${lore.spells.join('</li><li>')}</li></ul><br>`;
    }

    const and = game.i18n.localize('Forien.Armoury.Grimoires.And');
    const written = game.i18n.format("Forien.Armoury.Grimoires.WrittenIn", {language: this.language});
    const summary = game.i18n.format('Forien.Armoury.Grimoires.GrimoireSummary', {
      written,
      list: loresSummary.join(` ${and} `)
    })
    const description = `<p>${summary}</p> ${spells}`;

    await this.parent.update({'system.description.value': description});
  }

  /**
   * @returns {boolean}
   */
  get canActorWrite() {
    return this.reader?.itemTypes.talent.some(t => t.name === game.i18n.localize("Forien.Armoury.Grimoires.ReadWriteTalent")) || false;
  }

  /**
   * @returns {boolean}
   */
  get hideSpells() {
    if (!this.parent.actor) return false;

    if (Utility.getSetting(settings.grimoires.hideSpellsWithoutLanguage))
      return !this.languageSkill;

    if (Utility.getSetting(settings.grimoires.requireReadWrite))
      return !this.canActorWrite;

    return false;
  }

  /**
   * @returns {ActorWFRP4e|null}
   */
  get reader() {
    return this.parent.actor || game.user.character || canvas.tokens.controlled[0]?.actor || null;
  }
}
