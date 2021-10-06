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
    This function prompts a new player for their starting customization
    Parameters:
        Game: The game the player is being added to
    Returns:
        Object:
            Name: The name of the new player
            Class: The class of the new player
    */
    promptforNewPlayer(game) {
        var characterName = this.checkForUserApproval("What would you like to name your character?", "Are you sure you would like to name your character ");
        this.messageUser("Classes: ");
        for(var i = 0; i < game.characterClasses.length; i++) {
            this.messageUser(game.characterClasses[i].promptString(), 3);
        }
        const classValidityCheck = (className) => {
            if(game.getCharacterClassByName(className) !== -1) {
                return 1;
            }
            else{
                this.messageUser(className + " does not exist as a class. Please try again.");
                return 0;
            }
        }
        var className = this.checkForUserApproval("What class would you like your character to be?", "Are you sure you would like the class ", classValidityCheck);
        return {name: characterName, class: className};
    }


    /*
    This function checks for a user's approval on a user input and checks any functions passed to validate the user's input
    Parameters:
        Query: The query to ask for the user's input
        Followup: The followup to the user to validate their input
        Validity Check (optional): A function to validate the user's input
    Returns:
        Input: Returns the user input that passed the validity check and user check
    */
    checkForUserApproval(query, followup, validityCheck = undefined) {
        var check = 'n';
        while(check.toLowerCase() === 'no' || check.toLowerCase() === 'n') {
            var input = this.getUserInput(query);
            if(typeof validityCheck !== 'undefined') {
                if(!validityCheck(input)) {
                    continue;
                }
            }
            check = this.getUserInput(followup + input + "? Please Type Y/N for yes/no.");
            if(check.toLowerCase() !== 'yes' && check.toLowerCase() !== 'y') {
                check = 'n';
            }
        }
        return input;
    }


    promptForTarget(ability, availableTargets) {
        this.messageUser("Possible targets:");
        for(var i = 0; i < availableTargets.length; i++) {
            this.messageUser(availableTargets[i].promptString(), 3);
        }
        var target = this.getUserInput("Which " + ability.targetType + " would you like to target with " + ability.name + "?");
        availableTargets = availableTargets.filter(item => item.name.toLowerCase() === target.toLowerCase());
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

    /*
    This function prompts the user for which targets they want to affect
    Parameters:
        Game: The game we are targetting characters in
        Character: The character that is using an ability
        Ability: The ability being used
    Returns:
        Selected Targets: An array of targets selected by the user
    */
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
                var plural = '';
                if(numTargets > 1) {
                    plural = 's';
                }
                this.messageUser("You can choose " + numTargets + " more target" + plural + " to be affected by " + ability.name + ".");
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
        var availableAbilities = character.getAvailableAbilities(game);
        if(availableAbilities === -1) {
            return -1;
        }
        this.messageUser("The following abilities can be used on this turn:");
        for( var i = 0; i < availableAbilities.length; i++) {
            this.messageUser(availableAbilities[i].name, 3);
        }
        var abilityToUse = this.getUserInput("Which ability would you like to use?");
        const ability = game.getAbilityByName(abilityToUse);
        if(ability.modifier === 'wisdom' && !character.conditions.canMagicAttack) {
            return this.promptForAbility(game, character, 2);
        }
        else if(ability.modifier === 'strength' && !character.conditions.canPhysicalAttack) {
            return this.promptForAbility(game, character, 3);
        }
        else if(ability.targetType === 'ally' && !character.conditions.canGiveHealing) {
            return this.promptForAbility(game, character, 4);
        }
        else if(ability.targetType === 'enemy' && !character.conditions.canAttack) {
            return this.promptForAbility(game, character, 5);
        }
        else if(ability !== -1 && (character.abilities.includes(abilityToUse) || character.abilities.map(item => item.toLowerCase()).includes(abilityToUse))) {
            return ability;
        }
        else {
            return this.promptForAbility(game, character, 1);
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