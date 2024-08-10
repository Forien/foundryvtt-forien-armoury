import ForienBaseModule from "../utility/ForienBaseModule.mjs";
import Utility from "../utility/Utility.mjs";

export default class Macros extends ForienBaseModule {

  /**
   *
   * @param {Macro}   macro
   * @param {number}  requiredSL
   * @param {string}  description
   * @param {string}  lore
   *
   * @returns {Promise<boolean>}
   */
  async cantrip(macro, {requiredSL = 1, description = "Put Cant's description here", lore = "fire"}) {
    const {actor} = this.#getScope();

    if (!actor)
      return Utility.notify(game.i18n.localize("Forien.Armoury.Macros.MustControlActor"), {type: "warning"});

    if (!game.settings.get("wfrp4e", "useWoMChannelling"))
      return Utility.notify(game.i18n.localize("Forien.Armoury.Macros.Cant.UseWomChannelling"), {type: "warning"});

    const loreSpell = actor.itemTypes.spell.find(s => s.system.lore?.value === lore);
    const SL = loreSpell?.system.cn.SL || 0;

    if (SL < requiredSL)
      return Utility.notify(game.i18n.format("Forien.Armoury.Macros.Cant.NotEnoughSL", {
        actor: actor.name,
        lore: lore.capitalize(),
        macro: macro.name,
        SL,
        requiredSL
      }), {type: "warning"});

    const updates = actor.itemTypes.spell.reduce((acc, s) => {
      if (s.system.lore.value === lore)
        acc.push({_id: s._id, "system.cn.SL": s.system.cn.SL - requiredSL});
      return acc;
    }, []);

    let header = game.i18n.format("Forien.Armoury.Macros.Cant.LoreOf", {lore: lore.capitalize()});
    let SLCost = game.i18n.localize("Forien.Armoury.Macros.Cant.SLCost");
    let channelledChanged = game.i18n.format("Forien.Armoury.Macros.Cant.ChannelledSlChanged", {old: SL, new: SL - 1});

    await actor.updateEmbeddedDocuments("Item", updates);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({actor: actor}),
      content: `<b>${header} – ${macro.name}</b><br>
    <b>${SLCost}</b> ${requiredSL}
    <p>${description}</p>
    <em>${channelledChanged}</em>`
    });

    return true;
  }

  /**
   *
   * @param {Macro}                    macro
   * @param {string}                   name
   * @param {boolean}                  nameShowSL
   * @param {boolean}                  nameShowDifficulty
   * @param {string}                   img
   * @param {string}                   skill
   * @param {"remove"|"reset"|"none"}  onCompletion
   * @param {boolean}                  failureDecreasesSL
   * @param {boolean}                  hideTest
   * @param {boolean}                  hideProgress
   *
   * @returns {Promise<boolean>}
   */
  async lockpickTest(
    macro,
    {
      name = "Extended Pick Lock Test",
      nameShowSL = false,
      nameShowDifficulty = true,
      img = "icons/skills/trades/security-lockpicking-chest-blue.webp",
      skill = game.i18n.localize("NAME.PickLock"),
      onCompletion = "remove",
      failureDecreasesSL = true,
      hideTest = false,
      hideProgress = true,
    } = {}
  ) {
    const extendedTestData = {
      name,
      type: "extendedTest",
      img,
      system: {
        SL: {
          current: 0,
          target: 1
        },
        test: {
          value: skill
        },
        failingDecreases: {
          value: failureDecreasesSL
        },
        completion: {
          value: onCompletion
        },
        hide: {
          test: hideTest,
          progress: hideProgress
        },
        difficulty: {
          value: "challenging"
        }
      }
    }

    let difficultyOptions = '';
    for (let [difficulty, label] of Object.entries(game.wfrp4e.config.difficultyLabels)) {
      const selected = difficulty === "challenging" ? 'selected' : '';
      difficultyOptions += `<option value="${difficulty}" ${selected}>${label}</option>`
    }

    let content = `
<form>
    <div class="form-group">
        <label>${game.i18n.localize("SL")}</label>
        <div class="form-fields">
            <input type="text" name="sl" value="1" autofocus="">
        </div>
    </div>

    <div class="form-group">
        <label>${game.i18n.localize("Difficulty")}</label>
        <div class="form-fields">
            <select name="difficulty">
                ${difficultyOptions}
            </select>
        </div>
    </div>
</form>
`;

    await Dialog.confirm({
      title: game.i18n.localize("Forien.Armoury.Macros.Lockpick.DialogTitle"),
      content,
      yes: async html => {
        const SL = Math.round(html.find("[name='sl']").val());
        const difficulty = html.find("[name='difficulty']").val();

        if (isNaN(SL))
          return Utility.error(game.i18n.localize("Forien.Armoury.Macros.Lockpick.SLNaN"));
        if (!difficulty)
          return Utility.error(game.i18n.localize("Forien.Armoury.Macros.Lockpick.DifficultyEmpty"));

        await this.#createExtendedTest(SL, difficulty, extendedTestData, nameShowSL, nameShowDifficulty);
      }
    })
  }

  /**
   *
   * @param {number}   SL
   * @param {string}   difficulty
   * @param {{}}       extendedTestData
   * @param {boolean}  nameShowSL
   * @param {boolean}  nameShowDifficulty
   *
   * @returns {Promise<*>|void}
   */
  async #createExtendedTest(SL, difficulty, extendedTestData, nameShowSL, nameShowDifficulty) {
    const nameAppends = [];

    extendedTestData.system.SL.target = SL;
    extendedTestData.system.difficulty.value = difficulty;

    if (nameShowDifficulty) {
      let modifier = game.wfrp4e.config.difficultyModifiers[difficulty];
      if (modifier >= 0)
        modifier = `+${modifier}`;
      nameAppends.push(`D ${modifier}`);
    }

    if (nameShowSL)
      nameAppends.push(`SL ${SL}`);

    if (nameAppends.length)
      extendedTestData.name += ` (${nameAppends.join(', ')})`

    let controlled = canvas.tokens.controlled;

    for (let token of controlled) {
      if (!token.actor.isOwner) continue;

      await token.actor.createEmbeddedDocuments("Item", [extendedTestData]);
    }

    if (game.user.character && game.user.character.isOwner)
      return await game.user.character.createEmbeddedDocuments("Item", [extendedTestData]);

    if (controlled.length === 0 && game.user.can("ITEM_CREATE"))
      return await Item.createDocuments([extendedTestData]);
  }

  async checkStatuses(macro, {actorsFolderIds = []} = {}) {
    if (!game.user.isGM)
      return Utility.notify(game.i18n.localize("Forien.Armoury.Macros.NotAGM"), {type: "warning"});

    const actorsFolders = actorsFolderIds.map(id => game.folders.get(id)).filter(f => f);
    const actors = actorsFolders.reduce((actors, folder) => {
      let content = folder?.contents?.filter(c => c instanceof ActorWfrp4e && c.type === "character") ?? [];
      actors.push(...content);
      return actors;
    }, []);

    actors.sort((a, b) => a.name < b.name ? -1 : 1);


    if (actors.length === 0)
      return Utility.notify(game.i18n.localize("Forien.Armoury.Macros.CheckStatus.NoActorsFound"), {type: "warning"});

    function getName(actor) {
      return actor.name.split(' ')[0];
    }

    function getCareer({currentCareer}) {
      if (!currentCareer)
        return '-';

      let career = '';
      career += `${currentCareer.name} (${currentCareer.system.level.value})<br/>`;
      career += `<em>${currentCareer.system.class.value}</em>`;

      return career;
    }

    function getFortune({system, itemTypes}) {
      const {status} = system;

      if (!status?.fortune)
        return '-';

      let fortune = status.fortune.value;
      let fate = status.fate?.value || 0;
      let lucks = itemTypes.talent.filter(t => t.name === game.i18n.localize("NAME.Luck")).length;
      let max = fate + lucks;

      return `${fortune}/${max}`;
    }

    function getFate({system}) {
      const {status} = system;

      if (status?.fate)
        return `${status.fate.value}`;

      return '-';
    }

    function getResolve({system, itemTypes}) {
      const {status} = system;

      if (!status?.resolve)
        return '-';

      let resolve = status.resolve.value;
      let resilience = status.resilience?.value || 0;
      let strongMindeds = itemTypes.talent.filter(t => t.name === game.i18n.localize("NAME.StrongMinded")).length;
      let max = resilience + strongMindeds;

      return `${resolve}/${max}`;
    }

    function getResilience({system}) {
      const {status} = system;

      if (status?.resilience)
        return `${status.resilience.value}`;

      return '-';
    }

    function getPoints(actor) {
      let points = '';

      if (!actor.system.status?.fate)
        return '<td colspan="2">-</td>';

      points += '<td>';
      points += `<b>${game.i18n.localize("Forien.Armoury.Macros.CheckStatus.FortunePointsShort")}: </b> ${getFortune(actor)}<br/>`;
      points += `<b>${game.i18n.localize("Forien.Armoury.Macros.CheckStatus.FatePointsShort")}: </b> ${getFate(actor)}`;
      points += '</td>';
      points += '<td>';
      points += `<b>${game.i18n.localize("Forien.Armoury.Macros.CheckStatus.ResolvePointsShort")}: </b> ${getResolve(actor)}<br/>`;
      points += `<b>${game.i18n.localize("Forien.Armoury.Macros.CheckStatus.ResiliencePointsShort")}: </b> ${getResilience(actor)}`;
      points += '</td>';

      return points;
    }

    function getExperience({system}) {
      if (!system.details.experience)
        return '-';

      const {current, total} = system.details.experience;
      let experience = '';

      experience += `<b>${game.i18n.localize("Forien.Armoury.Macros.CheckStatus.ExperienceLeft")}: </b> ${current}<br/>`;
      experience += `<b>${game.i18n.localize("Forien.Armoury.Macros.CheckStatus.ExperienceTotal")}: </b> ${total}`;

      return experience;
    }

    let content = '';

    content += `<h2>${game.i18n.localize("Forien.Armoury.Macros.CheckStatus.MessageHeader")}</h2>`;
    content += `<table style="font-size: var(--font-size-11)">`;
    content += `<tr>
      <th>${game.i18n.localize("Forien.Armoury.Macros.CheckStatus.Name")}</th>
      <th>${game.i18n.localize("Forien.Armoury.Macros.CheckStatus.Career")}</th>
      <th colspan="2">${game.i18n.localize("Forien.Armoury.Macros.CheckStatus.Points")}</th>
      <th>${game.i18n.localize("Forien.Armoury.Macros.CheckStatus.Experience")}</th>
    </tr>`;

    for (let actor of actors) {
      content += `<tr>`;
      content += `<td><strong>${getName(actor)}</strong></td>`;
      content += `<td>${getCareer(actor)}</td>`;
      content += getPoints(actor);
      content += `<td>${getExperience(actor)}</td>`;
      content += `</tr>`;
    }
    content += `</table>`;

    await ChatMessage.create({
      speaker: {},
      whisper: game.users.filter(u => u.isGM),
      content
    })
  }

  awardXP(
    macro,
    {
      characterFolderId = null,
      companionFolderId = null,
      showMessage = true,
      messageFlavor = null,
      messageShowTotalXP = false
    } = {}
  ) {
    if (!game.user.isGM)
      return Utility.notify(game.i18n.localize("Forien.Armoury.Macros.NotAGM"), {type: "warning"});

    const characterFolder = game.folders.get(characterFolderId);
    const companionFolder = game.folders.get(companionFolderId);
    const characters = characterFolder?.contents.filter(c => c instanceof ActorWfrp4e && c.type === 'character') ?? [];
    const companions = companionFolder?.contents.filter(c => c instanceof ActorWfrp4e && c.type === 'character') ?? [];

    console.log({characterFolder,
      companionFolder,
      characters,
      companions})

    function prepareActorUpdate(actor, amount, reason) {
      const experience = foundry.utils.duplicate(actor.details.experience);
      experience.total += amount;
      experience.log.push({reason, amount, spent: experience.spent, total: experience.total, type: "total"});

      return {
        _id: actor._id,
        "system.details.experience": experience,
      }
    }

    async function updateActors(actors, amount, reason) {
      let updates = [];

      for (let actor of actors) {
        let update = prepareActorUpdate(actor, amount, reason);
        updates.push(update);
      }

      await Actor.updateDocuments(updates);
    }

    function makeList(actors, amount = null) {
      let output = '';

      actors.forEach(a => {
        let appendix = '';
        if (messageShowTotalXP) {
          let xpTotal = a.system.details.experience.total;
          if (amount !== null) {
            let xpPrev = xpTotal - amount;
            appendix = `– ${xpPrev} -> ${xpTotal} XP`;
          } else {
            appendix = `– ${xpTotal} XP`;
          }
        }
        output += `– ${a?.actor?.name || a.name} ${appendix}<br />`;
      })

      return output;
    }

    function makeDialogList(actors, type) {
      let output = '';

      for (const actor of actors) {
        output += `<input type="checkbox" id="${actor.id}" name="${type}" value="${actor.id}" style="width: 14px;height: 14px;" checked/>`;
        output += `<label for="${actor.id}">${actor.name}</label><br />`;
      }

      return output;
    }

    async function awardXP(xp, reason, characters, companions) {
      const halfXp = Math.floor(xp / 2);
      await updateActors(characters, xp, reason);
      await updateActors(companions, halfXp, reason);

      if (!showMessage) return;

      let content = '';

      if (characters.length) {
        content += `<p>Player characters have been awarded ${xp} XP for "${reason}"</p>`;
        let characterList = makeList(characters, xp);
        content += `<p>${characterList}</p>`;
      }
      if (companions.length) {
        content += `<p>Party companions have been awarded ${halfXp} XP for "${reason}"</p>`;
        let companionList = makeList(companions, halfXp);
        content += `<p>${companionList}</p>`;
      }

      if (characters.length === 0 && companions.length === 0)
        content += `<p>Nobody was awarded any XP</p>`;

      await ChatMessage.create({
        speaker: {},
        flavor: messageFlavor,
        content
      })
    }

    const gridStyle = `display: grid;
grid-template-columns: 1fr 1fr;
grid-template-rows: min-content 1fr;
grid-auto-rows: 1fr;
gap: 5px 5px;
grid-auto-flow: row;
grid-template-areas: 'headerCharacters headerCompanions'
'characters companions';`

    let characterList = makeDialogList(characters, 'characters');
    let companionList = makeDialogList(companions, 'companions');
    let reason = '';

    let sessionId = game.gmtoolkit?.utility.getSession()?.id;

    if (sessionId)
      reason = `Session ${sessionId}`;

    new Dialog({
      title: game.i18n.localize("Forien.Armoury.Macros.AwardXP.DialogTitle"),
      content: `<form style="padding: 5px 0">
              <div style="${gridStyle}">
                <h3 style="grid-area: headerCharacters; margin: 0">Characters</h3>
                <div style="grid-area: characters;">${characterList}</div>
                <h3 style="grid-area: headerCompanions; margin: 0">Companions</h3>
                <div style="grid-area: companions;">${companionList}</div>
              </div>
              <div class="form-group">
                <label>${game.i18n.localize("Forien.Armoury.Macros.AwardXP.Amount")}</label> 
                <input type="text" id="xp-amount" value="50" />
              </div>
              <div class="form-group">
                <label>${game.i18n.localize("Forien.Armoury.Macros.AwardXP.Reason")}</label> 
                <input type="text" id="reason" value="${reason}" placeholder="${game.i18n.localize("Forien.Armoury.Macros.AwardXP.Reason").toLowerCase()}" />
              </div>
          </form>`,
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: game.i18n.localize("Forien.Armoury.Macros.AwardXP.Award"),
          callback: (html) => {
            const xp = Math.round(html.find("#xp-amount").val());
            const reason = html.find("#reason").val();
            if (isNaN(xp))
              return Utility.notify(game.i18n.localize("Forien.Armoury.Macros.AwardXP.XPNaN"), {type: "warning"});
            if (!reason)
              return Utility.notify(game.i18n.localize("Forien.Armoury.Macros.AwardXP.ReasonEmpty"), {type: "warning"});

            let characters = [];
            let companions = [];

            html.find("[name='characters']:checked").each((i, e) => characters.push(game.actors.get(e.value)));
            html.find("[name='companions']:checked").each((i, e) => companions.push(game.actors.get(e.value)));

            return awardXP(xp, reason, characters, companions);
          }
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: game.i18n.localize("Cancel")
        }
      },
      default: "yes"
    }).render(true);
  }

  async createIngredient(
    macro,
    {
      addToActor = false,
      autoPay = false,
      quantity = 1,
    } = {}
  ) {
    const {actor} = this.#getScope();

    if (!actor)
      return Utility.notify(game.i18n.localize("Forien.Armoury.Macros.MustControlActor"), {type: "warning"});

    const allowedLores = [
      'fire',
      'heavens',
      'metal',
      'beasts',
      'life',
      'light',
      'death',
      'shadow',
      'hedgecraft',
      'witchcraft'
    ];

    const compendium = game.packs.get("forien-armoury.forien-armoury");

    const loreIngredients = {
      fire: "Fyaz0um5STWsmcL7",
      heavens: "rX639Tm9dTFGgdEs",
      metal: "0Xe2tUDjV3jR2o17",
      beasts: "0IzPuMHA4a4P0PYB",
      life: "G4EdPUHqekDS6kj8",
      light: "uCGbBeMU5TUZPoba",
      death: "VuO1EDySwVbmtdcH",
      shadow: "rsQryOWSCufQnNAC",
      hedgecraft: "gEnMIQ1x4ETY1gCB",
      witchcraft: "relq8BaanmuOaPEP"
    }

    if (!actor)
      return ui.notifications.notify(game.i18n.localize('Forien.Armoury.Macros.MustControlActor'), 'warning')

    const spells = actor.itemTypes.spell;
    let options = "";

    spells.forEach(spell => {
      if (allowedLores.includes(spell.lore.value)) {
        options += `<option value="${spell.uuid}">${spell.name} (CN: ${spell.cn.value})</option>`;
      }
    })

    /**
     * @param {ItemWfrp4e} spell
     * @returns {Promise<{}>}
     */
    async function createIngredient(spell) {
      const lore = spell.lore.value;
      const baseIngredient = await compendium.getDocument(loreIngredients[lore]);

      const ingredientData = baseIngredient.toObject();
      const ingredientFor = game.i18n.localize('Forien.Armoury.Macros.IngredientFor');
      ingredientData.name = `${ingredientFor} ${spell.name}`;

      switch (lore.toLowerCase()) {
        case 'hedgecraft':
          ingredientData.system.price.bp = 5;
          break;
        case 'witchcraft':
          ingredientData.system.price.bp = spell.cn.value;
          break;
        default:
          ingredientData.system.price.ss = spell.cn.value;
      }
      ingredientData.system.spellIngredient.value = spell._id;

      if (!addToActor) {
        return Item.implementation.create(ingredientData, {renderSheet : true});
      }

      ingredientData.system.quantity.value = quantity;
      const ss = ingredientData.system.price.ss * quantity;
      const bp = ingredientData.system.price.bp * quantity;

      if (autoPay) {
        const moneyPaid = MarketWfrp4e.payCommand(`${ss}ss${bp}bp`, actor);

        if (moneyPaid) {
          await actor.updateEmbeddedDocuments("Item", moneyPaid);
          await actor.createEmbeddedDocuments("Item", [ingredientData]);
        }
      }
    }

    new Dialog({
      title: game.i18n.localize('Forien.Armoury.Macros.SelectSpell'),
      content: `<form>
              <div class="form-group">
                <label>${game.i18n.localize('Forien.Armoury.Macros.AvailableSpells')}</label> 
				<select name="spell-id" id="spell-id">
				   ${options}
				</select>
              </div>
          </form>`,
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: game.i18n.localize('Forien.Armoury.Macros.Generate'),
          callback: async html => {
            let spellUuid = html.find("#spell-id").val()
            let spell = await fromUuid(spellUuid);

            return await createIngredient(spell);
          }
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: game.i18n.localize('Forien.Armoury.Macros.Cancel')
        }
      },
      default: "yes"
    }).render(true);
  }

  /**
   * Borrowed from foundry.js `Macro.#executeScript`
   */
  #getScope({actor, token} = {}) {
    const speaker = ChatMessage.implementation.getSpeaker({actor, token});
    const character = game.user.character;

    token = token || (canvas.ready ? canvas.tokens.get(speaker.token) : null);
    actor = actor || token?.actor || game.actors.get(speaker.actor);

    return {actor, token, character};
  }
}