const { all } = require('async');


class UI {
    //Creates or returns the singleton UI (no parameters)
    constructor() {}

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

    /*
    This function sends a message to the user (not for debugging)
    Parameters:
        Message: The message to be sent
        Tabbed: The indentation of the message to be sent (for CLI only)
    Returns:
        None; Communicates the given message to the user
    */
    messageUser(message, tabbed = 2) {
        var tabString = "";
        for(var i = 0; i < tabbed; i++) {
            tabString += "\t";
        }
        console.log(tabString + message);
    }

    /*
    This function will prompt the player for which enemy (singular) they want to attack and return the enemy object
    Parameters:
        Reprompt: A boolean value to determine whether or not the player has already failed the prompt
        Character: The character that is making an attack
    Returns:
        Enemy: The enemy to be attacked
    */
    promptForEnemy(game, character, reprompt = 0) {
        var enemyList = game.stealthCheck(game.enemies, character);
        for(var i = 0; i < enemyList.length; i++) {
            //TEST: UI.messageUser(enemyList[i].toString());
            this.messageUser(enemyList[i].promptString(), 3);
        }
        if(reprompt) {
            this.messageUser("Your character doesn't see that enemy anywhere! Please try again.");
        }
        var enemyToAttack = this.getUserInput("Which enemy would you like to attack?");
        var enemy = game.getEnemyByName(enemyToAttack);
        if(enemy === -1 || (enemy.conditions.isStealthed && !character.conditions.seesStealth)) {
            return this.promptForEnemy(character, game, 1);
        }
        else {
            return enemy;
        }
    }
    

    /*
    This function will prompt the player for which enemies they want to attack and return an array of enemy objects
    Parameters:
        Number of Enemies: The number of enemies that the ability will hit
        Character: The character making an attack
    Returns:
        Enemies to Attack: An array of enemies that an attack will hit
    */
    promptForEnemies(game, character, numEnemies) {
        //TEST: console.log(character.toString());
        var enemiesToAttack = [];
        var enemyList = game.stealthCheck(game.enemies, character);
        if(numEnemies >= enemyList.length) {
            this.messageUser("This attack will attempt to hit all enemies.");
            return enemyList;
        }
        while(numEnemies > 0) {
            if(numEnemies === 1) {
                this.messageUser("Please select an enemy to attack. You can attack 1 more enemy.");
            }
            else {
                this.messageUser("Please select an enemy to attack. You can attack " + numEnemies.toString() + " more enemies.");
            }
            var enemy = this.promptForEnemy(game, character, );
            enemiesToAttack.push(enemy);
            numEnemies--;
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
    promptForAlly(game, character, reprompt = 0) {
        var allyList = game.stealthCheck(game.allies, character);
        for(var i = 0; i < allyList.length; i++) {
            this.messageUser(allyList[i].promptString(), 3);
        }
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
        var ally = game.getAllyByName(allyToHeal);
        if(ally === -1 || (ally.conditions.isStealthed && !character.conditions.seesStealth)) {
            return this.promptForAlly(1, character);
        }
        else if(!ally.conditions.canReceiveHealing) {
            return this.promptForAlly(2, character);
        }
        else {
            return ally;
        }
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
    promptForAllies(game, character, numAllies) {
        var alliesToHeal = [];
        var allyList = game.stealthCheck(game.allies.concat(game.players), character);
        if(numAllies >= allyList.length) {
            this.messageUser("This spell will attempt to heal all allies.");
            return allyList;
        }
        while(numAllies > 0) {
            this.messageUser("Please select an ally to heal. You can heal " + numAllies.toString() + " more allies.");
            var ally = this.promptForAlly(game, character);
            alliesToHeal.push(ally);
            numAllies--;
        }
        return alliesToHeal;
    }


    promptForTarget(ability, availableTargets) {
        this.messageUser("Possible targets:");
        for(var i = 0; i < availableTargets.length; i++) {
            this.messageUser(availableTargets[i].promptString(), 3);
        }
        var target = this.getUserInput("Which " + ability.targetType + " would you like to target with " + ability.name + "?");
        //TEST: console.log(availableTargets);
        //TEST: console.log(target);
        availableTargets = availableTargets.filter(item => item.name === target);
        if(availableTargets.length === 0) {
            this.messageUser("Target not found. Please try again.");
            return this.promptForTarget(ability, availableTargets);
        }
        else if(availableTargets.length > 1) {
            this.messageUser("Multiple targets found with that name. Please select which one you'd like to target.")
            for(var i = 1 ; i < availableTargets.length + 1; i++) {
                this.messageUser("Target " + i + ": " + availableTargets[i - 1].toString())
            }
            var targetCheck = this.getUserInput("Which target would you like to attack?");
            target = availableTargets[parseInt(targetCheck) - 1];
        }
        else {
            return availableTargets[0];
        }
    }

    promptForTargets(game, character, ability) {
        var availableTargets = ability.getAvailableTargets(game, character);
        var selectedTargets = []
        if(ability.numTargets > availableTargets.length) {
            this.messageUser(character.name + "'s " + ability.name + " ability will affect all possible targets.");
            selectedTargets = availableTargets;
        }
        else {
            var numTargets = ability.numTargets;
            while(numTargets > 0) {
                this.messageUser("You can choose " + numTargets + " more targets to be affected by " + ability.name + ".");
                selectedTargets.push(this.promptForTarget(ability, availableTargets));
                numTargets--;
            }
        }
        return selectedTargets;
    }


    /*
    This function will prompt the player for what ability they want to use
    Parameters:
        Game: The game that is being played
        Character: The character being prompted for an ability
        Reprompt: A value denoting the reason for reprompt (0 for first prompt)
    Returns:
        Ability: Returns the ability if the player has it and it is in the game; otherwise reprompts
    */
    promptForAbility(game, character, reprompt = 0) {
        var availableAbilities = character.getAvailableAbilities(game);
        if(availableAbilities === -1) {
            return -1;
        }
        this.messageUser("The following abilities can be used on this turn:");
        for( var i = 0; i < availableAbilities.length; i++) {
            this.messageUser(availableAbilities[i].name, 3);
        }
        //TEST: UI.messageUser(player.conditions);
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
            case 5:
                this.messageUser("Your character cannot use attacks on this turn. Please try again.");
                break;
            default:
                break;
        }
        var abilityToUse = this.getUserInput("Which ability would you like to use?");
        const ability = game.getAbilityByName(abilityToUse);
        if(ability.modifier === 'wisdom' && !character.conditions.canMagicAttack) {
            return this.promptForAbility(2, character);
        }
        else if(ability.modifier === 'strength' && !character.conditions.canPhysicalAttack) {
            return this.promptForAbility(3, character);
        }
        else if(ability.targetType === 'ally' && !character.conditions.canGiveHealing) {
            return this.promptForAbility(4, character);
        }
        else if(ability.targetType === 'enemy' && !character.conditions.canAttack) {
            return this.promptForAbility(5, character);
        }
        else if(ability !== -1 && character.abilities.includes(abilityToUse)) {
            //TEST: console.log("Before: " + ability.toString());
            return ability;
        }
        else {
            return this.promptForAbility(1, character);
        }
    }


    /*
    This function informs the user of the status of the game
    Parameters:
        None; uses the game's properties to display the state of the game
    Returns:
        None; see above
    */
    getGameStatus(game) {
        this.messageUser("Players:");
        for(var i = 0; i < game.players.length; i++) {
            this.messageUser(game.players[i].promptString(), 3);
        }
        this.messageUser("Allies:");
        for(var i = 0; i < game.allies.length; i++) {
            this.messageUser(game.allies[i].promptString(), 3);
        }
        this.messageUser("Enemies:");
        for(var i = 0; i < game.enemies.length; i++) {
            this.messageUser(game.enemies[i].promptString(), 3);
        }
    }
}


//creates an exports a single UI object (singleton)
const exportUI = new UI();
module.exports = exportUI;