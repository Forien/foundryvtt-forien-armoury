import {constants, flags, settings} from "../constants.mjs";
import {debug}                      from "../utility/Debug.mjs";
import ForienBaseModule             from "../utility/ForienBaseModule.mjs";
import Utility                      from "../utility/Utility.mjs";

export default class Injuries extends ForienBaseModule {
  #observer;

  #listeners = new Map();

  /**
   * @inheritDoc
   */
  bindHooks() {
    Hooks.on("ready", this.#registerActorInjuryListeners.bind(this));
    Hooks.on("createItem", this.#registerCreatedInjuryListener.bind(this));
  }


  /**
   * On load, loop through all Actors and attempt to register listeners
   */
  async #registerActorInjuryListeners() {
    if (!game.user.isGM || game.user !== game.users.activeGM) return;
    if (!Utility.getSetting(settings.injuries.autoProgress)) return;

    this.#observer = game.modules.get(constants.moduleId).api.modules.get("worldTimeObserver");

    for (let actor of game.actors.contents) {
      await this.#registerActorInjuryListener(actor);
    }

    debug("[Injuries] Registered injury listeners", {listeners: this.#listeners});
  }

  /**
   * Registers new listener with the WorldTimeObserver for Actors that have injuries
   *
   * @param {ActorWFRP4e} actor
   */
  async #registerActorInjuryListener(actor) {
    let injuries = actor.itemTypes.injury;

    for (let injury of injuries) {
      await this.#registerInjuryListener(actor, injury);
    }
  }

  /**
   * Registers new listener with the WorldTimeObserver for Actors that got a new injury
   *
   * @param injury
   *
   * @return {Promise<void>}
   */
  async #registerCreatedInjuryListener(injury) {
    if (!game.user.isGM || game.user !== game.users.activeGM) return;
    if (!Utility.getSetting(settings.injuries.autoProgress)) return;
    if (injury.type !== "injury") return;
    let actor = injury.actor;

    if (!(actor instanceof ActorWFRP4e)) return;

    await this.#registerInjuryListener(actor, injury);
    debug("[Injuries] Registered a listener for newly created injury", {actor, injury, listeners: this.#listeners});
  }

  /**
   * Actually handle registering the listener for a specific injury
   *
   * @param {ActorWFRP4e} actor
   * @param {ItemWFRP4e} injury
   *
   * @return {Promise<void>}
   */
  async #registerInjuryListener(actor, injury) {
    if (injury.system.duration.permanent) return;

    let unitSeconds = this.#getUnitSeconds(game.i18n.localize("Days"));
    if (unitSeconds === false) return;

    if (isNaN(injury.system.duration.value))
      await this.#rollInjury(actor, injury);

    let {lastProgress, saved} = this.#getLastProgress(injury);

    this.#subscribeToObserver(actor, injury, unitSeconds, lastProgress);

    if (!saved)
      await this.#saveLastProgress(injury, lastProgress);
  }

  /**
   * Register listener to the WorldTimeObserver
   *
   * @param {ActorWFRP4e} actor
   * @param {ItemWFRP4e} injury
   * @param {number} unitSeconds
   * @param {number} lastProgress
   */
  #subscribeToObserver(actor, injury, unitSeconds, lastProgress) {
    let listenerId = this.#observer.subscribe(this.#handleAutoProgressEvent.bind(this), {
      args: {actorId: actor.id, injuryId: injury.id},
      every: unitSeconds,
      last: lastProgress,
    });

    this.#listeners.set(injury.uuid, listenerId);
  }

  /**
   * Roll injury value for duration or incubation.
   *
   * @param {ActorWFRP4e} actor
   * @param {ItemWFRP4e} injury
   *
   * @return {Promise<ItemWFRP4e|false>}
   */
  async #rollInjury(actor, injury) {
    debug("[Injuries] Injury value is NaN, attempting to roll on it", {actor, injury});

    injury.system.start();
  }

  /**
   * Retrieves last time an injury progressed, or current World Time if it hasn't,
   * along with boolean telling if the value was saved before.
   *
   * @param {ItemWFRP4e} injury
   *
   * @return {{saved: boolean, lastProgress: number}}
   */
  #getLastProgress(injury) {
    let lastProgress = injury.getFlag(constants.moduleId, flags.injuries.lastProgress);
    if (lastProgress)
      return {lastProgress, saved: true};

    return {lastProgress: game.time.worldTime, saved: false};
  }

  /**
   * Saves timestamp of the last progression of the injury.
   *
   * @param {ItemWFRP4e} injury
   * @param {number} lastProgress
   *
   * @return {Promise<void>}
   */
  async #saveLastProgress(injury, lastProgress) {
    await injury.setFlag(constants.moduleId, flags.injuries.lastProgress, lastProgress);
  }

  /**
   * Converts string time unit to its representation in seconds.
   *
   * @param {string} unit
   *
   * @return {number|false}
   */
  #getUnitSeconds(unit) {
    switch (unit) {
      case game.i18n.localize("Days"):
        return 86400;
      case game.i18n.localize("Hours"):
        return 3600;
      case game.i18n.localize("Minutes"):
        return 60;
      default:
        return false;
    }
  }

  /**
   * Handles progression of injuries, whenever fired by WorldTimeObserver
   *
   * @param {{id: string}} args
   * @param {number} time
   *
   * @return {Promise<*>}
   */
  async #handleAutoProgressEvent(args, time) {
    const {actorId, injuryId} = args;
    const uuid = `Actor.${actorId}.Item.${injuryId}`;
    const actor = game.actors.get(actorId);
    const injury = actor?.items.get(injuryId);

    if (!actor || !injury) {
      return this.#removeListener(uuid);
    }

    await this.#saveLastProgress(injury, time);
    await injury.system.decrement();

    debug("[Injuries] Handled injury progression event", {actor, injury, listeners: this.#listeners});
  }

  /**
   * Removes the listener and unsubscribes from WorldTimeObserver
   *
   * @param {string} uuid
   *
   * @return {boolean}
   */
  #removeListener(uuid) {
    let listenerId = this.#listeners.get(uuid);
    this.#observer.unsubscribe(listenerId);

    return this.#listeners.delete(uuid);
  }
}
