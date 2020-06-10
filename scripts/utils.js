ForienArmoury.Utils = class {
  static registerHandlebarsHelpers() {
    Handlebars.registerHelper('i18nformat', function(stringId, ...arrData) {
      let objData;
      if (typeof arrData[0] === 'object')
        objData = arrData[0];
      else
        objData = {...arrData};

      return game.i18n.format(stringId, objData);
    });
  }
};
