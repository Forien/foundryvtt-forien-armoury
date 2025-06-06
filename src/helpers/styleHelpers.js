/**
 * #######################################################
 * This file exists so that scripts used in Active Effects related to Fighting Styles can be updated
 * painlessly without end users having to replace every item.
 * #######################################################
 */
import {constants, flags} from "../constants.mjs";
import {debug}            from "../utility/Debug.mjs";
import Utility            from "../utility/Utility.mjs";

/**
 * Replaces itself with one of Fightin Style Talents of the player's choosing.
 *
 * * Talent name:           Fighting Style (Any)
 * * Effect name:           Fighting Style (Any)
 * * Effect Type:           Add Items
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 *
 * @return {Promise<boolean>}
 */
async function replaceWithStyle(args, self) {
  const styleTalents = await getCompendiumTalentsByFlag(flags.talents.fightingStyle);

  await Dialog.wait({
    title: game.i18n.localize("Forien.Armoury.Effects.SelectTalent"),
    content: await foundry.applications.handlebars.renderTemplate(
      Utility.getTemplate("select-item.hbs"),
      {styleTalents},
    ),
    default: "ok",
    buttons: {
      cancel: {
        label: game.i18n.localize("Cancel"),
        icon: "<i class=\"fas fa-undo\"></i>",
      },
      ok: {
        label: game.i18n.localize("Forien.Armoury.Effects.AddTalent"),
        icon: "<i class=\"fas fa-check\"></i>",
        callback: async html => {
          const id = html.find("input[name=talent]:checked").data("id");
          const talent = await addTalentToActorAndCareer(id, self);
          debug("[styleHelpers] \"Fighting Style (Any)\" has been replaced with: ", {
            talent,
            compendiumId: id,
            styleTalents,
            effectArgs: args,
            effectThis: self,
          });
        },
      },
    },
  });

  await self.actor.deleteEmbeddedDocuments("Item", [self.effect.item._id]);

  return false;
}

/**
 * Replaces itself with one of Fighting Master Talents of the same style as already owned Fighting Style Talent.
 *
 * * Talent name:           Fighting Style (Any)
 * * Effect name:           Fighting Style (Any)
 * * Effect Type:           Add Items
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 *
 * @return {Promise<boolean>}
 */
async function replaceWithMastery(args, self) {
  const styleTalent = self.actor.itemTypes.talent.find(t => t.flags[constants.moduleId]?.[flags.talents.fightingStyle]);
  const style = styleTalent?.name.split("(")[1]?.replace(")", "");

  const masteryTalents = await getCompendiumTalentsByFlag(flags.talents.fightingMaster);
  const id = masteryTalents.find(t => t.name.includes(style))._id;

  const talent = await addTalentToActorAndCareer(id, self);

  await self.actor.deleteEmbeddedDocuments("Item", [self.effect.item._id]);
  debug("[styleHelpers] \"Fighting Master (Style)\" has been replaced with: ", {
    talent,
    compendiumId: id,
    masteryTalents,
    effectArgs: args,
    effectThis: self,
  });

  return false;
}

/**
 * Returns a path to Forien's Armoury Compendium pack
 *
 * @return {string}
 */
function getCompendiumPath() {
  return `${constants.moduleId}.forien-armoury`;
}

/**
 * Returns all Talents from Compendium with the correct flag
 *
 * @param {string} flag
 * @return {Promise<ItemWFRP4e[]>}
 */
async function getCompendiumTalentsByFlag(flag) {
  const packPath = getCompendiumPath();
  const pack = game.packs.get(packPath);
  const index = await pack.getIndex({fields: ["type", "flags"]});

  return index.filter(i => i.type === "talent" && i.flags[constants.moduleId]?.[flag]);
}

/**
 * Adds a Talent to Actor and replaces it in career
 *
 * @param {string} id
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 * @return {Promise<ItemWFRP4e|null>}
 */
async function addTalentToActorAndCareer(id, self) {
  const talent = await fromUuid(`Compendium.${getCompendiumPath()}.Item.${id}`);

  const career = self.actor.currentCareer;
  let careerTalents = career.system.talents.map(t => {
    if (t === self.effect.name)
      return talent.name;

    return t;
  });

  await self.actor.createEmbeddedDocuments("Item", [talent]);
  await career.update({"system.talents": careerTalents});

  return talent;
}

// #region Steelstorm
/**
 * Creates Chat Card explaining Steelstorm Assault.
 *
 * * Talent name:           Fighting Style (Steelstorm)
 * * Effect name:           Steelstorm Assault
 * * Effect Type:           Manually Invoked
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function steelstormAssault(args, self) {
  const advantageCost = 2;
  const actor = self.actor;
  const weapon = findActorsMainWeapon(actor);

  const advances = checkAdvances(weapon);
  const required = 15;
  const advantage = actor.system.status?.advantage?.value;

  if (canUseSteelstormAssault(advances, required, advantage, advantageCost, self)) {
    actor.modifyAdvantage(-advantageCost);

    ChatMessage.create({
      user: game.user._id,
      content: `<b>${game.i18n.localize("Forien.Armoury.Effects.Steelstorm.Assault.Name")}</b><br/>
              ${game.i18n.format("Forien.Armoury.Effects.Steelstorm.Assault.Description", {character: actor.name})}`,
    });
  }

  debug(
    "[styleHelpers] \"Steelstorm Assault\" has been invoked.",
    {weapon, advances, required, effectArgs: args, effectThis: self},
  );
}

/**
 * Returns true if Steelstorm Assault can be used.
 *
 * If false, also displays warnings
 *
 * @param {number} advances
 * @param {number} requiredAdvances
 * @param {number} advantage
 * @param {number} advantageCost
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 *
 * @returns {boolean}
 */
function canUseSteelstormAssault(advances, requiredAdvances, advantage, advantageCost, self) {
  if (advances < requiredAdvances) {
    warnNotEnoughAdvances(self, advances, requiredAdvances);

    return false;
  }

  if (advantage < advantageCost) {
    warnNotEnoughAdvantage(self, advantageCost, advantage);

    return false;
  }

  return true;
}

/**
 * Removes Slow property from weapons, or adds Fast property to weapons.
 *
 * * Talent name:           Fighting Style (Steelstorm)
 * * Effect name:           Steelstorm Handling
 * * Effect Type:           Prepare Item
 * * Effect Application:    Actor
 *
 * @param {{item: ItemWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function steelstormHandling(args, self) {
  const weapon = args.item;

  if (weapon.type === "weapon" && weapon.equipped && weapon.isMelee) {
    const advances = checkAdvances(weapon);
    const required = 5;

    if (advances >= required) {
      const qualities = weapon.system.qualities.value;
      const flaws = weapon.system.flaws.value;

      if (flaws.find(f => f.name === "slow")) {
        weapon.system.flaws.value = flaws.filter(f => f.name !== "slow");
      } else if (weapon.twohanded.value === false && !qualities.find(f => f.name === "fast")) {
        qualities.push({
          name: "fast",
          value: null,
        });
      }
    }

    debug("[styleHelpers] \"Steelstorm Handling\" checked equipped melee weapon during Item Preparation.", {
      weapon,
      advances,
      required,
      effectArgs: args,
      effectThis: self,
    });
  }
}

/**
 * Creates new Effect on Actor and posts a Chat Card explaining All In.
 *
 * * Talent name:           Fighting Style (Steelstorm)
 * * Effect name:           Go All In
 * * Effect Type:           Manually Invoked
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function goAllIn(args, self) {
  const weapon = findActorsMainWeapon(self.actor);
  const advances = checkAdvances(weapon);
  const required = 10;

  if (advances >= required) {
    const goingAllIn = foundry.utils.duplicate(self.item.effects.getName("Going All In"));
    const masteryTalent = hasMastery(args.actor);

    goingAllIn.disabled = false;

    const allInName = game.i18n.localize("Forien.Armoury.Effects.Steelstorm.AllIn.Name");
    const allInDescription = game.i18n.format(
      "Forien.Armoury.Effects.Steelstorm.AllIn.Description",
      {character: self.actor.name},
    );
    const allInDescriptionMastery = masteryTalent
      ? game.i18n.localize("Forien.Armoury.Effects.Steelstorm.AllIn.Mastery")
      : "";

    self.actor.createEmbeddedDocuments("ActiveEffect", [goingAllIn]);
    ChatMessage.create({
      user: game.user._id,
      content: `<b>${allInName}</b><br/>
                ${allInDescription}<br/>
                ${allInDescriptionMastery}`,
    });
  } else {
    warnNotEnoughAdvances(self, advances, required);
  }

  debug(
    "[styleHelpers] \"Go All In\" has been invoked.",
    {weapon, advances, required, effectArgs: args, effectThis: self},
  );
}

/**
 * Handles giving a modifier for all Weapon Tests while Going All In.
 *
 * * Talent name:           Fighting Style (Steelstorm)
 * * Effect name:           Going All In
 * * Effect Type:           Dialog
 * * Effect Application:    Actor
 *
 * @param {{prefillModifiers: {modifier: number, difficulty: string, slBonus: number, successBonus: number}, type:
 *   string, item: ItemWFRP4e, options: {}}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function goingAllIn(args, self) {
  if (args.type === "weapon" && args.item?.type === "weapon") {
    const advances = checkAdvances(args.item);
    const required = 10;

    if (advances >= required)
      args.prefillModifiers.modifier += 20;

    debug("[styleHelpers] \"Going All In\" is active on Prefill Dialog.", {
      weapon: args.item,
      advances,
      required,
      effectArgs: args,
      effectThis: self,
    });
  }
}

/**
 * Handles giving an additional quality for equipped weapon while Going All In.
 *
 * * Talent name:           Fighting Style (Steelstorm)
 * * Effect name:           Going All In (Mastery)
 * * Effect Type:           Prepare Item
 * * Effect Application:    Actor
 *
 * @param {{item: ItemWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function goingAllInMastery(args, self) {
  const weapon = args.item;

  if (weapon.type === "weapon" && weapon.equipped && weapon.isMelee) {
    const advances = checkAdvances(weapon);
    const required = 10;

    if (hasMastery(self.actor) && advances >= required) {
      const qualities = weapon.system.qualities.value;
      const damaging = qualities.find(f => f.name === "damaging");

      if (!damaging) {
        qualities.push({
          name: "damaging",
          value: null,
        });
      } else {
        damaging.name = "impact";
      }
    }

    debug("[styleHelpers] \"Going All In (Mastery)\" is active on Prefill Dialog.", {
      weapon: args.item,
      advances,
      required,
      effectArgs: args,
      effectThis: self,
    });
  }
}


/**
 * Handles prociding a Notice whenever targetting a character that is Going All In.
 *
 * * Talent name:           Fighting Style (Steelstorm)
 * * Effect name:           Going All In
 * * Effect Type:           Dialog
 * * Effect Application:    Actor
 *
 * @param {{prefillModifiers: {modifier: number, difficulty: string, slBonus: number, successBonus: number}, type:
 *   string, item: ItemWFRP4e, options: {}}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function targetIsGoingAllIn(args, self) {
  const target = args.data.targets[0]?.name ?? "undefined";
  const unopposedNotice = `<b>${game.i18n.localize("Forien.Armoury.Effects.Steelstorm.AllIn.Name")}:</b> ${game.i18n.format(
    "Forien.Armoury.Effects.Steelstorm.AllIn.Notice",
    {target},
  )}`;

  args.data.other.push(unopposedNotice);

  debug("[styleHelpers] \"Going All In\" is active on Targeter`s Prefill Dialog.", {
    item: args.item,
    target,
    effectArgs: args,
    effectThis: self,
  });
}

// #endregion Steelstorm

// #region Ironshield

/**
 *
 * @param {{actor: ActorWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
async function addMeleeParryCurrent(args, self) {
  const career = args.actor?.currentCareer;

  debug("[styleHelpers] Checking current career for Ironshield.", {career, effectArgs: args, effectThis: self});
  if (career) await addMeleeParryToCareer(career);
}

/**
 *
 * @param {{item: ItemWFRP4e, context: string}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
async function addMeleeParryFuture(args, self) {
  if (args.context !== "update") return;
  if (args.item.type !== "career") return;
  if (args.item.current?.value !== true) return;

  debug(
    "[styleHelpers] Checking current career for Ironshield.",
    {career: args.item, effectArgs: args, effectThis: self},
  );
  await addMeleeParryToCareer(args.item);
}

/**
 * Handles giving a modifier for defensive Weapon Tests while Bracing.
 *
 * * Talent name:           Fighting Style (Ironshield)
 * * Effect name:           Bracing
 * * Effect Type:           Dialog
 * * Effect Application:    Actor
 *
 * @param {{prefillModifiers: {modifier: number, difficulty: string, slBonus: number, successBonus: number}, type:
 *   string, item: ItemWFRP4e, options: {}}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function bracing(args, self) {
  if (self.actor.isOpposing && args.type === "weapon" && args.item?.type === "weapon") {
    const advances = checkAdvances(args.item);
    const required = 10;

    if (advances >= required)
      args.prefillModifiers.modifier += 20;

    debug("[styleHelpers] \"Bracing\" is active on Prefill Dialog.", {
      weapon: args.item,
      advances,
      required,
      effectArgs: args,
      effectThis: self,
    });
  }
}

/**
 *
 * @param {Combat} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e, script: WFRP4eScript}} self
 */
function bracingReminder(args, self) {
  const bracingName = game.i18n.localize("Forien.Armoury.Effects.Ironshield.Bracing.Name");
  const bracingReminder = game.i18n.format(
    "Forien.Armoury.Effects.Ironshield.Bracing.Reminder",
    {character: self.actor.name},
  );

  ChatMessage.create({
    user: game.user._id,
    content: `<b>${bracingName}</b>: ${bracingReminder}`,
  });
}

/**
 * Creates new Effect on Actor and posts a Chat Card explaining Bracing.
 *
 * * Talent name:           Fighting Style (Ironshield)
 * * Effect name:           Brace!
 * * Effect Type:           Manually Invoked
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function brace(args, self) {
  const weapon = findActorsMainWeapon(self.actor);
  const advances = checkAdvances(weapon);
  const required = 10;

  if (advances >= required) {
    const bracing = foundry.utils.duplicate(self.item.effects.getName("Bracing"));
    bracing.disabled = false;
    self.actor.createEmbeddedDocuments("ActiveEffect", [bracing]);

    ChatMessage.create({
      user: game.user._id,
      content: `<b>${game.i18n.localize("Forien.Armoury.Effects.Ironshield.Bracing.Name")}</b><br/>
                ${game.i18n.format(
    "Forien.Armoury.Effects.Ironshield.Bracing.Description",
    {character: self.actor.name},
  )}`,
    });
  } else {
    warnNotEnoughAdvances(self, advances, required);
  }

  debug("[styleHelpers] \"Brace!\" has been invoked.", {weapon, advances, required, effectArgs: args, effectThis: self});
}

/**
 * Removes Slow property from weapons, or adds Fast property to weapons.
 *
 * * Talent name:           Fighting Style (Ironshield)
 * * Effect name:           Ironshield Ward
 * * Effect Type:           Prepare Item
 * * Effect Application:    Actor
 *
 * @param {{item: ItemWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function ironshieldWard(args, self) {
  const weapon = args.item;

  if (weapon.type === "weapon" && weapon.equipped && weapon.isMelee) {
    const advances = checkAdvances(weapon);
    const required = 5;

    if (advances >= required) {
      const qualities = weapon.system.qualities.value;

      if (!qualities.find(f => f.name === "defensive")) {
        qualities.push({
          name: "defensive",
          value: null,
        });
      }
    }
    debug("[styleHelpers] \"Ironshield Ward\" checked equipped melee weapon during Item Preparation.", {
      weapon,
      advances,
      required,
      effectArgs: args,
      effectThis: self,
    });
  }
}

/**
 * Checks if the character can perform a Riposte. If yes, informs everyone.
 *
 * * Talent name:           Fighting Style (Ironshield)
 * * Effect name:           Ironshield Riposte
 * * Effect Type:           Opposed Defender
 * * Effect Application:    Actor
 *
 * @param {{opposedTest: OpposedTest, attackerTest: WeaponTest, defenderTest:WeaponTest}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function ironshieldRiposte(args, self) {
  const advances = checkAdvances(args.defenderTest.weapon);
  const required = 15;

  if (advances >= required) {
    const name = game.i18n.localize("Forien.Armoury.Effects.Ironshield.Riposte.Name");
    const description = game.i18n.format(
      "Forien.Armoury.Effects.Ironshield.Riposte.Description",
      {character: self.actor.name},
    );
    let content = `<b>${name}:</b> ${description}`;

    const masteryTalent = hasMastery(self.actor);
    if (masteryTalent) {
      const mastery = game.i18n.localize("Forien.Armoury.Effects.Ironshield.Riposte.Mastery");
      content += `<br/> ${mastery}`;
    }

    args.opposedTest.data.opposeResult.other.push(content);
  }

  debug("[styleHelpers] \"Ironshield Riposte\" is checking Opposed Defender.", {
    weapon: args.defenderTest.weapon,
    advances,
    required,
    effectArgs: args,
    effectThis: self,
  });
}

/**
 * Replaces `Melee (Basic)` with `Melee (Parry)` skill in specified Career Item.
 *
 * @param {ItemWFRP4e} career
 */
async function addMeleeParryToCareer(career) {
  const meleei18n = game.i18n.localize("NAME.Melee");
  const parryi18n = game.i18n.localize("SPEC.Parry");
  const basici18n = game.i18n.localize("SPEC.Basic");
  const meleeParry = `${meleei18n} (${parryi18n})`;
  const meleeBasic = `${meleei18n} (${basici18n})`;

  let careerSkills = foundry.utils.deepClone(career.system.skills);

  if (!careerSkills.includes(meleeParry) && careerSkills.includes(meleeBasic)) {
    careerSkills = careerSkills.map(skill => (skill === meleeBasic ? meleeParry : skill));
    let incomeSkill = career.system.skills[career.system.incomeSkill];
    if (incomeSkill === meleeBasic) incomeSkill = meleeParry;

    await career.update({
      "system.skills": careerSkills,
      "system.incomeSkill": [careerSkills.indexOf(incomeSkill)],
    });
  }

  debug("[styleHelpers] \"Melee (Basic)\" has been replaced with \"Melee (Parry).", {career, meleeBasic, meleeParry});
}


// #endregion Ironshield


// #region Evadecraft
/**
 * Creates a Chat Card explaining Shrewd Trickery.
 *
 * * Talent name:           Fighting Style (Evadecraft)
 * * Effect name:           Shrewd Trickery
 * * Effect Type:           Manually Invoked
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function shrewdTrickery(args, self) {
  const weapon = findActorsMainWeapon(self.actor);
  const advances = checkAdvances(weapon);
  const required = 15;

  if (advances >= required) {
    ChatMessage.create({
      user: game.user._id,
      content: `<b>${game.i18n.localize("Forien.Armoury.Effects.Evadecraft.ShrewdTrickery.Name")}</b><br/>
                ${game.i18n.format(
    "Forien.Armoury.Effects.Evadecraft.ShrewdTrickery.Description",
    {character: self.actor.name},
  )}`,
    });
  } else {
    warnNotEnoughAdvances(self, advances, required);
  }
  debug(
    "[styleHelpers] \"Shrewd Trickery\" has been invoked.",
    {weapon, advances, required, effectArgs: args, effectThis: self},
  );
}


/**
 * Handles giving a modifier for non-shield Weapon Tests while opposing Ranged attacks.
 *
 * * Talent name:           Fighting Style (Evadecraft)
 * * Effect name:           Shrewd Evadecraft
 * * Effect Type:           Dialog
 * * Effect Application:    Actor
 *
 * @param {{prefillModifiers: {modifier: number, difficulty: string, slBonus: number, successBonus: number}, type:
 *   string, item: ItemWFRP4e, options: {}}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function shrewdEvadecraft(args, self) {
  if (!self.actor.isOpposing) return;

  const {advances, required, isRangedAttack, shieldRating} = getShrewdEvadecraftData(args, self);

  if (advances < required) return;

  // Using non-shield to oppose ranged attacks, or shield that normally can't
  if (isRangedAttack && shieldRating < 2)
    args.prefillModifiers.modifier -= 20;

  debug("[styleHelpers] \"Shrewd Evadecraft\" is active during Prefill Dialog when opposing.", {
    weapon: args.item,
    advances,
    required,
    isRangedAttack,
    shieldRating,
    effectArgs: args,
    effectThis: self,
  });
}

/**
 * Decides if the Dialog Effect should be hidden.
 *
 * * Talent name:           Fighting Style (Evadecraft)
 * * Effect name:           Shrewd Evadecraft
 * * Effect Type:           Dialog — Hide Script
 * * Effect Application:    Actor
 *
 * @param {{prefillModifiers: {modifier: number, difficulty: string, slBonus: number, successBonus: number}, type:
 *   string, item: ItemWFRP4e, options: {}}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 *
 * @returns {boolean}
 */
function canShrewdEvadecraft(args, self) {
  if (!self.actor.isOpposing) return true;

  const {advances, required, isRangedAttack, shieldRating} = getShrewdEvadecraftData(args, self);

  if (advances < required) return true;
  if (!isRangedAttack) return true;
  if (shieldRating >= 2) return true;

  debug("[styleHelpers] \"canShrewdEvadecraft\".", {
    isOpposing: self.actor.isOpposing,
    advances,
    required,
    isRangedAttack,
    shieldRating,
  });

  return false;
}

/**
 * Retrieves data used by Shrewd Evadecraft Scripts
 *
 * @param {{attackerTest: WeaponTest, defenderTest: WeaponTest, opposedTest: OpposedTest}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 *
 * @returns {{advances: number, isRangedAttack: boolean, shieldRating: number, required: number}}
 */
function getShrewdEvadecraftData(args, self) {
  const advances = checkAdvances(args.item);
  const required = 5;
  const isRangedAttack = self.actor.attacker?.test.weapon.isRanged || false;
  const shieldRating = args.item?.qualities.value.find(q => q.name === "shield")?.value || 0;

  return {advances, required, isRangedAttack, shieldRating};
}

/**
 * If attacker scored Critical Hit and actor has unused Fortune point, inform about the possible action.
 *
 * * Talent name:           Fighting Style (Evadecraft)
 * * Effect name:           Lucky Evadecraft
 * * Effect Type:           Pre-Opposed Defender
 * * Effect Application:    Actor
 *
 * @param {{attackerTest: WeaponTest, defenderTest: WeaponTest, opposedTest: OpposedTest}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function luckyEvadecraft(args, self) {
  const advances = checkAdvances(args.defenderTest.weapon);
  const required = 10;

  if (advances < required) return;

  const isCritical = args.attackerTest.isCritical;

  if (isCritical && self.actor.status.fortune.value) {
    const content = `<b>${game.i18n.localize("Forien.Armoury.Effects.Evadecraft.LuckyEvadecraft.Name")}:</b>
                ${game.i18n.format(
    "Forien.Armoury.Effects.Evadecraft.LuckyEvadecraft.Description",
    {character: self.actor.name},
  )}`;
    args.opposedTest.data.opposeResult.other.push(content);
  }

  debug("[styleHelpers] \"Lucky Evadecraft\" is active during Pre-Opposed Defender.", {
    weapon: args.defenderTest.weapon,
    advances,
    required,
    isCritical,
    fortune: self.actor.status.fortune.value,
    effectArgs: args,
    effectThis: self,
  });
}

/**
 * Creates a Chat Card explaining Shrewd Disengage.
 *
 * * Talent name:           Fighting Style (Evadecraft)
 * * Effect name:           Shrewd Disengage
 * * Effect Type:           Manually Invoked
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function shrewdDisengage(args, self) {
  ChatMessage.create({
    user: game.user._id,
    content: `<b>${game.i18n.localize("Forien.Armoury.Effects.Evadecraft.Disengage.Name")}</b><br/>
                ${game.i18n.format(
    "Forien.Armoury.Effects.Evadecraft.Disengage.Description",
    {character: self.actor.name},
  )}`,
  });
}

/**
 * Learns moves of a specific target, granting buff.
 *
 * * Talent name:           Fighting Master (Evadecraft)
 * * Effect name:           Evadecraft Mastery
 * * Effect Type:           Manually Invoked
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
async function invokeEvadecraftMastery(args, self) {
  const targetToken = game.user.targets.first()?.document;

  if (!targetToken)
    return Utility.notify(game.i18n.localize("Forien.Armoury.Effects.Evadecraft.Mastery.NoTarget"), {type: "warning"});

  const target = targetToken?.actor;

  if (hasEffectWithFlag(args.actor, flags.effects.target, target.id))
    return Utility.notify(
      game.i18n.localize("Forien.Armoury.Effects.Evadecraft.Mastery.AlreadyLearned"),
      {type: "warning"},
    );

  const learnedMoves = self.item.effects.getName("Learned Moves");

  const effect = (await self.actor.createEmbeddedDocuments("ActiveEffect", [learnedMoves]))[0];
  await effect.setFlag(constants.moduleId, flags.effects.target, target.id);
  await effect.update({name: `${effect.name} (${targetToken.name})`});

  const learnedMovesName = game.i18n.localize("Forien.Armoury.Effects.Evadecraft.Mastery.LearnedMoves");
  const learnedMovesDescription = game.i18n.format(
    "Forien.Armoury.Effects.Evadecraft.Mastery.LearnedMovesDescription",
    {character: self.actor.name},
  );

  await ChatMessage.create({
    user: game.user._id,
    content: `<b>${learnedMovesName}</b><br/>
                ${learnedMovesDescription}`,
  });

  debug(
    "[styleHelpers] \"Evadecraft Mastery\" has been invoked.",
    {targetToken, target, effect, effectArgs: args, effectThis: self},
  );
}

/**
 * Handles giving a modifier for all Dodge and Weapon Tests while opposing specified target.
 *
 * * Talent name:           Fighting Master (Evadecraft)
 * * Effect name:           Learned Moves
 * * Effect Type:           Dialog
 * * Effect Application:    Actor
 *
 * @param {{prefillModifiers: {modifier: number, difficulty: string, slBonus: number, successBonus: number}, type:
 *   string, item: ItemWFRP4e, options: {}}} args
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 */
function learnedMoves(args, self) {
  const {target, attacker, opponent, effectTargetId, dodgeName} = getLearnedMovesData(self);

  if (opponent && opponent.id === effectTargetId) {
    if (args.type === "weapon" || (args.type === "skill" && args.item.name === dodgeName))
      args.prefillModifiers.modifier += 10;
  }

  debug("[styleHelpers] \"Learned Moves\" is active during Prefill Dialog.", {
    target,
    attacker,
    opponent,
    effectTargetId,
    effectArgs: args,
    effectThis: self,
  });
}

function canUseLearnedMoves(args, self) {
  const {opponent, effectTargetId, dodgeName} = getLearnedMovesData(self);

  if (opponent && opponent.id === effectTargetId) {
    if (args.type === "weapon" || (args.type === "skill" && args.item.name === dodgeName))
      return true;
  }

  return false;
}


function getLearnedMovesData(self) {
  const target = game.user.targets.first()?.document.actor || null;
  const attacker = self.actor.attacker?.test?.actor || null;
  const opponent = target ?? attacker ?? false;
  const effectTargetId = self.effect.getFlag(constants.moduleId, flags.effects.target);
  const dodgeName = game.i18n.localize("NAME.Dodge");

  return {target, attacker, opponent, effectTargetId, dodgeName};
}

// #endregion Evadecraft


/**
 * Returns the Mastery talent owned by the Actor, or null if no Mastery is learned.
 *
 * @param {ActorWFRP4e} actor
 * @return {ItemWFRP4e|null}
 */
function hasMastery(actor) {
  return actor.itemTypes.talent.find(t => t.flags[constants.moduleId]?.[flags.talents.fightingMaster]) || null;
}

/**
 *
 * @param {ActorWFRP4e} actor
 * @param {string} flag
 * @param {string} value
 *
 * @return {boolean}
 */
function hasEffectWithFlag(actor, flag, value) {
  return actor.effects.some(e => e.getFlag(constants.moduleId, flag) === value);
}

/**
 * Returns number of advances in relevant skill
 *
 * @param {ItemWFRP4e|null} weapon
 *
 * @return {number}
 */
function checkAdvances(weapon) {
  return parseInt(weapon?.skillToUse?.advances.value) || 0;
}

/**
 * Finds equipped weapon that is not offhand and returns it.
 *
 * @param {ActorWFRP4e} actor
 * @return {ItemWFRP4e|null}
 */
function findActorsMainWeapon(actor) {
  return actor.itemTypes.weapon.find(w => w.equipped && w.offhand.value === false) || null;
}

/**
 * Generates warning to user about not enough advances to use the perk
 *
 * @param {{actor: ActorWFRP4e, effect: EffectWfrp4e, item: ItemWFRP4e}} self
 * @param {number} advances
 * @param {number} required
 */
function warnNotEnoughAdvances(self, advances, required) {
  const data = {
    effect: self.effect.name,
    advances,
    required,
  };
  const message = game.i18n.format("Forien.Armoury.Effects.NotEnoughAdvances", data);
  Utility.notify(message, {type: "warning", data});
}

function warnNotEnoughAdvantage(self, advantageCost, advantage) {
  const data = {
    name: self.effect.name,
    need: advantageCost,
    have: advantage,
  };
  const message = game.i18n.format("Forien.Armoury.Effects.NotEnoughAdvantage", data);
  Utility.notify(message, {type: "warning", data});
}

/**
 * Expose all relevant functions to the API
 *
 * @type {{bracing: bracing, ironshieldWard: ironshieldWard, ironshieldRiposte: ironshieldRiposte, shrewdTrickery:
 *   shrewdTrickery, canUseLearnedMoves: ((function(*, *): (boolean))|*), steelstormHandling: steelstormHandling,
 *   shrewdEvadecraft: shrewdEvadecraft, goingAllIn: goingAllIn, replaceWithStyle: (function({actor:
 *   game.wfrp4e.entities.ActorWFRP4e}, {actor: game.wfrp4e.entities.ActorWFRP4e, effect: EffectWfrp4e, item:
 *   game.wfrp4e.entities.ItemWFRP4e}): Promise<boolean>), invokeEvadecraftMastery: ((function({actor:
 *   game.wfrp4e.entities.ActorWFRP4e, effect: EffectWfrp4e, item: game.wfrp4e.entities.ItemWFRP4e}, {actor:
 *   game.wfrp4e.entities.ActorWFRP4e, effect: EffectWfrp4e, item: game.wfrp4e.entities.ItemWFRP4e}):
 *   Promise<false|undefined>)|*), goingAllInMastery: goingAllInMastery, brace: brace, steelstormAssault:
 *   steelstormAssault, addMeleeParryCurrent: ((function({actor: game.wfrp4e.entities.ActorWFRP4e}, {actor:
 *   game.wfrp4e.entities.ActorWFRP4e, effect: EffectWfrp4e, item: game.wfrp4e.entities.ItemWFRP4e}):
 *   Promise<void>)|*), goAllIn: goAllIn, replaceWithMastery: (function({actor: game.wfrp4e.entities.ActorWFRP4e},
 *   {actor: game.wfrp4e.entities.ActorWFRP4e, effect: EffectWfrp4e, item: game.wfrp4e.entities.ItemWFRP4e}):
 *   Promise<boolean>), targetIsGoingAllIn: targetIsGoingAllIn, bracingReminder: bracingReminder, learnedMoves:
 *   learnedMoves, canShrewdEvadecraft: ((function({prefillModifiers: {modifier: number, difficulty: string, slBonus:
 *   number, successBonus: number}, type: string, item: game.wfrp4e.entities.ItemWFRP4e, options: {}}, {actor:
 *   game.wfrp4e.entities.ActorWFRP4e, effect: EffectWfrp4e, item: game.wfrp4e.entities.ItemWFRP4e}): boolean)|*),
 *   luckyEvadecraft: luckyEvadecraft, shrewdDisengage: shrewdDisengage, addMeleeParryFuture: ((function({item:
 *   game.wfrp4e.entities.ItemWFRP4e, context: string}, {actor: game.wfrp4e.entities.ActorWFRP4e, effect: EffectWfrp4e,
 *   item: game.wfrp4e.entities.ItemWFRP4e}): Promise<void>)|*)}}
 */
export const styleHelpers = {
  replaceWithStyle: replaceWithStyle,
  replaceWithMastery: replaceWithMastery,
  steelstormAssault: steelstormAssault,
  steelstormHandling: steelstormHandling,
  goAllIn: goAllIn,
  goingAllIn: goingAllIn,
  targetIsGoingAllIn: targetIsGoingAllIn,
  goingAllInMastery: goingAllInMastery,
  addMeleeParryFuture: addMeleeParryFuture,
  addMeleeParryCurrent: addMeleeParryCurrent,
  bracing: bracing,
  brace: brace,
  bracingReminder: bracingReminder,
  ironshieldWard: ironshieldWard,
  ironshieldRiposte: ironshieldRiposte,
  shrewdTrickery: shrewdTrickery,
  canShrewdEvadecraft: canShrewdEvadecraft,
  shrewdEvadecraft: shrewdEvadecraft,
  luckyEvadecraft: luckyEvadecraft,
  shrewdDisengage: shrewdDisengage,
  invokeEvadecraftMastery: invokeEvadecraftMastery,
  canUseLearnedMoves: canUseLearnedMoves,
  learnedMoves: learnedMoves,
};
