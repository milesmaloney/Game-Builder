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
    }
}

module.exports = Player

/*
Many things need to be considered when taking a turn:
    Ability:
        *The ability being used
        The type of enemy and number of enemies the ability hits
        *The status effect the ability inflicts
        *The accuracy of the ability
    Stats:
        *The modifier (strength or magic) of the ability
        *The multiplier of the ability
        *The attacker's modifier value
        *The defender's defense value for the modifier
        *The attacker's dexterity
        *The defender's evasion
        *The attacker's luck
*/    
/*I'm going to go a different direction with this: I think taking the turn from the player object was a bad idea (this was mostly moved to the Game class)
takeTurn(game) {
        const ability = this.promptForAbility(game);
        while(ability === -1) { 
            console.log("Sorry, we couldn't find that ability. Please try again.");
            ability = this.promptForAbility(game);
        }
        /*Ability successfully received*/
/*        if(ability.targetType === 'enemy') {
            if(ability.numTargets > 1) {
                /*TODO: have users select enemies into an array, create function for calculating each individual damage, evasion, etc.*/
/*            }
            else {
                const enemy = this.promptForEnemy(game);
                while(enemy === -1) {
                    console.log("Sorry, we couldn't find that enemy. Please try again.");
                    enemy = this.promptForEnemy(game);
                }
                /*Ability + Enemy successfully received*/
/*               if(((ability.accuracy * this.dexterity) / enemy.evasion) * Math.random() < 0.30) {
                    console.log("Ability missed.");
                    return;
                }
                /*Ability + Enemy + Hit successfully received*/
/*                if(ability.statusEffect != "none") {
                    if(Math.random() < ability.chance) {
                        /*This means the status effect hits*/
/*                        enemy.statusEffects.append([ability.statusEffect,ability.duration])
                    }
                }
                /*Ability + Enemy + Hit + Status Effect successfully received*/
/*                let damage = 0;
                if(ability.modifier === "strength") {
                    damage = (this.strength * ability.multiplier) / (enemy.defense * 0.1);
                }
                if(ability.modifier === "magic") {
                    damage = (this.wisdom * ability.multiplier) / (enemy.resilience * 0.1);

                }
                /*Ability + Enemy + Hit + Status Effect + Damage successfully received*/
/*                if(this.luck * Math.random() > 0.7) {
                    damage *= 2;
                }
            }
        }
        else if(ability.targetType === 'ally') {
        }
        else {
            console.log("Invalid ability targetting type. Please try again or use a different ability.");
        }
    }
*/
    /*This function will prompt the player for which ability they want to use and return the ability object*/
/*    promptForAbility(game) {
        console.log(this.abilities);
        var abilityToUse = window.prompt("Which ability would you like to use?");
        return game.getAbilityByName(abilityToUse);
    }

    /*This function will prompt the player for which enemy (singular) they want to attack and return the enemy object*/
 /*   promptForEnemy(game) {
        console.log(game.getEnemies);
        var enemyToAttack = window.prompt("Which enemy would you like to attack?");
        return game.getEnemyByName(enemyToAttack)
    }

    /*This function will prompt the player for which enemies they want to attack and return an array of enemy objects*/
/*    promptForEnemies(game, numEnemies) {
        console.log(game.getEnemies);
        let enemiesToAttack = [];
        for(var i = 0; i < numEnemies; i++) {
            var enemyToAttack = window.prompt("Please select an enemy to attack. You can attack " + String(numEnemies - enemiesToAttack.length) + " more enemies.");
            var enemy = game.getEnemyByName(enemyToAttack);
            while(enemy === -1) {
                console.log("Failed to get the entered enemy. Please try again.");
                var enemyToAttack = window.prompt("Please select an enemy to attack. You can attack " + String(numEnemies - enemiesToAttack.length) + " more enemies.");
                var enemy = game.getEnemyByName(enemyToAttack);
            }
        }
    }
*/