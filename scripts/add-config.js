Hooks.on("init", function () {
  // Add enable/disable setting for Slashing
  game.settings.register("forien-armoury", "applySlashing.Enable", {
    name: "FArmoury.applySlashing.Enable",
    hint: "FArmoury.applySlashing.EnableHint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  // Add enable/disable setting for arrow reclamation feature
  game.settings.register("forien-armoury", "arrowReclamation.Enable", {
    name: "FArmoury.arrowReclamation.Enable",
    hint: "FArmoury.arrowReclamation.EnableHint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Add enable/disable recovery of Arrows
  game.settings.register("forien-armoury", "arrowReclamation.EnableArrows", {
    name: "FArmoury.arrowReclamation.EnableArrows",
    hint: "FArmoury.arrowReclamation.EnableArrowsHint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });
  // Add enable/disable recovery of Bolts
  game.settings.register("forien-armoury", "arrowReclamation.EnableBolts", {
    name: "FArmoury.arrowReclamation.EnableBolts",
    hint: "FArmoury.arrowReclamation.EnableBoltsHint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  // Add enable/disable recovery of Bullets
  game.settings.register("forien-armoury", "arrowReclamation.EnableBullets", {
    name: "FArmoury.arrowReclamation.EnableBullets",
    hint: "FArmoury.arrowReclamation.EnableBulletsHint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  // Add setting that allows for different rules of arrow reclamation
  game.settings.register("forien-armoury", "arrowReclamation.Rule", {
    name: "FArmoury.arrowReclamation.Rule",
    hint: "FArmoury.arrowReclamation.RuleHint",
    scope: "world",
    config: true,
    default: "default",
    type: String,
    choices: {
      "default": "FArmoury.arrowReclamation.DefaultRule",
      "success": "FArmoury.arrowReclamation.SuccessRule",
      "noCrit": "FArmoury.arrowReclamation.NoCritRule",
      "successNoCrit": "FArmoury.arrowReclamation.SuccessNoCritRule",
      "failure": "FArmoury.arrowReclamation.FailureRule",
      "failureNoCrit": "FArmoury.arrowReclamation.FailureNoCritRule",
      "percentage": "FArmoury.arrowReclamation.PercentageRule",
      "percentageNoCrit": "FArmoury.arrowReclamation.PercentageNoCritRule",
    }
  });

  // Add Percentage setting for Percentage rules
  game.settings.register("forien-armoury", "arrowReclamation.Percentage", {
    name: "FArmoury.arrowReclamation.Percentage",
    hint: "FArmoury.arrowReclamation.PercentageHint",
    scope: "world",
    config: true,
    default: 50,
    type: Number
  });
});
