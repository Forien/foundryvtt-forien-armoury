ForienArmoury.Localization = class Localization {
  static locales = ['pl', 'en'];

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
