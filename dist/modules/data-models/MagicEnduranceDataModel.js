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
  #lastRegen;
  /**
   * @type {number}
   */
  #maximum;
  #virtual

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
  get lastRegen() {
    return this.#lastRegen;
  }

  /**
   * @param {*} value
   */
  set lastRegen(value) {
    this.#lastRegen = parseInt(value);
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

  get virtual() {
    return this.#virtual;
  }

  set virtual(value) {
    this.#virtual = !!value;
  }

  /**
   * @return {{lastRegen: number, regen: number, value: number}}
   */
  toObject() {
    return {
      [flags.magicalEndurance.lastRegen]: this.lastRegen,
      [flags.magicalEndurance.regenPerHour]: this.regen,
      [flags.magicalEndurance.maximum]: this.maximum,
      [flags.magicalEndurance.value]: this.value,
    };
  }
}