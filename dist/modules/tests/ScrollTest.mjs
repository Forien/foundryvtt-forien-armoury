import Utility from "../utility/Utility.mjs";
import {settings} from "../constants.mjs";

/**
 * @extends WomCastTest
 */
export default class ScrollTest extends WomCastTest {
  allowOvercasting = false;

  constructor(data, actor) {
    super(data, actor)
    if (!data)
      return

    this.allowOvercasting = Utility.getSetting(settings.scrolls.allowOvercasting);
    this.data.context.allowOvercasting = this.allowOvercasting;
    this.data.preData.scroll = data.scroll;

    this.computeTargetNumber();
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

  /**
   * @inheritDoc
   */
  async postTest() {
    super.postTest();

    if (this.result.outcome === 'success')
      await this.result.scroll.system.reduceQuantity();
  }
}