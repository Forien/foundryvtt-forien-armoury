import Utility from "../utility/Utility.mjs";
import {settings} from "../constants.mjs";
import ScrollDialog from "../apps/ScrollDialog.mjs";

const fields = foundry.data.fields;

/**
 * @extends PhysicalItemModel
 * @mixes PropertiesMixin
 * @category - Documents
 */
export default class ScrollModel extends PropertiesMixin(PhysicalItemModel) {

  /**
   * @inheritDoc
   *
   * @returns {DataSchema}
   */
  static defineSchema() {
    let schema = super.defineSchema();

    schema.spellUuid = new fields.StringField({blank: true, nullable: true, initial: null});
    schema.language = new fields.StringField({blank: true, nullable: true, initial: game.i18n.localize("SPEC.Magick")});

    return schema;
  }

  /**
   *
   * @returns {ItemWfrp4e|{folder:string,img:string,name:string,pack:string,sort:number,type:string,uuid:string,_id:string}}
   */
  get spell() {
    return fromUuidSync(this.spellUuid);
  }

  /**
   * @returns {Promise<ItemWfrp4e|null>}
   */
  async loadSpell() {
    return await fromUuid(this.spellUuid);
  }

  /**
   * @returns {boolean}
   */
  get canUse() {
    const notZero = this.quantity.value > 0;
    const knowsLanguage = this.languageSkill;

    return notZero && knowsLanguage;
  }

  /**
   * @returns {boolean}
   */
  get isMagick() {
    return this.language.toLowerCase() === game.i18n.localize("SPEC.Magick").toLowerCase();
  }

  /**
   *
   * @returns {ItemWfrp4e|undefined}
   */
  get languageSkill() {
    return this.parent.actor?.itemTypes.skill.find(skill => skill.name.toLowerCase() === this.languageSkillName.toLowerCase());
  }

  /**
   *
   * @returns {string}
   */
  get languageSkillName() {
    return `${game.i18n.localize("NAME.Language")} (${this.language})`;
  }

  // *** Creation ***
  /**
   * @inheritDoc
   *
   * @param data
   * @param options
   * @param user
   * @returns {Promise<{}>}
   */
  async preCreateData(data, options, user) {
    const preCreateData = await super.preCreateData(data, options, user);

    if (!data.img || data.img === "icons/svg/item-bag.svg" || data.img === "systems/wfrp4e/icons/blank.png") {
      const match = data.name.match(/(\(\d+\))/i);
      preCreateData.img = "icons/sundries/scrolls/scroll-bound-green.webp";

      if (match) {
        const number = match[1];
        preCreateData.name = game.i18n.localize("Forien.Armoury.Scrolls.NewScrollDefaultName") + ` ${number}`;
      }
    }

    if (!preCreateData.system?.encumbrance?.value) {
      foundry.utils.setProperty(preCreateData, 'system.encumbrance.value', Utility.getSetting(settings.scrolls.defaultEncumbrance));
    }

    if (!preCreateData.system?.availability?.value) {
      foundry.utils.setProperty(preCreateData, 'system.availability.value', Utility.getSetting(settings.scrolls.defaultAvailability));
    }

    return preCreateData;
  }

  /**
   * @inheritDoc
   *
   * @param data
   * @param options
   * @param user
   */
  updateChecks(data, options, user) {
    super.updateChecks(data);

    if (data.system?.spellUuid) {
      this.#promptForScrollNameChange(options);
    }
  }

  /**
   * @inheritDoc
   *
   * @returns {Promise<void>}
   */
  async #promptForScrollNameChange(options = {}) {
    const setting = Utility.getSetting(settings.scrolls.updateName);

    if (!options.skipAsk && setting === settings.scrolls.never) return;

    const spell = await this.loadSpell();
    const scrollName = game.i18n.format("Forien.Armoury.Scrolls.ScrollOf", {spell: spell.name});
    const updateData = {name: scrollName};

    let content = game.i18n.format("Forien.Armoury.Scrolls.ChangeScrollNameContent", updateData);

    if (options.skipAsk || Utility.getSetting(settings.scrolls.replaceDescription)) {
      content += "<br>" + game.i18n.localize("Forien.Armoury.Scrolls.ChangeScrollDescription");
      updateData["system.description.value"] = spell.description.value;
    }

    let agreed = true;

    if (!options.skipAsk && setting === settings.scrolls.ask) {
      agreed = await Dialog.confirm({
        title: 'Forien.Armoury.Scrolls.ChangeScrollNameTitle',
        content
      });
    }

    if (agreed === true)
      this.parent.update(updateData);
  }

  /**
   * @inheritDoc
   *
   * @param htmlOptions
   * @returns {Promise<{}>}
   */
  async expandData(htmlOptions) {
    let data = await super.expandData(htmlOptions);

    data.properties.push(this.language);

    if (this.spell) {
      /**
       * @type {ItemWfrp4e}
       */
      let spell = await fromUuid(this.spell.uuid);
      data.properties.push(`<a class="scroll-spell-link" data-uuid="${spell.uuid}">${spell.name}</a>`);

      const lore = game.wfrp4e.config.magicLores[spell.system?.lore?.value] ?? null;
      const loreLabel = game.i18n.format("Forien.Armoury.Scrolls.LoreOf", {lore});
      if (lore)
        data.properties.push(loreLabel);

      data.properties.push(spell.system.ritual?.value ? game.i18n.localize("ITEM.Ritual") : false);
      data.properties.push(spell.system.magicMissile?.value ? game.i18n.localize("Magic Missile") : false);
      data.properties.push(spell.system.target?.aoe ? game.i18n.localize("AoE") : false);
      data.properties.push(spell.system.range?.vortex ? game.i18n.localize("ITEM.RandomVortex") : false);

      const buttonLabel = game.i18n.format("Forien.Armoury.Scrolls.CastFromScroll", {spell: spell.name});
      data.other.push(`<a class="scroll-spell-cast">${buttonLabel}</a>`);
    }

    let itemProperties = this.OriginalQualities.concat(this.OriginalFlaws)
    for (let prop of itemProperties)
      data.properties.push("<a class='item-property'>" + prop + "</a>")

    data.properties = data.properties.filter(p => !!p);

    return data;
  }


  /**
   * Prepares the Scroll Dialog and performs the Scroll Test
   *
   * @returns {Promise<ScrollTest|null>}
   */
  async prepareScrollTest(options = {}) {
    /**
     * @type {ActorWfrp4e}
     */
    const actor = this.parent.actor;
    if (!actor) return null;

    if (!this.canUse) {
      Utility.notify(
        game.i18n.format("Forien.Armoury.Scrolls.ActorCanNotUse", {
          actor: actor.name,
          scroll: this.parent.name,
          language: this.language
        }),
        {type: "warning"}
      );

      return null;
    }

    const compendiumSpell = await this.loadSpell();
    const spellData = compendiumSpell.toObject();
    const skill = this.languageSkill;

    spellData.system.memorized.value = true;
    spellData.system.cn.value = 0;
    spellData.system.skill.value = skill.name;

    let difficulty = Utility.getSetting(settings.scrolls.difficulty);

    if (this.isMagick)
      difficulty = Utility.getSetting(settings.scrolls.difficultyMagick);

    const spell = new CONFIG.Item.documentClass(spellData, {parent: actor});
    spell.system.computeOvercastingData();

    const dialogData = {
      fields: foundry.utils.mergeObject(options.fields || {}, {
        difficulty
      }),
      data: {
        scroll: this.parent,
        spell,
        hitLoc: !!spell.system.damage.value,
        skill: skill
      },
      options: options || {}
    }

    const test = await actor._setupTest(dialogData, ScrollDialog)
    return await test.roll();
  }
}
