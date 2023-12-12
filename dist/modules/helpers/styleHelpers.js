/**
 * #######################################################
 * This file exists so that scripts used in Active Effects related to Fighting Styles can be updated
 * painlessly without end users having to replace every item.
 * #######################################################
 */
import {constants, flags} from "../constants.mjs";
import Utility from "../utility/Utility.mjs";
import {debug} from "../utility/Debug.mjs";

/**
 * Replaces itself with one of Fightin Style Talents of the player's choosing.
 *
 * * Talent name:           Fighting Style (Any)
 * * Effect name:           Fighting Style (Any)
 * * Effect Type:           Add Items
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 *
 * @return {Promise<boolean>}
 */
async function replaceWithStyle(args, self) {
  const styleTalents = await getCompendiumTalentsByFlag(flags.talents.fightingStyle);

  await Dialog.wait({
    title: game.i18n.localize("Forien.Armoury.Effects.SelectTalent"),
    content: await renderTemplate(Utility.getTemplate('select-item.hbs'), {styleTalents}),
    default: "ok",
    buttons: {
      cancel: {
        label: game.i18n.localize("Cancel"),
        icon: '<i class="fas fa-undo"></i>'
      },
      ok: {
        label: game.i18n.localize("Forien.Armoury.Effects.AddTalent"),
        icon: '<i class="fas fa-check"></i>',
        callback: async html => {
          const id = html.find('input[name=talent]:checked').data('id');
          const talent = await addTalentToActorAndCareer(id, self);
          debug('"Fighting Style (Any)" has been replaced with: ', {
            talent,
            compendiumId: id,
            styleTalents,
            effectArgs: args,
            effectThis: self
          });
        }
      }
    }
  })

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
 * @param {{actor: ActorWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 *
 * @return {Promise<boolean>}
 */
async function replaceWithMastery(args, self) {
  const styleTalent = args.actor.itemCategories.talent.find(t => t.flags[constants.moduleId]?.[flags.talents.fightingStyle]);
  const style = styleTalent?.name.split("(")[1]?.replace(")", "");

  const masteryTalents = await getCompendiumTalentsByFlag(flags.talents.fightingMaster);
  const id = masteryTalents.find(t => t.name.includes(style))._id;

  const talent = await addTalentToActorAndCareer(id, self);

  await self.actor.deleteEmbeddedDocuments("Item", [self.effect.item._id]);
  debug('"Fighting Master (Style)" has been replaced with: ', {
    talent,
    compendiumId: id,
    masteryTalents,
    effectArgs: args,
    effectThis: self
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
 * @return {Promise<ItemWfrp4e[]>}
 */
async function getCompendiumTalentsByFlag(flag) {
  const packPath = getCompendiumPath();
  const pack = game.packs.get(packPath);
  const index = await pack.getIndex({fields: ['type', 'flags']});

  return index.filter(i => i.type === 'talent' && i.flags[constants.moduleId]?.[flag]);
}

/**
 * Adds a Talent to Actor and replaces it in career
 *
 * @param {string} id
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 * @return {Promise<ItemWfrp4e|null>}
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

//#region Steelstorm
/**
 * Creates Chat Card explaining Steelstorm Assault.
 *
 * * Talent name:           Fighting Style (Steelstorm)
 * * Effect name:           Steelstorm Assault
 * * Effect Type:           Manually Invoked
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function steelstormAssault(args, self) {
  const weapon = findActorsMainWeapon(self.actor);
  const advances = checkAdvances(weapon);
  const required = 15;

  if (advances >= required) {
    ChatMessage.create({
      user: game.user._id,
      content: `<b>${game.i18n.localize('Forien.Armoury.Effects.Steelstorm.Assault.Name')}</b><br/>
                ${game.i18n.format('Forien.Armoury.Effects.Steelstorm.Assault.Description', {character: self.actor.name})}`
    })
  } else {
    warnNotEnoughAdvances(self, advances, required);
  }

  debug('"Steelstorm Assault" has been invoked.', {weapon, advances, required, effectArgs: args, effectThis: self});
}

/**
 * Removes Slow property from weapons, or adds Fast property to weapons.
 *
 * * Talent name:           Fighting Style (Steelstorm)
 * * Effect name:           Steelstorm Handling
 * * Effect Type:           Prepare Item
 * * Effect Application:    Actor
 *
 * @param {{item: ItemWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function steelstormHandling(args, self) {
  const weapon = args.item;

  if (weapon.type === 'weapon' && weapon.equipped && weapon.isMelee) {
    const advances = checkAdvances(weapon);
    const required = 5;

    if (advances >= required) {
      const qualities = weapon.system.qualities.value;
      const flaws = weapon.system.flaws.value;

      if (flaws.find(f => f.name === 'slow')) {
        weapon.system.flaws.value = flaws.filter(f => f.name !== 'slow')
      } else if (weapon.twohanded.value === false && !qualities.find(f => f.name === 'fast')) {
        qualities.push({
          name: 'fast',
          value: null
        })
      }
    }

    debug('"Steelstorm Handling" checked equipped melee weapon during Item Preparation.', {
      weapon,
      advances,
      required,
      effectArgs: args,
      effectThis: self
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
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function goAllIn(args, self) {
  const weapon = findActorsMainWeapon(self.actor);
  const advances = checkAdvances(weapon);
  const required = 10;

  if (advances >= required) {
    const goingAllIn = self.item.effects.getName("Going All In");
    const goingAllInMastery = self.item.effects.getName("Going All In (Mastery)");
    const masteryTalent = hasMastery(args.actor);
    const effects = [goingAllIn];

    if (masteryTalent)
      effects.push(goingAllInMastery);

    const allInName = game.i18n.localize('Forien.Armoury.Effects.Steelstorm.AllIn.Name');
    const allInDescription = game.i18n.format('Forien.Armoury.Effects.Steelstorm.AllIn.Description', {character: self.actor.name});
    const allInDescriptionMastery = masteryTalent ? game.i18n.localize('Forien.Armoury.Effects.Steelstorm.AllIn.Mastery') : '';

    self.actor.createEmbeddedDocuments("ActiveEffect", effects);
    ChatMessage.create({
      user: game.user._id,
      content: `<b>${allInName}</b><br/>
                ${allInDescription}<br/>
                ${allInDescriptionMastery}`
    })
  } else {
    warnNotEnoughAdvances(self, advances, required);
  }

  debug('"Go All In" has been invoked.', {weapon, advances, required, effectArgs: args, effectThis: self});
}

/**
 * Handles giving a modifier for all Weapon Tests while Going All In.
 *
 * * Talent name:           Fighting Style (Steelstorm)
 * * Effect name:           Going All In
 * * Effect Type:           Prefill Dialog
 * * Effect Application:    Actor
 *
 * @param {{prefillModifiers: {modifier: number, difficulty: string, slBonus: number, successBonus: number}, type: string, item: ItemWfrp4e, options: {}}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function goingAllIn(args, self) {
  if (args.type === 'weapon' && args.item?.type === 'weapon') {
    const advances = checkAdvances(args.item);
    const required = 10;

    if (advances >= required)
      args.prefillModifiers.modifier += 20;

    debug('"Going All In" is active on Prefill Dialog.', {
      weapon: args.item,
      advances,
      required,
      effectArgs: args,
      effectThis: self
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
 * @param {{item: ItemWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function goingAllInMastery(args, self) {
  const weapon = args.item;

  if (weapon.type === 'weapon' && weapon.equipped && weapon.isMelee) {
    const advances = checkAdvances(weapon);
    const required = 10;

    if (advances >= required) {
      const qualities = weapon.system.qualities.value;
      const damaging = qualities.find(f => f.name === 'damaging');

      if (!damaging) {
        qualities.push({
          name: 'damaging',
          value: null
        })
      } else {
        damaging.name = 'impact';
      }
    }

    debug('"Going All In (Mastery)" is active on Prefill Dialog.', {
      weapon: args.item,
      advances,
      required,
      effectArgs: args,
      effectThis: self
    });
  }
}


//#endregion Steelstorm

//#region Ironshield
/**
 *
 * @param {{actor: ActorWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
async function addMeleeParryCurrent(args, self) {
  const career = args.actor?.currentCareer;

  debug('Checking current career for Ironshield.', {career, effectArgs: args, effectThis: self});
  if (career) await addMeleeParryToCareer(career);
}

/**
 *
 * @param {{item: ItemWfrp4e, context: string}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
async function addMeleeParryFuture(args, self) {
  if (args.context !== 'update') return;
  if (args.item.type !== 'career') return;
  if (args.item.current?.value !== true) return;

  debug('Checking current career for Ironshield.', {career: args.item, effectArgs: args, effectThis: self});
  await addMeleeParryToCareer(args.item);
}

/**
 * Handles giving a modifier for defensive Weapon Tests while Bracing.
 *
 * * Talent name:           Fighting Style (Ironshield)
 * * Effect name:           Bracing
 * * Effect Type:           Prefill Dialog
 * * Effect Application:    Actor
 *
 * @param {{prefillModifiers: {modifier: number, difficulty: string, slBonus: number, successBonus: number}, type: string, item: ItemWfrp4e, options: {}}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function bracing(args, self) {
  if (self.actor.isOpposing && args.type === 'weapon' && args.item?.type === 'weapon') {
    const advances = checkAdvances(args.item);
    const required = 10;

    if (advances >= required)
      args.prefillModifiers.modifier += 20;

    debug('"Bracing" is active on Prefill Dialog.', {
      weapon: args.item,
      advances,
      required,
      effectArgs: args,
      effectThis: self
    });
  }
}

/**
 * Creates new Effect on Actor and posts a Chat Card explaining Bracing.
 *
 * * Talent name:           Fighting Style (Ironshield)
 * * Effect name:           Brace!
 * * Effect Type:           Manually Invoked
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function brace(args, self) {
  const weapon = findActorsMainWeapon(self.actor);
  const advances = checkAdvances(weapon);
  const required = 10;

  if (advances >= required) {
    const bracing = self.item.effects.getName("Bracing");
    self.actor.createEmbeddedDocuments("ActiveEffect", [bracing]);
    ChatMessage.create({
      user: game.user._id,
      content: `<b>${game.i18n.localize('Forien.Armoury.Effects.Ironshield.Bracing.Name')}</b><br/>
                ${game.i18n.format('Forien.Armoury.Effects.Ironshield.Bracing.Description', {character: self.actor.name})}`
    })
  } else {
    warnNotEnoughAdvances(self, advances, required);
  }

  debug('"Brace!" has been invoked.', {weapon, advances, required, effectArgs: args, effectThis: self});
}

/**
 * Removes Slow property from weapons, or adds Fast property to weapons.
 *
 * * Talent name:           Fighting Style (Ironshield)
 * * Effect name:           Ironshield Ward
 * * Effect Type:           Prepare Item
 * * Effect Application:    Actor
 *
 * @param {{item: ItemWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function ironshieldWard(args, self) {
  const weapon = args.item;

  if (weapon.type === 'weapon' && weapon.equipped && weapon.isMelee) {
    const advances = checkAdvances(weapon);
    const required = 5;

    if (advances >= required) {
      const qualities = weapon.system.qualities.value;

      if (!qualities.find(f => f.name === 'defensive')) {
        qualities.push({
          name: 'defensive',
          value: null
        })
      }
    }
    debug('"Ironshield Ward" checked equipped melee weapon during Item Preparation.', {
      weapon,
      advances,
      required,
      effectArgs: args,
      effectThis: self
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
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function ironshieldRiposte(args, self) {
  const advances = checkAdvances(args.defenderTest.weapon);
  const required = 15;

  if (advances >= required) {
    const name = game.i18n.localize('Forien.Armoury.Effects.Ironshield.Riposte.Name');
    const description = game.i18n.format('Forien.Armoury.Effects.Ironshield.Riposte.Description', {character: self.actor.name});
    let content = `<b>${name}:</b> ${description}`;

    const masteryTalent = hasMastery(self.actor);
    if (masteryTalent) {
      const mastery = game.i18n.localize('Forien.Armoury.Effects.Ironshield.Riposte.Mastery');
      content += `<br/> ${mastery}`;
    }

    args.opposedTest.data.opposeResult.other.push(content);
  }

  debug('"Ironshield Riposte" is checking Opposed Defender.', {
    weapon: args.defenderTest.weapon,
    advances,
    required,
    effectArgs: args,
    effectThis: self
  });
}

/**
 * Replaces `Melee (Basic)` with `Melee (Parry)` skill in specified Career Item.
 *
 * @param {ItemWfrp4e} career
 */
async function addMeleeParryToCareer(career) {
  const meleei18n = game.i18n.localize("NAME.Melee");
  const parryi18n = game.i18n.localize("SPEC.Parry");
  const basici18n = game.i18n.localize("SPEC.Basic");
  const meleeParry = `${meleei18n} (${parryi18n})`;
  const meleeBasic = `${meleei18n} (${basici18n})`;

  let careerSkills = foundry.utils.deepClone(career.system.skills);

  if (!careerSkills.includes(meleeParry) && careerSkills.includes(meleeBasic)) {
    careerSkills = careerSkills.map(skill => skill === meleeBasic ? meleeParry : skill);
    let incomeSkill = career.system.skills[career.system.incomeSkill];
    if (incomeSkill === meleeBasic) incomeSkill = meleeParry;

    await career.update({
      'system.skills': careerSkills,
      'system.incomeSkill': [careerSkills.indexOf(incomeSkill)]
    });
  }

  debug('"Melee (Basic)" has been replaced with "Melee (Parry).', {career, meleeBasic, meleeParry});
}


//#endregion Ironshield


//#region Evadecraft
/**
 * Creates a Chat Card explaining Shrewd Trickery.
 *
 * * Talent name:           Fighting Style (Evadecraft)
 * * Effect name:           Shrewd Trickery
 * * Effect Type:           Manually Invoked
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function shrewdTrickery(args, self) {
  const weapon = findActorsMainWeapon(self.actor);
  const advances = checkAdvances(weapon);
  const required = 15;

  if (advances >= required) {
    ChatMessage.create({
      user: game.user._id,
      content: `<b>${game.i18n.localize('Forien.Armoury.Effects.Evadecraft.ShrewdTrickery.Name')}</b><br/>
                ${game.i18n.format('Forien.Armoury.Effects.Evadecraft.ShrewdTrickery.Description', {character: self.actor.name})}`
    })
  } else {
    warnNotEnoughAdvances(self, advances, required);
  }
  debug('"Shrewd Trickery" has been invoked.', {weapon, advances, required, effectArgs: args, effectThis: self});
}

/**
 * Handles giving a modifier for non-shield Weapon Tests while opposing Ranged attacks.
 *
 * * Talent name:           Fighting Style (Evadecraft)
 * * Effect name:           Shrewd Evadecraft
 * * Effect Type:           Prefill Dialog
 * * Effect Application:    Actor
 *
 * @param {{prefillModifiers: {modifier: number, difficulty: string, slBonus: number, successBonus: number}, type: string, item: ItemWfrp4e, options: {}}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function shrewdEvadecraft(args, self) {
  if (!self.actor.isOpposing) return;

  const advances = checkAdvances(args.item);
  const required = 5;

  if (advances < required) return;

  const isRangedAttack = self.actor.attacker?.test.weapon.isRanged || false;
  const shieldRating = args.item?.qualities.value.find(q => q.name === 'shield')?.value || 0;

  // Using non-shield to oppose ranged attacks, or shield that normally can't
  if (isRangedAttack && shieldRating < 2)
    args.prefillModifiers.modifier -= 20;

  debug('"Shrewd Evadecraft" is active during Prefill Dialog when opposing.', {
    weapon: args.item,
    advances,
    required,
    isRangedAttack,
    shieldRating,
    effectArgs: args,
    effectThis: self
  });
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
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function luckyEvadecraft(args, self) {
  const advances = checkAdvances(args.defenderTest.weapon);
  const required = 10;

  if (advances < required) return;

  const isCritical = args.attackerTest.isCritical;

  if (isCritical && self.actor.status.fortune.value) {
    const content = `<b>${game.i18n.localize('Forien.Armoury.Effects.Evadecraft.LuckyEvadecraft.Name')}:</b>
                ${game.i18n.format('Forien.Armoury.Effects.Evadecraft.LuckyEvadecraft.Description', {character: self.actor.name})}`;
    args.opposedTest.data.opposeResult.other.push(content)
  }

  debug('"Lucky Evadecraft" is active during Pre-Opposed Defender.', {
    weapon: args.defenderTest.weapon,
    advances,
    required,
    isCritical,
    fortune: self.actor.status.fortune.value,
    effectArgs: args,
    effectThis: self
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
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function shrewdDisengage(args, self) {
  ChatMessage.create({
    user: game.user._id,
    content: `<b>${game.i18n.localize('Forien.Armoury.Effects.Evadecraft.Disengage.Name')}</b><br/>
                ${game.i18n.format('Forien.Armoury.Effects.Evadecraft.Disengage.Description', {character: self.actor.name})}`
  })
}

/**
 * Learns moves of a specific target, granting buff.
 *
 * * Talent name:           Fighting Master (Evadecraft)
 * * Effect name:           Evadecraft Mastery
 * * Effect Type:           Manually Invoked
 * * Effect Application:    Actor
 *
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
async function invokeEvadecraftMastery(args, self) {
  const targetToken = game.user.targets.first()?.document;

  if (!targetToken)
    return Utility.notify(game.i18n.localize("Forien.Armoury.Effects.Evadecraft.Mastery.NoTarget"), {type: 'warning'})

  const target = targetToken?.actor;

  if (hasEffectWithFlag(args.actor, flags.effects.target, target.id))
    return Utility.notify(game.i18n.localize("Forien.Armoury.Effects.Evadecraft.Mastery.AlreadyLearned"), {type: 'warning'})

  const learnedMoves = self.item.effects.getName("Learned Moves");

  const effect = (await self.actor.createEmbeddedDocuments("ActiveEffect", [learnedMoves]))[0];
  await effect.setFlag(constants.moduleId, flags.effects.target, target.id);
  await effect.update({'name': `${effect.name} (${targetToken.name})`})

  const learnedMovesName = game.i18n.localize('Forien.Armoury.Effects.Evadecraft.Mastery.LearnedMoves');
  const learnedMovesDescription = game.i18n.format('Forien.Armoury.Effects.Evadecraft.Mastery.LearnedMovesDescription', {character: self.actor.name});

  await ChatMessage.create({
    user: game.user._id,
    content: `<b>${learnedMovesName}</b><br/>
                ${learnedMovesDescription}`
  });

  debug('"Evadecraft Mastery" has been invoked.', {targetToken, target, effect, effectArgs: args, effectThis: self});
}

/**
 * Handles giving a modifier for all Dodge and Weapon Tests while opposing specified target.
 *
 * * Talent name:           Fighting Master (Evadecraft)
 * * Effect name:           Learned Moves
 * * Effect Type:           Prefill Dialog
 * * Effect Application:    Actor
 *
 * @param {{prefillModifiers: {modifier: number, difficulty: string, slBonus: number, successBonus: number}, type: string, item: ItemWfrp4e, options: {}}} args
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 */
function learnedMoves(args, self) {
  const target = game.user.targets.first()?.document.actor || null;
  const attacker = self.actor.attacker?.test?.actor || null
  const opponent = target ?? attacker ?? false;
  const effectTargetId = self.effect.getFlag(constants.moduleId, flags.effects.target);
  const dodgeName = game.i18n.localize("NAME.Dodge");

  if (opponent && opponent.id === effectTargetId) {
    if (args.type === 'weapon' || (args.type === 'skill' && args.item.name === dodgeName))
      args.prefillModifiers.modifier += 10;
  }

  debug('"Learned Moves" is active during Prefill Dialog.', {
    target,
    attacker,
    opponent,
    effectTargetId,
    effectArgs: args,
    effectThis: self
  });
}


//#endregion Evadecraft


/**
 * Returns the Mastery talent owned by the Actor, or null if no Mastery is learned.
 *
 * @param {ActorWfrp4e} actor
 * @return {ItemWfrp4e|null}
 */
function hasMastery(actor) {
  return actor.itemCategories.talent.find(t => t.flags[constants.moduleId]?.[flags.talents.fightingMaster]) || null;
}

/**
 *
 * @param {ActorWfrp4e} actor
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
 * @param {ItemWfrp4e|null} weapon
 *
 * @return {number}
 */
function checkAdvances(weapon) {
  return parseInt(weapon?.skillToUse?.advances.value) || 0;
}

/**
 * Finds equipped weapon that is not offhand and returns it.
 *
 * @param {ActorWfrp4e} actor
 * @return {ItemWfrp4e|null}
 */
function findActorsMainWeapon(actor) {
  return actor.itemCategories.weapon.find(w => w.equipped && w.offhand.value === false) || null;
}

/**
 * Generates warning to user about not enough advances to use the perk
 *
 * @param {{actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}} self
 * @param {number} advances
 * @param {number} required
 */
function warnNotEnoughAdvances(self, advances, required) {
  const data = {
    effect: self.effect.name,
    advances,
    required
  };
  const message = game.i18n.format('Forien.Armoury.Effects.NotEnoughAdvances', data);
  Utility.notify(message, {type: 'warning', data});
}

/**
 * Expose all relevant functions to the API
 *
 * @type {{bracing: bracing, ironshieldWard: ironshieldWard, ironshieldRiposte: ironshieldRiposte, shrewdTrickery: shrewdTrickery, steelstormHandling: steelstormHandling, shrewdEvadecraft: shrewdEvadecraft, goingAllIn: goingAllIn, replaceWithStyle: (function({actor: ActorWfrp4e}, {actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}): Promise<boolean>), invokeEvadecraftMastery: ((function({actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}, {actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}): Promise<void|undefined>)|*), goingAllInMastery: goingAllInMastery, brace: brace, steelstormAssault: steelstormAssault, addMeleeParryCurrent: ((function({actor: ActorWfrp4e}, {actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}): Promise<void>)|*), goAllIn: goAllIn, replaceWithMastery: (function({actor: ActorWfrp4e}, {actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}): Promise<boolean>), learnedMoves: learnedMoves, luckyEvadecraft: luckyEvadecraft, shrewdDisengage: shrewdDisengage, addMeleeParryFuture: ((function({item: ItemWfrp4e, context: string}, {actor: ActorWfrp4e, effect: EffectWfrp4e, item: ItemWfrp4e}): Promise<void>)|*)}}
 */
export const styleHelpers = {
  replaceWithStyle: replaceWithStyle,
  replaceWithMastery: replaceWithMastery,
  steelstormAssault: steelstormAssault,
  steelstormHandling: steelstormHandling,
  goAllIn: goAllIn,
  goingAllIn: goingAllIn,
  goingAllInMastery: goingAllInMastery,
  addMeleeParryFuture: addMeleeParryFuture,
  addMeleeParryCurrent: addMeleeParryCurrent,
  bracing: bracing,
  brace: brace,
  ironshieldWard: ironshieldWard,
  ironshieldRiposte: ironshieldRiposte,
  shrewdTrickery: shrewdTrickery,
  shrewdEvadecraft: shrewdEvadecraft,
  luckyEvadecraft: luckyEvadecraft,
  shrewdDisengage: shrewdDisengage,
  invokeEvadecraftMastery: invokeEvadecraftMastery,
  learnedMoves: learnedMoves
}
