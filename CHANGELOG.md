# Changelog


## v4.X.X

### v4.0.3
* Endurance Test from Casting Fatigue will no longer initiate an Opposed Test
* Fix erroneous duplication when importing Merchant RollTables for Item Piles integration

### v4.0.2
* Fixed Magical Endurance CSS
* Updated Foundry API calls with namespaces to remove warnings
* Fixed inputs for Combat Fatigue and Pass Out not appearing in the Combat Tracker
* Includes changes in [v4.0.0-beta](#v4.0.0-beta) and [v4.0.1-beta](#v4.0.1-beta)

### v4.0.1-beta
* Fixed using Magic Scrolls
* Restrict GM actions to the active GM user
  * This will prevent the module attempting to call some actions for multiple  users at once in the rare case when
    someone has multiple GM users online at the same time. 

### v4.0.0-beta
* Refactored project's structure, introduced rollup
    - Changed how compendium data is stored, from `.json` to `.yml`.
    - Database files are built on release and shipped into zip without being directly commited in repository
    - Moved source files from `dist` to `src`
    - Moved sass stylesheets from `src/styles` to `styles`
    - Moved static files from `dist` and `src` to `static`
    - The entire codebase is now compiled into a single `forien-armoury.mjs` file, which should lower amount of files 
      browsers need to load, and also help narrowing down if an error comes from this module
* Verified for v13.342, set minimum compatibility at v13
* Moved SettingsApp, GrimoireSheet and ScrollSheet to ApplicationV2
* Replaced jQuery calls and event listeners with native JavaScript


## v3.X.X

### v3.5.1
* Fixed hidden `Submit` button due to insufficient Settings App height

### v3.5.0
* Added new Career path: Martial Artist
* Added 24 Templates spread across 6 archetypes: Archer, Assassin, Guard, Knight, Merchant and Soldier
* Added 10 variations of existing armour Items (like gambesons) supporting the **Archives of the Empire Vol. III** armour system
* Added Kettle Hat armour for both CRB armour system and **Archives of the Empire Vol. III** armour system
* Added option to automatically randomize Characteristics, Skills and Talents on created unlinked Tokens based on species (simulate C/S/T clicks)
* Added option to add random amount of money to unlinked Tokens upon creation.
* Added option to hide custom properties from dialog when editing Qualities and Flaws of an Item
* Moved settings for Automated Disease/Injury Progression into new Actors tab
* Fixed Injuries listeners not being registered on non-english localization

### v3.4.2
* Fix Check Career macro for WFPR4e 8.3.0

### v3.4.1
* Fix Item Repair macros throwing an error when Weapons have no integer Damage value – for example `SB` or blank ([#51](https://github.com/Forien/foundryvtt-forien-armoury/issues/51))
* Add support for Armour Items from `Archives of the Empire Vol. III` for Item Repair macros

### v3.4.0
* Added Automatic Injury Progression feature
* Updated Automatic Disease Progression feature to use system's functions for decrementation instead of custom ones
* Restored Merchants Compendium
* Minor fix to script in `Explorer's Backpack`. It will no longer throw console errors when bedroll or lantern is not found.  

### v3.3.0
* Added GM and Player Macros for toggling `Engaged` status
* Added `Explorer's Backpack`, which allows attaching a Bedroll and a Lantern
* Updated Document Event Listeners (`preCreateData`, `updateChecks`, `createChecks` and `deleteChecks`) to their new equivalents to match current WFRP4e code. This fixes:
  * Default Encumbrance and Rarity not applying to Grimoires and Scrolls
  * Scrolls not prompting to update Description
  * Grimoires not awarding spells when added to Actor (when equipping is not required)
  * Grimoires not taking spells away when removed from Actor (when equipping is not required)
* Updated references to some WFRP4e classes. This fixes `Item Repair` and `Generate Random Scroll` Macros.


### v3.2.0
* Fixed Grimoires not applying SourceId flag correctly, resulting in duplicating spells in very specific conditions
* Fixed spelling in Hooks registration after they have been renamed
* Added support for Character Sheet v2 introduced in WFRP4e 8.1.0 for Magical Endurance and Scrolls.

### v3.1.1
* Fixed multiple macros and features being broken due to renaming of Actor class from `ActorWfrp4e` to `ActorWFRP4e`
* Fixed Combat Fatigue not being handled due to API changes (scripts being moved from `game.wfrp4e.combat.scripts` to `CombatHelpers`)

### v3.1.0
* Updated for Active Effects using Data Models (with [Warhammer Library](https://foundryvtt.com/packages/warhammer-lib)) and verified for WFRP4e 8.0.1
* Created `Grimoire` type for Items.
  * This is new item type in the system, which allows to transfer spells from Grimoires without need to add spells themselves to an Actor.
  * It allows GMs to create items that award spells when held (or equipped, configurable) and take the spells away when grimoire is lost (or unequipped)
  * Memorized spells are not removed
  * Additional options to limit spells based on known language, lores, ability to Read/Write etc.

### v3.0.0
* Verified for Foundry v12 and set it as minimum version
* Fixed Slashing label error
* Fixed Poisonous applying on SL lower than rating instead higher than rating
* Changed deprecated calls `roll({async: false})` to `evaluateSync()` in Arrow Reclamation
* Fixed Magical Endurance not being retracted for directly casting spells if cost for using scrolls was set to 0
* Fixed Dialog Title in `Make Extended Lockpick Test` macro not being localized
  * This change does not require re-importing the macro 
* Fixed `Generate Ingredient for Spell` macro, and moved it to `Macros` class for better support in the future
  * This change requires re-importing the macro from Compendium
* Removed deprecated macros from Compendium


## v2.X.X

### v2.1.2
* Fixed the AP check for the Slashing weapon quality

### v2.1.1
* `Award XP` macro now offers checkboxes to deselect characters and/or companions from getting XP
* Added support for rerolling Combat Fatigue Tests
* Fixed input for Combat Fatigue not rendering without explicit ownership (affects mostly GMs)
* Arrows should no longer be duplicated in case of rerolling ranged tests
* "Fixed" the improved Gunpowder reducing the reload by 2 due to Foundry bug by changing script trigger 

### v2.1.0
* Fixed notification not showing when Actor can't use scroll due to quantity or language
* Fixed Applicable Effects not working from Chat Cards
* Added following GM only Macros:
  * Character Status summary — lets GM generate a quick table showing basic summary of party composition - careers, fate/resilience points, experience
  * Award XP with Companions — allows GM to award party the XP, based on whether Actors are in specified folders. Companions receive half.
* Added following GM & Player Macros:
  * Use Cantrip — allows using "Cants" using rules from `Archives of the Empire Vol.III`. Require duplication and setup
  * Make Extended Lockpick Test — allows both GMs and Players to create Extended Lockpick Tests for their characters to attempt. Configuration available

### v2.0.1
* Changed imrpoved blackpoweder reload scripts from `prepateData` to `prepareOwned` to fix Foundry's bug with 
  prepare data running twice on items
* Added options to `Scroll.prepareScrollTest()` method allowing to pass fields and options to Dialog

### v2.0.0
* Updated code to be compatible with wfrp4e v7.1.0, namely changed `actor.itemCategories` to `actor.itemTypes`
* Updated all effects to make them work properly with new Active Effect rework
* Created `Magic Scrolls` type for Items.
  * This is new item type in the system, which allows casting Spells from Scrolls, without need to add spell itself to an Actor
* Added "Generate Random Scroll" Macro, which improves the WoM macro by creating Magic Scroll Item
* New Weapon Rune
  * Rune of Fracture. Adds Impact, but damages weapon by 2 per attack.
* Added Runebound species with Reiklander and Orphaned subspecies
  * Added Rolltables for Runebound Career and Runebound Random Talents for use during Chargen
* Added Combat Fatigue rounds counter to Combat Tracker (thanks to silent_mark) 
* Added setting to allow automatic falling unconscious of characters from 0 wounds in CRB ruleset (thanks to silent_mark)
* Added 3 more Diseases: Jakob Kreutzfeld Disease, The Martyr's Smear and The Wither (thanks to RassilonMonk)
* Added 3 new Symptoms: Purblind, Wasting and Dementia (thanks to RassilonMonk)
* Added 15 new Petty Spells


## v1.X.X

### v1.4.1
* Fixed harmless console error that appeared when creating new Item on Actor that isn't a Disease

### v1.4.0
* Added accessory: Amulet of „Resilience“
* Added new career: Monster Hunter
  * This career utilizes one of three unique Fighting Styles and focuses on tracking down and fighting monstrous beasts
* Added new journal: Forien's Lore
  * Describing Hunters' Guild and Runebounds
* Added 8 new Talents
  * `Fighting Style (Any)` and `Fighting Master (Style)` along with variant for every of the three styles.
* Added 4 symptoms made by RassilonMonk
* Added 5 new Diseases by RassilonMonk
* Added a `Drunk` Trait
* Added a general Macro to quickly open the Forien's Armoury Settings
* Reworked structure of `.mjs` files in the module, since codebase grows
* Created Settings App, which allows to display settings in more visually appealing and intuitive way
* Modified some icons by adding a wfrp4e-style border to them.
* Improved the API and streamlined a lot of code responsible for handling ESModules.
  * API is now version `1.1.0`, should be backwards-compatible.
* Added `Casting Fatigue` feature, proposed and designed by VividOblivion. 
* Created a `WorldTimeObserver`, which allows me to track world time updates and fire off events based on passed time
* Hooked up Magical Endurance Regeneration (from Casting Fatigue) to the `WorldTimeObserver` for automated regeneration
  * This requires some time tracking module (like `Simple Calendar`) to actually modify the `World Time` setting.
* Created am Automatic Disease Progression, which will progress diseases' duration and incubation automatically
  * This requires some time tracking module (like `Simple Calendar`) to actually modify the `World Time` setting.
* Improved Debug readability, by adding tags based on ESModule name, as well as trace to warnings and errors. 

### v1.3.2
* Added full debug support. Can be enabled in settings (client side)
  * Use `Forien's Armoury` as filter in console to only see this module's messages

### v1.3.1
* Added three accessories: Amulet of „Protection“, Elegant Pipe and Spectacles
* Fixed arrow items' image paths
* Fixed weird edge case with Roll Limited Skill macro
* Fixed Combat Fatigue counting wrong amount of turns

### v1.3.0
* Reintroduced the Slashing, Recoverable and Unrecoverable properties for weapons and ammunition
* Introduced new Incendiary, Poisonous and Blinding qualities
* Unbreakable quality now ensures ammunition will be recovered
* Added Combat Fatigue feature (implementing Getting Tired from CRB p.168)
* Added new items
  * Cutlass, Light Bomb, Cracker Bullet, Razor Bullet, Poisoned Arrows, Fire Arrows, Winged Arrows
* Changed Torch (weapon) to use Incendiary quality instead of effect
* Added Repulsive trait
* Added macro for testing Advanced Skills with result limits
* Updated the Journals with new information
* Minor fixes to items (improved gunpowder, powder horns)
* Fixed error with Arrow Reclamation

### v1.2.1
* Fixed remaining item links in compendiums
* Fixed ReImport not deleting old stuff
### v1.2.0
* Fixed invalid item links for WFRP4e Core 4.0.0
* Removed stray debugger
### v1.1.6
* Fixed the Item Piles Rolltables looped import due to a bug with non-existing compendium in WFRP4e Core 4.0.0
### v1.1.5
* Fixed the "Percentage" modes for Ammo Reclamation not working properly
### v1.1.4
* Fixed serious bug that would delete all RollTables on Re-Importing the Item Piles Integration instead of only RollTables in one specific folder
### v1.1.3
* Fixed Repair Item feature not working without specified Type and Subtype
### v1.1.2
* Introduced various Price Tables by Nibbler

### v1.1.0
* Fixed some duplicated IDs from WFRP4e Core module (for example Potion Bag was overriding Sling Bag) (Issue #35)
* Fixed "Check Equipment for Repairs" macro that would not allow repairing damaged Armour if Armour only had 1 AP 
* Allowed "trapping" Torch to be lit up
  * This converts the Torch into an equippable "weapon"
* Effects on ATL Light items now have time limit set up for Time's Up module (Issue #34)
* Added an OPT-IN setting that will configure ATL presets to work well with Light items from Compendium (Issue #34)
* Done some groundwork to better support module integrations in the future.
* Added Item Piles Integration in form of a prefab Merchants and RollTables to be used to populate those Merchants (Issues #27, #28)
  * Added Import Rolltable feature along with Re-Import setting that will convert Rolltable entries from UiA to Core module if UiA is not installed
  * Added Service Items that work well with prefab Merchants, including Repair services
* Expanded Repair Item functionality to allow macro being run on GM side for the player, also to limit the types of items that can be repaired
* Changed "Check Career!" Macro to be built-in api functionality in preparation to be used in the upcoming Token Action HUD for WFRP4e
  * Also, that functionality now supports localization!

### v1.0.0
* **Completely rewrote the Module** for Foundry 11 and WFRP4e 6. 
  * Old version was made for Foundry 0.6 and WFRP4e 1.6
  * Leaving the old changelog as is, even though many things have been removed
* Changed License to MIT
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


## v0.X.X

### v0.2.X

#### v0.2.13
* Updated to work with WFRP 2.0.0 and higher
* Fixed dependency bug with FVTT 0.6.6

#### v0.2.12
* Possibly fixed bug with WFRP4e 2.0.0
* Adjustments to ingredients' descriptions in compendium

#### v0.2.11
* fixes to German translation by ElCamino

#### v0.2.10
* added German translation thanks to ElCamino

#### v0.2.9
* added French translation thanks to LeRatierBretonnien and Gharazel

#### v0.2.8
* added FoundryGet integration

#### v0.2.7
* fixed icons for WFRP 1.6.1
* upped compatibleCoreVersion to 0.6.3

#### v0.2.6
* fixed bug, where Bleeding was being applied even without Slashing
* added module setting that allows to disable Slashing rules 

#### v0.2.5
* Fixed some GWMWG weapons according to Rat Catchers Guild update, thanks to hamofficer
* Added support for retrieving arrows out of combat
* removed unnecessary logging

#### v0.2.4
* Added notification when combat ends about all recovered ammunition. Only owner and GM see it. 
* fixed Unbreakable
* added `i18nformat` helper for Handlebars that can either accept multiple arguments, or object of substitutes

#### v0.2.3
* prepared groundwork for translation using Babele to any language
* added automation for applying Bleed Conditions upon hit with Slashing weapon
* started translating Forien's Armoury compendium to Polish (all names and most descriptions done)

#### v0.2.2
* under DasSauerkraut's permission, integrated Gerwin Waffenhalter’s Magnificent Weapons Gallery weapons and slashing quality 
* prepared module for translation to Polish
* translated basic strings for now, Compendium still English only
* added check for ammunition to avoid errors on tests not using ammunition
* removed unnecessary logging

#### v0.2.1
* fixed links to changelog and readme in module.json

#### v0.2.0
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
* Created changelog

### v0.1.X

#### v0.1.7
* Fixed Arrow Recovery to use sockets, so it works for everyone, not only GM

#### v0.1.6 - Arrow Recovery
* Added arrow recovery feature with several rules
