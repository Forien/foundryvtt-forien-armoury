class ForienArmoury {
	/**
	 * Adds information about Ammunition entity and Actor entity to Combat Tracker
	 * allows for tracking which ammo and in what quantity has to be returned
	 */
	static addAmmoToReplenish(actorId, ammoId) 
	{
		// retrieve existing data or initialize it
		let ammoReplenish = game.combat.getFlag('forien-armoury', 'ammoReplenish') || {};
		let actorData = ammoReplenish[actorId] || [];
		let ammoData = actorData.find(a => a._id == ammoId);

		// if ammo object doesn't exist, create one
		if (ammoData == undefined) {
			ammoData = {
				"_id": ammoId,
				"quantity": 0
			};
			actorData.push(ammoData);
		}
		ammoData.quantity += 1;
		
		// overwrite actor data
		ammoReplenish[actorId] = actorData;
		
		// set (overwrite) flag with updated data
		game.combat.setFlag('forien-armoury', 'ammoReplenish', ammoReplenish);
	}
	
	/**
	 * Finds ammo in possesion of an Actor and replenishes given amount
	 */
	static replenishAmmo(actorId, ammoId, quantity) 
	{
		let actor = game.actors.find(a => a._id == actorId);
		let ammoEntity = duplicate(actor.getEmbeddedEntity("OwnedItem", ammoId));
		
		ammoEntity.data.quantity.value += quantity;
		actor.updateEmbeddedEntity("OwnedItem", {_id: ammoId, "data.quantity.value" : ammoEntity.data.quantity.value });
	}
	
	/**
	 * When combat ends, check Combat Tracker for any ammunition to recover.
	 */
	static processEndOfCombat(combat) 
	{
		let ammoReplenish = combat.getFlag('forien-armoury', 'ammoReplenish');

		for (var actorId in ammoReplenish) {
			if (Array.isArray(ammoReplenish[actorId])) {
				ammoReplenish[actorId].forEach(function (ammo) {
					ForienArmoury.replenishAmmo(actorId, ammo._id, ammo.quantity);
				});
			}
		}
	}
}

Hooks.on("deleteCombat", function(combat) {
	if (game.user.isGM) {
		ForienArmoury.processEndOfCombat(combat);
	}
})

Hooks.on("wfrp4e:rollWeaponTest", function(roll, cardOptions) {
	// if feature not enabled, do nothing
	if (!game.settings.get("forien-armoury", "arrowReclamationEnable")) {
		return;
	}

	let actorId = cardOptions.speaker.actor;
	let weapon = roll.weapon;
	let ammoId = weapon.data.currentAmmo.value;
	let type = null;
	let crit = false;
	let even = false;
	let success = false;
	let save = false;
	let message = "";
	
	// prepare ammo type for translation and also limit types of ammo being recoverable
	if (weapon.data.ammunitionGroup.value == 'bow') {
		type = 'Arrow';
	} else if (weapon.data.ammunitionGroup.value == 'crossbow') {
		type = 'Bolt';
	} else if (weapon.data.ammunitionGroup.value == 'sling') {
		type = 'Bullet';
	}
	
	if (type == null) {
		return;
	}
	
	// define chat messages
	let messageNow = `${game.i18n.localize("FArmoury." + type)} ${game.i18n.localize("FArmoury.recovered")}.`;
	let messageFuture = `${game.i18n.localize("FArmoury." + type)} ${game.i18n.localize("FArmoury.recoveredFuture")}.`;

	// Define flags used by rules
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
			if (game.user.isGM) {
				ForienArmoury.addAmmoToReplenish(actorId, ammoId);
			} else {				
				game.socket.emit("module.forien-armoury", {
					type: "arrowToReclaim",
					payload:  {actorId:actorId, ammoId:ammoId}
				})
			}
		}
		
		if (Array.isArray(roll.other)) {
			roll.other.push(message)
		} else {
			roll.other = [message];
		}
	}
});

Hooks.on("init", function() {
	// Allow and process incoming socket data
	game.socket.on("module.forien-armoury", data => {
		if (game.user.isGM) {
			if (data.type == "arrowToReclaim") {
				ForienArmoury.addAmmoToReplenish(data.payload.actorId, data.payload.ammoId);
			}
		}
	})	
	
	// Add enable/disable setting for arrow reclamation feature
	game.settings.register("forien-armoury", "arrowReclamationEnable", {
		name: "SETTINGS.arrowReclamationEnable",
		hint: "SETTINGS.arrowReclamationEnableHint",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	
	// Add setting that allows for different rules of arrow reclamation
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