ForienArmoury.Localization = class Localization {
  static locales = ['pl', 'fr', 'de'];

  static registerBabele() {
    this.locales.forEach(l => {
      Babele.get().register({
        module: 'forien-armoury',
        lang: l,
        dir: 'packs/' + l
      });
    });
  }
};
