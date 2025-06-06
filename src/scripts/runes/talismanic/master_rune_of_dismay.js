let template = {
  t: "circle",
  distance: 48,
  direction: 0,
  angle: 0,
  width: null,
  borderColor: "#000000",
  fillColor: "#aa3333",
  hidden: false,
  flags: {}
};

let token;
if (this.actor.isToken) token = this.actor.token;
else token = this.actor.getActiveTokens()[0]?.document;

let offset = game.scenes.active.grid.size / 2;

let position = {
  x: token.x + offset,
  y: token.y + offset
};

game.scenes.viewed.createEmbeddedDocuments("MeasuredTemplate", [{...template, ...position}]);
let name = game.i18n.localize("Forien.Armoury.Runes.MasterRuneOfDismay.name");
let effect = game.i18n.localize("Forien.Armoury.Runes.MasterRuneOfDismay.effect");

ChatMessage.create({
  user: game.user._id,
  speaker: this.actor.speaker,
  content: `
    <h2>${name}</h2>
    <p>${effect}</p>
`
});
