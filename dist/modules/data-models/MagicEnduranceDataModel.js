import {flags} from "../constants.mjs";


export default class MagicEnduranceDataModel {
  /**
   * @type {number}
   */
  #value;
  /**
   * @type {number}
   */
  #regenPerHour;
  /**
   * @type {number}
   */
  #latRegen;
  /**
   * @type {number}
   */
  #maximum;

  constructor(object) {
    Object.assign(this, object);
  }


  /**
   *
   * @return {number}
   */
  get value() {
    return this.#value;
  }

  /**
   * @param {*} value
   */
  set value(value) {
    if (value > this.maximum)
      value = this.maximum;

    this.#value = parseInt(value);
  }

  /**
   *
   * @return {number}
   */
  get regen() {
    return this.#regenPerHour;
  }

  /**
   * @param {*} value
   */
  set regen(value) {
    this.#regenPerHour = parseInt(value);
  }

  /**
   *
   * @return {number}
   */
  get latRegen() {
    return this.#latRegen;
  }

  /**
   * @param {*} value
   */
  set latRegen(value) {
    this.#latRegen = parseInt(value);
  }


  /**
   *
   * @return {number}
   */
  get maximum() {
    return this.#maximum;
  }

  /**
   * @param {*} value
   */
  set maximum(value) {
    this.#maximum = parseInt(value);
  }

  /**
   * @return {{lastRegen: number, regen: number, value: number}}
   */
  toObject() {
    return {
      [flags.magicalEndurance.lastRegen]: this.latRegen,
      [flags.magicalEndurance.regenPerHour]: this.regen,
      [flags.magicalEndurance.maximum]: this.maximum,
      [flags.magicalEndurance.value]: this.value,
    };
  }
}