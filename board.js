/**
 * <p>
 * Controls boarding of an enemy
 * <p>
 * 
 * @(#)board.java   v1.20 08/04/10
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

function board(k, e, a)
{
    this.applet = k;
    this.currentPlayer = k.getCurrentPlayer();
    this.font = k.getCGAFont();
        
    this.currentEnemy = e;
    this.currentAttack = a;
    
    this.shipY = 0;
    this.flagY = 0;
    
    this.playerMenLost = 0;
    this.enemyMenLost = 0;
    
    // Used so that last rounds loses is shown while doing flag animation
    this.playerMenShow=0;
    this.enemyMenShow=0;

    this.playerMenLostShow = 0;
    this.enemyMenLostShow = 0; 
    
    this.currentState = null; // What part of boarding are we at now

    /**
 * Prepare boarding variables
 */
    this.resetBoarding = function()
    {
        this.playerMenLost = 0;
        this.enemyMenLost = 0;
        this.playerMenLostShow = 0;
        this.enemyMenLostShow = 0;
        this.shipY = 220; // Ship animation start Y axis point
        this.flagY = 36; // Flag animation start Y axis point
        this.currentState = board.stateType.SHIP_ANIMATION;
    }

    this.resetBoarding();
    
    /**
     * Fake paint method called from Applet.paint
     */
    this.paint = function(g)
    {
        this.font.setCurrentMode(cgafont.modes.CGA_MODE1);

        // Show ship animation
        g.drawImage(img_ship_board_en, 372, 30); 
        g.drawImage(img_ship_board_da, 352, this.shipY);
        
        // Show flag animation (but only when enemy surrendered)
        if (this.currentState == board.stateType.FLAG_ANIMATION)
        {
            g.drawImage(img_flag_pole, 96, 24);
            if (this.currentEnemy.getEnemyType() == 7)
                g.drawImage(img_flag_pirate, 106, this.flagY);
            else
                g.drawImage(img_flag_en, 106, this.flagY);
        }

        // Do not show text while doing startup ship animation
        if (this.currentState != board.stateType.SHIP_ANIMATION)
        {
            this.applet.getMap().paint(g); // Paint stats in bottom of screen
            g.drawImage(this.font.getResource("Boarding1"), 0, 128);
            var enemyName = this.currentEnemy.getName();
            if (this.currentEnemy.getEnemyType() != 7)
                enemyName = this.font.getResourceAsString("BoardingEnemyName1") + enemyName.substring(enemyName.indexOf(" "));
            else
                enemyName = this.font.getResourceAsString("BoardingEnemyName2");
            g.drawImage(this.font.getResource("Boarding2", enemyName), 0, 144);
            g.drawImage(this.font.getResource("Boarding3", this.enemyMenLostShow), 0, 160);
            g.drawImage(this.font.getResource("Boarding4", this.enemyMenShow), 0, 176);
            g.drawImage(this.font.getResource("Boarding5", this.playerMenLostShow), 0, 192);
            g.drawImage(this.font.getResource("Boarding6"), 0, 224);
            g.drawImage(this.font.getResource("Boarding7"), 0, 240);
            if (this.currentState == board.stateType.FLAG_ANIMATION) // Hack - needed for flag animation scene
            {
                g.drawImage(this.font.getString("          "), 25, 368);
                g.drawImage(this.font.getResource("Map9", this.playerMenShow), 25, 368);
            }
        }
    }
    
    /**
     * Controls keyboard character events
     */
this.keyEvent = function(c)
    {
    if (this.currentState == board.stateType.BOARDING)
        {
        var fight = this.font.getResourceAsString("BoardTypeF").charAt(0);
        var withdraw = this.font.getResourceAsString("BoardTypeW").charAt(0);

            if (c.toLowerCase() == fight)
                this.boardEnemy(); // Board enemy once more
            else if (c.toLowerCase() == withdraw) // Withdraw from shooting
                this.currentAttack.setCurrentAttack(attack.attackType.WITHDRAW);
        }
    }
        
    // ------------------- Methods in this game object not specified by interface -------------------

    
    
    /**
     * Show animation of boarding ship
     * (with help from run method in kaper class)
     */
    this.showShipAnimation = function()
    {
        if (this.shipY > 50) // Ship still moving
        {
            this.applet.animationRepaint = true;
            this.shipY -= 20; 
        }
        else // Animation done
        {
            this.applet.animationRepaint = false;
            this.currentState = board.stateType.BOARDING;
            this.boardEnemy(); // Make first boarding
        }
    }
    
    /**
     * Show animation of surrendering enemy
     * (with help from run method in kaper class)
     */
            this.showFlagAnimation = function()
    {
                if (this.flagY < 78) // Flag still moving
        {
                    this.applet.animationRepaint = true;
                    this.flagY += 1;
        }
        else // Animation done
        {
                    this.applet.animationRepaint = false;
                    this.currentEnemy.checkEnemyStatus(); // We allready know enemys dead, so this should change game status
                    this.applet.repaint(); // Animation has ended, update screem with new game status
        }
    }
    
    /**
     * Board enemy (both sides looses men)
     */
    this.boardEnemy = function()
    {
        playsound("flute1");
        var playerMen = this.currentPlayer.getMen();
        var playerExp = this.currentPlayer.getExperience();
        var playerLost = this.currentPlayer.getBattlesLost();
        var playerDiff = this.currentPlayer.getDifficulty();
        var enemyMen = this.currentEnemy.getMen();
        var enemyMenTenth = Math.round(enemyMen / 10);
        
        // Calculate win/loose factor
        // (the lower the number, the more loses the enemy will suffer)
        var wlMen = enemyMen / playerMen; // Factor of men
        var wlExp = (playerExp + playerLost) / playerExp; // Factor of attack experience
        var wlDiff = playerDiff / 10; // Factor of difficulty
        var wlFactor = wlMen * wlExp * wlDiff;
        if (wlFactor > 1.2) wlFactor = 1.2;
        if (wlFactor < 0.6) wlFactor = 0.6;

        // Calculate player loses
        //Random r = new Random();
        var d = Math.random();
        this.playerMenLost = Math.round(playerMen * wlExp * (playerDiff * d / 30));
        this.currentPlayer.setMen(playerMen - this.playerMenLost);
        
        this.currentPlayer.checkPlayerStatus();
        
        // No need to go any furhter if player died by enemy hand
        if (this.currentPlayer.getDeathReason() != player.causeOfDeath.NOT_YET)
            return;        

        // Calculate enemy loses
        this.enemyMenLost = Math.round(this.playerMenLost / wlFactor);
        if (this.enemyMenLost < enemyMenTenth) this.enemyMenLost = enemyMenTenth; // Enemy always looses at least 1/10 of his men
        this.currentEnemy.setMen(enemyMen - this.enemyMenLost);
        
        // If enemy surrenders, start flag animation
        // (Hack - made here to show animation before enemy changes game status)
        if (this.currentEnemy.getMen() < 20)
        {
            if (this.enemyMenLostShow == 0) this.updateShowVariables(); // Update show if enemy dies in first attack
            this.currentState = board.stateType.FLAG_ANIMATION;
            this.showFlagAnimation();
        }
        else // Enemy not dead yet, update loses to show on screen
        {
            this.updateShowVariables();
        }
    }
    
    /**
     * Update player and enemy loses for show on screen
     * (If enemy dies, screen should not be updated)
     */
    this.updateShowVariables = function()
    {
        this.playerMenShow = this.currentPlayer.getMen();
        this.enemyMenShow = this.currentEnemy.getMen();
        this.playerMenLostShow = this.playerMenLost;

        // Wierd error from original game
        //if (enemyMenLost > 7)
        this.enemyMenLostShow = this.enemyMenLost;
        //else
        //    enemyMenLostShow = 7;
    }
    
    
    // ------------------- PROPERTIES -------------------

    
    /**
     * Property for current state
     */
    this.getCurrentState = function()
    {
        return this.currentState;
    }
}

    board.stateType = { SHIP_ANIMATION:0, BOARDING:1, FLAG_ANIMATION:2 };
