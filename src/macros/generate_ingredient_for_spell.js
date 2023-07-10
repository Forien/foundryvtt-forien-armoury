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

const compendium = "Compendium.forien-armoury.forien-armoury.Item."

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

const spells = actor.itemCategories.spell;
let options = "";

spells.forEach(spell => {
  if (allowedLores.includes(spell.lore.value)) {
    options += `<option value="${spell.uuid}">${spell.name} (CN: ${spell.cn.value})</option>`;
  }
})

const dialog = new Dialog({
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
      callback: html => {
        let spellUuid = html.find("#spell-id").val()
        let spell = fromUuidSync(spellUuid);
        let lore = spell.lore.value;
        let uuid = compendium + loreIngredients[lore];
        let baseIngredientPromise = fromUuid(uuid)

        baseIngredientPromise.then(baseIngredient => {

          const origData = baseIngredient.toObject();
          let ingredient;
          let template = {data: game.system.model.Item[baseIngredient.type]};
          let ingredientData = mergeObject(template, origData);

          let ingredientFor = game.i18n.localize('Forien.Armoury.Macros.IngredientFor');
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

          Item.implementation.create(ingredientData, {renderSheet : true});
        })
      }
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: game.i18n.localize('Forien.Armoury.Macros.Cancel')
    }
  },
  default: "yes"
}).render(true)