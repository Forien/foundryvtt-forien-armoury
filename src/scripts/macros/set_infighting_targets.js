let targets = game.user.targets;

targets.forEach(tkn => {
  let actor = tkn.actor;
  actor.addSystemEffect("infighting");
});
