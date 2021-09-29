

/*
CharacterClass holds the base stats and abilities as well as leveling upgrades for each class
Attributes:
    Class Name: The name of the character class
    Abilities: The base abilities of the character class
    Base Stats: The base stats for each stat for the character class
    Class Level Ups: 
        Stats: Frequency of automatic stat increases for each stat  
        Abilities: the abilities to be received on leveling up to certain levels
*/
class CharacterClass {
    constructor(className, description, abilities, baseStrength, baseWisdom, baseDefense, baseResilience, baseDexterity, baseEvasion, baseSpeed, baseLuck, baseMaxHP, classLevelUps) {
        this.name = className;
        this.description = description;
        this.abilities = abilities;
        this.baseStats = {
            strength: baseStrength,
            wisdom: baseWisdom,
            defense: baseDefense,
            resilience: baseResilience,
            dexterity: baseDexterity,
            evasion: baseEvasion,
            speed: baseSpeed,
            luck: baseLuck,
            maxHealth: baseMaxHP
        }
        this.classLevelUps = classLevelUps;
    }

    promptString() {
        var string = this.name + ":\n\t\t\t\t" + this.description + "\n\t\t\t\tStarting Abilities:";
        for(var i = 0; i < this.abilities.length; i++) {
            string += "\n\t\t\t\t\t" + this.abilities[i];
        }
        return string;
    }
}
module.exports = CharacterClass;