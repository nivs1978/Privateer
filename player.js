/**
 * <p>
 * This class encapsulates the player concept
 * <p>
 * 
 * @(#)player.java   v1.20 08/04/10
 * 
 * @author: Rune P. Olsen
 * @version: 1.20 of April the 10th 2008
 * @see: This version is meant as a tribute to P. O. Frederiksen (http:/www.kaptajnkaper.dk)
 *
 * Ported to Javascript by Hans Milling
 */

/**
 * Constructor
 */
function player(k)
{
    /**
     * Calculate next promotion details
     */
    this.calculateNextPromotion = function () {
        this.difficulty += 2;
        this.scoreToNextPromotion = this.score + 500 + 250 * this.difficulty;
        this.maxMovesBeforeNextPromotion = this.moves + 325 - Math.round(12.5 * this.difficulty);
    }

    /**
 * Reset player data
 */
    this.resetPlayer = function () {
        this.name = "";
        this.score = 0;
        this.moves = 0;
        this.difficulty = 0;
        this.posX = 10;
        this.posY = 10;

        this.money = 600;
        this.cannons = 20;
        this.men = 200;
        this.reparation = 200;
        this.jewels = 0;
        this.grain = 30;

        this.calculateNextPromotion();

        this.eventExp = 2; // Experience starts at 2 according to original game
        this.battlesWon = 1;
        this.battlesLost = 1;

        this.prizeMen = 0;
        this.prizeMoney = 0;

        this.deathReason = player.causeOfDeath.NOT_YET;
    }

    this.name = ""; // Name of player
    this.score = 0; // Score of player
    this.moves = 0; // Number of moves so far
    this.difficulty = null; // Difficulty used as factor to calculate lots of things in game
    this.posX = 0;
    this.posY = 0; // Position of players ship

    this.money = 0;
    this.cannons = 0;
    this.men = 0;
    this.reparation= 0;
    this.jewels = 0; // Resources

    this.grain = 0 // Resources

    this.scoreToNextPromotion = 0; // Score to reach for next promotion
    this.maxMovesBeforeNextPromotion = 0; // Max number of moves before next promotion
    
    // Player has two ranks (a military rank and a civil title)
    this.rankType1 = [ "SEAMAN", "CAPTAIN", "LEFTENANTCOMMANDER", "COMMANDER", "ADMIRAL" ];
    this.rankType2 = [ "CITISEN", "BARON", "VISCOUNT", "COUNT", "ROYAL_HEIR" ];
    
    this.eventExp = 0; // Event experience
    this.battlesWon = 0; // Count of wins against enemy ships
    this.battlesLost = 0; // Count of loses against enemy ships
    
    // The prizing that awaits the player when arriving Copenhagen
    this.prizeMen = 0;
    this.prizeMoney = 0;
    
    this.deathReason = null; // Reason why player died (if he his dead yet)

    this.applet = k;
    this.resetPlayer();
    
    /**
     * Check if player is to be promoted
     */
    this.checkForPromotion = function()
    {
        if (this.score >= this.scoreToNextPromotion) // Player is to be promoted
        {
            this.calculateNextPromotion();
            this.applet.setCurrentAction(kaper.actionType.PROMOTE);
        }
    }
    
    /**
     * Check player status
     */
    this.checkPlayerStatus = function()
    {
        // Check if to many resources
        if (this.money > 30000) this.deathReason = player.causeOfDeath.TOO_MANY_MONEY;
        if (this.men > 500) this.deathReason = player.causeOfDeath.TOO_MANY_MEN;
        if (this.cannons > 150) this.deathReason = player.causeOfDeath.TOO_MANY_CANNONS;
        if (this.grain > 700) this.deathReason = player.causeOfDeath.TOO_MANY_GRAIN;
        
        // Check if enough resources
        if (this.reparation <= 20 || this.men <= 10) this.deathReason = player.causeOfDeath.TOO_FEW_RESOURCES;
        
        // Check if too many moves (compared to score)
        if (this.moves >= this.maxMovesBeforeNextPromotion) this.deathReason = player.causeOfDeath.TOO_MANY_MOVES;
        
        // If player just died change game status
        if (this.deathReason != player.causeOfDeath.NOT_YET)
        {
            this.applet.setCurrentStep(kaper.stepType.GAME_LOST);
            this.applet.setCurrentAction(kaper.actionType.MAP);
            this.applet.animationRepaint = false; // In case that died when sailing into harbor
        }
    }
    
    /**
     * Collect player prize men and money
     */
    this.collectPrizes = function()
    {
        this.score += this.prizeMoney / 10;
        this.men += this.prizeMen;
        this.money += this.prizeMoney;
        if (this.money > 30000) this.money = 30000;
        this.prizeMen = 0;
        this.prizeMoney = 0;
    }
    
    
    // ------------------- PROPERTIES -------------------
    
    
    /**
     * Properties for players name
     */
    this.getName = function()
    {
        return this.name;
    }

    this.setName = function(n)
    {
        this.name = n;
    }

    /**
     * Properties for players score
     */
    this.getScore = function()
    {
        return this.score;
    }
    this.addToScore = function(p)
    {
        this.score += p;
    }

    /**
     * Properties for players experience
     */
    this.getExperience = function()
    {
        return this.eventExp;
    }

    this.addToExperience = function()
    {
        this.eventExp += 1;
    }

    this.getBattlesWon = function()
    {
        return this.battlesWon;
    }
    this.addToBattlesWon = function()
    {
        this.battlesWon += 1;
    }
    this.getBattlesLost = function()
    {
        return this.battlesLost;
    }
    this.addToBattlesLost = function()
    {
        this.battlesLost += 1;
    }

    /**
     * Properties for players moves
     */
    this.getMoves = function()
    {
        return this.moves;
    }
    this.addMove = function()
    {
        this.moves += 1;
 
        // Grain is used when moving
        this.setGrain(this.grain - this.getMen() * (this.difficulty * 1.0 / 800.0));
        
        // As inoriginal game, promotion can only happen while moving ship
        this.checkForPromotion();
    }

    /**
     * Properties for players money
     */
    this.getMoney = function()
    {
        return this.money;
    }
    this.setMoney = function(m)
    {
        this.money = m;
    }
    
    /**
     * Property for players difficulty
     */
    this.getDifficulty = function()
    {
        return this.difficulty;
    }

    /**
     * Properties for players grain
     */
    this.getGrain = function()
    {
        // No need to show that grain is double
        return Math.round(this.grain);
    }
    this.setGrain = function(g)
    {
        this.grain = g;

        // If no more grain, some of the players men dies instead
        if (this.grain < 0)
        {
            this.grain = 0;
            this.setMen(Math.floor(0.9 * this.getMen()));
        }
    }
    
    /**
     * Properties for players men
     */
    this.getMen = function()
    {
        return this.men;
    }
    this.setMen = function(m)
    {
        this.men = Math.floor(m);
        if (this.men < 0) this.men = 0;
    }

    /**
     * Properties for players cannons
     */
    this.getCannons = function()
    {
        return this.cannons;
    }
    this.setCannons = function(c)
    {
        this.cannons = Math.floor(c);
        if (this.cannons < 0) this.cannons = 0;
    }

    /**
     * Properties for players reparation points
     */
    this.getReparation = function()
    {
        return this.reparation;
    }
    this.setReparation = function(r)
    {
        reparation = Math.floor(r);
        if (this.reparation < 0) this.reparation = 0;
    }

    /**
     * Properties for players jewels
     */
    this.getJewels = function()
    {
        return this.jewels;
    }
    this.setJewels = function(j)
    {
        this.jewels = Math.floor(j);
    }   
    
    /**
     * Properties for control of promotions
     */
    this.getMaxMovesBeforeNextPromotion = function()
    {
        return this.maxMovesBeforeNextPromotion;
    }
    this.getScoreToNextPromotion = function ()
    {
        return this.scoreToNextPromotion;
    }
    
    /**
     * Properties for players position
     */
    this.getPosX = function()
    {
        return this.posX;
    }
    this.setPosX = function(x)
    {
        this.posX = x;
    }
    this.getPosY = function()
    {
        return this.posY;
    }
    this.setPosY = function(y)
    {
        this.posY = y;
    }
    
    /**
     * Property for players death reason
     */
    this.getDeathReason = function()
    {
        return this.deathReason;
    }
    
    /**
     * Properties for players rank
     */
    this.getRankType1 = function()
    {
        var internalRankName = this.rankType1[(Math.floor(this.difficulty - 2) / 2)];
        return this.applet.getCGAFont().getResourceAsString("PlayerRank1_" + internalRankName);
    }
    this.getRankType2 = function()
    {
        var internalRankName = this.rankType2[Math.floor((this.difficulty - 2) / 2)];
        return this.applet.getCGAFont().getResourceAsString("PlayerRank2_" + internalRankName);
    }

    /**
     * Properties for players prizing (men)
     */
    this.getPrizeMen = function()
    {
        return this.prizeMen;
    }
    this.addToPrizeMen = function(m)
    {
        this.prizeMen += Math.floor(m);
    }   

    /**
     * Properties for players prizing (money)
     */
    this.getPrizeMoney = function()
    {
        return this.prizeMoney;
    }
    this.addToPrizeMoney = function(m)
    {
        this.prizeMoney += Math.floor(m);
    }   
}

player.causeOfDeath = { NOT_YET: 0, TOO_MANY_MONEY: 1, TOO_MANY_MEN: 2, TOO_MANY_CANNONS: 3, TOO_MANY_GRAIN: 4, TOO_FEW_RESOURCES: 5, TOO_MANY_MOVES: 6 };
