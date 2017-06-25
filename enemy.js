/**
 * <p>
 * This class encapsulates the enemy ship concept
 * <p>
 * 
 * @(#)enemy.java   v1.20 08/04/10
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
function enemy(k, a)
{
    applet = k;
    currentAttack = a;

    // General enemy variables
    this.enemyType = null; // Type of enemy
    this.money = null;
    this.cannons = null;
    this.men = null;
    this.reparation = null; // Resources
    this.grain= 0.0; // Resources

    // Enemy type data is divided into Cannons, Men, Money, Grain
    this.typeData = [[5,80,150,30],     // Merchant ship
                                [10,480,600,15],   // Troopcarrier
                                [2,40,150,4],      // Gunboat
                                [15,140,450,5],    // Frigate
                                [6,50,200,4],      // Brig
                                [1,10,30,1],       // Schooner
                                [50,140,900,20],   // Man o'war
                                [70,200,1500,12]]; // Pirate ship

    this.currentState = null; // Is this enemy still alive and healthy

    /**
     * Prepare random enemy to use in next enemy encounter
     */
    this.prepareNextEnemy = function()
    {
        // Find new random enemy
        // Random r = new Random();
        this.enemyType = Math.floor(Math.random()*8);
        // Set enemy properties
        this.money = this.typeData[this.enemyType][2];
        this.reparation = 100 + Math.floor(Math.random() * 50);
        this.cannons = this.typeData[this.enemyType][0];
        this.men = this.typeData[this.enemyType][1];
        this.grain = 1 + Math.round(Math.random() * this.typeData[this.enemyType][3]);
        this.currentState = enemy.stateType.GOOD;
    }
                                
    this.prepareNextEnemy();

    /**
     * Check enemy status
     */
    this.checkEnemyStatus = function()
    {
        if (this.cannons < 1) this.currentState = enemy.stateType.SURRENDER;
        if (this.men < 20) this.currentState = enemy.stateType.SURRENDER;
        if (this.reparation < 40 - this.applet.getCurrentPlayer().getDifficulty()) this.currentState = enemy.stateType.SURRENDER;
        if (this.reparation < 15) this.currentState = enemy.stateType.SUNK;

        if (this.currentState == enemy.stateType.SURRENDER)
            this.currentAttack.setCurrentAttack(attack.attackType.WON_SURRENDER);
        else if (this.currentState == enemy.stateType.SUNK)
            this.currentAttack.setCurrentAttack(attack.attackType.WON_SUNK);
    }
    
    // ------------------- PROPERTIES -------------------
    
    
    /**
     * Property for enemys name
     */
    this.getName = function()
    {
        // Cannot presave enemys name, because we don't know the locale when game starts
        return this.applet.getCGAFont().getResourceAsString("EnemyName" + (this.enemyType + 1));
    }

    /**
     * Property enemys money
     */
    this.getMoney = function()
    {
        return this.money;
    }

    /**
     * Property for enemys grain
     */
    this.getGrain = function()
    {
        // No need to show that grain is double
        return Math.round(this.grain);
    }
    
    /**
     * Properties for enemys men
     */
    this.getMen = function()
    {
        return this.men;
    }

    this.setMen = function(m)
    {
        this.men = m;
        if (this.men < 0) this.men = 0;
    }

    /**
     * Properties for enemys cannons
     */
    this.getCannons = function()
    {
        return this.cannons;
    }
    this.setCannons = function(c)
    {
        this.cannons = c;
        if (this.cannons < 0) this.cannons = 0;
    }

    /**
     * Properties for enemys reparation points
     */
    this.getReparation = function()
    {
        return this.reparation;
    }
    this.setReparation = function(r)
    {
        this.reparation = r;
        if (this.reparation < 0) this.reparation = 0;
    }
    
   /**
     * Property for enemys prizing costs
     */
    this.getPrizeCost = function()
    {
        return 5 + this.men / 2;
    }
    
    /**
     * Property for enemys type
     */
    this.getEnemyType = function()
    {
        return this.enemyType;
    }
    
    /**
     * Property for enemys state
     */
    this.getCurrentState = function()
    {
        return this.currentState;
    }
}

enemy.stateType = { GOOD:0, SURRENDER:0, SUNK:0 };
