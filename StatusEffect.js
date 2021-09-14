/*
Status effect attributes and their effects:
    Name: The name of the status effect
    Effect: A string describing what the status effect will do
    Booleans (0 or 1):
        endsTurn: If the affected character loses their turn
        preventsMagicAttacks: If the affected character is prevented from using magic attacks
        preventsPhysicalAttacks: If the affected character is prevented from using physical attacks
        preventsIncomingHealing: If the affected character is prevented from receiving healing
        preventsOutgoingHealing: If the affected character is prevented from giving healing
    magicAttackReduction: A percentage by which the damage of magic attacks of the affected character is reduced
    physicalAttackReduction: A percentage by which the damage of physical attacks of the affected character is reduced
    damagePerRound: The amount of damage the affected character takes on the start of their turn each round
    statsReduced: An array of strings that denotes the stats that are to be reduced.
    percentReducedBy: An array of percentage values (indices should line up with statsReduced) denoting how much each stat is reduced by
NOTE: Status effects need to be handled on a per-game basis using conditionals
*/
class StatusEffect {
    constructor(name, effect, endsTurn = 0, preventsMagicAttacks = 0, preventsPhysicalAttacks = 0, preventsIncomingHealing = 0, preventsOutgoingHealing = 0, magicAttackReduction = 0, physicalAttackReduction = 0, damagePerRound = 0, statsReduced = [], percentReducedBy = []) {
        this.name = name;
        this.effect = effect;
        this.endsTurn = endsTurn;
        this.preventsMagicAttacks = preventsMagicAttacks;
        this.preventsPhysicalAttacks = preventsPhysicalAttacks;
        this.preventsIncomingHealing = preventsIncomingHealing;
        this.preventsOutgoingHealing = preventsOutgoingHealing;
        this.magicAttackReduction = magicAttackReduction;
        this.physicalAttackReduction = physicalAttackReduction;
        this.damagePerRound = damagePerRound;
        this.statsReduced = statsReduced;
        this.percentReducedBy = percentReducedBy;
    }
}

module.exports = StatusEffect