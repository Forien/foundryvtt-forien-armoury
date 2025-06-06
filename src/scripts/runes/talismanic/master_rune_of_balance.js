let target = Array.from(game.user.targets)[0]?.document;
let targetActor = target?.actor;
let token;

if (this.actor.isToken) token = this.actor.token;
else token = this.actor.getActiveTokens()[0]?.document;

if (!targetActor)
  return ui.notifications.notify(game.i18n.format("Forien.Armoury.Runes.MustSelectATarget", {rune: this.effect.name}), "warning");

let distance = canvas.grid.measureDistances([{
  ray: new Ray({x: token.x, y: token.y}, {
    x: target.x,
    y: target.y
  })
}], {gridSpaces: true})[0];

if (distance > 48)
  return ui.notifications.notify(game.i18n.format("Forien.Armoury.Runes.TargetNotInRange", {
    rune: this.effect.name,
    range: 48
  }), "warning");

let effectOf = game.i18n.localize("Forien.Armoury.Runes.EffectOf");
let effectDuration = Number(this.actor.system.characteristics.wp.bonus) * 6;

let effectCopy = this.effect.toObject();
effectCopy._id = undefined;
effectCopy.origin = this.actor.uuid;
effectCopy.name = `${effectOf} ${effectCopy.name}`;
effectCopy.flags.wfrp4e.effectTrigger = "prefillDialog";
effectCopy.flags.wfrp4e.script = `
if (args.type == "cast" || args.type == "channelling")
  args.prefillModifiers.modifier -= 20
`;
effectCopy.duration.seconds = effectDuration;

targetActor.createEmbeddedDocuments("ActiveEffect", [effectCopy]);
game.user.updateTokenTargets([]);
