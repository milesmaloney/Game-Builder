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



    applyStatusEffect(statusEffect) {
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
            this.conditions.magicAttackChange *= (statusEffect.magicAttackReduction / 100);
        }
        if(statusEffect.physicalAttackReduction !== 0) {
            this.conditions.physicalAttackChange *= (statusEffect.physicalAttackReduction / 100);
        }
        if(statusEffect.damagePerRound !== 0) {
            this.conditions.damageTakenPerRound += statusEffect.damagePerRound;
        }
        for(var i = 0; i < statusEffect.statsReduced.length; i++) {
            this.changeStat(statusEffect.statsReduced.statReduced, statusEffect.statsReduced.reducedBy)
        }
    }

    /*
    This function uses an array of booleans to store which conditions are remaining and which are expiring
    Parameters:
        None; this function uses the character's properties as parameters
    Returns:
        None; updates the characters conditions based on the remaining status effects
    */
    removeStatusEffects() {
        booleanConditions = [0, 0, 0, 0, 0, 0, 0]
        for(var i = 0; i < statusEffects.length; i++) {
            statusEffects[i].duration--;
            if(statusEffects[i].duration === 0) {
                if(statusEffects[i].magicAttackReduction != 0) {
                    this.conditions.magicAttackChange /= (statusEffects[i].magicAttackReduction / 100);
                }
                else if(statusEffects[i].physicalAttackReduction != 0) {
                    this.conditions.physicalAttackChange /= (statusEffects[i].physicalAttackReduction / 100);
                }
                else if(statusEffects[i].damagePerRound != 0) {
                    this.conditions.damageTakenPerRound -= statusEffects[i].damagePerRound;
                }
                else if(statusEffects[i].statsReduced.length > 0) {
                    for(var j = 0; j < statusEffects[i].statsReduced.length; j++) {
                        //TODO: uncertain of this math (1/reducedBy). Need to double check.
                        this.changeStat(statusEffects[i].statsReduced.statReduced, (1 / statusEffects[i].statReduced.reducedBy));
                    }
                }
            }
            //Loops through remaining status effects to fill boolean conditions array
            else {
                if(statusEffects[i].endsTurn) {
                    booleanConditions[0] = 1;
                }
                else if(statusEffects[i].preventsAttacks) {
                    booleanConditions[1] = 1;
                }
                else if(statusEffects[i].preventsPhysicalAttacks) {
                    booleanConditions[2] = 1;
                }
                else if(statusEffects[i].preventsMagicAttacks) {
                    booleanConditions[3] = 1;
                }
                else if(statusEffects[i].preventsIncomingHealing) {
                    booleanConditions[4] = 1;
                }
                else if(statusEffects[i].preventsOutgoingHealing) {
                    booleanConditions[5] = 1;
                }
                else if(statusEffects[i].revealsStealth) {
                    booleanConditions[6] = 1;
                }
            }
        }
        //Goes through boolean conditions array to determine character's status conditions
        if(!booleanConditions[0]) {
            this.hasTurn = 1;
        }
        else if(!booleanConditions[1]) {
            this.canAttack = 1;
        }
        else if(!booleanConditions[2]) {
            this.canPhysicalAttack = 1;
        }
        else if(!booleanConditions[3]) {
            this.canMagicAttack = 1;
        }
        else if(!booleanConditions[4]) {
            this.canReceiveHealing = 1;
        }
        else if(!booleanConditions[5]) {
            this.canGiveHealing = 1;
        }
        else if(!booleanConditions[6]) {
            this.canStealth = 1;
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
    changeStat(stat, change) {
        change = (change / 100);
        switch(stat) {
            case 'strength':
                this.updateStatReduction(this.conditions.statReductions.strength, change);
                this.stats.strength = this.strength * change;
                break;
            case 'wisdom':
                this.updateStatReduction(this.conditions.statReductions.wisdom, change);
                this.stats.wisdom = this.wisdom * change;
                break;
            case 'defense':
                this.updateStatReduction(this.conditions.statReductions.defense, change);
                this.stats.defense = this.defense * change;
                break;
            case 'resilience':
                this.updateStatReduction(this.conditions.statReductions.resilience, change);
                this.stats.resilience = this.resilience * change;
                break;
            case 'dexterity':
                this.updateStatReduction(this.conditions.statReductions.dexterity, change);
                this.stats.dexterity = this.dexterity * change;
                break;
            case 'evasion':
                this.updateStatReduction(this.conditions.statReductions.evasion, change);
                this.stats.evasion = this.evasion * change;
                break;
            case 'maxHealth':
                this.updateStatReduction(this.conditions.statReductions.maxHealth, change);
                this.stats.maxHealth = this.maxHealth * change;
                break;
            //Kept for potential % Health abilities
            case 'currentHealth':
                this.stats.currentHealth = this.currentHealth * change;
                break;
            case 'luck':
                this.updateStatReduction(this.conditions.statReductions.luck, change);
                this.stats.luck = this.luck * change;
                break;
            case 'speed':
                this.updateStatReduction(this.conditions.statReductions.speed, change);
                this.stats.speed = this.speed * change;
                break;
        }
    }


    updateStatReduction(stat, change) {
        if(change < 1) {
            stat *= (1 + change);
        }
        else {
            stat *= (change - 1);
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

    promptString() {
        return "Name: " + this.name + "\nHealth: " + this.currentHealth;
    }
}

module.exports = Character