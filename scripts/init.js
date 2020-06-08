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

  // if Babele module is installed and enabled, register translations
  if (game.modules.get("babele") !== undefined && game.modules.get("babele").active)
    ForienArmoury.Localization.registerBabele();
});

Hooks.on("deleteCombat", function (combat) {
  if (game.user.isGM) {
    ForienArmoury.ArrowReclamation.processEndOfCombat(combat);
  }
});

Hooks.on("wfrp4e:rollWeaponTest", function (roll, cardOptions) {
  ForienArmoury.ArrowReclamation.checkRollWeaponTest(roll, cardOptions);
});

Hooks.on("wfrp4e:opposedTestResult", function (result) {
  ForienArmoury.ArrowReclamation.applyBleedingOnSlashing(result);
});
