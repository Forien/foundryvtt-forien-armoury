# FoundryVTT - Forien's Armoury
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/Forien/foundryvtt-forien-armoury?style=for-the-badge) 
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FForien%2Ffoundryvtt-forien-armoury%2Fmaster%2Fdist%2Fmodule.json&label=Foundry%20Min%20Version&query=$.compatibility.minimum&colorB=orange&style=for-the-badge) 
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FForien%2Ffoundryvtt-forien-armoury%2Fmaster%2Fdist%2Fmodule.json&label=Foundry%20Verified&query=$.compatibility.verified&colorB=orange&style=for-the-badge)  
![License](https://img.shields.io/github/license/Forien/foundryvtt-forien-armoury?style=for-the-badge) ![GitHub Releases](https://img.shields.io/github/downloads/Forien/foundryvtt-forien-armoury/latest/module.zip?style=for-the-badge) 
![GitHub All Releases](https://img.shields.io/github/downloads/Forien/foundryvtt-forien-armoury/module.zip?style=for-the-badge&label=Downloads+total)  
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white&link=https%3A%2F%2Fdiscord.gg%2FXkTFv8DRDc)](https://discord.gg/XkTFv8DRDc)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/foundryworkshop)
[![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/forien)

This module is a collection of custom trappings and features for Warhammer Fantasy Role-Play 4th edition game system for Foundry Virtual Table Top  

Forien's Armoury started as a compendium of my own custom items and houserules and as the time went by, it got expanded


### Notable changes in v1.4.0
* Added new career: `Monster Hunter`
  * This career utilizes one of three unique **Fighting Styles** and focuses on tracking down and fighting monstrous beasts
* Added 8 new Talents
  * `Fighting Style (Any)` and `Fighting Master (Style)` along with variant for every of the three styles.
* Introducing _„RassilonMonk's Cauldron of Nurgle“_, a bundle of symptoms and diseases to use during your games in perilous Old World
  * Added 5 new **Diseases**: Gonorrhoea, Meniere's disease, Nurgle's Rot, Ragpicker's Disease, The Spews
  * Added 4 new **Symptoms**: Vertigo, Scarring, Rashes and Taint
* Created am Automatic Disease Progression, which will progress diseases' duration and incubation automatically
  * This requires some time tracking module (like `Simple Calendar`) to actually modify the `World Time` setting.
* Added `Casting Fatigue` feature, proposed and designed by VividOblivion.
* Added new journal: `Forien's Lore`
  * Describing **Hunters' Guild** and **Runebounds**
* Added accessory: `Amulet of „Resilience“`
* Added trait: `Drunk`
* Created Settings App, which allows to display settings in more visually appealing and intuitive way
* Several other changes to both content and codebase, [read more](https://github.com/Forien/foundryvtt-forien-armoury/blob/master/CHANGELOG.md)

### Notable changes in v1.3.0
* Reintroduced the **Slashing**, **Recoverable** and **Unrecoverable** properties for weapons and ammunition
* Introduced new **Incendiary, Poisonous** and **Blinding** qualities
* Added **Combat Fatigue feature** (implementing Getting Tired from CRB p.168)
* Added **new items**
  * Cutlass, Light Bomb, Cracker Bullet, Razor Bullet, Poisoned Arrows, Fire Arrows, Winged Arrows
* Added Repulsive trait
* Added new Macro for testing **Advanced Skills** with result limits
* Updated the Journals with new information
* Minor fixes to items (improved gunpowder, powder horns)
* Several smaller changes and fixes, [read more](https://github.com/Forien/foundryvtt-forien-armoury/blob/master/CHANGELOG.md)


## Installation

### Recommended: Install via FoundryVTT

FoundryVTT will automatically install the Module and its dependencies, while also prompting you to download optional, recommended Modules.

Once installed, while in World using WFRP4e game system, enable `Forien's Armoury` module.

### Manual

1. Install [WFRP4e Game System](https://github.com/moo-man/WFRP4e-FoundryVTT) and other dependencies.
2. Install Forien's Armoury by extracting ZIP in your `FoundryData/Data/modules` directory
3. While in World using WFRP4e game system, enable Forien's Armoury module




## Contents
### Features
This Module adds some QoL and automation features, including mechanics that:
* Allow for automatic removal of **Temporary Runes** when they get disabled (preferably by `Times Up` Module). 
  * Optionally allows for damaging an Item when Rune is removed (disabled by default).
* **Item Repair** (Macro), allow players to easily repair their equipment for free or for price, using Macro and clean, readable auto-updating Chat Card
* **Check Careers** (Macro), allows players to quickly check their progress through current Career and how far are they from completing it.
* **Arrow Reclamation**, allowing players to recover some of ammunition (arrows, bolts or sling bullets) after an encounter. Defaults to even rolls. Disabled by default.
* **Combat Fatigue**, using optional _„Getting Tired“_ ruleset.
* **Casting Fatigue**, providing soft limit to amount of spells that can be cast in short amount of time.
* **Automated Disease Progression**, allowing for `incubation` and `duration` of diseases to countdown automatically.


### Items
Module contains single Compendium pack containing over 117 entries (items and effects).

* Added 12 new **Careers** across 3 new Career Paths
  * Monster Hunter
  * Runebound Ranger
  * Runesmith
* Added 32 Runes implemented as working Active Effects
* Added 1 new **Skill** (Runecraft)
* Added 11 new **Talents** (Dawi Runes, Runebound Magic, Fortifiend Mind, 3x Fighting Styles and 3x Fighting Masters)
* Added 3 new **Traits** (Drunk, Point Blank Rule, Repulsive)
* Added 11 new and rebalanced **Armour** items:
  * Added Gambesons as an alternative to Leather armour
  * Rebalanced Leather armour (is more expensive than Gambesons, but Durable)
  * Added Cuirass (plate torso armour)
  * Added Breastplate (covers front only)
* Added 9 new **Ammunition** types:
  * Barbed Bolt, Bodkin Bolt, Sharp Stick (Bolt)
  * Fire Arrows, Poisoned Arrows, Winged Arrows
  * Cracker Bullet, Razor Bullet
  * Improved Bullet and Powder
* Added 8 new **Weapons**:
  * Cutlass
  * Light Bomb
  * Old Bow
  * Pickaxe
  * Short Spear
  * Spear
  * Spear (2h)
  * Torch
* Added 6 new **Accessories**:
  * Amulet of „Protection“
  * Amulet of „Resilience“
  * Elegant Pipe
  * Ring of See Invisibility
  * Ring of Smell
  * Spectacles
* Added 8 new **Containers**
  * 3 Quivers, 3 Powder Horns, 2 Bags
* Added 5 new **Diseases**
  * Gonorrhoea, 
  * Meniere's disease, 
  * Nurgle's Rot,
  * Ragpicker's Disease, 
  * The Spews
* Added 10 new generic **Ingredients** for each Arcane Lore
* Added some miscellaneous **Trappings**


### Journals
Module contains single Compendium Pack containing two Journals:

* Forien's Homerules — this Journal contains my own Homerules, as well as rules for some of the Items included in this Module.
* Forien's Careers — this Journal only contains detailed descriptions for Careers included with this Module.
* Forien's Lore — this Journal only contains non-mechanical descriptions of some homebrew concepts I introduced, such as `Hunters' Guild` or the `Runebound` species.


### Macros
Module contains a single Compendium Pack containing 10 Macros:

* GM Macro to quickly set Infighting on target Tokens
* 3 GM Macros to quickly set selected tokens' dispositions
* Player Macro to check their Career progression
* Player Macros to check for their Damaged Equipment
* Player Macro to generate specific Ingredient for, and based on a specific Spell
* Player Macro to roll for advanced Skill with limited SL result
* General Macro to quickly open a WFRP4e Item Browser
* General Macro to quickly open the Forien's Armoury Settings


## Troubleshooting and Debug
If you want to have deeper understanding of why module behaves the way it does, **you can enable Debug in module's setting**.

This setting makes it so that module will output a ton of information into the console whenever is performs or attempts to perform an action.

You can open the console by using `F12` keybind on most browsers.

**Tip**: Use `Forien's Armoury` as filter in console to only see this module's messages.



## Recommended 3rd Party Modules
These modules are important for functionality of this module's **Features**. While not strictly **required**, I highly recommend using them:
* [Times Up](https://foundryvtt.com/packages/times-up) — Allows for automatic disabling of effects, especially useful for Temporary Runes introduced in Forien's Armoury.
* [Simple Calendar](https://foundryvtt.com/packages/foundryvtt-simple-calendar) — A time tracking module is _**required**_ for **Automatic Disease Progression** as well as **Automated Magical Endurance Regeneration**. Simple Calendar is recommended since it works well with WFRP4e! 

### Other suggested modules
These modules work with _some Documents_ (Actors, Items etc.) I provide in the Compendiums. Those are only necessary if you plan on using those Documents.
* [Active Token Effects](https://foundryvtt.com/packages/ATL) — Allows to use presets such as "torch" etc. for Lighting items
* [Item Piles](https://foundryvtt.com/packages/item-piles) — Awesome module that allows you to make tokens lootable, create treasure chests, bank vaults and - most importantly in my opinion - merchants. Forien's Armoury includes 92 Rollable Tables ready to be used to Populate Items for Merchants, as well as 6 prefab merchants!

### Notable mentions
* [DFreds Effects Panel](https://foundryvtt.com/packages/dfreds-effects-panel) — Isn't specifically linked to Forien's Armoury in any way, but provides nice and clean effects display with ability to toggle them, so I recommend trying it 




## Future plans

### Features
* Easy to use UI for creating runic items

### Content
* New Career Paths
  * [Added in v1.4.0] ~~Monster Hunter – mundane alternative to the Runebound Ranger, trained to specialize in one of several fighting style~~
  * Hunter Engineer – an Engineer that specializes in weapons, traps and gadgets designed to be effective against monsters
  * Balancing tweaks to all careers in Monster Hunter Class, if needed
* More dwarven Runes

*If you have **any** suggestion or idea on new contents, open an [Issue](https://github.com/Forien/foundryvtt-forien-armoury/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md&title=) or hit me up on Discord!*


## Known issues

* Sometimes, the **Automated Disease Progression** feature will stop on `duration = 1` and throw an error. This is due to a bug existing in the WFRP4e itself. 
  * **Workaround:** When you see this error, consider disease `finished` and follow-up accordingly. Usually deleting the disease Item from Actor is the right course of action.


## Contact

If you wish to contact me for any reason, reach me out on Discord using my tag: `forien`




## Support

If you wish to support me, please consider [becoming my Patreon](https://www.patreon.com/foundryworkshop) or donating [through Paypal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6P2RRX7HVEMV2&source=url). Thanks!




## Acknowledgments
_Disclaimer: I kept all acknowledgments, even if their respective work was lost during the Module's remake. Sorry for that._

* Thanks to Atropos for his relentless work on developing and improving the Foundry VTT
* Thanks to Moo Man for his great work developing the [WFRP4e game system](https://github.com/moo-man/WFRP4e-FoundryVTT) as well as for his invaluable help with understanding how to mod Foundry using JS
* Thanks to Thoradin for an idea for arrow reclamation feature :)
* Thanks to [DasSauerkraut](https://github.com/DasSauerkraut) for allowing me to integrate compendium from his [Gerwin Waffenhalter’s Magnificent Weapons Gallery](https://github.com/DasSauerkraut/wfrp-gwmwg) into my module
* Thanks to LeRatierBretonnien and Gharazel for providing French translation! 
* Thanks to ElCamino for providing German translation!
* Thanks to [silent_mark](https://github.com/silentmark) for contributing to Polish translation!
* Thanks to Nibbler from The Rat Catchers Guild on Discord for providing his price tables
* Thanks to VividOblivion for proposing and designing a `Casting Fatigue` rule!
* Thanks to RassilonMonk for contributing symptoms and diseases as a part of his _„RassilonMonk's Cauldron of Nurgle“_!



## License

Forien's Armoury is a module for Foundry VTT by Forien and is licensed under a MIT License.

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License for Package Development from March 2, 2023](https://foundryvtt.com/article/license/).

_To the best of my knowledge, all content in this module is either made by me, publicly available under permissive license or falls under Fair Use. Please bring infractions or concerns related to my module to my attention by contacting me via email presented on my GitHub profile._ 
