/*
Ability attributes and their effects:
    Name: The name of the ability
    Status Effect: The status effect the ability afflicts
    Chance: The chance of the status effect proccing
    Duration: The duration of the status effect
    Target Type: The type of character the ability targets
    Number of Targets: the number of targets the ability targets
    Modifier: The strength/magic modifier (either or) of the ability
    Multiplier: The percentage of the strength/magic stat the ability will use for damage
*/
class Ability {
    constructor(name, statusEffect, chance, duration, targetType, numTargets, accuracy, modifier, multiplier) {
        this.name = name;
        this.statusEffect = statusEffect;
        this.chance = chance;
        this.duration = duration;
        this.targetType = targetType;
        this.numTargets = numTargets;
        this.accuracy = accuracy;
        this.modifier = modifier;
        this.multiplier = multiplier;
    }

    toString() {
        return "Ability: " + this.name + "\n\tStatus Effect: " + this.statusEffect + "\n\t\tChance of Applying: " + this.chance + "\n\t\tDuration: " + this.duration + "\n\tTarget Type: " + this.targetType + "\n\tNumber of Targets: " + this.numTargets + "\n\tAccuracy: " + this.accuracy + "\n\tModifier: " + this.modifier + "\n\tMultiplier: " + this.multiplier; 
    }
}

module.exports = Ability