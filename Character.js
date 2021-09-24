const UI = require('./UI.js');


/*
Character attributes and their effects:
    Name: The name of the character
    Abilities: The abilities the character has
    Stats:
        Strength: The physical attack stat for the character (0 to 99)
            Increases character physical attack damage by strength %
        Defense: The physical defense stat for the character (0 to 99)
            Reduces enemy physical attack damage to this character by defense %
        Wisdom: The magic attack stat for the character (0 to 99)
            Increases character magic attack damage by wisdom %
        Resilience: The magic defense stat for the character (0 to 99)
            Reduces enemy magic attack damage to this character by resilience %
        Dexterity: The hit chance stat for the character (0 to 99)
            Increases the chance of hitting an enemy by dexterity %
        Evasion: The dodge chance stat for the character (0 to 99)
            Reduces the chance of being hit by an enemy by evasion %
        Max Health: The total amount of health the character can have (0 to 1000)
            Denotes the maximum amount of hp the character can have
        Current Health: The current amount of health the character has (0 to 1000)
            Denotes the current amount of hp the character has
        Luck: The crit chance stat for the character (0 to 99)
            Increases the chance that the character will land a critical hit
        Speed: The speed stat for the character (0 to 1000)
            Increases the chance that the character will appear sooner in the turn order
    Status Effects: A list of status effects alongside their durations [[statusEffect, duration], [statusEffect, duration]]
    Conditions: A list of conditions and whether they are currently affecting the character:
        hasTurn: returns true if the character has its turn, false if it doesn't
        canAttack: returns true if the character can attack on its turn, false if it can't
        canMagicAttack: returns true if the character can magically attack on its turn, false if it can't
        canPhysicalAttack: returns true if the character can physically attack on its turn, false if it can't
        canReceiveHealing: returns true if the character can receive healing, false if it can't
        canGiveHealing: returns true if the character can heal on its turn, false if it can't
        isStealthed: returns true if the character is invisible to other characters, false if it isn't
        seesStealth: returns true if the character can see all stealthed characters, false if it can't
        magicAttackReduction: integer between 0 and 100 denoting the percent of magic attack reduction on the character
        physicalAttackReduction: integer between 0 and 100 denoting the percent of physical attack reduction on the character
        damageTakenPerRound: integer denoting the amount of damage the character takes per round
        statReductions: Object containing an integer denoting the percentage a stat is reduced by for each stat (except currentHealth)
    NOTE: all stat changes are stored as percentages
*/
class Character {
    constructor(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects) {
        this.name = name;
        this.abilities = abilities;
        this.stats = {
            strength: strength,
            defense: defense,
            wisdom: wisdom,
            resilience: resilience,
            dexterity: dexterity,
            evasion: evasion,
            maxHealth: maxHealth,
            currentHealth: currentHealth,
            luck: luck,
            speed: speed
        }
        this.statusEffects = statusEffects;
        this.conditions = {
            hasTurn: 1,
            canAttack: 1,
            canMagicAttack: 1,
            canPhysicalAttack: 1,
            canReceiveHealing: 1,
            canGiveHealing: 1,
            isStealthed: 0,
            canStealth: 1,
            seesStealth: 0,
            magicAttackChange: 100,
            physicalAttackChange: 100,
            damageTakenPerRound: 0,
            statReductions: {
                strength: 100,
                wisdom: 100,
                defense: 100,
                resilience: 100,
                dexterity: 100,
                evasion: 100,
                luck: 100,
                speed: 100,
                maxHealth: 100
            }
        }
    }


        /*
    This function lists the available abilities for a character who is taking their turn
    Parameters:
        Game: The game that the character is being played in
    Returns:
        Available Abilities: An array of abilities available for the given character to use
    */
    getAvailableAbilities(game) {
        var availableAbilities = [];
        for(var i = 0; i < this.abilities.length; i++) {
            var currAbility = game.getAbilityByName(this.abilities[i]);
            if(!this.conditions.canAttack && currAbility.targetType === 'enemy') {
                continue;
            }
            else if(!this.conditions.canPhysicalAttack && currAbility.targetType === 'enemy' && currAbility.modifier === 'strength') {
                continue;
            }
            else if(!this.conditions.canMagicAttack && currAbility.targetType ===  'enemy' && currAbility.modifier === 'wisdom') {
                continue;
            }
            else if(!this.conditions.canGiveHealing && currAbility.targetType === 'ally') {
                continue;
            }
            else {
                availableAbilities.push(currAbility);
            }
        }
        if(availableAbilities.length === 0) {
            UI.messageUser(character.name + " has no available abilities to use on this turn. Continuing to next turn...");
            return -1;
        }
        else {
            return availableAbilities;
        }
    }



    /*
    This function applies a status effect to this character
    Parameters:
        Status effect: a StatusEffect object to be applied to the character
    Returns:
        None; the conditions property will be filled by the properties of the status effect
    */
    applyStatusEffect(statusEffect) {
        //TEST: console.log(statusEffect);
        if(statusEffect.endsTurn) {
            this.conditions.hasTurn = 0;
        }
        if(statusEffect.preventsAttacks) {
            this.conditions.canAttack = 0;
        }
        if(statusEffect.preventsMagicAttacks) {
            this.conditions.canMagicAttack = 0;
        }
        if(statusEffect.preventsPhysicalAttacks) {
            this.conditions.canPhysicalAttack = 0;
        }
        if(statusEffect.preventsIncomingHealing) {
            this.conditions.canReceiveHealing = 0;
        }
        if(statusEffect.preventsOutgoingHealing) {
            this.conditions.canGiveHealing = 0;
        }
        if(statusEffect.revealsStealth) {
            this.conditions.isStealthed = 0;
            this.conditions.canStealth = 0;
        }
        if(statusEffect.magicAttackReduction !== 0) {
            this.conditions.magicAttackChange -= statusEffect.magicAttackReduction;
        }
        if(statusEffect.physicalAttackReduction !== 0) {
            this.conditions.physicalAttackChange -= statusEffect.physicalAttackReduction;
        }
        if(statusEffect.damagePerRound !== 0) {
            this.conditions.damageTakenPerRound += statusEffect.damagePerRound;
        }
        for(var i = 0; i < statusEffect.statsReduced.length; i++) {
            this.changeStat(statusEffect.statsReduced[i].statReduced, statusEffect.statsReduced[i].reducedBy, 0);
        }
    }

    /*
    This function uses an array of booleans to store which conditions are remaining and which are expiring
    Parameters:
        None; this function uses the character's properties as parameters
    Returns:
        None; updates the characters conditions based on the remaining status effects
    */
    removeStatusEffects(game) {
        var booleanConditions = [0, 0, 0, 0, 0, 0, 0];
        for(var i = 0; i < this.statusEffects.length; i++) {
            var statusEffect = game.getStatusEffectByName(this.statusEffects[i].statusEffect);
            this.statusEffects[i].duration--;
            if(this.statusEffects[i].duration === 0) {  
                game.messageUser(this.name + " is no longer " + statusEffect.name + "!");
                if(statusEffect.magicAttackReduction !== 0) {
                    this.conditions.magicAttackChange += statusEffect.magicAttackReduction;
                }
                else if(statusEffect.physicalAttackReduction !== 0) {
                    this.conditions.physicalAttackChange += statusEffect.physicalAttackReduction;
                }
                else if(statusEffect.damagePerRound !== 0) {
                    this.conditions.damageTakenPerRound -= statusEffect.damagePerRound;
                }
                else if(statusEffect.statsReduced.length > 0) {
                    for(var j = 0; j < statusEffect.statsReduced.length; j++) {
                        this.changeStat(statusEffect.statsReduced[j].statReduced, statusEffect.statsReduced[j].reducedBy, 1);
                    }
                }
                this.statusEffects.splice(i, 1);
            }
            //Loops through remaining status effects to fill boolean conditions array
            else {
                if(statusEffect.endsTurn) {
                    booleanConditions[0] = 1;
                }
                else if(statusEffect.preventsAttacks) {
                    booleanConditions[1] = 1;
                }
                else if(statusEffect.preventsPhysicalAttacks) {
                    booleanConditions[2] = 1;
                }
                else if(statusEffect.preventsMagicAttacks) {
                    booleanConditions[3] = 1;
                }
                else if(statusEffect.preventsIncomingHealing) {
                    booleanConditions[4] = 1;
                }
                else if(statusEffect.preventsOutgoingHealing) {
                    booleanConditions[5] = 1;
                }
                else if(statusEffect.revealsStealth) {
                    booleanConditions[6] = 1;
                }
            }
        }
        //TEST: console.log("boolean conditions: " + booleanConditions);
        //Goes through boolean conditions array to determine character's status conditions
        if(!booleanConditions[0]) {
            this.conditions.hasTurn = 1;
        }
        else if(!booleanConditions[1]) {
            this.conditions.canAttack = 1;
        }
        else if(!booleanConditions[2]) {
            this.conditions.canPhysicalAttack = 1;
        }
        else if(!booleanConditions[3]) {
            this.conditions.canMagicAttack = 1;
        }
        else if(!booleanConditions[4]) {
            this.conditions.canReceiveHealing = 1;
        }
        else if(!booleanConditions[5]) {
            this.conditions.canGiveHealing = 1;
        }
        else if(!booleanConditions[6]) {
            this.conditions.canStealth = 1;
        }
    }

    /*
    This function changes the stats of the given character by a percentage denoted by change (between 0 and 1)
    Parameters:
        Stat: The stat to be changed
        Change: The amount the stat will be changed by (between 0 and 100)
    Returns:
        None; The function will update the Character object's attributes
    */
    changeStat(stat, change, revert) {
        change = change / 100;
        switch(stat) {
            case 'strength':
                if(revert) {
                    this.conditions.statReductions.strength += (100 - (100 * change));
                    this.stats.strength /= change;
                }
                else {
                    this.conditions.statReductions.strength -= (100 - (100 * change));
                    this.stats.strength *= change;
                }
            case 'wisdom':
                if(revert) {
                    this.conditions.statReductions.wisdom += (100 - (100 * change));
                    this.stats.wisdom /= change;
                }
                else {
                    this.conditions.statReductions.wisdom -= (100 - (100 * change));
                    this.stats.wisdom *= change;
                }
            case 'defense':
                if(revert) {
                    this.conditions.statReductions.defense += (100 - (100 * change));
                    this.stats.defense /= change;
                }
                else {
                    this.conditions.statReductions.defense -= (100 - (100 * change));
                    this.stats.defense *= change;
                }
            case 'resilience':
                if(revert) {
                    this.conditions.statReductions.resilience += (100 - (100 * change));
                    this.stats.resilience /= change;
                }
                else {
                    this.conditions.statReductions.resilience -= (100 - (100 * change));
                    this.stats.resilience *= change;
                }
            case 'dexterity':
                if(revert) {
                    this.conditions.statReductions.dexterity += (100 - (100 * change));
                    this.stats.dexterity /= change;
                }
                else {
                    this.conditions.statReductions.dexterity -= (100 - (100 * change));
                    this.stats.dexterity *= change;
                }
            case 'evasion':
                if(revert) {
                    this.conditions.statReductions.evasion += (100 - (100 * change));
                    this.stats.evasion /= change;
                }
                else {
                    this.conditions.statReductions.evasion -= (100 - (100 * change));
                    this.stats.evasion *= change;
                }
            case 'maxHealth':
                if(revert) {
                    this.conditions.statReductions.maxHealth += (100 - (100 * change));
                    this.stats.maxHealth /= change;
                }
                else {
                    this.conditions.statReductions.maxHealth -= (100 - (100 * change));
                    this.stats.maxHealth *= change;
                }
            //Kept for potential % Health abilities (change > 100 for healing)
            case 'currentHealth':
                this.stats.currentHealth = this.stats.currentHealth * change;
                break;
            case 'luck':
                if(revert) {
                    this.conditions.statReductions.luck += (100 - (100 * change));
                    this.stats.luck /= change;
                }
                else {
                    this.conditions.statReductions.luck -= (100 - (100 * change));
                    this.stats.luck *= change;
                }
                break;
            case 'speed':
                if(revert) {
                    this.conditions.statReductions.speed += (100 - (100 * change));
                    this.stats.speed /= change;
                }
                else {
                    this.conditions.statReductions.speed -= (100 - (100 * change));
                    this.stats.speed *= change;
                }
                break;
        }
    }


    updateStatReduction(stat, change) {
        //TEST: console.log("stat before: " + stat)
        //TEST: console.log("change: " + change);
        //gets the original stat change percentage (e.g. 50 for 50%)
        change = change * 100;
        stat -= stat - (100 - change);
        //TEST: console.log("stat after: " + stat)
    }


    reduceStatsByStatusEffect(statusEffect) {
        if(statusEffect.statsReduced.length !== 0) {
            for(var i = 0; i < statusEffect.statsReduced.length; i++) {
                this.changeStat(statusEffect.statsReduced.statReduced, statusEffect.statsReduced.reducedBy);
            }
        }
    }


    toString() {
        return ("Character: " + this.name + "\n\tStrength: " + this.stats.strength.toString() + "\n\tDefense: " + this.stats.defense.toString() + "\n\tWisdom: " + this.stats.wisdom.toString() + "\n\tResilience: " + this.stats.resilience.toString() + "\n\tDexterity: " + this.stats.dexterity.toString() + "\n\tEvasion: " + this.stats.evasion.toString() + "\n\tMax Health: " + this.stats.maxHealth.toString() + "\n\tCurrent Health: " + this.stats.currentHealth.toString() + "\n\tLuck: " + this.stats.currentHealth.toString() + "\n\tSpeed: " + this.stats.speed.toString() + "\n");
    }

    promptString() {
        return "Name: " + this.name + " Health: " + this.stats.currentHealth;
    }
}

module.exports = Character