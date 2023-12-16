import {debug} from "./Debug.mjs";
import {constants} from "../constants.mjs";
import Utility from "./Utility.mjs";
import ForienBaseModule from "./ForienBaseModule.mjs";

export default class WorldTimeObserver extends ForienBaseModule {
  /**
   * @type {Map<string, {callback: function, args: {}, every: number, last: number}>}
   */
  #subscribers = new Map();

  /**
   *
   */
  bindHooks() {
    Hooks.on('updateWorldTime', this.#onWorldTimeUpdate.bind(this));
  }

  /**
   *
   * @param {number} time
   * @param {number} increment
   * @param {{}} _options
   *
   * @return {Promise<void>}
   */
  async #onWorldTimeUpdate(time, increment, _options) {
    for (let [_id, subscriber] of this.#subscribers) {
      await this.#checkSubscriberTime(time, subscriber);
    }
  }

  /**
   *
   * @param {number} time
   * @param {{callback: function, args: {}, every: number, last: number}} subscriber
   *
   * @return {Promise<void>}
   */
  async #checkSubscriberTime(time, subscriber) {
    const passedTime = time - subscriber.last;
    if (passedTime < subscriber.every) return;

    // how many times the event should've happened by now?
    const passedUnits = Math.floor(passedTime / subscriber.every);

    for (let i = 0; i < passedUnits; i++) {
      await subscriber.callback.call(this, subscriber.args)
    }

    // set `last` to last time the event should happen, not necessarily current time.
    // e.g.: `last`:100, `time`:115, `every`:10. New `last` should be set to 110 to trigger at 120, not 125.
    const newLast = time - (passedTime % subscriber.every);
    subscriber.last = time;
    debug('[WorldTimeObserver] Handled events for a subscriber', {time, subscriber, passedTime, passedUnits, newLast});
  }

  /**
   * Subscribes a new listener
   *
   * @param {function} callback
   * @param {{}} args
   * @param {number} every
   * @param {number} last
   *
   * @return {string|false} id of listener or false on fail
   */
  subscribe(callback, {args = {}, every = 60, last = 0} = {}) {
    if (!(callback instanceof Function))
      return Utility.notify(game.i18n.localize("Forien.Armoury.WorldTimeObserver.NotAFunction"), {type: 'error'});

    if (!Number.isInteger(every) || every <= 0)
      return Utility.notify(game.i18n.format("Forien.Armoury.WorldTimeObserver.NotAnInteger", {arg: 'every'}), {type: 'error'});

    if (!Number.isInteger(last) || last < 0)
      return Utility.notify(game.i18n.format("Forien.Armoury.WorldTimeObserver.NotAnInteger", {arg: 'last'}), {type: 'error'});

    if (!(args instanceof Object))
      return Utility.notify(game.i18n.localize("Forien.Armoury.WorldTimeObserver.NotAnObject"), {type: 'error'});

    let id;
    let count = 0;

    do {
      id = foundry.utils.randomID();
      count++;
    } while (this.#subscribers.has(id) === true && count < constants.loopLimit);

    // how is it possible? Shouldn't. But I'm not gonna risk it.
    if (count === constants.loopLimit) {
      Utility.notify(game.i18n.localize("Forien.Armoury.WorldTimeObserver.LoopError"), {
        type: 'error',
        permanent: true,
        data: {observer: this.constructor.name, id, callback, args, every, last, attempts: count}
      })
      return false;
    }

    this.#subscribers.set(id, {
      callback,
      args,
      every,
      last
    })

    debug('[WorldTimeObserver] Subscribed new listener', {
      observer: this.constructor.name,
      id,
      callback,
      args,
      every,
      last,
      attempts: count
    })

    return id;
  }

  /**
   * Unsubscribes listener with a given id.
   *
   * @param {string} id
   */
  unsubscribe(id) {
    this.#subscribers.delete(id)
    debug('[WorldTimeObserver] Unsubscribed listener with the specified id', {observer: this.constructor.name, id})
  }

  /**
   * Unsubscribes all listeners that share a callback.
   *
   * @param callback
   */
  unsubscribeBulk(callback) {
    this.#subscribers.forEach((value, key, map) => {
      if (value.callback === callback)
        map.delete(key);
    })
    debug('[WorldTimeObserver] Unsubscribed all listeners with the specified callback', {observer: this.constructor.name, callback})
  }

  /**
   * Unsubscribes all listeners.
   */
  unsubscribeAll() {
    this.#subscribers.clear();
    debug('[WorldTimeObserver] Unsubscribed all listeners', {observer: this.constructor.name})
  }


}