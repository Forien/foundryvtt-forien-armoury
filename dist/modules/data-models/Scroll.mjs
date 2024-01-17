const fields = foundry.data.fields;

/**
 * @extends PhysicalItemModel
 * @mixes PropertiesMixin
 * @category - Documents
 */
export default class ScrollModel extends PropertiesMixin(PhysicalItemModel) {

  static defineSchema() {
    let schema = super.defineSchema();

    schema.spellUuid = new fields.StringField({blank: true, nullable: true, initial: null});
    schema.language = new fields.StringField({blank: true, nullable: true, initial: null});

    return schema;
  }

  /**
   *
   * @returns {ItemWfrp4e|{folder:string,img:string,name:string,pack:string,sort:number,type:string,uuid:string,_id:string}}
   */
  get spell() {
    return fromUuidSync(this.spellUuid);
  }

  get canUse() {
    const notZero = this.quantity.value > 0;
    const languageLocalized = game.i18n.localize("NAME.Language");
    const knowsLanguage = this.parent.actor?.itemTypes.skill.some(skill => skill.name.includes(languageLocalized) && skill.name.includes(this.language));

    return notZero && knowsLanguage;
  }

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
      data.properties.push("<a class ='item-property'>" + prop + "</a>")

    data.properties = data.properties.filter(p => !!p);

    return data;
  }

}