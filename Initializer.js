const UI = require('./UI.js');

class Initializer {
    constructor() {
    }

    initializeGame(game) {
        this.initializeStatusEffects(game);
        this.initializeAbilities(game);
        this.initializeCharacterClasses(game);
        this.initializeEnemies(game);
        this.initializeAllies(game);
        this.initializePlayers(game);
        return game;
    }

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

    initializeAbilities(game) {
        //Initialize abilities (100 targets = all targets)
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
                speed: 5
            },
            abilities: [{level: 2, availableAbilities: ['Minor Heal']}, {level: 5, availableAbilities: ['Slice', 'Minor Group Heal']}]
        })

        game.addCharacterClass('Warrior', 'The warrior was made for battle. The warrior spends its time challenging those who dare stand in their way.', ['Slice', 'Sweep'], 4, 1, 4, 2, 3, 1, 30, 5, 23, {
            stats: {
                strength: 0.80,
                wisdom: 0.2,
                defense: 0.75,
                resilience: 0.4,
                dexterity: 0.6,
                evasion: 0.45,
                luck: 0.66,
                speed: 7
            },
            abilities: [{level: 2, availableAbilities: 'Punch'}, {level: 5, availableAbilities: ['Minor Arcane Beam', 'Minor Group Heal']}]
        });
    }

    initializeEnemies(game) {
        //Initialize Enemies
        game.addEnemy("Enemy 1", ["Punch","Minor Arcane Beam", "Slice", "Minor Heal"], 5, 5, 5, 5, 5, 5, 25, 25, 5, 50, []);
        game.addEnemy("Enemy 2", ["Minor Group Heal", "Minor Arcane Beam", "Sweep"], 5, 5, 5, 5, 5, 5, 25, 25, 5, 50, []);
    }

    initializeAllies(game) {
        //Initialize Allies
        game.addAlly("Ally 1", [ "Minor Heal", "Minor Arcane Beam", "Minor Arcane Barrage" ], 5, 5, 5, 5, 5, 5, 25, 25, 5, 50, []);
    }

    initializePlayers(game) {
        var numPlayers = UI.checkForUserApproval("How many players would like to play?", "Are you sure the number of players that would like to play is ");
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
}

const init = new Initializer();
module.exports = init;