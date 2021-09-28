const UI = require('./UI.js');



/*
Ability attributes and their effects:
    Name: The name of the ability
    Status Effect: The status effect the ability afflicts
        Chance: The chance of the status effect proccing
        Duration: The duration of the status effect
    Target Type: The type of character the ability targets
    Number of Targets: the number of targets the ability targets
    Modifier: The strength/magic modifier (either or) of the ability
    Multiplier: The percentage of the strength/magic stat the ability will use for damage
*/
class Ability {
    constructor(name, statusEffect, chance, duration, targetType, numTargets, accuracy, modifier, multiplier) {
        this.name = name;
        this.statusEffect = statusEffect;
        this.chance = chance;
        this.duration = duration;
        this.targetType = targetType;
        this.numTargets = numTargets;
        this.accuracy = accuracy;
        this.modifier = modifier;
        this.multiplier = multiplier;
    }


    /*
    This function gets the available targets for the given character + ability
    Parameters:
        Game: The game the character is finding available targets in
        Character: The character using the ability
    Returns:
        Available Targets: The available targets for the given character + ability combination
    */
    getAvailableTargets(game, character) {
        var availableTargets;
        switch(this.getTargetType(character)) {
            //Player/ally healing player/ally
            case 1:
                availableTargets = game.stealthCheck(game.players.concat(game.allies), character);
                //Filters out allies that cannot receive healing
                availableTargets.filter(item => item.conditions.canReceiveHealing);
                break;
            //Player/ally attacking enemy
            case 2:
                availableTargets = game.stealthCheck(game.enemies, character);
                break;
            //Enemy attacking player/ally
            case 3:
                availableTargets = game.stealthCheck(game.players.concat(game.allies), character);
                break;
            //Enemy healing enemy
            case 4:
                availableTargets = game.stealthCheck(game.enemies, character);
                //Filters out enemies that cannot receive healing
                availableTargets.filter(item => item.conditions.canReceiveHealing);
                break;
            //Character type or ability target type unidentified
            default:
                return -1;
        }
        return availableTargets;
    }

    /*
    This function determines what type of target an ability should target
    Parameters:
        Character: The character using the ability
    Returns:
        Integer: Integer value denoting what type of character is attempting what
            1: Player/ally healing player/ally
            2: Player/ally attacking enemy
            3: Enemy healing enemy
            4: Enemy attacking player/ally
    */
    getTargetType(character) {
        //Player or ally healing another player or ally
        if((character.type === 'player' || character.type === 'ally') && this.targetType === 'ally') {
            return 1;
        }
        //Player or ally attacking an enemy
        else if((character.type === 'player' || character.type === 'ally') && this.targetType === 'enemy') {
            return 2;   
        }
        //Enemy attacking an ally or player
        else if(character.type === 'enemy' && this.targetType === 'enemy') {
            return 3;
        }
        //Enemy healing an enemy
        else if(character.type === 'enemy' && this.targetType === 'ally') {
            return 4;
        }
        else {
            return -1;
        }
    }


    toString() {
        return "Ability: " + this.name + "\n\tStatus Effect: " + this.statusEffect + "\n\t\tChance of Applying: " + this.chance + "\n\t\tDuration: " + this.duration + "\n\tTarget Type: " + this.targetType + "\n\tNumber of Targets: " + this.numTargets + "\n\tAccuracy: " + this.accuracy + "\n\tModifier: " + this.modifier + "\n\tMultiplier: " + this.multiplier; 
    }
}

module.exports = Ability