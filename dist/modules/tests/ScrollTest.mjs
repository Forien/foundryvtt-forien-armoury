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
    this.computeTargetNumber();
  }

  get item() {
    let item = super.item;

    item.system.computeOvercastingData();

    return item;
  }

  /**
   * Scrolls always count as Casting with Ingredient
   *
   * @returns {true}
   */
  get hasIngredient() {
    return true;
  }

  /**
   * Ma
   */
  // computeTargetNumber() {
  //   let skill = this.actor?.itemTypes.skill.find(skill => skill.name === this.data.result.skillSelected);
  //
  //   if (!skill)
  //     this.result.target = this.actor.characteristics.int.value;
  //   else
  //     this.result.target = skill.total.value;
  //
  //   if (this.preData.target)
  //     this.data.result.target = this.preData.target
  //   else
  //     this.data.result.target += this.targetModifiers
  // }
}