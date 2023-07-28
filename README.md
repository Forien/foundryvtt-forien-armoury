# FoundryVTT - Forien's Armoury
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/forien/foundryvtt-forien-armoury?style=for-the-badge) 
![GitHub Releases](https://img.shields.io/github/downloads/Forien/foundryvtt-forien-armoury/latest/module.zip?style=for-the-badge)
![GitHub All Releases](https://img.shields.io/github/downloads/Forien/foundryvtt-forien-armoury/module.zip?style=for-the-badge&label=Downloads+total)  
**[Compatibility]**: *Foundry VTT* **Version 11**, *WFRP4e* **v6.6.1**    
**[Languages]**: *English*

This module is a collection of custom trappings and features for Warhammer Fantasy Role-Play 4th edition game system for Foundry Virtual Table Top  

Forien's Armoury started as a compendium of my own custom items and houserules and as the time went by, it got expanded

#### Notable changes in v1.0.0
* Module was remade from the ground up, not updated
  * It was easier this way, since Migrating from Foundry 0.6 to Foundry 11 would most likely break stuff
* Added bunch of my own Houserules in a Journal
* Added new careers:
  * Dwarven Runesmiths
  * Runebound Rangers
* Added bunch of new items, weapons, trappings
  * Generic Ingredients for each Tradition
  * Gambeson type Armour
  * Rebalanced Soft Leather Armour
  * Changed Breastplate (only covers front)
  * Added Cuirass (more like vanilla Breastplate)
  * Powder Kegs
  * Quivers and Powder Horns
  * and more 
* Added fully automated Rune support for Runesmith
  * Runes are effects on Items
  * Temporary Runes when disabled will delete themselves from Actor and Item
  * Optionally, Item will be damaged when Temporary Rune is removed from it
  * For best effects, I suggest using [Times Up](https://foundryvtt.com/packages/times-up) by Tim Posney
* Added new type of Magic for Runebound Rangers




## Installation

### Recommended: Install via FoundryVTT

FoundryVTT will automatically install the Module and will prompt you to download recommended Modules as well.

Once installed, while in World using WFRP4e game system, enable Forien's Armoury module

### Manual

1. Install [WFRP4e Game System](https://github.com/moo-man/WFRP4e-FoundryVTT) and other dependencies.
2. Install Forien's Armoury by extracting ZIP in your `FoundryData/Data/modules` directory
3. While in World using WFRP4e game system, enable Forien's Armoury module




## Contents
### Features
This Module adds some QoL and automation features, including mechanics that:
* Allow for automatic removal of Temporary Runes when they get disabled (prefferably by `Times Up` Module). 
  * Optionally allows for damaging an Item when Rune is removed (disabled by default).
* Allow players to easily repair their equipment for free or for price, using Macro and clean, readable auto-updating Chat Card
* Allow players to quickly check their progress through current Career and how far are they from completing it.
* Allow players to reclaim portion of ammunition (arrows, bolts or sling bullets) after an encounter. Defaults to even rolls. Disabled by default.


### Items
Module contains single Compendium pack containing over 80 entries (items and effects).

* Added 8 new **Careers** across 2 new Career Paths
  * Runesmith
  * Runebound Ranger
* Added 32 Runes implemented as working Active Effects
* Added 1 new **Skill** (Runecraft)
* Added 2 new **Talents** (Dawi Runes, Runebound Magic)
* Added 1 new **Trait** (Point Blank Rule)
* Added 11 new and rebalanced **Armour** items:
  * Added Gambesons as an alternative to Leather armour
  * Rebalanced Leather armour (is more expensive than Gambesons, but Durable)
  * Added Cuirass (plate torso armour)
  * Added Breastplate (covers front only)
* Added 4 new **Ammunition** types:
  * Barbed Bolt
  * Bodkin Bolt
  * Sharp Stick (Bolt)
  * Improved Bullet and Powder
* Added 5 new **Weapons**:
  * Pickaxe
  * Short Spear
  * Spear
  * Spear (2h)
  * Torch
* Added 2 new **Accessories**:
  * Ring of See Invisibility
  * Ring of Smell
* Added 8 new **Containers**
  * 3 Quivers, 3 Powder Horns, 2 Bags
* Added 10 new generic **Ingredients** for each Arcane Lore
* Added some miscellaneous **Trappings**


### Journals
Module contains single Compendium Pack containing two Journals:

* Forien's Homerules — this Journal contains my own Homerules, as well as rules for some of the Items included in this Module.
* Forien's Careers — this Journal only contains detailed descriptions for Careers included with this Module.  


### Macros
Module contains a single Compendium Pack containing 9 Macros:

* GM Macro to quickly set Infighting on target Tokens
* GM Macros to quickly set selected tokens' dispositions
* Player Macro to check their Career progression
* Player Macros to check for their Damaged Equipment
* Player Macro to generate specific Ingredient for, and based on a specific Spell
* Player Macro to quickly open a WFRP4e Item Browser




## Recommended 3rd Party Modules
* [Times Up](https://foundryvtt.com/packages/times-up) — Allows for automatic disabling of effects, especially useful for Temporary Runes introduced in Forien's Armoury
* [Active Token Effects](https://foundryvtt.com/packages/ATL) — Allows to use presets such as "torch" etc. for Lighting items 

### Other suggested modules
* [DFreds Effects Panel](https://foundryvtt.com/packages/dfreds-effects-panel) — Isn't specifically linked to Forien's Armoury in any way, but provides nice and clean effects display with ability to toggle them, so I recommend trying it 




## Future plans

### Features
* Easy to use UI for creating runic items
* Activatable Torches, that automatically turn into equippable weapon version of a torch

### Content
* New Career Paths
  * Monster Hunter – mundane alternative to the Runebound Ranger, trained to specialize in one of several fighting style
  * Hunter Engineer – an Engineer that specializes in weapons, traps and gadgets designed to be effective against monsters
* More dwarven Runes

*If you have **any** suggestion or idea on new contents, open an [Issue](https://github.com/Forien/foundryvtt-forien-armoury/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md&title=) or hit me up on Discord!*




## Contact

If you wish to contact me for any reason, reach me out on Discord using my tag: `forien`




## Support

If you wish to support me, please consider [becoming my Patreon](https://www.patreon.com/forien) or donating [through Paypal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6P2RRX7HVEMV2&source=url). Thanks!




## Acknowledgments
_Disclaimer: I kept all acknowledgments, even if their respective work was lost during the Module's remake. Sorry for that._

* Thanks to Atropos for his relentless work on developing and improving the Foundry VTT
* Thanks to Moo Man for his great work developing the [WFRP4e game system](https://github.com/moo-man/WFRP4e-FoundryVTT) as well as for his invaluable help with understanding how to mod Foundry using JS
* Thanks to Thoradin for an idea for arrow reclamation feature :)
* Thanks to [DasSauerkraut](https://github.com/DasSauerkraut) for allowing me to integrate compendium from his [Gerwin Waffenhalter’s Magnificent Weapons Gallery](https://github.com/DasSauerkraut/wfrp-gwmwg) into my module
* Thanks to LeRatierBretonnien and Gharazel for providing French translation! 
* Thanks to ElCamino for providing German translation!




## License

Forien's Armoury is a module for Foundry VTT by Forien and is licensed under a MIT License.

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License for Package Development from March 2, 2023](https://foundryvtt.com/article/license/).

_To the best of my knowledge, all content in this module is either made by me, publicly available under permissive license or falls under Fair Use. Please bring infractions or concerns related to my module to my attention by contacting me via email presented on my GitHub profile._ 
