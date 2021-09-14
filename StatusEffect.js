/*
Status effect attributes and their effects:
    Name: The name of the status effect
    Effect: A string describing what the status effect will do

NOTE: Status effects need to be handled on a per-game basis using conditionals
*/
export default class StatusEffect {
    constructor(name, effect, endsTurn = false, preventsMagicAttacks = false, preventsPhysicalAttacks = false, preventsIncomingHealing = false, preventsOutgoingHealing = false, magicAttackReduction = 0, physicalAttackReduction = 0, damagePerRound = 0, statsReduced = [], percentReducedBy = []) {
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