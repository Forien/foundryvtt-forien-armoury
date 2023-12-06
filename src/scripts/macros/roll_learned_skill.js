/**
 * Requested by Mrak
 * Implements the "Options: Advances and Test Results" table from https://lawhammer.blogspot.com/2019/12/view-to-skill.html
 */

if (!actor)
  return ui.notifications.notify(game.i18n.localize('Forien.Armoury.Macros.MustControlActor'), 'warning');

const skills = actor.items.filter(i => i.type === 'skill' && i.system.advanced.value === 'adv');

let options = "";

for (const skill of skills) {
  options += `<option value="${skill.uuid}">${skill.name} (${skill.advances.value})</option>`;
}

Dialog.wait({
  title: game.i18n.localize('Forien.Armoury.Macros.SelectSkill'),
  content: `<form>
              <div class="form-group">
                <label>${game.i18n.localize('Forien.Armoury.Macros.AvailableSkills')}</label> 
				<select name="skill-id" id="skill-id">
				   ${options}
				</select>
              </div>
          </form>`,
  buttons: {
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: game.i18n.localize('Forien.Armoury.Macros.Cancel')
    },
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: game.i18n.localize('Forien.Armoury.Macros.Roll'),
      callback: async (html) => {
        const skillUuid = html.find("#skill-id").val();
        const skill = fromUuidSync(skillUuid);
        const advances = skill.advances.value;
        const test = await actor.setupSkill(skill);
        await test.roll();
        const characteristicToUse = test.data.result.options.characteristicToUse;
        const characteristicBonus = actor.characteristics[characteristicToUse]?.bonus;
        const difficulty = test.data.result.testDifficulty;
        const SL = parseInt(test.data.result.SL);

        if (advances < 6)
          test.data.preData.SL = SL > 0 ? 0 : SL;
        else if (advances < 11)
          test.data.preData.SL = SL > characteristicBonus ? characteristicBonus : SL;
        else if (advances < 21)
          test.data.preData.SL = SL;
        else if (advances < 31 && difficulty >= 20)
          test.data.preData.SL = SL < 1 ? 1 : SL;
        else if (difficulty >= 20)
          test.data.preData.SL = SL < characteristicBonus ? characteristicBonus : SL;

        await test.computeResult();
        await test.renderRollCard()
      }
    }
  },
  default: "yes"
})