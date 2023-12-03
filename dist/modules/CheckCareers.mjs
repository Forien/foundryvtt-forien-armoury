import Utility from "./utility/Utility.mjs";

export default class CheckCareers {
  static #templates = {
    checkCareer: 'check-career.hbs',
  }

  static get templates() {
    return Object.values(CheckCareers.#templates);
  }

  static checkPlayersCareers(onlyOnline = true) {
    let characters = [];

    if (game.user.isGM) {
      let users = game.users.filter(u => u.isGM === false);
      if (onlyOnline) {
        users = users.filter(u => u.active === true);
      }
      characters = users.map(u => u.character);
    } else if (game.user.character) {
      characters.push(game.user.character);
    }

    CheckCareers.checkCareers(characters);
  }

  static checkCareers(actors = []) {
    actors.forEach(actor => {
      if (actor instanceof ActorWfrp4e) {
        CheckCareers.checkCareer(actor)
      }
    })
  }

  static checkMyCareer() {
    if (game.user.character instanceof ActorWfrp4e)
      CheckCareers.checkCareer(game.user.character);
  }

  static checkCareer(character) {
    let currentCareer = character.currentCareer;
    let careerLevel = currentCareer.level.value;
    let requiredAdvances = careerLevel * 5;

    if (currentCareer.complete.value === true) {
      return;
    }

    const characteristics = this.#checkCharacteristics(character, currentCareer, requiredAdvances);
    const talents = this.#checkTalents(character, currentCareer);
    const skills = this.#checkSkills(character, currentCareer, requiredAdvances);
    const owners = this.#getOwners(character);

    let conclusion = (characteristics.done >= characteristics.total && skills.done >= 8 && talents.done >= 1);
    let conclusionPotential = (skills.potentialCount > 0 || talents.potentialCount > 0);


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
   *
   * @param character
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
      owners = game.users.filter(u => u.isGM === true);
    }

    return owners;
  }

  /**
   *
   * @param character
   * @param currentCareer
   * @param requiredAdvances
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
   *
   * @param character
   * @param currentCareer
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
   *
   * @param character
   * @param currentCareer
   * @param requiredAdvances
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