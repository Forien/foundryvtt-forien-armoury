import {settings}       from "../constants.mjs";
import {debug}          from "../utility/Debug.mjs";
import ForienBaseModule from "../utility/ForienBaseModule.mjs";
import Utility          from "../utility/Utility.mjs";

export default class Tokens extends ForienBaseModule {
  #allowedTypes = [
    "npc",
    "creature",
  ];

  #brassPenniesItemUUID = "Compendium.wfrp4e-core.items.Item.0MYOJFx3vkYA95B4";

  /**
   * @inheritDoc
   */
  bindHooks() {
    Hooks.on("createToken", this.#onCreateToken.bind(this));
  }

  /**
   *
   *
   *
   * @param {TokenDocument} token
   * @param {{}} _options
   * @param {string} _userId
   *
   * @return {Promise<void>}
   */
  async #onCreateToken(token, _options, _userId) {
    if (!game.user.isGM || game.user !== game.users.activeGM) return;
    if (!Utility.getSetting(settings.actor.rollToken)) return;
    if (!this.#allowedTypes.includes(token.actor?.type)) return;
    if (token.actorLink) return;

    const rollMode = Utility.getSetting(settings.actor.rollMode);
    const moneyMode = Utility.getSetting(settings.actor.moneyMode);
    let money = null;
    let formula = null;

    if (await this.#askRollToken(token, rollMode))
      await this.#rollToken(token);

    if (Utility.getSetting(settings.actor.rollMoney)) {
      formula = await this.#askRollMoney(token, moneyMode);
      money = await this.#rollMoney(token, formula);
    }

    debug("[Tokens] Performed rolls on Token Creation.", {token, formula, money, rollMode, moneyMode});
  }

  /**
   *
   * @param {TokenDocument} token
   * @param {string} mode
   *
   * @returns {Promise<boolean>}
   */
  async #askRollToken(token, mode) {
    let doRoll = true;

    if (
      mode === settings.actor.choices.ask
      || (mode === settings.actor.choices.askNPC && token.actor.type === "npc")
    ) {
      doRoll = await foundry.applications.api.DialogV2.confirm({
        window: {
          title: game.i18n.format("Forien.Armoury.Actors.ShouldRollTokenTitle", {
            name: token.name,
          }),
        },
        content: game.i18n.format("Forien.Armoury.Actors.ShouldRollTokenContent", {
          name: token.name,
          species: token.actor.system.details.species.value,
        }),
      });
    }

    return doRoll;
  }

  /**
   *
   * @param {TokenDocument} token
   * @param {string} mode
   *
   * @returns {Promise<string>}
   */
  async #askRollMoney(token, mode) {
    let formula = Utility.getSetting(settings.actor.defaultMoney);

    if (
      mode === settings.actor.choices.ask
      || (mode === settings.actor.choices.askNPC && token.actor.type === "npc")
    ) {
      formula = await ValueDialog.create({
        title: token.name,
        content: game.i18n.localize("Forien.Armoury.Actors.InputMoneyFormula"),
      }, formula);
    }

    return formula;
  }


  /**
   *
   * @param {TokenDocument} token
   *
   * @returns {Promise<void>}
   */
  async #rollToken(token) {
    const advancement = new Advancement(token.actor);

    await advancement.advanceSpeciesCharacteristics();

    try {
      await advancement.advanceSpeciesSkills();
      await advancement.advanceSpeciesTalents();
    } catch (error) {
      Utility.notify(`Could not advance species Skills and/or Talents for ${token.name}.`, {
        type: "warning",
        data: {token, actor: token.actor},
      });
    }
  }

  /**
   *
   * @param {TokenDocument} token
   * @param {string} formula
   *
   * @returns {Promise<number|boolean>}
   */
  async #rollMoney(token, formula) {
    const bpItem = await fromUuid(this.#brassPenniesItemUUID);
    const bpData = bpItem?.toObject();
    let total;

    if (!bpData)
      return Utility.notify(
        `Could not find Brass Pennies under "${this.#brassPenniesItemUUID}" UUID. Please contact Forien or submit a bug report on Forien's Armoury GitHub.`,
        {type: "error"},
      );

    const actor = token.actor;

    try {
      const roll = await new Roll(formula).evaluate();
      total = roll.total;

      const moneyItems = (await WFRP_Utility.allMoneyItems() || [])
                           .map(m => {
                             if (m.system.coinValue.value === 1)
                               m.system.quantity.value = total;
                             else
                               m.system.quantity.value = 0;

                             return m;
                           })
                           .sort(
                             (a, b) => ((a.system.coinValue.value >= b.system.coinValue.value) ? -1 : 1)
                           )
                         || [];

      const money = game.wfrp4e.market.consolidateMoney(moneyItems);
      await actor.createEmbeddedDocuments("Item", money);
    } catch {
      Utility.notify(`Could not roll "${formula}" money for ${token.name}.`, {
        type: "error",
        data: {formula, token, actor, bpData},
      });
    }

    return total;
  }
}
