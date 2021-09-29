const UI = require('./UI.js');
const Calculator = require('./Calculator.js');


class Initializer {
    constructor() {
    }

    /*
    This function initializes the game using the other functions of the Initializer
    Parameter:
        Game: The empty constructed game object being initialized
    Returns:
        Game: The filled game object after being initialized
    */
    initializeGame(game) {
        this.initializeStatusEffects(game);
        this.initializeAbilities(game);
        this.initializeCharacterClasses(game);
        this.initializeAllies(game);
        this.initializePlayers(game);
        this.initializeEnemies(game);
        this.initializeStatusEffectsOnCharacters(game);
        return game;
    }

    /*
    This function initializes the status effects for the game
    Parameters:
        Game: The game being initialized
    Returns:
        None; creates character classes for the game
    */
    initializeStatusEffects(game) {
        //Damage reduction status effects
        game.addStatusEffect("unfocused", "Unfocused characters have their magic damage reduced by 25%", 0, 0, 0, 0, 0, 0, 0, 25);
        game.addStatusEffect("disarmed", "Disarmed characters have their physical damage reduced by 25%", 0, 0, 0, 0, 0, 0, 0, 0, 25);

        //Stat status effects
        game.addStatusEffect("weakened", "Weakened characters have their strength reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "strength", reducedBy: 50 }]);
        game.addStatusEffect("exposed", "Exposed characters have their defense reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "defense", reducedBy: 50 }]);
        game.addStatusEffect("confused", "Confused characters have their wisdom reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "wisdom", reducedBy: 50 }]);
        game.addStatusEffect("intimidated", "Intimidated characters have their resilience reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "resilience", reducedBy: 50 }]);
        game.addStatusEffect("dazed", "Dazed characters have their dexterity reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "dexterity", reducedBy: 50 }]);
        game.addStatusEffect("surrounded", "Surrounded characters have their evasion reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "evasion", reducedBy: 50 }]);
        game.addStatusEffect("cursed", "Cursed opponents have their luck reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,[{ statReduced: "luck", reducedBy: 50 }]);
        game.addStatusEffect("slowed", "Slowed characters have their speed reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "speed", reducedBy: 50 }]);

        //Damage status effects
        game.addStatusEffect("bleeding", "Bleeding characters will take damage at the end of each turn rotation", 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);

        //Base status effect (for abilities, not characters)
        game.addStatusEffect("none", "Abilities with no status effect behave as normal");
    }

    /*
    This function initializes the abilities for the game
    Parameters:
        Game: The game being initialized
    Returns:
        None; creates character classes for the game
    */
    initializeAbilities(game) {
        //Initialize abilities (100 targets = all targets)
        //Generic Pass Ability
        game.addAbility("Pass", "none", 0, 0, 'ally', 0, 0, 'wisdom', 0.0);

        //Single Target Physical Attacks
        game.addAbility("Slice", "bleeding", 33, 1, "enemy", 1, 90, "strength", 0.66);
        game.addAbility("Punch", "none", 0, 0, "enemy", 1, 100, "strength", 1.0);

        //Multi Target Physical Attacks
        game.addAbility("Sweep", "none", 0, 0, "enemy", 12, 70, "strength", 0.5);

        //Single Target Healing Abilities
        game.addAbility("Minor Heal", "none", 0, 0, "ally", 1, 100, "wisdom", 0.5);

        //Multi Target Healing Abilities
        game.addAbility("Minor Group Heal", "none", 0, 0, "ally", 12, 70, "wisdom", 0.25);

        //Single Target Magical Attacks
        game.addAbility("Minor Arcane Beam", "none", 0, 0, "enemy", 1, 80, "wisdom", 1.0);

        //Multi Target Magical Attacks
        game.addAbility("Minor Arcane Barrage", "none", 0, 0, "enemy", 12, 70, "wisdom", 0.4);
    }

    /*
    This function initializes the character classes for the game
    Parameters:
        Game: The game being initialized
    Returns:
        None; creates character classes for the game
    */
    initializeCharacterClasses(game) {
        game.addCharacterClass('Arcane Mage', 'The arcane mage is attuned to the arcane arts, and focuses its time and energy on studying the workings of magic.', ['Minor Arcane Beam', 'Minor Arcane Barrage'], 1, 5, 1, 3, 4, 2, 20, 1, 15, {
            stats: {
                strength: 0.25,
                wisdom: 0.75,
                defense: 0.30,
                resilience: 0.66,
                dexterity: 0.60,
                evasion: 0.35,
                luck: 0.5,
                speed: 5,
                maxHealth: 3
            },
            abilities: [{level: 2, availableAbilities: ['Minor Heal']}, {level: 5, availableAbilities: ['Slice', 'Minor Group Heal']}]
        });

        game.addCharacterClass('Warrior', 'The warrior was made for battle. The warrior spends its time challenging those who dare stand in their way.', ['Slice', 'Sweep'], 4, 1, 4, 2, 3, 1, 30, 5, 23, {
            stats: {
                strength: 0.80,
                wisdom: 0.2,
                defense: 0.75,
                resilience: 0.4,
                dexterity: 0.6,
                evasion: 0.45,
                luck: 0.66,
                speed: 7,
                maxHealth: 5
            },
            abilities: [{level: 2, availableAbilities: 'Punch'}, {level: 5, availableAbilities: ['Minor Arcane Beam', 'Minor Group Heal']}]
        });

        game.addCharacterClass('Warden', 'The warden seeks to protect life wherever they can. They would sooner heal an ally than attack a foe.', ['Minor Heal', 'Minor Group Heal'], 1, 3, 4, 4, 2, 2, 15, 4, 14, {
            stats: {
                strength: 0.10,
                wisdom: 0.75,
                defense: 0.90,
                resilience: 0.95,
                dexterity: 0.4,
                evasion: 0.3,
                luck: 0.55,
                speed: 5,
                maxHealth: 4
            },
            abilities: [{level: 2, availableAbilities: 'Minor Arcane Beam'}, {level: 5, availableAbilities: ['Minor Arcane Barrage', 'Slice']}]
        });
    }

    /*
    This function initializes the enemies in the game
    Parameters:
        Game: The game being initialized
    Returns:
        None; creates enemies in the game
    */
    initializeEnemies(game) {
        //Initialize Enemies
        for(var i = 0; i < 3; i++) {
            this.initializeEnemy(game);
        }
    }

    initializeEnemy(game) {
        var playerParty = game.players.concat(game.allies);
        var statSummation = {strength: 0, wisdom: 0, defense: 0, resilience: 0, dexterity: 0, evasion: 0, luck: 0, speed: 0, maxHealth: 0};
        for(var i = 0; i <  playerParty.length; i++) {
            statSummation.strength += playerParty[i].stats.strength;
            statSummation.wisdom += playerParty[i].stats.wisdom;
            statSummation.defense += playerParty[i].stats.defense;
            statSummation.resilience += playerParty[i].stats.resilience;
            statSummation.dexterity += playerParty[i].stats.dexterity;
            statSummation.evasion += playerParty[i].stats.evasion;
            statSummation.luck += playerParty[i].stats.luck;
            statSummation.speed += playerParty[i].stats.speed;
            statSummation.maxHealth += playerParty[i].stats.maxHealth;
        }
        statSummation.strength /= playerParty.length;
        statSummation.wisdom /= playerParty.length;
        statSummation.defense /= playerParty.length;
        statSummation.resilience /= playerParty.length;
        statSummation.dexterity /= playerParty.length;
        statSummation.evasion /= playerParty.length;
        statSummation.luck /= playerParty.length;
        statSummation.speed /= playerParty.length;
        statSummation.maxHealth /= playerParty.length;
        var numRandomDecreases = Calculator.calculateRandom(0, 9);
        var numRandomIncreases = Calculator.calculateRandom(0, 9);
        for(var i = 0; i < Math.max(numRandomDecreases, numRandomDecreases); i++) {
            if(numRandomIncreases !== 0) {
                this.randomlyChangeStatFromStatSummation(statSummation, 1.1);
            }
            if(numRandomDecreases !== 0) {
                this.randomlyChangeStatFromStatSummation(statSummation, 0.9);
            }
        }
        game.addEnemyByType(statSummation, Calculator.calculateRandom(0, 2));
    }



    randomlyChangeStatFromStatSummation(object, change) {
        var randomStat = Calculator.calculateRandom(1, 9);
        switch(randomStat) {
            case 1:
                object.strength *= change;
                break;
            case 2:
                object.wisdom *= change;
                break;
            case 3:
                object.defense *= change;
                break;
            case 4:
                object.resilience *= change;
                break;
            case 5:
                object.dexterity *= change;
                break;
            case 6:
                object.evasion *= change;
                break;
            case 7:
                object.luck *= change;
                break;
            case 8:
                object.speed *= change;
                break;
            case 9:
                object.maxHealth *= change;
                break;
        }
    }

    /*
    This function initializes the allies in the game
    Parameters:
        Game: The game being initialized
    Returns:
        None; creates allies in the game
    */
    initializeAllies(game) {
        var randomClass = game.characterClasses[Calculator.calculateRandom(0, game.characterClasses.length - 1)];
        //Reroll once if the random class matches that of an existing player
        if(game.players.filter(item => item.className === randomClass.name) >= 1) {
            randomClass = game.characterClasses[Calculator.calculateRandom(0, game.characterClasses.length - 1)];
        }
        var numClassExisting = game.allies.filter(item => item.className = randomClass.name);
        game.addAlly(randomClass.name + " " + (numClassExisting + 1), randomClass.name, randomClass.abilities, randomClass.baseStats.strength, randomClass.baseStats.defense, randomClass.baseStats.wisdom, randomClass.baseStats.resilience, randomClass.baseStats.dexterity, randomClass.baseStats.evasion, randomClass.baseStats.maxHealth, randomClass.baseStats.maxHealth, randomClass.baseStats.luck, randomClass.baseStats.speed, []);
    }

    /*
    This function checks for multiple players and initializes each player
    Parameters:
        Game: The game being initialized
    Returns:
        None; creates players in the game with base stats based on character class
    */
    initializePlayers(game) {
        const validatePlayerNumber = (numPlayers) => {
            if(parseInt(numPlayers) > 8 || isNaN(parseInt(numPlayers)) || parseInt(numPlayers) <= 0) {
                UI.messageUser("Please select a number between 1 and 8.", 1);
                return 0;
            }
            else {
                return 1;
            }
        }
        var numPlayers = UI.checkForUserApproval("How many players would like to play?", "Are you sure the number of players that would like to play is ", validatePlayerNumber);
        //Initialize Players
        for(var i = 0; i < numPlayers; i++) {
            this.initializePlayer(game);
        }
    }

    /*
    This function handles the initialization of a player character
    Parameters:
        Game: The game the player is being added to.
    Returns:
        None; The player will be added to the game specified in parameters.
    */
    initializePlayer(game) {
        var character = UI.promptforNewPlayer(game);
        var charClass = game.getCharacterClassByName(character.class);
        game.addPlayer(character.name, charClass.name, charClass.abilities, charClass.baseStats.strength, charClass.baseStats.wisdom, charClass.baseStats.defense, charClass.baseStats.resilience, charClass.baseStats.dexterity, charClass.baseStats.evasion, charClass.baseStats.maxHealth, charClass.baseStats.maxHealth, charClass.baseStats.luck, charClass.baseStats.speed, []);
        UI.messageUser(character.name + " has joined the battle!");
    }


    /*
    This function will initialize status effects when any characters are constructed with pre-determined status effects
     Parameters:
        Game: the game being initialized
     Returns:
        None; applies status effects to characters, including
     */
    initializeStatusEffectsOnCharacters(game) {
        const characters = game.players.concat(game.allies).concat(game.enemies);
        for (var i = 0; i < characters.length; i++) {
            for(var j = 0; j < characters[i].statusEffects.length; j++) {
                characters[i].applyStatusEffect(this.getStatusEffectByName(characters[i].statusEffects[j].statusEffect));
            }
        }
    }
}

const init = new Initializer();
module.exports = init;