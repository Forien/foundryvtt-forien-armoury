import Utility    from "../utility/Utility.mjs";
import {settings} from "../constants.mjs";

/**
 * @extends WomCastTest
 */
export default class ScrollTest extends WomCastTest {
  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return

    this.data.preData.scroll = data.scroll;
    this.data.context.isScroll = true;
    this.data.context.allowOvercasting = this.allowOvercasting;

    this.computeTargetNumber();
  }

  /**
   * Can overcasting be employed?
   *
   * @returns {boolean}
   */
  get allowOvercasting() {
    let allowOvercasting = Utility.getSetting(settings.scrolls.allowOvercasting);

    if (allowOvercasting === settings.scrolls.never)
      return false;

    if (allowOvercasting === settings.scrolls.always)
      return true;

    return this.data.preData.scroll.system.isMagick;
  }

  /**
   * @inheritDoc
   */
  get item() {
    let item = super.item;

    item.system.computeOvercastingData();

    return item;
  }

  /**
   * Scrolls always count as Casting with Ingredient
   *
   * @inheritDoc
   *
   * @returns {true}
   */
  get hasIngredient() {
    return true;
  }

  get scroll() {
    return this.data.preData.scroll;
  }

  get damageEffects() {
    return this.item.damageEffects.map(this.#mapEffects.bind(this));
  }

  get targetEffects() {
    return this.item.targetEffects.map(this.#mapEffects.bind(this));
  }

  get areaEffects() {
    return this.item.areaEffects.map(this.#mapEffects.bind(this));
  }

  #mapEffects(e) {
    let effect = foundry.utils.duplicate(e);
    effect.uuid = `${this.scroll.system.spellUuid}.ActiveEffect.${effect._id}`;
    effect.actor = this.data.actor;

    return effect;
  }

  /**
   * @inheritDoc
   */
  async postTest() {
    super.postTest();

    if (this.result.outcome === 'success')
      await this.result.scroll.system.reduceQuantity();
  }
}