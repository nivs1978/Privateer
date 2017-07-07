/**
 * <p>
 * Controls enemy attacks
 * <p>
 * 
 * @(#)attack.java   v1.20 08/04/10
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
function attack(k)
{
    this.sunkMen = 0; // No of men thrown out when enemy ship is sunk

    this.applet = k;
    this.currentPlayer = k.getCurrentPlayer();
    this.font = k.getCGAFont();

    // The two types of attack
    this.currentEnemy = new enemy(this.applet, this); // Prepare first enemy
    this.currentAttack = attack.attackType.NONE; // No attack started yet. Where in the attack are we

    // Ready both types of attack
    this.currentShoot = new shoot(this.applet, this.currentEnemy, this);
    this.currentBoard = new board(this.applet, this.currentEnemy, this);
        
    // No men sunk at this time
    this.sunkMen = 0;
    
    /**
     * Fake paint method called from Applet.paint
     */
    this.paint = function(g)
    {
        var temp = null;
        
        switch (this.currentAttack)
        {
            case attack.attackType.NONE:
                this.font.setCurrentMode(cgafont.modes.CGA_MODE2);
                this.applet.getMap().paint(g); // Paint stats in bottom of screen
                g.drawImage(this.font.getResource("Attack1"), 0, 0);
                g.drawImage(this.font.getResource("Attack2"), 0, 16);
                g.drawImage(this.font.getResource("Attack3", this.currentEnemy.getName()), 0, 32);
                g.drawImage(this.font.getResource("Attack4", this.currentPlayer.getRankType1(), this.currentPlayer.getName()), 0, 64);
                g.drawImage(this.font.getResource("Attack5"), 0, 80);
                g.drawImage(this.font.getResource("Attack6"), 0, 112);
                break;
                
            case attack.attackType.ATTACK:
                this.font.setCurrentMode(cgafont.modes.CGA_MODE2);
                this.applet.getMap().paint(g); // Paint stats in bottom of screen
                g.drawImage(this.font.getResource("Attacking1"), 0, 0);
                g.drawImage(this.font.getResource("Attacking2"), 0, 16);
                break;
                
            case attack.attackType.SHOOT:
                this.currentShoot.paint(g);
                break;

            case attack.attackType.BOARD:
                this.currentBoard.paint(g);
                break;
                
            case attack.attackType.WITHDRAW:
                this.font.setCurrentMode(cgafont.modes.CGA_MODE2);
                this.applet.getMap().paint(g); // Paint stats in bottom of screen
                g.drawImage(this.font.getResource("Attack6"), 0, 16);
                break;
                
            case attack.attackType.WON_SURRENDER:
                playsound("taps");
            case attack.attackType.WON_PRIZING:
                this.font.setCurrentMode(cgafont.modes.CGA_MODE1);
                g.drawImage(this.font.getResource("AttackSurrender1"), 0, 0);
                g.drawImage(this.font.getResource("AttackSurrender2", this.currentEnemy.getMoney()), 0, 16);
                if (this.currentEnemy.getMen() > 1)
                    g.drawImage(this.font.getResource("AttackSurrender3", this.currentEnemy.getMen()), 0, 32);
                else
                    g.drawImage(this.font.getResource("AttackSurrender4"), 0, 32);
                g.drawImage(this.font.getResource("AttackSurrender5", this.currentEnemy.getGrain()), 0, 48);
                g.drawImage(this.font.getResource("AttackSurrender6"), 0, 64);
                g.drawImage(this.font.getResource("AttackSurrender7"), 0, 96);
                g.drawImage(this.font.getResource("AttackSurrender8", this.currentEnemy.getPrizeCost()), 0, 112);
                g.drawImage(this.font.getResource("AttackSurrender9", this.currentPlayer.getMen()), 0, 128);
                g.drawImage(this.font.getResource("AttackSurrender10"), 0, 144);
                g.drawImage(this.font.getResource("AttackSurrender11"), 0, 160);
                if (this.currentAttack == attack.attackType.WON_PRIZING)
                {
                    g.drawImage(this.font.getResource("AttackSurrender12"), 0, 192);
                    g.drawImage(this.font.getResource("Continue"), 0, 224);
                }
                break;

            case attack.attackType.WON_SUNK:
                playsound("taps");
                this.font.setCurrentMode(cgafont.modes.CGA_MODE1);
                g.drawImage(this.font.getResource("AttackSunk1"), 0, 0);
                var moreLines = 0;
                if (this.sunkMen > 0)
                {
                    g.drawImage(this.font.getResource("AttackSunk2", this.sunkMen), 0, 16);
                    this.moreLines += 16;
                }
                g.drawImage(this.font.getResource("Continue"), 0, 32 + moreLines);
                break;
        }
    }
    
    /**
     * Controls keyboard character events
     */
    this.keyEvent = function(c)
    {
        switch (this.currentAttack)
        {
            case attack.attackType.NONE:
            case attack.attackType.WITHDRAW:
                var a = this.font.getResourceAsString("AttackY").charAt(0);
                var flee = this.font.getResourceAsString("AttackN").charAt(0);

                // Encountering a enemy is an event (which means experience)
                if (this.currentAttack == attack.attackType.NONE) this.currentPlayer.addToExperience();
                            
                if (c.toLowerCase() == a) // Player attacks - ask how to attack
                    this.currentAttack = attack.attackType.ATTACK;
                else if (c.toLowerCase() == flee) // Go back to map
                {
                    playsound("flee");
                    this.resetAttack(attack.type.LOST);
                }
                else // Player has to choose either Attack or Flee
                    playsound("beep"); //Toolkit.getDefaultToolkit().beep();
                break;
            
            case attack.attackType.ATTACK:
                var board = this.font.getResourceAsString("AttackTypeB").charAt(0);
                var shoot = this.font.getResourceAsString("AttackTypeS").charAt(0);

                if (c.toLowerCase() == board) // Attack by boarding ship
                {
                    this.currentAttack = attack.attackType.BOARD;
                    this.currentBoard.resetBoarding();
                    this.currentBoard.showShipAnimation();
                }
                else if (c.toLowerCase() == shoot) // Attack by shooting down ship
                {
                    this.currentAttack = attack.attackType.SHOOT;
                    this.currentShoot.prepareShooting();
                }
                else // Player has to choose either Board or Shoot
                    playsound("beep"); //Toolkit.getDefaultToolkit().beep();
                    
                break;
                
            case attack.attackType.SHOOT:
            case attack.attackType.BOARD:
                if (this.currentAttack == attack.attackType.BOARD)
                    this.currentBoard.keyEvent(c);
                else
                    this.currentShoot.keyEvent(c);
                
                if (this.currentPlayer.getDeathReason() != player.causeOfDeath.NOT_YET)
                    this.resetAttack(attack.type.LOST);
                // Hack - needed to finish flag animation in boarding scene since game status has not been updated yet
                //else if (currentEnemy.getCurrentState() != enemy.stateType.GOOD)
                else if (this.currentEnemy.getMen() < 20)
                    this.currentPlayer.addToScore(this.currentEnemy.getMoney() / 10);

                break;
             
            case attack.attackType.WON_SURRENDER:
                var prize = this.font.getResourceAsString("AttackSurrenderP").charAt(0);
                var sink = this.font.getResourceAsString("AttackSurrenderS").charAt(0);
                
                // Original game always used the value 50 to indicate a fought battle
                this.applet.getMap().setCurrentMapDataValue(50);

                // Give player enemys resources
                this.currentPlayer.setMoney(this.currentPlayer.getMoney() + this.currentEnemy.getMoney());
                var grain = this.currentEnemy.getGrain();
                if (grain == 1) grain = 2;
                this.currentPlayer.setGrain(this.currentPlayer.getGrain() + grain);

                if (c.toLowerCase() == prize) // Prizing enemy ship
                {
                    this.currentAttack = attack.attackType.WON_PRIZING;
                    //Random r = new Random();
                    if (this.currentPlayer.getDifficulty() < Math.floor(Math.random()*16)) // Sometimes prizing goes wrong
                    {
                        this.currentPlayer.addToPrizeMen(this.currentEnemy.getPrizeCost());
                        this.currentPlayer.addToPrizeMoney(this.currentEnemy.getMoney());
                    }
                }
                else if (c.toLowerCase() == sink) // Sinking enemy ship
                {
                    this.currentAttack = attack.attackType.WON_SUNK;
                    var newMen = this.currentPlayer.getMen() + this.currentEnemy.getMen();
                    if (newMen > 500)
                    {
                        this.currentPlayer.setMen(500);
                        this.sunkMen = newMen - 500;
                    }
                    else
                        this.currentPlayer.setMen(newMen);
                }
                else // Player has to choose either Prize or Sink
                    playsound("beep"); //Toolkit.getDefaultToolkit().beep();
                break;
                
            case attack.attackType.WON_PRIZING:
                // Cannont do these thing before all earlier data has been put on screen for the player
                this.currentPlayer.setMen(this.currentPlayer.getMen() - this.currentEnemy.getPrizeCost());
                this.resetAttack(attack.type.WON);
                this.currentPlayer.checkPlayerStatus(); // Check if player didn't have enough men for prizing
                break;

            case attack.attackType.WON_SUNK:
                // Original game always used the value 50 to indicate a fought battle
                this.applet.getMap().setCurrentMapDataValue(50);
                this.resetAttack(attack.attackType.WON);
                break;
        }
    }
    
    // ------------------- Methods in this game object not specified by interface -------------------
    
    /**
     * Reset attack
     */
    this.resetAttack = function(t)
    {
        if (t == attack.type.LOST)
            this.currentPlayer.addToBattlesLost();
        else
            this.currentPlayer.addToBattlesWon();

        this.currentAttack = attack.attackType.NONE;
        this.currentEnemy.prepareNextEnemy();
        this.applet.setCurrentAction(kaper.actionType.MAP);
        this.sunkMen = 0;
    }
    
    // ------------------- PROPERTIES -------------------
    
    /**
     * Properties for current attack type
     */
    this.getCurrentAttack = function()
    {
        return this.currentAttack;
    }
    this.setCurrentAttack = function(a)
    {
        this.currentAttack = a;
    }

    /**
     * Property for current board
     */
    this.getCurrentBoard = function()
    {
        return this.currentBoard;
    }
}

attack.attackType = { NONE:0, ATTACK:1, SHOOT:2, BOARD:3, WITHDRAW:4, WON_SURRENDER:5, WON_PRIZING:6, WON_SUNK:7 };
attack.type = { LOST:0, WON:1 };
