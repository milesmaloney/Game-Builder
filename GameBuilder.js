const { all } = require('async');
var StatusEffect = require('./StatusEffect.js');
var Ability = require('./Ability.js');
var Player = require('./Player.js');
var Enemy = require('./Enemy.js');
var Ally = require('./Ally.js');
const UI = require('./UI.js');
const Calculator = require('./Calculator.js');




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
        this.turnCount = 0;
        this.gameOver = 0;
    }


    /*
    Parameters:
        None; This function should run on its own
    Returns:
        None; This function handles the main event loop of the game
    */
    playGame() {
        //Initialize all values that need to be initialized outside of the loop (currently only status effects)
        const characters = this.players.concat(this.allies).concat(this.enemies);
        for (var i = 0; i < characters.length; i++) {
            this.initStatusEffects(characters[i]);
        }
        //Execute the turn loop until the game is over
        while(!this.gameOver) {
            this.executeTurnLoop();
        }
        UI.messageUser("Game over!", 0);
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
        this.turnCount++;
        UI.messageUser("Round " + this.turnCount.toString() + ":", 0);
        var turnOrder = this.setTurnOrder();
        for(var i = 0; i < turnOrder.length; i++) {
            //Checks if the game ended mid-round
            if(this.gameOverCheck()) {
                break;
            }
            UI.messageUser("It is " + turnOrder[i].name + "'s turn:", 1);
            //Checks if character is dead
            if(this.deathCheck(turnOrder[i])) {
                continue;
            }
            //TEST: console.log("Passed death check.");
            //Checks if character died to bleed
            if(!this.statusEffectCheck(turnOrder[i])) {
                continue
            }
            //TEST: console.log("Passed status effect check.");
            //Checks if character loses their turn
            if(!turnOrder[i].conditions.hasTurn) {
                UI.messageUser(turnOrder[i].name + " loses their turn! Continuing to next turn...");
                continue;
            }
            //TEST: console.log("Passed turn check.");
            //Executes player's turn
            if(turnOrder[i].type === "player") {
                this.takePlayerTurn(turnOrder[i]);
            }
            //Executes enemy's turn
            else if(turnOrder[i].type === "enemy") {
                this.takeEnemyTurn(turnOrder[i]);
            }
            //Executes ally's turn
            else if(turnOrder[i].type === "ally") {
                this.takeAllyTurn(turnOrder[i]);
            }
            //Catches unidentified character type
            else {
                console.log("ERROR: The character's type is unkown.");
            }
        }
    }

    /*
    This function checks if the game over condition has been met
    Parameters:
        None; Whether or not the game is over depends on the remaining enemies/players
    Returns:
        Boolean: Boolean value determining whether or not the game is over
    */
    gameOverCheck() {
        if(this.enemies.length === 0) {
            this.cueGameOver(1);
            return 1;
        }
        else if(this.players.length === 0) {
            this.cueGameOver(0);
            return 1;
        }
        else {
            return 0;
        }
    }

    /*
    This function checks if a character in the turn order is dead and returns a spliced array if they are
    Parameters:
        turnOrder: The turn order array
        Index: The character's index in the array
    Returns:
        Boolean: Boolean value determining whether or not the character is dead (1 if dead, 0 if alive)
    */
    deathCheck(character) {
        switch(character.type) {
            case 'player':
                if(this.getPlayerByName(character.name) === -1){
                    UI.messageUser(character.name + " is dead! Moving on to next turn...");
                    return 1;
                }
                break;
            case 'enemy':
                if(this.getEnemyByName(character.name) === -1) {
                    UI.messageUser(character.name + " is dead! Moving on to next turn...");
                    return 1;
                }
                break;
            case 'ally':
                if(this.getAllyByName(character.name) === -1) {
                    UI.messageUser(character.name + " is dead! Moving on to next turn...");
                    return 1;
                }
                break;
        }
        return 0;
    }

    /*
    This function will check for stealth conditions and return the enemies or allies that the player can see
    Parameters:
        Array: The array denoting the types of characters the player is looking for
        Character: The character that is attempting an action
    Returns:
        Array: A new array with all characters the character attempting an action can see
    */
    stealthCheck(array, character) {
        if(character.conditions.seesStealth) {
            return array;
        }
        else {
            return array.filter(item => !item.conditions.isStealthed);
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
        var characters = this.players.concat(this.enemies).concat(this.allies);
        characters.sort((a,b) => (a.speed * Math.random() < b.speed * Math.random()) ? 1 : -1);
        return characters;
    }
    

    /*
    This function takes a character and parses through its status effects array and executes the status effects accordingly & returns an
    array of values denoting the 6 status effects that need to be dealt with in turn
    Parameters:
        Character: The character whose turn it is
    Returns:
        Boolean: True if character survived, false if character died
    */
    statusEffectCheck(character) {
        if(character.conditions.damageTakenPerRound !== 0)  {
            this.messageUser(character.name + " has taken " + character.conditions.damageTakenPerRound + " damage from damage over time effects!");
            this.executeDamage(character, character.conditions.damageTakenPerRound);
            //Implies the character died from on-turn damage; returns false
            if(typeof character === 'undefined') {
                return 0;
            }
        }
        //Reverts status conditions for all expiring status effects
        character.removeStatusEffects(this);
        return 1;
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
    takePlayerTurn(player) {
        //TEST: console.log(player);
        //TEST: console.log(statusEffects);
        UI.getGameStatus(this);
        const ability = UI.promptForAbility(this, player);
        if(ability === -1) {
            return;
        }
        //TEST: console.log("After:" + ability);
        var targets = UI.promptForTargets(this, player, ability);
        this.useAbility(ability, player, targets);
    }

    /*
    This function takes a turn on behalf of the enemy (AI)
    Parameters:
        Enemy: The enemy taking the turn
    Returns:
        None; Selects a random ability and executes it on random available targets for that ability, and modifies properties based on the
        results
    */
    takeEnemyTurn(enemy) {
        var availableAbilities = enemy.getAvailableAbilities(this);
        if(availableAbilities === -1) {
            return;
        }
        var ability = availableAbilities[Calculator.calculateRandom(0, availableAbilities.length - 1)];
        UI.messageUser(enemy.name + " is using " + ability.name + ".");
        var numTargets = ability.numTargets;
        var availableTargets = [];
        if(ability.targetType === 'enemy') {
            var availableTargets = this.stealthCheck(this.allies.concat(this.players), enemy);
        }
        else if(ability.targetType === 'ally') {
            var availableTargets = this.stealthCheck(this.enemies, enemy);
        }
        var selectedTargets = [];
        //Checks if the ability would hit all available targets
        if(numTargets >= availableTargets.length) {
            UI.messageUser(enemy.name + "'s " + ability.name + " attack will attempt to hit all targets.");
            selectedTargets = availableTargets;
        }
        else {
            //selects the targets and removes them from the available targets pool accordingly
            while(numTargets !== 0) {
                var selectedTarget = Calculator.calculateRandom(0, availableTargets.length - 1);
                selectedTargets.push(availableTargets[selectedTarget]);
                availableTargets.splice(selectedTarget, 1);
                numTargets--;
            }
        }
        if(ability.targetType === 'enemy') {
            this.attackEnemies(enemy, selectedTargets, ability);
        }
        else {
            this.healAllies(enemy, selectedTargets, ability);
        }
    }


    /*
    This function takes a turn on behalf of an ally (AI)
    Parameters:
        Ally: The ally that is taking its turn
    Returns:
        None: selects a random ability and modifies properties of characters based on the result of the ability's execution
    */
    takeAllyTurn(ally) {
        var ability = this.selectAIAbility(ally);
        var numTargets = ability.numTargets;
        var availableTargets = [];
        if(ability.targetType === 'enemy') {
            var availableTargets = this.stealthCheck(this.enemies, ally);
        }
        else if(ability.targetType === 'ally') {
            var availableTargets = this.stealthCheck(this.players.concat(this.allies), ally);
        }
        //TEST: console.log("Ally: " + ally.name + "\n" + ability.toString() + "\nAvailable Targets: \n" + availableTargets);
        var selectedTargets = [];
        //Checks if the ability would hit all available targets
        if(numTargets >= availableTargets.length) {
            UI.messageUser(ally.name + "'s " + ability.name + " attack will attempt to hit all targets.");
            selectedTargets = availableTargets;
        }
        else {
            //selects the targets and removes them from the available targets pool accordingly
            while(numTargets !== 0) {
                var selectedTarget = Calculator.calculateRandom(0, availableTargets.length - 1);
                selectedTargets.push(availableTargets[selectedTarget]);
                availableTargets.splice(selectedTarget, 1);
                numTargets--;
            }
        }
        //TEST: console.log(selectedTargets);
        if(ability.targetType === 'enemy') {
            this.attackEnemies(ally, selectedTargets, ability);
        }
        else if(ability.targetType === 'ally') {
            this.healAllies(ally, selectedTargets, ability);
        }
    }


    selectAIAbility(character) {
        var availableAbilities = character.getAvailableAbilities(this);
        if(availableAbilities === -1) {
            return -1;
        }
        var ability = availableAbilities[Calculator.calculateRandom(0, availableAbilities.length - 1)];
        UI.messageUser(character.name + " is using " + ability.name + ".");
        return ability;
    }


    selectAITargets(character, ability) {

    }


/*-------------------------------------------------------Action Functions--------------------------------------------------------------*/
    

    /*
    This function uses an ability as a character on the selected targets
    Parameters:
        Ability: The ability being used
        Character: The character using the ability
        Target: The targets of the ability
    Returns:
        None; The function will carry out the attack or healing of the ability on the targets
    */
    useAbility(ability, character, target) {
        if(ability.targetType === 'enemy') {
            this.attackEnemies(character, target, ability);
        }
        else if(ability.targetType === 'allies') {
            this.healAllies(character, target, ability);
        }
    }


    /*
    This function carries out an attack on an enemy with an ability
    Parameters:
        Character: The character that is attacking
        Enemies: The enemies being attacked
        Ability: The ability being used to attack
    Returns:
        None; removes damage from enemy's current health if the attack is successful
    */
    attackEnemies(character, enemies, ability) {
        //TEST: console.log(enemies);
        for(var i = 0; i < enemies.length; i++) {
            //Checks whether the attack hits or misses
            if(!Calculator.calculateHitOrMissDamage(character, enemies[i], ability)) {
                continue;
            }
            if(Calculator.calculateStatusEffect(ability)) {
                enemies[i].statusEffects.push({ statusEffect: ability.statusEffect, duration: ability.duration });
                var statusEffectApplied = this.getStatusEffectByName(ability.statusEffect);
                if(statusEffectApplied !== -1) {
                    enemies[i].applyStatusEffect(statusEffectApplied);
                }
                else {
                    console.log("ERROR: Ability's status effect not found.");
                }
            }
            var damage = Calculator.calculateDamage(character, enemies[i], ability);
            UI.messageUser(character.name + " hit " + enemies[i].name + " with " + ability.name + " for " + damage + " damage!");
            this.executeDamage(enemies[i], damage);
        }
    }

    /*
    This function carries out healing on an ally with an ability
    Parameters:
        Character: The player that is healing
        Allies: The ally receiving healing
        Ability: The ability being used to heal
    Returns:
        None; the healing will be added to the ally's current health if successful
    */
    healAllies(character, allies, ability) {
        //TEST: console.log(allies);
        for(var i = 0; i < allies.length; i++) {
            if(!Calculator.calculateHitOrMissHealing(character, allies[i], ability)) {
                continue;
            }
            var healing = Calculator.calculateHealing(character, ability);
            UI.messageUser(character.name + " healed " + allies[i].name + " with " + ability.name + " for " + healing + " health!");
            this.executeHealing(allies[i], healing);
        }
    }


    /*
    This function will carry out damage on an enemy and determine if they are dead
    Parameters:
        Enemy: The character taking damage
        Damage: The damage dealt to the character
    Returns:
        None; The function will modify the character's health attribute and remove the character from the relevant array if they have 
        died.
    */
    executeDamage(enemy, damage) {
        enemy.stats.currentHealth -= damage;
        if(enemy.stats.currentHealth <= 0) {
            switch(enemy.type) {
                case 'player':
                    this.killCharacter(enemy, this.players);
                    break;
                case 'enemy':
                    this.killCharacter(enemy, this.enemies);
                    break;
                case 'ally':
                    this.killCharacter(enemy, this.allies);
                    break;
            }
        }
    }


    /*
    This function executes the healing performed by a character
    Parameters:
        Ally: The ally that is receiving healing
        Healing: The amount of healing being given
    Returns:
        None; this function will add the healing amount to the current hp of the ally
    */
    executeHealing(ally, healing) {
        ally.stats.currentHealth += healing;
    }


    /*
    This function helps with the occurrence of character deaths in the execute damage function
    Parameters:
        Character: The character that is dying
        Array: The array the character is stored in
    Returns:
        None; The function will inform the user a character has died and remove the character from the game
    */
    killCharacter(character, array) {
        UI.messageUser(character.name + " has died!");
        let index = array.findIndex(charFind => charFind.name === character.name);
        array.splice(index, 1);
    }


    /*
    This function informs the user whether they win or lose when the game ends
    Parameters:
        winOrLose: A boolean value (0 or 1) denoting whether all players died or all enemies died
    Returns:
        None; Outputs message to user and mutates gameOver value to true
    */
    cueGameOver(winOrLose) {
        switch(winOrLose) {
            case 0:
                UI.messageUser("You have been defeated. You lose.");
                break;
            case 1:
                UI.messageUser("You have defeated all enemies. You win!");
                break;
        }
        this.gameOver = 1;
    }


    /*
    This function will initialize status effects when a character is constructed with pre-determined status effects
    Parameters:
        Character: The character currently being initialized
    Returns:
        None; the function will fill the character's conditions property
    */
    initStatusEffects(character) {
        //TEST: console.log(character.toString());
        //TEST: console.log(character.statusEffects);
        for(var i = 0; i < character.statusEffects.length; i++) {
            character.applyStatusEffect(this.getStatusEffectByName(character.statusEffects[i].statusEffect));
        }
        //TEST: console.log(character.conditions);
    }


/*-----------------------------------------------------Helper Functions---------------------------------------------------------------*/


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
        for(var i = 0; i < this.allies.length; i++) {
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


    addStatusEffect(name, effect, endsTurn = 0, preventsAttacks = 0, preventsMagicAttacks = 0, preventsPhysicalAttacks = 0, preventsIncomingHealing = 0, preventsOutgoingHealing = 0, revealsStealth = 0, magicAttackReduction = 0, physicalAttackReduction = 0, damagePerRound = 0, statsReduced = [], percentReducedBy = []) {
        this.statusEffects.push(new StatusEffect(name, effect, endsTurn, preventsAttacks, preventsMagicAttacks, preventsPhysicalAttacks, preventsIncomingHealing, preventsOutgoingHealing, revealsStealth, magicAttackReduction, physicalAttackReduction, damagePerRound, statsReduced, percentReducedBy));
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
}

/*Creates a new empty game */
var myGame = new Game([],[],[],[],[]);


//Functional status effects
myGame.addStatusEffect("stunned", "Stunned characters lose their turn", 1);
myGame.addStatusEffect("harmless", "Harmless characters cannot use any attacks.", 0, 1);
myGame.addStatusEffect("silenced", "Silenced characters cannot use magic on their turn", 0, 0, 1);
myGame.addStatusEffect("immobilized", "Immobilized characters cannot use physical attacks on their turn.", 0, 0, 0, 1);
myGame.addStatusEffect("hopeless", "Hopeless characters will refuse healing from allies", 0, 0, 0, 0, 1);
myGame.addStatusEffect("selfish", "Selfish characters will not cast any spells on their allies", 0, 0, 0, 0, 0, 1);




//Damage reduction status effects
myGame.addStatusEffect("unfocused", "Unfocused characters have their magic damage reduced by 25%", 0, 0, 0, 0, 0, 0, 0, 25);
myGame.addStatusEffect("disarmed", "Disarmed characters have their physical damage reduced by 25%", 0, 0, 0, 0, 0, 0, 0, 0, 25);

//Stat status effects
myGame.addStatusEffect("weakened", "Weakened characters have their strength reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "strength", reducedBy: 50 }]);
myGame.addStatusEffect("exposed", "Exposed characters have their defense reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "defense", reducedBy: 50 }]);
myGame.addStatusEffect("confused", "Confused characters have their wisdom reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "wisdom", reducedBy: 50 }]);
myGame.addStatusEffect("intimidated", "Intimidated characters have their resilience reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "resilience", reducedBy: 50 }]);
myGame.addStatusEffect("dazed", "Dazed characters have their dexterity reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "dexterity", reducedBy: 50 }]);
myGame.addStatusEffect("surrounded", "Surrounded characters have their evasion reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "evasion", reducedBy: 50 }]);
myGame.addStatusEffect("cursed", "Cursed opponents have their luck reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,[{ statReduced: "luck", reducedBy: 50 }]);
myGame.addStatusEffect("slowed", "Slowed characters have their speed reduced by 50%", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [{ statReduced: "speed", reducedBy: 50 }]);

//Damage status effect
myGame.addStatusEffect("bleeding", "Bleeding characters will take damage at the end of each turn rotation", 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);

//Base status effect (for abilities, not characters)
myGame.addStatusEffect("none", "Abilities with no status effect behave as normal");

//Initialize abilities (100 targets = all targets)
//Single Target Physical Attacks
myGame.addAbility("Slice", "bleeding", 33, 1, "enemy", 1, 90, "strength", 0.66);
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
myGame.addPlayer("Player 1", [ "Slice", "Sweep", "Minor Heal", "Minor Group Heal", "Minor Arcane Beam", "Minor Arcane Barrage"], 5, 5, 5, 5, 5, 5, 25, 25, 5, 50, []);

//Initialize Allies
myGame.addAlly("Ally 1", [ "Minor Heal", "Minor Arcane Beam" ], 5, 5, 5, 5, 5, 5, 25, 25, 5, 50, []);

//Initialize Enemies
myGame.addEnemy("Enemy 1", ["Punch","Minor Arcane Beam", "Slice", "Minor Heal"], 5, 5, 5, 5, 5, 5, 25, 25, 5, 50, []);
myGame.addEnemy("Enemy 2", ["Minor Group Heal", "Minor Arcane Beam", "Sweep"], 5, 5, 5, 5, 5, 5, 25, 25, 5, 50, []);

myGame.playGame();