# FoundryVTT - Forien's Armoury
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/forien/foundryvtt-forien-armoury?style=for-the-badge) 
![GitHub Releases](https://img.shields.io/github/downloads/Forien/foundryvtt-forien-armoury/latest/total?style=for-the-badge)
![GitHub All Releases](https://img.shields.io/github/downloads/Forien/foundryvtt-forien-armoury/total?style=for-the-badge&label=Downloads+total)  
**[Compatibility]**: *FoundryVTT* 0.6.0+, *WFRP4e* 1.6.2   
**[Optional modules]**: *Babele* 1.19+ (required for translations)  
**[Languages]**: *English, French, German, Polish*  
[![](https://img.shields.io/badge/FoundryGet-compatible-success)](https://github.com/cswendrowski/foundryget)

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
This module allows GMs to enable an "arrow reclamation feature", which allows for some portion of ammunition (arrows, bolts and sling bullets) to be returned to players after an encounter. Defaults to even rolls. Must be enabled.

* 2 projectile Qualities and 3 projectile Flaws are also added to work with the feature


### Compendiums
Module contains single Compendium pack containing at the moment 34 items.

* Added Gambesons as an alternative to Leather armour
* Rebalanced Leather armour (is more expensive than Gambesons, but Durable)
* Added boiled Leather Bracers
* Added Cuirass (plate torso armour)
* Added Breastplate (covers front only)


* Added various Arrow types: Bodkin, Hunting, Leaf, Military, Shoddy — where Military replaces vanilla Arrow
* Added various Bolt types: Bodkin, Broad, Hunting, Needle, Standard — where Standard replaces vanilla Bolt
* Added Cracker Bullet for Sling (Blast 2 ammo)
* Added generic Ingredient item entities, one for each tradition.


## Future plans

### Features
* 

### Content
* 

*If you have **any** suggestion or idea on new contents, hit me up on Discord!*


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
