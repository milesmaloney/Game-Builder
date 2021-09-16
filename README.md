# Game-Builder

This Game Builder is a customizable turn-based game creator that allows you to define status effects, players, enemies, allies, and abilities, and have the players and allies fight using their given abilities. Eventually, this project intends to include progression of player characters against more and more challenging enemies.


Issues:
    Stat changes do not have any timer related to them and they need some way to store the duration while the stats are reduced

To-do:
    Create startgame function that defines the game over condition (all allies + players or enemies are dead) and runs the turn loop
    Create status effect execution function that executes the stat changes of a status effect
    Negative stat values currently will return negative values for most calculations, but I eventually want them to function similarly to positive values and return for example, positive damage when an enemy has negative armor.
    Add initial player values and level-up modifications
    Add a psuedorandom enemy progression to further challenge player
    Create user interface beyond command line (stretch goal)
