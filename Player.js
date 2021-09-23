var Character = require('./Character.js');

/*
Player attributes and their effects:
    Name: The name of the character
    Abilities: The abilities the character has
    Strength: The physical attack stat for the character
    Defense: The physical defense stat for the character
    Wisdom: The magic attack stat for the character
    Resilience: The magic defense stat for the character
    Dexterity: The hit chance stat for the character
    Evasion: The dodge chance stat for the character
    Max Health: The total amount of health the character can have
    Current Health: The current amount of health the character has
    Luck: The crit chance stat for the character
    Speed: The speed stat for the character (when in the turn the character will attack)
    Status Effects: A list of status effects alongside their durations [[statusEffect, duration], [statusEffect, duration]]
    Type: specifies that this character is a player character
*/
class Player extends Character {
    constructor(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects) {
        super(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion,maxHealth, currentHealth, luck, speed, statusEffects);
        this.type = 'player';
        this.level = 1;
    }

    /*
    This function handles the initialization of a player character
    Parameters:
        Game: The game the player is being added to.
    Returns:
        None; The player will be added to the game specified in parameters.
    */
    initializePlayer(game) {
        var name = game.getUserInput("What would you like to name your character?");
        game.addPlayer(name, ["Punch", "Minor Heal", "Minor Arcane Beam"], 5, 3, 5, 3, 5, 3, 10, 10, 0, 25, []);
    }

    /*
    This function handles a player leveling up
    Parameters:
        Game: The game the player is leveling up in (necessary for getUserInput)
    Returns:
        None; mutates player stats based on the stat increases requested
    */
    levelUpPlayer(game) {
        var numStatIncreases = parseInt(this.level * .5);
        while(numStatIncreases > 0) {
            console.log(this.stats);
            var stat = game.getUserInput("Which stat would you like to increase? You can increase " + numStatIncreases + " more stats.");
            var statIncrease = this.increaseStat(stat);
            while(statIncrease === -1) {
                game.messageUser("That stat doesn't exist! Please try again.");
                var stat = game.getUserInput("Which stat would you like to increase? You can increase " + numStatIncreases + " more stats.");
                var statIncrease = this.increaseStat(stat);
            }
            game.messageUser("Your " + stat + " stat has increased by " + statIncrease + "!");
        }
        this.stats.currentHealth = this.stats.maxHealth;
    }

    /*
    This function increases a player's stat
    Parameters:
        Stat: The stat to be increased
    Returns:
        Integer: The amount the stat was increased by (or -1 if stat wasn't found)
    */
    increaseStat(stat) {
        switch(stat) {
            case 'strength':
                this.stats.strength += 1;
                return 1;
            case 'wisdom':
                this.stats.strength += 1;
                return 1;
            case 'defense':
                this.stats.defense += 1;
                return 1;
            case 'resilience':
                this.stats.resilience += 1;
                return 1;
            case 'dexterity':
                this.stats.dexterity += 1;
                return 1;
            case 'evasion':
                this.stats.evasion += 1;
                return 1;
            case 'maxHealth':
                this.stats.maxHealth += 5;
                return 5;
            case 'luck':
                this.stats.luck += 2;
                return 2;
            case 'speed':
                this.stats.speed += 5;
                return 5;
            //Stat not found
            default:
                return -1;
        }
    }
}

module.exports = Player