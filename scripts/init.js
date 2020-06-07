let ForienArmoury = {};

Hooks.on("init", function () {
  // Allow and process incoming socket data
  game.socket.on("module.forien-armoury", data => {
    if (game.user.isGM) {
      if (data.type === "arrowToReclaim") {
        ForienArmoury.ArrowReclamation.addAmmoToReplenish(data.payload.actorId, data.payload.ammoId);
      }
    }
  });

  ForienArmoury.ArrowReclamation.registerQualitiesAndFlaws();
});

Hooks.on("deleteCombat", function (combat) {
  if (game.user.isGM) {
    ForienArmoury.ArrowReclamation.processEndOfCombat(combat);
  }
});

Hooks.on("wfrp4e:rollWeaponTest", function (roll, cardOptions) {
  ForienArmoury.ArrowReclamation.checkRollWeaponTest(roll, cardOptions);
});
