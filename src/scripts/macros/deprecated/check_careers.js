const checkOnlyOnlinePlayers = false;


let characters = [];

if (game.user.isGM) {
  let users = game.users.filter(u => u.isGM === false);
  if (checkOnlyOnlinePlayers) {
    users = users.filter(u => u.active === true);
  }
  characters = users.map(u => u.character);
} else if (game.user.character) {
  characters.push(game.user.character);
}

characters.forEach(character => {
  let currentCareer = character.currentCareer;
  let careerLevel = currentCareer.level.value;
  let requiredAdvances = careerLevel * 5;

  if (currentCareer.complete.value === true) {
    return;
  }

  /* check characteristics */
  let doneCharacteristics = 0;
  let totalCharacteristics = 0;
  currentCareer.characteristics.forEach(ch => {
    let advances = character.characteristics[ch].advances;
    if (advances >= requiredAdvances)
      doneCharacteristics++;
    totalCharacteristics++;
  });

  /* check talents */
  let doneTalents = 0;
  let potentialTalents = [];
  character.itemCategories.talent.forEach(talent => {
    if (currentCareer.talents.includes(talent.name))
      doneTalents++;
    else if (talent.advances.indicator)
      potentialTalents.push(talent.name);
  });

  /* check skills */
  let doneSkills = 0;
  let potentialSkills = [];
  character.itemCategories.skill.forEach(skill => {
    if (skill.advances.value < requiredAdvances) return;
    if (currentCareer.skills.includes(skill.name))
      doneSkills++;
    else if (skill.advances.indicator)
      potentialSkills.push(skill.name);
  });

  /* prepare Chat Message */
  let owners = [];
  if (game.user.isGM) {
    for (id in character.ownership) {
      if (character.ownership[id] === 3 && id !== game.user.id)
        owners.push(id);
    }
  } else {
    owners = game.users.filter(u => u.isGM === true);
  }


  let potentialSkillsInfo = "";
  let potentialTalentsInfo = "";
  let characteristicsComment = "";
  let skillsComment = "";
  let talentsComment = "";
  let conclusion = "You can't complete your career yet.";


  if (potentialSkills.length > 0)
    potentialSkillsInfo = `<p><em>You also have <a class="content-link" data-tooltip="${potentialSkills.toString()}">${potentialSkills.length} other skill(s)</a> that could potentially be part of your career.</em></p>`;

  if (potentialTalents.length > 0)
    potentialTalentsInfo = `<p><em>You also have <a class="content-link" data-tooltip="${potentialTalents.toString()}">${potentialTalents.length} other talent(s)</a> that could potentially be part of your career.</em></p>`;

  if (potentialSkills.length > 0 || potentialTalents.length > 0)
    conclusion += "<br><em>You have \"potential\" skills and/or talents, talk to your GM. They might count towards your career!</em>";

  if (doneCharacteristics >= totalCharacteristics)
    characteristicsComment = "<p>You have <em>enough</em> advances to complete your career!";

  if (doneSkills >= 8)
    skillsComment = "<p>You have <em>enough</em> advances to complete your career!";

  if (doneTalents >= 1)
    talentsComment = "<p>You have <em>enough</em> talents to complete your career!";


  if (doneCharacteristics >= totalCharacteristics && doneSkills >= 8 && doneTalents >= 1)
    conclusion = "<strong><em>Congratulations! You can complete your current career!</em></strong>";


  ChatMessage.create({
    user: game.user._id,
    whisper: owners,
    content: `
			<h2>${character.name}</h2>
			<p>Your current career is <strong>${currentCareer.name}</strong>. It is <strong>Level ${careerLevel}</strong> career, so required amount of advances is <strong>${requiredAdvances}</strong>.</p>
			<p>Check below if you have bought enough advances to complete your career!</p>
			<h3>Characteristics:</h3>
			<p>You have <strong>${doneCharacteristics} out of ${totalCharacteristics}</strong> required characteristics.</p>
			${characteristicsComment}
			<h3>Skills:</h3>
			<p>You have <strong>${doneSkills} out of 8</strong> required skills.</p>
			${skillsComment}
			${potentialSkillsInfo}
			<h3>Talents:</h3>
			<p>You have bought <strong>${doneTalents}</strong> career talents.</p>
			${talentsComment}
			${potentialTalentsInfo}
			<hr>
			<p>${conclusion}</p>
		`
  });
});
