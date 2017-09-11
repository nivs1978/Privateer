/*
    This file is part of Privateer.

    Privateer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Privateer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Privateer.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * <p>
 * Controls shooting at an enemy
 * <p>
 * 
 * @(#)shoot.java   v1.20 08/04/10
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
function shoot(k, e, a)
{
    this.applet = k;
    this.currentPlayer = k.getCurrentPlayer();
    this.font = k.getCGAFont();

    // Shooting variables
    this.enemyDistance;
    this.windDirection;
    this.windStrength;
    this.shotSide; // Horizontal
    this.shotElevation; // Vertical
    this.enemyShots;
    this.playerShotSmall;
    this.playerShotLarge;
    this.showEnemyShots;
    this.showPlayerLargeShot;
        
    this.currentAttack = a;
    this.currentEnemy = e;
    this.currentState = shoot.stateType.SHOOTING; // How is the player attacking the enemy

    this.shotSide = 0; // Horizontal of shoot
    this.shotElevation = 0; // Elevation of shoot (vertical) 

    /**
     * Fake paint method called from Applet.paint
     */
    this.paint = function(g)
    {
        this.font.setCurrentMode(cgafont.modes.CGA_MODE1);
        g.drawImage(img_shoot, 9, 0);
        var x = (this.windDirection / 3) * 20;
        var y = (this.windDirection % 3) * 20;
        g.drawImage(img_shoot_wind, 37 + x, 338 + y);
        g.drawImage(this.font.getResource("Shooting1"), 41, 32);
        g.drawImage(this.font.getResource("Shooting2"), 41, 144);
        g.drawImage(this.font.getResource("Shooting3"), 441, 176);
        g.drawImage(this.font.getResource("Shooting4"), 41, 224);
        if (this.currentState == shoot.stateType.SHOOTING)
            g.drawImage(this.font.getResource("Shooting5"), 265, 240);
        else
            g.drawImage(this.font.getResource("Shooting11"), 265, 240);
        g.drawImage(this.font.getResource("Shooting6", this.enemyDistance), 25, 272);
        g.drawImage(this.font.getResource("Shooting2"), 281, 272);
        g.drawImage(this.font.getResource("Shooting1"), 473, 272);
        g.drawImage(this.font.getResource("Shooting7"), 25, 304);
        g.drawImage(this.font.getString(this.windStrength), 57, 320);
        g.drawImage(this.font.getResource("Shooting8"), 121, 304);
        g.drawImage(this.font.getResource("Shooting9"), 121, 336);
        g.drawImage(this.font.getResource("Shooting10"), 121, 368);
        g.drawImage(this.font.getString(this.currentPlayer.getCannons()), 265, 304);
        g.drawImage(this.font.getString(this.currentPlayer.getMen()), 265, 336);
        g.drawImage(this.font.getString(this.currentPlayer.getReparation()), 265, 368);
        g.drawImage(this.font.getString(this.currentEnemy.getCannons()), 457, 304);
        g.drawImage(this.font.getString(this.currentEnemy.getMen()), 457, 336);
        g.drawImage(this.font.getString(this.currentEnemy.getReparation()), 457, 368);
        g.drawImage(img_shoot_cross, 449 + this.shotSide, 80 + this.shotElevation);
                
        // If player has been promoted at least twice, shooting should be more difficult
        if (this.currentPlayer.getDifficulty() > 4)
        {
            g.fillRect(31, 22, 278, 98); // Player cannot see where his own shots hit
            g.drawImage(img_flag_pole, 105, 24);
            if (currentEnemy.getEnemyType() == 8) // Show Pirate flag if fighting Pirate ship, or else union jack
                g.drawImage(img_flag_en, 115, 36);
            else
                g.drawImage(img_flag_pirate, 115, 36);
        }
                
        // Show both player and enemy shots
        if (this.currentState == shoot.stateType.SHOT)
        {
            // Enemy shots
            if (this.showEnemyShots)
                for (var i = 0; i < this.enemyShots.length; i++)
                    g.drawImage(img_shoot_hit, 40 + this.enemyShots[i][0], 140 + this.enemyShots[i][1]);
                
            // Player shots
            if (this.currentPlayer.getDifficulty() <= 4)
                g.drawImage(img_shoot_hit, this.playerShotSmall[0], this.playerShotSmall[1]);
            if (this.showPlayerLargeShot)
                g.drawImage(img_shoot_miss1, this.playerShotLarge[0], this.playerShotLarge[1]);
        }
    }
    
    /**
     * Control character key events which happens on enemy screens
     */
this.keyEvent = function(c)
    {
    switch (this.currentState)
        {
        case shoot.stateType.SHOOTING:
                var fire = this.font.getResourceAsString("ShootTypeF").charAt(0);
                var withdraw = this.font.getResourceAsString("ShootTypeW").charAt(0);
                
                if (c.toLowerCase() == fire)
                {
                    this.fireShots(); // Fire both player and enemy shots
                    
                    // Check if player or enemy enemy died from shooting
                    if (this.currentPlayer.getDeathReason() == player.causeOfDeath.NOT_YET &&
                        this.currentEnemy.getCurrentState() == enemy.stateType.GOOD)
                        this.currentState = shoot.stateType.SHOT;
                    else
                        this.resetShooting();
                }
                else if (c.toLowerCase() == withdraw) // Withdraw from shooting
                {
                    this.resetShooting();
                    this.currentAttack.setCurrentAttack(attack.attackType.WITHDRAW);
                }
                // Arrow keys pressed at shooting screen - move shot cross
                this.moveShotCross(c);

                break;
                
        case shoot.stateType.SHOT:
                // Go back to shooting no matter what has been pressed
            this.currentState = shoot.stateType.SHOOTING;
                break;
        }
}
        
    // ------------------- Methods in this game object not specified by interface -------------------
    
    /**
     * Prepare shooting variables
     */
            this.prepareShooting = function()
    {
        //Random r = new Random();
                this.resetShooting();
                this.windDirection = Math.floor(Math.random()*9);
                this.windStrength = 1 + Math.floor(Math.random()*10);
                if (this.windDirection == 4) this.windStrength = 0; // A direction of 4 means no wind
    }
    
    /**
     * Reset enemy distance and aim of player
     */
    this.resetShooting = function()
    {
        //Random r = new Random();
        this.enemyDistance = 500 + Math.floor(Math.random()*500);

        this.shotSide = 0; // New distance means 
        this.shotElevation = 0;

        this.currentState = shoot.stateType.SHOOTING;
    }
    
    /**
     * Move shot cross if allowed
     */
    this.moveShotCross = function(direction)
    {
        // Translate keyboard input to change in arrow position
        switch (direction)
        {
            case "9": // Up-right arrow pressed
                this.shotSide += 2;
                this.shotElevation -= 2;
                break;
                
            case "3": // Down-right arrow pressed
                this.shotSide += 2;
                this.shotElevation += 2;
                break;
                
            case "1": // Down-left arrow pressed
                this.shotSide -= 2;
                this.shotElevation += 2;
                break;
                    
            case "7": // Up-left arrow pressed
                this.shotSide -= 2;
                this.shotElevation -= 2;
                break;
                    
            case "4": // Left arrow pressed
            case "ArrowLeft":
                this.shotSide -= 2;
                break;
                  
            case "8": // Up arrow pressed
            case "ArrowUp":
                this.shotElevation -= 2;
                break;
                    
            case "6": // Right arrow pressed
            case "ArrowRight":
                this.shotSide += 2;
                break;
                    
            case "2": // Down arrow pressed
            case "ArrowDown":
                this.shotElevation += 2;
                break;
        }
        
        // Check if movement allowed
        if (this.shotSide < -100) this.shotSide = -100;
        if (this.shotSide > 100) this.shotSide = 100;
        if (this.shotElevation < -60) this.shotElevation = -60;
        if (this.shotElevation > 60) this.shotElevation = 60;
    }

    /**
     * Fire both player and enemy shots
     */
    this.fireShots = function()
    {
        //Random r = new Random();
        
        // Get players current values
        var pMen = this.currentPlayer.getMen();
        var pRep = this.currentPlayer.getReparation();
        var pCan = this.currentPlayer.getCannons();
        var pDif = this.currentPlayer.getDifficulty();
        var pExp = this.currentPlayer.getExperience();
        var pLos = this.currentPlayer.getBattlesLost();
        
        // Get enemys current calues
        var eMen = this.currentEnemy.getMen();
        var eRep = this.currentEnemy.getReparation();
        var eCan = this.currentEnemy.getCannons();

        //
        // Calculate (and fire) enemy shots
        //
        
        // Calculate player loses
        var lostFactor = (pExp + pLos) / pExp;

        // How many men is lost
        if (Math.random() > 0.4)
        {
            var cannonFactor = eCan / 1.4;
            this.currentPlayer.setMen       (pMen - Math.round(cannonFactor * lostFactor) - Math.round(pDif * Math.random() * 0.5));
        }
        // How many reparation points is lost
        if (Math.random() > 0.4)
        {
            var cannonFactor = eCan / 1.3;
            this.currentPlayer.setReparation(pRep - Math.round(cannonFactor * lostFactor) - Math.round(pDif * Math.random() * 0.5));
        }
        // Maybe also a cannon is lost
        var cannonFactor = eCan / 5;
        if (Math.random() * 100 < pDif + cannonFactor)
        {
            this.currentPlayer.setCannons(pCan - 1);
            if (this.currentPlayer.getCannons() < 1) this.currentPlayer.setCannons(1); // Cannot have less than one cannon
        }
        
        this.currentPlayer.checkPlayerStatus();
        
        // No need to go any furhter if player died from enemy shot
        if (this.currentPlayer.getDeathReason() != player.causeOfDeath.NOT_YET)
            return;
        
        //
        // Calculate (and fire) player shots
        //

        // Set shot difficulty according to promotion level
        var shotDifficulty = 2;
        if (this.currentPlayer.getDifficulty() > 4) this.shotDifficulty = 1;
        if (this.currentPlayer.getDifficulty() > 6) this.shotDifficulty = 0;

        // Calculate player shots
        var sideValue = 10 * ((this.windDirection / 3) - 1);
        var elevationValue = 10 * ((this.windDirection % 3) - 1);
        var shotHorizontal = Math.round(this.windStrength * sideValue * 0.1) + Math.round((sideValue * 0.2 * Math.random()) - Math.round(this.shotSide * 0.2));
        var shotVertical = this.enemyDistance - (700 + (this.windStrength * elevationValue) - (10 * this.shotElevation) + Math.floor(Math.random()*50) - Math.floor(Math.random()*50));
        // Make sure that shot in within visual boundaries
        if (shotHorizontal > 20) shotHorizontal = 20;
        if (shotHorizontal < -20) shotHorizontal = -20;

        // Check if player hit the enemy
        if (shotHorizontal <= shotDifficulty && shotHorizontal >= -shotDifficulty &&
            shotVertical <= 0 && shotVertical >= -50)
        {
            // Player hits enemy - calculate enemy loses
            pMen = this.currentPlayer.getMen();
            pRep = this.currentPlayer.getReparation();
            pCan = this.currentPlayer.getCannons();

            var tempRep = eRep - Math.round((2 * pCan) / pDif) + shotVertical;
            if (tempRep < eRep) this.currentEnemy.setReparation(tempRep);
            var tempCan = eCan - Math.round((Math.random() * 10) / pDif);
            this.currentEnemy.setCannons(tempCan);
            
            this.currentEnemy.checkEnemyStatus();
            
            // Only kill men from shots if not surrendered or sunk yet
            if (this.currentEnemy.getCurrentState() == enemy.stateType.GOOD)
            {
                var tempMen = eMen - Math.round(0.9 * eMen * (pCan + (shotVertical / 5) + (Math.random() * 10)) / 100);
                if (tempMen < eMen) this.currentEnemy.setMen(tempMen);
            }
            
            this.currentEnemy.checkEnemyStatus();

            // No need to go any further if enemy died from player shots
            if (this.currentEnemy.getCurrentState() != enemy.stateType.GOOD)
                return;
        }
        
        //
        // Prepare enemy shots to show
        //
        
        // Calculate how many enemy shots to show
        var cMen = this.currentPlayer.getMen();
        var cRep = this.currentPlayer.getReparation();
        var cCan = this.currentPlayer.getCannons();
        if (pMen != cMen || pRep != cRep || pCan != cCan) // If nothing lost, no enemy shots to show
        {
            this.showEnemyShots = true; // Enemy shots will be shown
            
            var noEnemyShots = (pMen - cMen) + (pRep - cRep) + (pCan - cCan);
            if (noEnemyShots > 10) noEnemyShots = 10; // Max 10 shots
            if (noEnemyShots > eCan) noEnemyShots = eCan; // Cannot show more shots then enemy has cannons
            
            // Where to place enemy shots (in pixels)
            this.enemyShots = [];
            for (var i = 0; i < noEnemyShots; i++)
            {
                this.enemyShots[i] = [];
                // Show shots in random area of enemy ship
                this.enemyShots[i][0] = Math.floor(Math.random() * 220);
                this.enemyShots[i][1] = Math.floor(Math.random() * 40);
            }
        }
        else
            this.showEnemyShots = false; // Enemy shots willl not be shown
        
        //
        // Prepare player shots to show
        //
        
        this.playerShotSmall = []; // Shot on small enemy in upper left corner of screen
        this.playerShotLarge = []; // Shot on large enemy in righthandside of screen
        
        // Prepare coordinates from vertical values
        this.playerShotSmall[1] = 70;
        if (shotVertical > 0) this.playerShotSmall[1] = 98;
        if (shotVertical < -49) this.playerShotSmall[1] = 40;

        // Prepare coordinates from horizontal values
        if (shotHorizontal <= shotDifficulty && shotHorizontal >= -shotDifficulty)
        {
            this.playerShotSmall[0] = 169;
            this.playerShotLarge[0] = 459;
            if (shotVertical <= 0 && shotVertical >= -50)
                this.playerShotLarge[1] = 120; // 100 in original game, but 120 looks better
            else
                this.playerShotLarge[1] = 140;
        }
        else
        {
            this.playerShotLarge[1] = 120;
            if (shotHorizontal > shotDifficulty)
            {
                this.playerShotLarge[0] = 399 - 4 * shotHorizontal;
                this.playerShotSmall[0] = 75;
            }
            else
            {
                this.playerShotLarge[0] = 499 - 4 * shotHorizontal;
                this.playerShotSmall[0] = 269;
            }
        }
        
        // If shot is behind enemy, don't show shot behind large enemy
        if (shotVertical < -50)
            this.showPlayerLargeShot = false;
        else
            this.showPlayerLargeShot = true;
    }
}

shoot.stateType ={ SHOOTING:0, SHOT:1 };
