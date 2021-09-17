/*
Character attributes and their effects:
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
*/

class Character {
    constructor(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects) {
        this.name = name;
        this.abilities = abilities;
        this.strength = strength;
        this.defense = defense;
        this.wisdom = wisdom;
        this.resilience = resilience;
        this.dexterity = dexterity;
        this.evasion = evasion;
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
        this.luck = luck;
        this.speed = speed;
        this.statusEffects = statusEffects;
    }


    /*
    This function changes the stats of the given character by a percentage denoted by change (between 0 and 1)
    Parameters:
        Stat: The stat to be changed
        Change: The amount the stat will be changed by
    Returns:
        None; The function will update the Character object's attributes
    */
    changeStat(stat, change) {
        switch(stat) {
            case 'strength':
                this.strength = this.strength * change;
                break;
            case 'defense':
                this.defense = this.defense * change;
                break;
            case 'wisdom':
                this.wisdom = this.wisdom * change;
                break;
            case 'resilience':
                this.resilience = this.resilience * change;
                break;
            case 'dexterity':
                this.dexterity = this.dexterity * change;
                break;
            case 'evasion':
                this.evasion = this.evasion * change;
                break;
            case 'maxHealth':
                this.maxHealth = this.maxHealth * change;
                break;
            case 'currentHealth':
                this.currentHealth = this.currentHealth * change;
                break;
            case 'luck':
                this.luck = this.luck * change;
                break;
            case 'speed':
                this.speed = this.speed * change;
                break;
        }
    }


    reduceStatsByStatusEffect(statusEffect) {
        if(statusEffect.statsReduced.length !== 0) {
            for(var i = 0; i < statusEffect.statsReduced.length; i++) {
                this.changeStat(statusEffect.statsReduced.statReduced, statusEffect.statsReduced.reducedBy);
            }
        }
    }


    toString() {
        return ("\n\tStrength: " + this.strength.toString() + "\n\tDefense: " + this.defense.toString() + "\n\tWisdom: " + this.wisdom.toString() + "\n\tResilience: " + this.resilience.toString() + "\n\tDexterity: " + this.dexterity.toString() + "\n\tEvasion: " + this.evasion.toString() + "\n\tMax Health: " + this.maxHealth.toString() + "\n\tCurrent Health: " + this.currentHealth.toString() + "\n\tLuck: " + this.currentHealth.toString() + "\n\tSpeed: " + this.speed.toString());
    }
}

module.exports = Character