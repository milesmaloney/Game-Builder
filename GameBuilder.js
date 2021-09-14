const { all } = require('async');
import StatusEffect from './StatusEffect.js';
import Ability from './Ability.js';
import Player from './Player.js';
import Enemy from './Enemy.js';
import Ally from './Ally.js';


/*
TODO: Work on getting negative values working, as well as check for status effects and mutate the turn based on those status effects
*/

class Game {
    constructor(players, enemies, allies, abilities, statusEffects) {
        this.players = players;
        this.enemies = enemies;
        this.allies = allies;
        this.abilities = abilities;
        this.statusEffects = statusEffects;
        this.gameOver = false;
    }

/*
Many things need to be considered when taking a turn:
    Ability:
        *The ability being used
        *The type of target and number of targets the ability hits
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
    takePlayerTurn(player) {
        console.log(player);
        const ability = this.promptForAbility(false, player);
        /*Attacking an Enemy*/
        if(ability.targetType === 'enemy') {
            /*Multiple Targets*/
            if(ability.numTargets > 1) {
                const enemies = this.promptForEnemies(ability.numTargets, false);
                for(var i = 0; i < enemies.length; i++) {
                    this.attackEnemy(player, enemies[i], ability);
                }
            }
            /*Single Target*/
            else {
                const enemy = this.promptForEnemy(false);
                this.attackEnemy(player, enemy, ability);
            }
        }
        /*Healing an Ally*/
        else if(ability.targetType === 'ally') {
            /*Multiple Targets*/
            if(ability.numTargets > 1) {
                const allies = this.promptForAllies(ability.numTargets, false);
                for(var i = 0; i < allies.length; i++) {
                    this.healAlly(player, allies[i], ability);
                }
            }
            /*Single Target*/
            else {
                const ally = this.promptForAlly(false);
                this.healAlly(player, ally, ability);
            }
        }
        else {
            console.log("Invalid ability targetting type. Please try again or use a different ability.");
        }
    }

    /*This function calculates whether or not the attack will hit*/
    calculateHitOrMissDamage(player, enemy, ability) {
        if(((ability.accuracy * player.dexterity) / enemy.evasion) * Math.random() < 0.30) {
            console.log("Ability missed.");
            return false;
        }
        else {
            return true;
        }
    }

    /*This function calculates whether or not a healing ability will hit*/
    calculateHitOrMissHealing(player, ally, ability) {
        if(((ability.accuracy * player.dexterity) / (ally.currentHealth / ally.maxHealth)) * Math.random() < 0.40) {
            console.log("Ability missed.")
            return false;
        }
        else {
            return true;
        }
    }

    /*This function calculates whether or not a status effect will hit and applies it*/
    calculateStatusEffect(ability) {
        if(ability.statusEffect != "none") {
            if(Math.random() < ability.chance) {
                /*This means the status effect hits*/
                console.log(String(ability.statusEffect) + " applied!");
                return true;
            }
        }
        return false;
    }

    /*This function calculates the damage of an ability given the player, enemy, and ability*/
    calculateDamage(player, enemy, ability) {
        let damage;
        if(ability.modifier === "strength") {
            damage = (player.strength * ability.multiplier) / (enemy.defense * 0.1);
        }
        else if(ability.modifier === "magic") {
            damage = (player.wisdom * ability.multiplier) / (enemy.resilience * 0.1);
        }
        else {
            return 0;
        }
        return damage;
    }

    /*This function will calculate the healing done from a healing spell (function for later changes)*/
    calculateHealing(player, ally, ability) {
        return ((player.wisdom * ability.multiplier) / (ally.currentHealth / ally.maxHealth));
    }

    /*This function calculates whether or not an attack is a critical hit*/
    calculateCrit(player, damage) {
        if(player.luck * Math.random() > .8) {
            console.log("Critical Hit!");
            damage *= 2;
        }
        return damage;
    }

    /*This function carries out an attack on an enemy with an ability*/
    attackEnemy(player, enemy, ability) {
        if(!this.calculateHitOrMissDamage(player, enemy, ability)) {
            return;
        }
        /*Ability + Enemy + Hit successfully received*/
        if(this.calculateStatusEffect(ability)) {
            enemy.statusEffects.push({ statusEffect: ability.statusEffect, duration: ability.duration });
        }
        /*Ability + Enemy + Hit + Status Effect successfully received*/
        var damage = this.calculateDamage(player, enemy, ability);
        /*Ability + Enemy + Hit + Status Effect + Damage successfully received*/
        damage = this.calculateCrit(player, damage);
        console.log("You hit " + enemy.name + " for " + String(damage) + " damage!");
        enemy.currentHealth -= damage;
    }

    /*This function carries out healing on an ally with an ability*/
    healAlly(player, ally, ability) {
        if(!this.calculateHitOrMissHealing(player, ally, ability)) {
            return;
        }
        var healing = this.calculateHealing()
        healing = this.calculateCrit(player, healing);
        console.log("You healed " + ally.name + " for " + String(healing) + "health!");
        ally.currentHealth += healing;
    }

    /*This function will prompt the player for what ability they want to use*/
    promptForAbility(reprompt, player) {
        console.log(player.abilities);
        var abilityToUse;
        if(reprompt) {
            abilityToUse = console.log("Your character doesn't know that move. Please try again.");
        }
        abilityToUse = this.getUserInput("Which ability would you like to use?");
        const ability = this.getAbilityByName(abilityToUse);
        if(ability != -1 && player.abilities.includes(abilityToUse)) {
            return ability;
        }
        else {
            this.promptForAbility(true, player);
        }
    }


    /*This function will prompt the player for which enemy (singular) they want to attack and return the enemy object*/
    promptForEnemy(reprompt) {
        console.log(this.getEnemies());
        if(reprompt) {
            console.log("Your character doesn't see that enemy anywhere! Please try again.");
        }
        var enemyToAttack = this.getUserInput("Which enemy would you like to attack?");
        var enemy = this.getEnemyByName(enemyToAttack);
        if(enemy === -1) {
            this.promptForEnemy(true);
        }
        else {
            return enemy;
        }
    }

    /*This function will prompt the player for which enemies they want to attack and return an array of enemy objects*/
    promptForEnemies(numEnemies, reprompt) {
        console.log(this.getEnemies());
        let enemiesToAttack = [];
        if(numEnemies >= this.enemies.length) {
            console.log("This attack will attempt to hit all enemies.");
            return this.enemies;
        }
        if(reprompt === true) {
            console.log("Your character cannot find that enemy anywhere. Please try again.");
        }
        while(numEnemies > 0) {
            var enemyToAttack = this.getUserInput("Please select an enemy to attack. You can attack " + String(numEnemies) + " more enemies.");
            var enemy = this.getEnemyByName(enemyToAttack);
            if(enemy === -1) {
                this.promptForEnemies(numEnemies, true);
            }
            else {
                enemiesToAttack.push(enemy);
                numEnemies--;
            }
        }
        return enemiesToAttack;
    }

    /*This function will prompt the player for which ally they want to heal*/
    promptForAlly(reprompt) {
        console.log(this.getAllies());
        if(reprompt) {
            console.log("Your character couldn't see that ally. Please try again.")
        }
        var allyToHeal = this.getUserInput("Which ally would you like to heal?");
        var ally = this.getAllyByName(allyToHeal);
        if(ally === -1) {
            this.promptForAlly(true);
        }
        else {
            return ally;
        }
    }

    /*This function will prompt the player for which allies they want to heal*/
    promptForAllies(numAllies, reprompt) {
        console.log(this.getAllies());
        let alliesToHeal = [];
        if(numAllies >= this.enemies.length) {
            console.log("This spell will attempt to heal all allies.");
            return this.allies;
        }
        if(reprompt === true) {
            console.log("Your character cannot find that ally anywhere. Please try again.");
        }
        while(numAllies > 0) {
            var allyToHeal = this.getUserInput("Please select an ally to heal. You can heal " + String(numAllies) + " more allies.");
            var ally = this.getEnemyByName(allyToHeal);
            if(ally === -1) {
                this.promptForAllies(numAllies, true);
            }
            else {
                alliesToHeal.push(ally);
                numAllies--;
            }
        }
        return alliesToHeal;
    }

    /*This function allows for user input from the command line*/
    getUserInput(query) {
        const prompt = require('prompt-sync')({sigint: true});
        const response = prompt(query + "  ");
        return response;
    }


    playGame() {
    }



    /*Sets the turn order based on character's speed multiplied by a random number between 0 and 1 */
    setTurnOrder() {
        var characters = this.players.concat(this.enemies);
        characters.sort((a,b) => (a.speed * Math.random() < b.speed * Math.random()) ? 1 : -1);
        return characters;
    }


    /*Helper Functions*/
    getPlayers() {
        return this.players;
    }


    getEnemies() {
        return this.enemies;
    }

    getAllies() {
        return this.allies;
    }

    getAbilities() {
        return this.abilities;
    }


    getStatusEffects() {
        return this.statusEffects;
    }


    getPlayerByName(name) {
        for(var i = 0; i < this.players.length; i++) {
            if(this.players[i].name === name) {
                return this.players[i];
            }
        }
        return -1;
    }

    getEnemyByName(name) {
        for(var i = 0; i < this.enemies.length; i++) {
            if(this.enemies[i].name === name) {
                return this.enemies[i];
            }
        }
        return -1;

    }

    getAllyByName(name) {
        for(var i = 0; i < this.enemies.length; i++) {
            if(this.allies[i].name === name) {
                return this.allies[i];
            }
        }
        return -1;
    }

    getAbilityByName(name) {
        for(var i = 0; i < this.abilities.length; i++) {
            if(this.abilities[i].name === name) {
                return this.abilities[i];
            }
        }
        return -1;
    }

    getStatusEffectByName(name) {
        for(var i = 0; i < this.statusEffects.length; i++) {
            if(this.statusEffects[i].name === name) {
                return this.statusEffects[i];
            }
        }
        return -1;
    }


    /*This function informs the user of any status effects on the character whose turn it is and return an array of indices of the status effects on the current target*/
    statusEffectCheck(character) {
        var statusEffectIndices = [];
        for(var i = 0; i < character.statusEffects.length; i++) {
            for(var j = 0; j < this.statusEffects.length; j++) {
                if(this.statusEffects[j].name === character.statusEffects[i].statusEffect.name) {
                    console.log("You are " + this.statusEffects[j].name + "! " + this.statusEffects[j].effect + ". You will recover in " + character.statusEffects[i].duration + " turns.");
                    statusEffectIndices.push(j);
                }
            }
        }
        return statusEffectIndices;

    }


/*Tentative turn loop*/
    executeTurnLoop() {
        const turnOrder = this.setTurnOrder();
        for(var i = 0; i < turnOrder.length; i++) {
            console.log(turnOrder[i].name);
            var statusEffects = this.statusEffectCheck(turnOrder[i]);
            console.log("status effect check done.");
            if(statusEffects.length === 0) {
                console.log("You had no status effects on you this turn. Take your turn.");
            }
            if(turnOrder[i].type === "player") {
                console.log("turn starting...");
                this.takePlayerTurn(turnOrder[i]);
            }
            
        }
    }


    addStatusEffect(name, effect, endsTurn = false, preventsMagicAttacks = false, preventsPhysicalAttacks = false, preventsIncomingHealing = false, preventsOutgoingHealing = false, magicAttackReduction = 0, physicalAttackReduction = 0, damagePerRound = 0, statsReduced = [], percentReducedBy = []) {
        this.statusEffects.push(new StatusEffect(name, effect, endsTurn, preventsMagicAttacks, preventsPhysicalAttacks, preventsIncomingHealing, preventsOutgoingHealing, magicAttackReduction, physicalAttackReduction, statsReduced, percentReducedBy, damagePerRound));
    }

    addAbility(name, statusEffect, chance, duration, targetType, numTargets, accuracy, modifier, multiplier) {
        this.abilities.push(new Ability(name, statusEffect, duration, chance, targetType, numTargets, accuracy, modifier, multiplier));
    }

    addPlayer(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects) {
        this.players.push(new Player(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects));
    }

    addEnemy(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects) {
        this.enemies.push(new Enemy(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects));
    }
}

/*Creates a new empty game */
var myGame = new Game([],[],[],[],[]);

//Functional status effects
myGame.addStatusEffect("stunned", "Stunned characters lose their turn", true );
myGame.addStatusEffect("silenced", "Silenced characters cannot use magic on their turn", undefined, true);
myGame.addStatusEffect("immobilized", "Immobilized characters cannot use physical attacks on their turn.", undefined, undefined, true);
myGame.addStatusEffect("taunted", "Taunted characters will only use physical attacks on the character that taunted them", undefined, true);
myGame.addStatusEffect("bleeding", "Bleeding characters will take damage at the end of each turn rotation", undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1);
myGame.addStatusEffect("hopeless", "Hopeless characters will refuse healing from allies", undefined, undefined, undefined, true);
myGame.addStatusEffect("selfish", "Selfish characters will not cast any spells on their allies", undefined, undefined, undefined, undefined, true);

//Damage reduction status effects
myGame.addStatusEffect("disarmed", "Disarmed characters have their physical damage reduced by 25%", undefined, undefined, undefined, undefined, undefined, undefined, .25);
myGame.addStatusEffect("unfocused", "Unfocused characters have their magic damage reduced by 25%", undefined, undefined, undefined, undefined, undefined, .25);

//Stat status effects
myGame.addStatusEffect("weakened", "Weakened characters have their strength reduced by 50%", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ["strength"], [.50]);
myGame.addStatusEffect("exposed", "Exposed characters have their defense reduced by 50%", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ["defense"], [.50]);
myGame.addStatusEffect("confused", "Confused characters have their wisdom reduced by 50%", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ["wisdom"], [.50]);
myGame.addStatusEffect("intimidated", "Intimidated characters have their resilience reduced by 50%", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ["resilience"], [.50]);
myGame.addStatusEffect("dazed", "Dazed characters have their dexterity reduced by 50%", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ["dexterity"], [.50]);
myGame.addStatusEffect("surrounded", "Surrounded characters have their evasion reduced by 50%", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ["evasion"], [.50]);
myGame.addStatusEffect("cursed", "Cursed opponents have their luck reduced by 50%", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ["luck"], [.50]);
myGame.addStatusEffect("slowed", "Slowed characters have their speed reduced by 50%", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ["speed"], [.50]);

//Base status effect (for abilities, not characters)
myGame.addStatusEffect("none", "Abilities with no status effect behave as normal");

//Initialize abilities (12 targets = all targets)
//Single Target Physical Attacks
myGame.addAbility("Slice", "bleed", 0.33, 1, "enemy", 1, 90, "strength", 0.66);
myGame.addAbility("Punch", "none", 0, 0, "enemy", 1, 100, "strength", 1.0);

//Multi Target Physical Attacks
myGame.addAbility("Sweep", "none", 0, 0, "enemy", 12, 70, "strength", 0.5);

//Single Target Healing Abilities
myGame.addAbility("Minor Heal", "none", 0, 0, "ally", 1, 100, "wisdom", 0.5);

//Multi Target Healing Abilities
myGame.addAbility("Minor Group Heal", "none", 0, 0, "ally", 12, 70, "wisdom", 0.25);

//Single Target Magical Attacks
myGame.addAbility("Minor Arcane Beam", "none", 0, 0, "enemy", 1, 80, "wisdom", 1.0);

//Multi Target Magical Attacks
myGame.addAbility("Minor Arcane Barrage", "none", 0, 0, "enemy", 12, 70, "wisdom", 0.4);

//Initialize Players
myGame.addPlayer("Jonka", ["Sweep", "Slice", "Minor Group Heal", "Minor Arcana Barrage"], 3, 1, 5, 2, 3, 5, 12, 12, 2, 50, []);

//Initialize Enemies
myGame.addEnemy("Jonku", ["Punch","Minor Arcana Beam", "Slice", "Minor Heal"], 1, 1, 1, 1, 1, 1, 1, 1, 1, 36, []);
myGame.addEnemy("Jonky", ["Minor Group Heal", "Minor Arcane Beam", "Sweep"], 14, -4, 0, 2, 1, 1, 8, 8, 2, 11, []);

myGame.executeTurnLoop();