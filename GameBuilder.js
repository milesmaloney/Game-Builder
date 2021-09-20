const { all } = require('async');
var StatusEffect = require('./StatusEffect.js');
var Ability = require('./Ability.js');
var Player = require('./Player.js');
var Enemy = require('./Enemy.js');
var Ally = require('./Ally.js');




/*
This class holds the many different elements of the game
Attributes:
    Players: The controlled player characters in the game
    Enemies: The non-controlled enemy characters of the game
    Allies: The non-controlled ally characters of the game
    Abilities: The abilities available in the game
    Status Effects: The status effects available in the game
*/
class Game {
    constructor(players, enemies, allies, abilities, statusEffects) {
        this.players = players;
        this.enemies = enemies;
        this.allies = allies;
        this.abilities = abilities;
        this.statusEffects = statusEffects;
        this.gameOver = 0;
    }


    /*
    TODO: This function will play the game until a game over is reached
    Parameters:
        ?
    Returns:
        ?
    */
    playGame() {
        //Initialize all values that need to be initialized outside of the loop
        //Execute the turn loop until the game is over
        while(!this.gameOver) {
            this.executeTurnLoop();
        }
    }


/*----------------------------------------------------------Turn Functions------------------------------------------------------------*/


    /*
    This function executes the turn loop, having each character take their turn based on the turn order
    Parameters:
        None; this function uses the attributes of the Game object as parameters
    Returns:
        None; the purpose of this function is to loop while the objects' attributes are changed
    */
    executeTurnLoop() {
        if(this.enemies.length === 0 || this.players.length === 0) {
            this.gameOver = 1;
        }
        const turnOrder = this.setTurnOrder();
        for(var i = 0; i < turnOrder.length; i++) {
            //TEST: console.log(turnOrder[i].name);
            var statusEffects = this.statusEffectCheck(turnOrder[i]);
            //TEST: console.log("status effect check done.");
            if(statusEffects[0]) {
                continue;
            }
            if(turnOrder[i].type === "player") {
                this.messageUser(turnOrder[i].name + "'s turn starting...");
                this.takePlayerTurn(turnOrder[i], statusEffects);
            }
        }
    }

    /*
    Sets the turn order based on character's speed multiplied by a random number between 0 and 1
    Parameters:
        None; this function uses the players, allies, and enemies arrays in the Game object to find the turn order
    Returns:
        Characters: An array of all of the characters in the game sorted by the character's speeds multiplied by a random number between 
        0 and 1
    */
    setTurnOrder() {
        var characters = this.players.concat(this.enemies);
        characters.sort((a,b) => (a.speed * Math.random() < b.speed * Math.random()) ? 1 : -1);
        return characters;
    }
    

    /*
    This function takes a character and parses through its status effects array and executes the status effects accordingly & returns an
    array of values denoting the 6 status effects that need to be dealt with in turn
    Parameters:
        Character: The character whose turn it is
    Returns:
        Current Status Effects: An array containing all of the conditions applied to the character by its status effects (a summation of
        the status effects)
    */
    statusEffectCheck(character) {
        var currStatusEffects = [0, 0, 0, 0, 0, 0, 0];
        //TEST: console.log("Pre-check character stats:" + character.toString());
        //TEST: console.log("Current status effects: ");
        for(var i = 0; i < character.statusEffects.length; i++) {
            //gets the status effect object based on the name of the status effect
            var statusEffect = this.getStatusEffectByName(character.statusEffects[i].statusEffect);
            //TEST: console.log(statusEffect);
            //Stores whether the turn ends right away (still need to apply bleed damage, stat reductions, etc.)
            if(statusEffect.endsTurn) {
                currStatusEffects[0] = 1;
            }
            //Stores magic attack prevention for use in turn
            else if(statusEffect.preventsMagicAttacks) {
                currStatusEffects[1] = 1;
            }
            //Stores physical attack prevention for use in turn
            else if(statusEffect.preventsPhysicalAttacks) {
                currStatusEffects[2] = 1;
            }
            //Stores incoming healing prevention for use in turn
            else if(statusEffect.preventsIncomingHealing) {
                currStatusEffects[3] = 1;
            }
            //Stores outgoing healing prevention for use in turn
            else if(statusEffect.preventsOutgoingHealing) {
                currStatusEffects[4] = 1;
            }
            //Stores magic attack reduction for use in turn
            else if(statusEffect.magicAttackReduction !== 0) {
                currStatusEffects[5] = statusEffect.magicAttackReduction;
            }
            //Stores physical attack reduction for use in turn
            else if(statusEffect.physicalAttackReduction !== 0) {
                currStatusEffects[6] = statusEffect.physicalAttackReduction;
            }
            //Damages the character based on the damage per round
            else if(statusEffect.damagePerRound !== 0)  {
                this.executeDamage(character, statusEffect.damagePerRound);
            }
            //Performs stat reductions or Reverts stats for expiring stat reductions
            else if(statusEffect.statsReduced.length !== 0) {
                //Loops through the stats reduced by the current status effect
                for(var j = 0; j < statusEffect.statsReduced.length; j++) {
                    //Checks if the current status effect is ending and reverts stat reductions if it is
                    if(character.statusEffects[i].duration <= 1) {
                        character.changeStat(statusEffect.statsReduced[j].statReduced, 1.0 + statusEffect.statsReduced[j].reducedBy);
                    }
                }
            }
            //TEST: console.log("\tStatus Effect: " + character.statusEffects[i].statusEffect.toString() + " Duration (before decrement): " + character.statusEffects[i].duration.toString());
            //decrements duration of status effects
            character.statusEffects[i].duration--;
        }
        //removes expired status effects
        character.statusEffects = character.statusEffects.filter(item => item.duration > 0);
        //TEST: console.log("Post-check character stats:" + character.toString());
        return currStatusEffects;
    }


    /*
    This function will execute a turn from the player point of view
    Parameters:
        Player: The player character taking a turn, with relevant stats and abilities
    Returns:
        None; the function will execute relevant functions that will impact character stats and in turn affect the game
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
    takePlayerTurn(player, statusEffects) {
        //TEST: console.log(player);
        const ability = this.promptForAbility(0, player, statusEffects);
        /*Attacking an Enemy*/
        if(ability.targetType === 'enemy') {
            /*Multiple Targets*/
            if(ability.numTargets > 1) {
                const enemies = this.promptForEnemies(ability.numTargets, 0);
                for(var i = 0; i < enemies.length; i++) {
                    this.attackEnemy(player, enemies[i], ability);
                }
            }
            /*Single Target*/
            else {
                const enemy = this.promptForEnemy(0);
                this.attackEnemy(player, enemy, ability);
            }
        }
        /*Healing an Ally*/
        else if(ability.targetType === 'ally') {
            /*Multiple Targets*/
            if(ability.numTargets > 1) {
                const allies = this.promptForAllies(ability.numTargets, 0);
                for(var i = 0; i < allies.length; i++) {
                    this.healAlly(player, allies[i], ability);
                }
            }
            /*Single Target*/
            else {
                const ally = this.promptForAlly(0);
                this.healAlly(player, ally, ability);
            }
        }
        /*General catch*/
        else {
            this.messageUser("Invalid ability targetting type. Please try again or use a different ability.");
        }
    }


/*-------------------------------------------------------Action Functions--------------------------------------------------------------*/
    

    /*
    This function carries out an attack on an enemy with an ability
    Parameters:
        Player: The player that is attacking
        Enemy: The enemy being attacked
        Ability: The ability being used to attack
    Returns:
        None; removes damage from enemy's current health if the attack is successful
    */
    attackEnemy(player, enemy, ability) {
        if(!this.calculateHitOrMissDamage(player, enemy, ability)) {
            return;
        }
        /*Ability + Enemy + Hit successfully received*/
        if(this.calculateStatusEffect(ability)) {
            enemy.statusEffects.push({ statusEffect: ability.statusEffect, duration: ability.duration });
            enemy.reduceStatsByStatusEffect(this.getStatusEffectByName(ability.statusEffect));
        }
        /*Ability + Enemy + Hit + Status Effect successfully received*/
        var damage = this.calculateDamage(player, enemy, ability);
        /*Ability + Enemy + Hit + Status Effect + Damage successfully received*/
        damage = this.calculateCrit(player, damage);
        this.messageUser("You hit " + enemy.name + " for " + String(damage) + " damage!");
        this.executeDamage(enemy, damage);
    }

    /*
    This function carries out healing on an ally with an ability
    Parameters:
        Player: The player that is healing
        Ally: The ally receiving healing
        Ability: The ability being used to heal
    Returns:
        None; the healing will be added to the ally's current health if successful
    */
    healAlly(player, ally, ability) {
        if(!this.calculateHitOrMissHealing(player, ally, ability)) {
            return;
        }
        var healing = this.calculateHealing()
        healing = this.calculateCrit(player, healing);
        this.messageUser("You healed " + ally.name + " for " + String(healing) + "health!");
        ally.currentHealth += healing;
    }


    /*
    This function will carry out damage on an enemy and determine if they are dead
    Parameters:
        Character: The character taking damage
        Damage: The damage dealt to the character
    Returns:
        None; The function will modify the character's health attribute and remove the character from the relevant array if they have 
        died.
    */
    executeDamage(character, damage) {
        character.currentHealth = character.currentHealth - damage;
        //TODO: Character is dead
        if(character.currentHealth <= 0) {
            switch(character.type) {
                case player:
                    break;
                case enemy:
                    break;
                case ally:
                    break;
            }
        }
    }


/*------------------------------------------------------Prompt Functions--------------------------------------------------------------*/


    /*
    This function will prompt the player for which enemy (singular) they want to attack and return the enemy object
    Parameters:
        Reprompt: A boolean value to determine whether or not the player has already failed the prompt
    Returns:
        Enemy: The enemy to be attacked
    */
    promptForEnemy(reprompt) {
        this.messageUser(this.getEnemies());
        if(reprompt) {
            this.messageUser("Your character doesn't see that enemy anywhere! Please try again.");
        }
        var enemyToAttack = this.getUserInput("Which enemy would you like to attack?");
        var enemy = this.getEnemyByName(enemyToAttack);
        if(enemy === -1) {
            this.promptForEnemy(1);
        }
        else {
            return enemy;
        }
    }
    

    /*
    This function will prompt the player for which enemies they want to attack and return an array of enemy objects
    Parameters:
        Number of Enemies: The number of enemies that the ability will hit
        Reprompt: A boolean value to determine whether the player has already failed the prompt
        Enemies To Attack: An array of enemies that the ability will hit (default value is empty; used for reprompting)
    Returns:
        Enemies to Attack: An array of enemies that an attack will hit
    */
    promptForEnemies(numEnemies, reprompt, enemiesToAttack = []) {
        this.messageUser(this.getEnemies());
        if(numEnemies >= this.enemies.length) {
            this.messageUser("This attack will attempt to hit all enemies.");
            return this.enemies;
        }
        if(reprompt) {
            this.messageUser("Your character cannot find that enemy anywhere. Please try again.");
        }
        while(numEnemies > 0) {
            var enemyToAttack = this.getUserInput("Please select an enemy to attack. You can attack " + String(numEnemies) + " more enemies.");
            var enemy = this.getEnemyByName(enemyToAttack);
            if(enemy === -1) {
                this.promptForEnemies(numEnemies, 1, enemiesToAttack);
            }
            else {
                enemiesToAttack.push(enemy);
                numEnemies--;
            }
        }
        return enemiesToAttack;
    }
    

    /*
    This function will prompt the player for which ally they want to heal
    Parameters:
        Reprompt: A boolean value to determine whether or not the player has already failed the prompt
    Returns:
        Ally: The ally to receive healing
    */
    promptForAlly(reprompt) {
        this.messageUser(this.getAllies());
        switch(reprompt) {
            case 1:
                this.messageUser("Your character couldn't see that ally. Please try again.");
                break;
            case 2:
                this.messageUser("The selected ally cannot be healed.");
                break;
            default:
                break;
        }
        var allyToHeal = this.getUserInput("Which ally would you like to heal?");
        var ally = this.getAllyByName(allyToHeal);
        if(ally === -1) {
            return this.promptForAlly(1);
        }
        for(var i = 0; i < ally.statusEffects.length; i++) {
            if(this.getStatusEffectByName(ally.statusEffects[i].statusEffect).preventsIncomingHealing) {
                return this.promptForAlly(2);
            }
        }
        //This return statement only gets called when all necessary conditions are met
        return ally;
    }
    

    /*
    This function will prompt the player for which allies they want to heal
    Parameters:
        Number of Allies: The number of allies that the player will attempt to heal
        Reprompt: A boolean value to determine whether or not the player has failed the prompt
        Allies to Heal: An array of the allies that the ability will heal (default value = empty; used for reprompting)
    Returns:
        Allies: An array of allies that the player will attempt to heal
    */
    promptForAllies(numAllies, reprompt, alliesToHeal = []) {
        this.messageUser(this.getAllies());
        if(numAllies >= this.enemies.length) {
            this.messageUser("This spell will attempt to heal all allies.");
            return this.allies;
        }
        if(reprompt) {
            this.messageUser("Your character cannot find that ally anywhere. Please try again.");
        }
        while(numAllies > 0) {
            var allyToHeal = this.getUserInput("Please select an ally to heal. You can heal " + String(numAllies) + " more allies.");
            var ally = this.getEnemyByName(allyToHeal);
            if(ally === -1) {
                return this.promptForAllies(numAllies, 1, alliesToHeal);
            }
            for(var i = 0; i < ally.statusEffects.length; i++) {
                if(this.getStatusEffectByName(ally.statusEffects[i].statusEffect).preventsIncomingHealing) {
                    return this.promptForAllies(numAllies, 2, alliesToHeal);
                }
            }
            alliesToHeal.push(ally);
            numAllies--;
        }
        return alliesToHeal;
    }


    /*
    This function will prompt the player for what ability they want to use
    Parameters:
        Reprompt: A boolean value to determine whether the player has already failed the prompt
        Player: The player that is taking its turn
    Returns:
        Ability: Returns the ability if the player has it and it is in the game; otherwise reprompts
    */
    promptForAbility(reprompt, player, statusEffects) {
        this.messageUser(player.abilities);
        var abilityToUse;
        switch(reprompt) {
            case 1:
                this.messageUser("Your character doesn't know that move. Please try again.");
                break;
            case 2:
                this.messageUser("Your character cannot use magic attacks on this turn. Please try again.");
                break;
            case 3:
                this.messageUser("Your character cannot use magic attacks on this turn. Please try again.");
                break;
            case 4:
                this.messageUser("Your character cannot use healing abilities on this turn. Please try again.");
                break;
            default:
                break;
        }
        abilityToUse = this.getUserInput("Which ability would you like to use?");
        const ability = this.getAbilityByName(abilityToUse);
        if(ability.modifier === 'wisdom' && statusEffects[1]) {
            this.promptForAbility(2, player);
        }
        else if(ability.modifier === 'strength' && statusEffects[2]) {
            this.promptForAbility(3, player);
        }
        else if(ability.targetType === 'ally' && statusEffects[3]) {
            this.promptForAbility(4, player);
        }
        else if(ability != -1 && player.abilities.includes(abilityToUse)) {
            return ability;
        }
        else {
            this.promptForAbility(1, player);
        }
    }


    /*
    This function allows for user input from the command line
    Parameters:
        Query: What the game wants to ask the user
    Returns:
        Response: The user's response to the query
    */
    getUserInput(query) {
        const prompt = require('prompt-sync')({sigint: true});
        const response = prompt(query + "  ");
        return response;
    }


/*---------------------------------------------------Calculation Functions------------------------------------------------------------*/


    /*
    This function calculates whether or not the attack will hit
    Parameters:
        Player: The player who is attempting an attack
        Enemy: The enemy receiving the attack
        Ability: The ability being used
    Returns:
        Boolean: True if the attack hits, false if the attack misses
    */
    calculateHitOrMissDamage(player, enemy, ability) {
        if(((ability.accuracy * player.dexterity) / enemy.evasion) * Math.random() < 0.30) {
            this.messageUser("Ability missed.");
            return 0;
        }
        else {
            return 1;
        }
    }


    /*
    This function calculates whether or not a healing ability will hit
    Parameters:
        Player: The player who is attempting to heal an ally
        Ally: The ally receiving the heal
        Ability: The ability being used
    Returns:
        Boolean: True if the healing is received, false if the healing fails
    */
    calculateHitOrMissHealing(player, ally, ability) {
        if(((ability.accuracy * player.dexterity) / (ally.currentHealth / ally.maxHealth)) * Math.random() < 0.40) {
            this.messageUser("Ability missed.")
            return 0;
        }
        else {
            return 1;
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
            if(Math.random() < ability.chance) {
                /*This means the status effect hits*/
                this.messageUser(String(ability.statusEffect) + " applied!");
                return 1;
            }
        }
        return 0;
    }


    /*
    This function calculates the damage of an ability given the player, enemy, and ability
    Parameters:
        Player: The player that is dealing damage
        Enemy: The enemy that is taking damage
        Ability: The ability that is dealing damage
    Returns:
        Damage: A number denoting the amount of damage that is dealt
    */
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


    /*
    This function will calculate the healing done from a healing spell (function for later changes)
    Parameters:
        Player: The player that is giving healing
        Ally: The ally that is receiving healing
        Ability: The ability that is being used
    Returns:
        Integer: Amount of healing given
    */
    calculateHealing(player, ally, ability) {
        return ((player.wisdom * ability.multiplier) / (ally.currentHealth / ally.maxHealth));
    }


    /*
    This function calculates whether or not an attack is a critical hit
    Parameters:
        Player: The player dealing damage
        Damage: The damage being dealt
    Returns:
        Damage: The damage being dealt after calculating a crit
    */
    calculateCrit(player, damage) {
        if(player.luck * Math.random() > .8) {
            this.messageUser("Critical Hit!");
            damage *= 2;
        }
        return damage;
    }


/*-----------------------------------------------------Helper Functions---------------------------------------------------------------*/


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


    addStatusEffect(name, effect, endsTurn = 0, preventsMagicAttacks = 0, preventsPhysicalAttacks = 0, preventsIncomingHealing = 0, preventsOutgoingHealing = 0, magicAttackReduction = 0, physicalAttackReduction = 0, damagePerRound = 0, statsReduced = [], percentReducedBy = []) {
        this.statusEffects.push(new StatusEffect(name, effect, endsTurn, preventsMagicAttacks, preventsPhysicalAttacks, preventsIncomingHealing, preventsOutgoingHealing, magicAttackReduction, physicalAttackReduction, damagePerRound, statsReduced, percentReducedBy));
    }

    addAbility(name, statusEffect, chance, duration, targetType, numTargets, accuracy, modifier, multiplier) {
        this.abilities.push(new Ability(name, statusEffect, duration, chance, targetType, numTargets, accuracy, modifier, multiplier));
    }

    addPlayer(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects) {
        var player = new Player(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects);
        for(var i = 0; i < statusEffects.length; i++) {
            player.reduceStatsByStatusEffect(this.getStatusEffectByName(statusEffects[i].statusEffect));
        }
        this.players.push(player);
    }

    addAlly(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects) {
        var ally = new Ally(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects);
        for(var i = 0; i < statusEffects.length; i++) {
            ally.reduceStatsByStatusEffect(this.getStatusEffectByName(statusEffects[i].statusEffect));
        }
        this.allies.push(ally);
    }

    addEnemy(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects) {
        var enemy = new Enemy(name, abilities, strength, defense, wisdom, resilience, dexterity, evasion, maxHealth, currentHealth, luck, speed, statusEffects);
        for(var i = 0; i < statusEffects.length; i++) {
            enemy.reduceStatsByStatusEffect(this.getStatusEffectByName(statusEffects[i].statusEffect));
        }
        this.enemies.push(enemy);
    }

    messageUser(message) {
        console.log(message);
    }
}

/*Creates a new empty game */
var myGame = new Game([],[],[],[],[]);


//Functional status effects
myGame.addStatusEffect("stunned", "Stunned characters lose their turn", 1);
myGame.addStatusEffect("silenced", "Silenced characters cannot use magic on their turn", 0, 1);
myGame.addStatusEffect("immobilized", "Immobilized characters cannot use physical attacks on their turn.", 0, 0, 1);
myGame.addStatusEffect("taunted", "Taunted characters will only use physical attacks on the character that taunted them", 0, 1);
myGame.addStatusEffect("bleeding", "Bleeding characters will take damage at the end of each turn rotation", 0, 0, 0, 0, 0, 0, 0, 1);
myGame.addStatusEffect("hopeless", "Hopeless characters will refuse healing from allies", 0, 0, 0, 1);
myGame.addStatusEffect("selfish", "Selfish characters will not cast any spells on their allies", 0, 0, 0, 0, 1);

//Damage reduction status effects
myGame.addStatusEffect("disarmed", "Disarmed characters have their physical damage reduced by 25%", 0, 0, 0, 0, 0, 0, .25);
myGame.addStatusEffect("unfocused", "Unfocused characters have their magic damage reduced by 25%", 0, 0, 0, 0, 0, .25);

//Stat status effects
myGame.addStatusEffect("weakened", "Weakened characters have their strength reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "strength", reducedBy: .50 }]);
myGame.addStatusEffect("exposed", "Exposed characters have their defense reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "defense", reducedBy: .50 }]);
myGame.addStatusEffect("confused", "Confused characters have their wisdom reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "wisdom", reducedBy: .50 }]);
myGame.addStatusEffect("intimidated", "Intimidated characters have their resilience reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "resilience", reducedBy: .50 }]);
myGame.addStatusEffect("dazed", "Dazed characters have their dexterity reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "dexterity", reducedBy: .50 }]);
myGame.addStatusEffect("surrounded", "Surrounded characters have their evasion reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "evasion", reducedBy: .50 }]);
myGame.addStatusEffect("cursed", "Cursed opponents have their luck reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "luck", reducedBy: .50 }]);
myGame.addStatusEffect("slowed", "Slowed characters have their speed reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "speed", reducedBy: .50 }]);

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
myGame.addPlayer("Jonka", ["Sweep", "Slice", "Minor Group Heal", "Minor Arcana Barrage"], 3, 1, 5, 2, 3, 5, 12, 12, 2, 50, [{ statusEffect: "stunned", duration: 3 }, { statusEffect: "silenced", duration: 4 }, { statusEffect: "slowed", duration: 2 }, { statusEffect: "disarmed", duration: 5 }]);

//Initialize Enemies
myGame.addEnemy("Jonku", ["Punch","Minor Arcana Beam", "Slice", "Minor Heal"], 1, 1, 1, 1, 1, 1, 1, 1, 1, 36, []);
myGame.addEnemy("Jonky", ["Minor Group Heal", "Minor Arcane Beam", "Sweep"], 14, -4, 0, 2, 1, 1, 8, 8, 2, 11, []);

for(var i = 0; i < 5; i++) {
    console.log(myGame.statusEffectCheck(myGame.getPlayerByName("Jonka")));
}
