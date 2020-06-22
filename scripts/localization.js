ForienArmoury.Localization = class Localization {
  static locales = ['pl', 'fr'];

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
