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

    changeStat(stat, change) {
        switch(stat) {
            case 'strength':
                this.strength = this.strength * change;
            case 'defense':
                this.defense = this.defense * change;
            case 'wisdom':
                this.wisdom = this.wisdom * change;
            case 'resilience':
                this.resilience = this.resilience * change;
            case 'dexterity':
                this.dexterity = this.dexterity * change;
            case 'evasion':
                this.evasion = this.evasion * change;
            case 'maxHealth':
                this.maxHealth = this.maxHealth * change;
            case 'currentHealth':
                this.currentHealth = this.currentHealth * change;
            case 'luck':
                this.luck = this.luck * change;
            case 'speed':
                this.speed = this.speed * change;
        }
    }
}

module.exports = Character