ForienArmoury.Localization = class Localization {
  static locales = ['pl'];

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
