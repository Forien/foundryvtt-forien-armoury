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

      // new fields.SchemaField({
      // value: new fields.StringField(),
      // effectString: new fields.StringField(),
    // });

    return schema;
  }

  get spell() {
    return fromUuidSync(this.spellUuid);
  }

  _onUpdate() {
    alert('update!');
  }

}