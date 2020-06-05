class ForienArmoury {
	/**
	 */
	static addAmmoToReplenish(actorId, ammoId) 
	{
		// retrieve array or initialize it. 
		let ammoReplenish = game.combat.ammoReplenish || [];
		game.combat.ammoReplenish = ammoReplenish;
		
		// retrieve actor array or initialize it.
		let actorData = ammoReplenish[actorId] || [];
		ammoReplenish[actorId] = actorData;
	
		// retrieve ammo object
		let ammoData = actorData.find(a => a._id == ammoId);

		// if ammo object doesn't exist, create one
		if (ammoData == undefined) {
			ammoData = {
				"_id": ammoId,
				"quantity": 0
			};
			// push ammo object to actor data
			actorData.push(ammoData);
		}
		
		// increase ammo to replenish
		ammoData.quantity += 1;
	}
	
	/**
	 */
	static replenishAmmo(actorId, ammoId, quantity) 
	{
		let actor = game.actors.find(a => a._id == actorId);
		let ammoEntity = duplicate(actor.getEmbeddedEntity("OwnedItem", ammoId));
		
		ammoEntity.data.quantity.value += quantity;
		actor.updateEmbeddedEntity("OwnedItem", {_id: ammoId, "data.quantity.value" : ammoEntity.data.quantity.value });
	}
	
	/**
	 */
	static processEndOfCombat() 
	{
		if (Array.isArray(game.combat.ammoReplenish)) {
			for (var actorId in game.combat.ammoReplenish) {
				if (Array.isArray(game.combat.ammoReplenish[actorId])) {					
					game.combat.ammoReplenish[actorId].forEach(function (ammo) {
						ForienArmoury.replenishAmmo(actorId, ammo._id, ammo.quantity);
					});
				}
			}
		}
	}
}

Hooks.on("preDeleteCombat", function() {
	ForienArmoury.processEndOfCombat();
})

Hooks.on("wfrp4e:rollWeaponTest", function(roll, actorId) {
	let weapon = roll.weapon;
	let ammoId = weapon.data.currentAmmo.value;
	let type = null;
	let crit = false;
	let even = false;
	let success = false;
	let save = false;
	let message = "";
	
	if (!game.settings.get("forien-armoury", "arrowReclamationEnable")) {
		return;
	}
	
	if (weapon.data.ammunitionGroup.value == 'bow') {
		type = 'Arrow';
	} else if (weapon.data.ammunitionGroup.value == 'crossbow') {
		type = 'Bolt';
	}
	
	if (type == null) {
		return;
	}
	
	let messageNow = `${game.i18n.localize(type)} ${game.i18n.localize("recovered")}.`;
	let messageFuture = `${game.i18n.localize(type)} ${game.i18n.localize("will be recovered after combat")}.`;

	
	if (roll.extra.critical != undefined || roll.extra.fumble != undefined) {
		crit = true;
	}
	
	if (roll.roll % 2 == 0) {
		even = true;
	}
	
	if (roll.roll <= roll.target) {
		success = true;
	}
	
	switch (game.settings.get("forien-armoury", "arrowReclamationRule")) {
		case 'success':
			save = even && success;
		break;
		case 'noCrit':
			save = even && !crit;
		break;
		case 'successNoCrit':
			save = even && success && !crit;
		break;
		case 'default':
		default:
			save = even;
	}
	
	if (save == true) {
		if (game.combat == null) {
			return; // broken at the moment
			message = messageNow;
			ForienArmoury.replenishAmmo(actorId, ammoId, 1);
		} else {
			message = messageFuture;
			ForienArmoury.addAmmoToReplenish(actorId, ammoId);
		}
		
		if (Array.isArray(roll.other)) {
			roll.other.push(message)
		} else {
			roll.other = [message];
		}
	}
});

Hooks.on("init", function() {
	game.settings.register("forien-armoury", "arrowReclamationEnable", {
		name: "SETTINGS.arrowReclamationEnable",
		hint: "SETTINGS.arrowReclamationEnableHint",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	
	game.settings.register("forien-armoury", "arrowReclamationRule", {
		name: "SETTINGS.arrowReclamationRule",
		hint: "SETTINGS.arrowReclamationRuleHint",
		scope: "world",
		config: true,
		default: "default",
		type: String,
		choices: {
			"default": "SETTINGS.arrowReclamationDefault",
			"success": "SETTINGS.arrowReclamationSuccess",
			"noCrit": "SETTINGS.arrowReclamationNoCrit",
			"successNoCrit": "SETTINGS.arrowReclamationSuccessNoCrit"
		}
	});
});