import Utility from "./utility/Utility.mjs";
import {debug} from "./utility/Debug.mjs";

export default class CheckCareers {
  static #templates = {
    checkCareer: 'check-career.hbs',
  }

  static get templates() {
    return Object.values(CheckCareers.#templates);
  }

  /**
   * Performs Career Check for player characters (if GM) or for own assigned character (if Player)
   *
   * @param {boolean} onlyOnline should check careers only for characters of online users?
   */
  static checkPlayersCareers(onlyOnline = true) {
    let characters = [];

    if (game.user.isGM) {
      let users = game.users.filter(u => u.isGM === false);
      if (onlyOnline) {
        users = users.filter(u => u.active === true);
      }
      characters = users.map(u => u.character);
      debug(`Checking player characters' careers as GM`, {onlyOnline, characters});

      CheckCareers.checkCareers(characters);
    } else {
      CheckCareers.checkMyCareer();
    }
  }

  /**
   * Permorms Career Check for assigned character only
   */
  static checkMyCareer() {
    debug(`Checking my character's career`, {character: game.user.character});

    if (game.user.character instanceof ActorWfrp4e)
      CheckCareers.checkCareer(game.user.character);
  }

  /**
   * Performs Career Check for all provided actors
   *
   * @param {ActorWfrp4e[]} actors Actors for whom to perform career checks
   */
  static checkCareers(actors = []) {
    actors.forEach(actor => CheckCareers.checkCareer(actor))
  }

  /**
   * Checks career completion progress for provided Character and output results to Chat
   *
   * @param {ActorWfrp4e} character Character to perform a Career Check for
   */
  static checkCareer(character) {
    if (!(actor instanceof ActorWfrp4e) || actor.type !== 'character') return;
    let currentCareer = character.currentCareer;
    let careerLevel = currentCareer.level.value;
    let requiredAdvances = careerLevel * 5;

    if (currentCareer.complete.value === true)
      return debug('Current Career is marked as finished, skipping', {character, currentCareer});

    const characteristics = this.#checkCharacteristics(character, currentCareer, requiredAdvances);
    const talents = this.#checkTalents(character, currentCareer);
    const skills = this.#checkSkills(character, currentCareer, requiredAdvances);
    const owners = this.#getOwners(character);

    let conclusion = (characteristics.done >= characteristics.total && skills.done >= 8 && talents.done >= 1);
    let conclusionPotential = (skills.potentialCount > 0 || talents.potentialCount > 0);

    debug(`Character's Career checked`, {
      character,
      currentCareer,
      requiredAdvances,
      characteristics,
      talents,
      skills,
      owners,
      conclusion,
      conclusionPotential
    });

    const templateData = {
      character: character.name,
      currentCareer: currentCareer.name,
      requiredAdvances,
      careerLevel,
      characteristics,
      skills,
      talents,
      conclusion,
      conclusionPotential
    }

    renderTemplate(Utility.getTemplate(CheckCareers.#templates.checkCareer), templateData).then(content => {
      ChatMessage.create({
        speaker: ChatMessage.getSpeakerActor(character),
        user: game.user._id,
        whisper: owners,
        content: content
      });
    });
  }

  /**
   * Returns an array containing id of every owner of a character (if GM) or every GM (if Player)
   *
   * @param {ActorWfrp4e} character
   * @return {*[]}
   */
  static #getOwners(character) {
    let owners = [];
    if (game.user.isGM) {
      for (let id in character.ownership) {
        if (character.ownership[id] === 3 && id !== game.user.id)
          owners.push(id);
      }
    } else {
      owners = game.users.filter(u => u.isGM === true).map(u => u.id);
    }

    return owners;
  }

  /**
   * Checks Actor for every Skill specified in the career and counts how many have required number of advances
   *
   * @param {ActorWfrp4e} character
   * @param {ItemWfrp4e} currentCareer
   * @param {number} requiredAdvances
   * @return {{hasPotential: boolean, potentialCount: number, done: number, potential: string}}
   */
  static #checkSkills(character, currentCareer, requiredAdvances) {
    let done = 0;
    let potentialSkills = [];

    character.itemCategories.skill.forEach(skill => {
      if (skill.advances.value < requiredAdvances) return;
      if (currentCareer.skills.includes(skill.name))
        done++;
      else if (skill.advances.indicator)
        potentialSkills.push(skill.name)

    });

    return {
      done,
      hasPotential: potentialSkills.length > 0,
      potentialCount: potentialSkills.length,
      potential: potentialSkills.toString()
    };
  }

  /**
   * Checks Actor for every Talent specified in the career and counts how many have been purchased
   *
   * @param {ActorWfrp4e} character
   * @param {ItemWfrp4e} currentCareer
   * @return {{hasPotential: boolean, potentialCount: number, done: number, potential: string}}
   */
  static #checkTalents(character, currentCareer) {
    let done = 0;
    let potentialTalents = [];

    character.itemCategories.talent.forEach(talent => {
      if (currentCareer.talents.includes(talent.name))
        done++
      else if (talent.advances.indicator)
        potentialTalents.push(talent.name)
    });

    return {
      done,
      hasPotential: potentialTalents.length > 0,
      potentialCount: potentialTalents.length,
      potential: potentialTalents.toString()
    };
  }

  /**
   * Checks Actor for every Characteristic specified in the career and counts how many have required number of advances
   *
   * @param {ActorWfrp4e} character
   * @param {ItemWfrp4e} currentCareer
   * @param {number} requiredAdvances
   * @return {{total: number, done: number}}
   */
  static #checkCharacteristics(character, currentCareer, requiredAdvances) {
    let done = 0;
    let total = 0;

    currentCareer.characteristics.forEach(ch => {
      let advances = character.characteristics[ch].advances;
      if (advances >= requiredAdvances)
        done++;
      total++;
    });

    return {done, total};
  }
}