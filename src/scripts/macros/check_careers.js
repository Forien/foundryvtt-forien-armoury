const onlyOnline = true;
const api = game.modules.get("forien-armoury")?.api.checkCareers;

if (game.user.isGM) api.checkPlayersCareers(onlyOnline);
else api.checkMyCareer();