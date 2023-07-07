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

const spells = actor.itemCategories.spell;
let options = "";

spells.forEach(spell => {
  if (allowedLores.includes(spell.lore.value)) {
    options += `<option value="${spell.uuid}">${spell.name} (CN: ${spell.cn.value})</option>`;
  }
})

const dialog = new Dialog({
  title: game.i18n.localize("Select spell to create ingredient"),
  content: `<form>
              <div class="form-group">
                <label>Available spells</label> 
				<select name="spell-id" id="spell-id">
				   ${options}
				</select>
              </div>
          </form>`,
  buttons: {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: "Generate",
      callback: html => {
        let spellUuid = html.find("#spell-id").val()
        let spell = fromUuidSync(spellUuid);
        console.log(spell);
        let lore = spell.lore.value;
        console.log(lore);
        let uuid = compendium + loreIngredients[lore];
        console.log(uuid);
        let baseIngredientPromise = fromUuid(uuid)

        baseIngredientPromise.then(baseIngredient => {

          const origData = duplicate(baseIngredient);
          let ingredient;
          let template = {data: game.system.model.Item[baseIngredient.type]};
          let ingredienData = mergeObject(template, origData);
          console.log(ingredienData);


          ingredienData.name = `Ingredient for ${spell.name}`;
          ingredienData.system.price.ss = spell.cn.value;
          ingredienData.system.spellIngredient.value = spell._id;

          console.log(ingredienData);

          Item.implementation.create(ingredienData, {renderSheet : true});
        })
      }
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: "Cancel"
    }
  },
  default: "yes"
}).render(true)