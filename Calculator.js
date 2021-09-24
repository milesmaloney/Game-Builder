const UI = require('./UI.js');


class Calculator {
    constructor() {}

    
    /*
    This function calculates whether or not the attack will hit
    Parameters:
        Character: The character who is attempting an attack
        Enemy: The enemy receiving the attack
        Ability: The ability being used
    Returns:
        Boolean: True if the attack hits, false if the attack misses
    */
    calculateHitOrMissDamage(character, enemy, ability) {
        //75% chance * dex:evasion ratio * accuracy% (chance of 0 left in as a potential edge case)
        if(this.calculateRandom(0, 100) * (character.stats.dexterity / enemy.stats.evasion) *  (ability.accuracy / 100) > 25) {
            return 1;
        }
        else {
            UI.messageUser(character.name + "'s " + ability.name + " attack has missed " + enemy.name + "!");
            return 0;
        }
    }
    
    
    /*
    This function calculates whether or not a healing ability will hit
    Parameters:
        Character: The character who is attempting to heal an ally
        Ally: The ally receiving the heal
        Ability: The ability being used
    Returns:
        Boolean: True if the healing is received, false if the healing fails
    */
    calculateHitOrMissHealing(character, ally, ability) {
        //80% chance * ally % missing hp * accuracy%
        if(this.calculateRandom(0, 100) * ((ally.stats.maxHealth - ally.stats.currentHealth) / ally.stats.maxHealth) * ability.accuracy > 20) {
            return 1;
        }
        else {
            UI.messageUser(character.name + "'s " + ability.name + " has missed " + ally.name + "!");
            return 0;
        }
    }


    /*
    This function calculates whether or not a status effect will hit
    Parameters:
        Ability: The ability being used (contains the chance of the status effect to hit)
    Returns:
        Boolean: True if the status effect is applied, or false if the status effect is not applied
    */
    calculateStatusEffect(ability) {
        if(ability.statusEffect != "none") {
            if(ability.chance > this.calculateRandom(1, 100)) {
                /*This means the status effect hits*/
                UI.messageUser(ability.statusEffect.toString() + " applied!");
                return 1;
            }
        }
        return 0;
    }


    /*
    This function calculates the damage of an ability given the player, enemy, and ability
    Parameters:
        Character: The character that is dealing damage
        Enemy: The enemy that is taking damage
        Ability: The ability that is dealing damage
    Returns:
        Damage: A number denoting the amount of damage that is dealt
    */
    calculateDamage(character, enemy, ability) {
        var damage;
        //ability multiplier * strength:defense ratio * strength
        if(ability.modifier === "strength") {
            damage = ability.multiplier * (character.stats.strength / enemy.stats.defense) * character.stats.strength;
        }
        //ability multiplier * wisdom:resilience ratio * wisdom
        else if(ability.modifier === "wisdom") {
            damage = ability.multiplier * (character.stats.wisdom / enemy.stats.resilience) * character.stats.wisdom;
        }
        else {
            return 0;
        }
        damage = parseInt(this.calculateCrit(character, damage));
        return damage;
    }
    
    
    /*
    This function will calculate the healing done from a healing spell (function for later changes)
    Parameters:
        Character: The character that is giving healing
        Ally: The ally that is receiving healing
        Ability: The ability that is being used
    Returns:
        Integer: Amount of healing given
    */
    calculateHealing(character, ability) {
        var healing = (character.stats.wisdom * ability.multiplier);
        healing = parseInt(this.calculateCrit(character, healing));
        return healing;
    }
    
    
    /*
    This function calculates whether or not an attack is a critical hit
    Parameters:
        Character: The character dealing damage or healing
        Value: The value of the damage or healing
    Returns:
        Value: The damage or healing after calculating the crit
    */
    calculateCrit(character, value) {
        //15% + luck chance
        if(character.stats.luck + this.calculateRandom(0, 100) > 85) {
            UI.messageUser("Critical Hit!");
            value *= 2;
        }
        return value;
    }
    
    
    /*
    This function calculates a random number between min and max (inclusive on both ends)
    Parameters:
        Min: The minimum number we want the random result to be
        Max: The maximum number we want the random result to be
    Returns:
        Int: A random integer between min and max
    */
    calculateRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

//Exports a singleton Calculator object
const exportCalculator = new Calculator();
module.exports = exportCalculator;