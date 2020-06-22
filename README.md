# FoundryVTT - Forien's Armoury
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/forien/foundryvtt-forien-armoury?style=for-the-badge)  ![GitHub Releases](https://img.shields.io/github/downloads/Forien/foundryvtt-forien-armoury/latest/total?style=for-the-badge)    
**[Compatibility]**: *FoundryVTT* 0.6.0+, *WFRP4e* 1.6.0+   
**[Optional modules]**: *Babele* 1.19+ (required for translations)  
[![](https://img.shields.io/badge/FoundryGet-compatible-success)](https://github.com/cswendrowski/foundryget)

This module is a collection of custom trappings and features for Warhammer Fantasy Role-Play 4th edition game system for Foundry Virtual Table Top

#### Notable changes in v0.2.*
* Extended Arrow Recovery system with more rules
* Added new qualities and flaws to use with projectiles:
  * Unbreakable (used extisting quality) – projectiles is always recovered, bypassing rules, as long as it is recoverable (settings/quailities)
  * Recoverable – projectile can be recovered, even if settings won't allow it
  * Unrecoverable – projectile always perishes, will never be recovered
  * Sturdy – projectile is sturdy and easier to recover
  * Frail – projectile breaks easily and is harder to recover
  * Hard To Find – projectile is hard to find, if it would be recovered, roll again with -10 modifier
* Added new qualities and flaws to some items in compendium
* Added variants for lead and stone bullets that use projectile qualities and flaws
* Under DasSauerkraut's permission, integrated Gerwin Waffenhalter’s Magnificent Weapons Gallery weapons and slashing quality 
* Added automation for applying Bleed Conditions upon hit with Slashing weapon
* Prepared groundwork for translation using Babele to any language
* Started translating Forien's Armoury compendium to Polish (all names and most descriptions done)
* Added notification when combat ends about all recovered ammunition. Only owner and GM see it. 
* Restored support for retrieving ammunition out of combat 


## Installation

### Recommended: Install via [FoundryGet](https://github.com/cswendrowski/foundryget)

FoundryGet will automatically install downstream dependencies such as Babele and manage version conflicts.

```
foundryget install https://raw.githubusercontent.com/Forien/foundryvtt-forien-armoury/master/module.json
```

Once installed, while in World using WFRP4e game system, enable Forien's Armoury module

### Manual

1. Install [WFRP4e Game System](https://github.com/CatoThe1stElder/WFRP-4th-Edition-FoundryVTT).
2. Install Forien's Armoury using manifest URL: https://raw.githubusercontent.com/Forien/foundryvtt-forien-armoury/master/module.json
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
* Added Cuirass (basically Plate Breastplate)
* Added Breastplate (covers front only)
* Added various Arrow types: Bodkin, Hunting, Leaf, Military, Shoddy — where Military replaces vanilla Arrow
* Added various Bolt types: Bodkin, Broad, Hunting, Needle, Standard — where Standard replaces vanilla Bolt
* Added Cracker Bullet for Sling (Blast 2 ammo)
* Added generic Ingredient item entities, one for each tradition.


## Future plans

### Features
* add checkboxes in weapon test dialog that would allow to override arrow recovery system

### Content
* Translating Compendium to Polish using Babele
* Maybe some non-combat trappings as well
* Create specific ingredients instead of generic ones

*If you have **any** suggestion or idea on new contents, hit me up on Discord!*


## Contact

If you wish to contact me for any reason, reach me out on Discord using my tag: `Forien#2130`

## Support

If you wish to support me, please consider [becoming my Patreon](https://www.patreon.com/forien) or donating [through Paypal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6P2RRX7HVEMV2&source=url). Thanks!


## Acknowledgments

* Thanks to Atropos for his relentless work on developing and improving the Foundry VTT
* Thanks to Moo Man for his great work developing the [WFRP4e game system](https://github.com/CatoThe1stElder/WFRP-4th-Edition-FoundryVTT) as well as for his invaluable help with understanding how to mod Foundry using JS
* Thanks to Thoradin for an idea for arrow reclamation feature :)
* Thanks to [DasSauerkraut](https://github.com/DasSauerkraut) for allowing me to integrate compendium from his [Gerwin Waffenhalter’s Magnificent Weapons Gallery](https://github.com/DasSauerkraut/wfrp-gwmwg) into my module
* Thanks to LeRatierBretonnien and Gharazel for providing French translation! 


## License

Forien's Armoury is a module for Foundry VTT by Forien and is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development from May 29, 2020](https://foundryvtt.com/article/license/).
