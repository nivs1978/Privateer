/**
 * <p>
 * Controls the map and events that occurs at sea
 * <p>
 * 
 * @(#)map.java   v1.20 08/04/10
 * 
 * @author: Rune P. Olsen
 * @version: 1.20 of April the 10th 2008
 * @see: This version is meant as a tribute to P. O. Frederiksen (http:/www.kaptajnkaper.dk)
  *
 * Ported to Javascript by Hans Milling
*/
function map(k)
{
   
    // Holds data of entire game map (predefined data set my resetMap)
    this.currentMapData = [];

    /**
     * Reset map
     */
    this.resetMap = function () {
        // Movement and city data (0 = land, 1 = water, 2-8 = city)
        // (a value of 50 is set while playing on those locations where the player has fought a battle)
        this.currentMapData = [[0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                           [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                           [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 0, 1, 1, 0, 0],
                           [0, 0, 1, 1, 0, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
                           [0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
                           [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0],
                           [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 5, 1, 0, 0, 0],
                           [0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 6, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0],
                           [0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0],
                           [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0],
                           [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0],
                           [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 8, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
                           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]];
        //currentMapData = mapData;
    }

    /**
     * Constructor
     */

        this.applet = k;
        this.currentPlayer = k.getCurrentPlayer();
        this.font = k.getCGAFont();
        this.resetMap();

    
    /**
     * Fake paint method called from Applet.paint
     */
        this.paint = function(g)
    {
        // Only show entire map if no event on sea is happening (e.g. mist or enemy)
            if (this.applet.getCurrentAction() == kaper.actionType.MAP)
        {
                this.font.setCurrentMode(this.cgafont.modes.CGA_MODE2);

            // Show entire map
                g.drawImage(img_map_mode2, 9, 0);

            // Show help keys
                g.drawImage(this.font.getResource("Map3"), 41, 304, applet); // F1
                g.drawImage(this.font.getResource("Map4"), 265, 304, applet); // F2
                g.drawImage(this.font.getResource("Map5"), 473, 304, applet); // F3

            // Show information at top of screen
                g.drawImage(this.font.getResource("Map1", this.currentPlayer.getScore()), 41, 0);
                g.drawImage(this.font.getResource("Map2", this.currentPlayer.getScoreToNextPromotion(), this.currentPlayer.getMaxMovesBeforeNextPromotion()), 249, 0);

            // Show ship at correct position
            var pixelX = this.currentPlayer.getPosX() * 20 + 11;
            var pixelY = this.currentPlayer.getPosY() * 20 + 2;
            g.drawImage(img_ship_map_mode2, pixelX, pixelY);
        }
        else
        {
            // Only show the bottom part of the map (used by mist and enemy events)
                if (this.font.getCurrentMode() == this.cgafont.modes.CGA_MODE1)
                    g.drawImage(img_map_mode1, 9, 325, 631, 394, 0, 325, 622, 394);
            else
                    g.drawImage(img_map_mode2, 9, 325, 631, 394, 0, 325, 622, 394);
        }

        // Show information at bottom of screen
        g.drawImage(font.getResource("Map6", currentPlayer.getMoves()), 25, 336, applet);
        g.drawImage(font.getResource("Map7", currentPlayer.getMoney()), 217, 336, applet);
        g.drawImage(font.getResource("Map8", currentPlayer.getGrain()), 441, 336, applet);
        g.drawImage(font.getResource("Map9", currentPlayer.getMen()), 25, 368, applet);
        g.drawImage(font.getResource("Map10", currentPlayer.getCannons()), 217, 368, applet);
        g.drawImage(font.getResource("Map11", currentPlayer.getReparation()), 441, 368, applet);
    }

    /**
     * Controls keyboard arrow events
     */
    this.keyEventCode = function(i)
    {
        if (i >= 33 && i <= 40) // Arrow keys pressed - move ship
            moveShip(i);
        else if (i == 112) // F1 pressed - show help menu
            this.applet.setCurrentAction(kaper.actionType.HELP);
    }
    
    /**
     * Controls keyboard character events
     */
    this.keyEventChar = function(c)
    {
        if (c.charCodeAt(0) == 27) // ESC pressed - end game
            this.applet.setCurrentStep(kaper.stepType.HIGHSCORE); 
    }

    
    // ------------------- Methods in this game object not specified by interface -------------------
    
    
    /**
     * Move ship if map layout allows it
     */
    this.moveShip = function(direction)
    {
        // Get current position of player
        var posX = this.currentPlayer.getPosX();
        var posY = this.currentPlayer.getPosY();
        
        // Translate keyboard input to change in ship position
        switch (direction)
        {
            case 33: // Up-right arrow pressed
                posX += 1;
                posY -= 1;
                break;
                    
            case 34: // Down-right arrow pressed
                posX += 1;
                posY += 1;
                break;
                    
            case 35: // Down-left arrow pressed
                posX -= 1;
                posY += 1;
                break;
                    
            case 36: // Up-left arrow pressed
                posX -= 1;
                posY -= 1;
                break;
                    
            case 37: // Left arrow pressed
                posX -= 1;
                break;
                    
            case 38: // Up arrow pressed
                posY -= 1;
                break;
                    
            case 39: // Right arrow pressed
                posX += 1;
                break;
                    
            case 40: // Down arrow pressed
                posY += 1;
                break;
        }
        
        // If ship still on map, check if move is legal according to map layout
        if (posX >= 1 && posX <= 29 && posY >= 1 && posY <= 14) // Map is 29x14 tiles large
        {
            var mapValue = this.currentMapData[posY - 1][posX - 1];
            
            if (mapValue != 0) // 0 means land - ship cannot be on this position
            {
                this.currentPlayer.setPosX(posX);
                this.currentPlayer.setPosY(posY);
                
                // Check if ship now in a harbor (2-8 means harbor)
                if (mapValue > 1 && mapValue < 9)
                {
                    this.applet.setCurrentAction(kaper.actionType.HARBOR);
                    var cityName = this.font.getResourceAsString("CityName" + (mapValue - 1));
                    if (mapValue == 8) // Only collect prizes if in Copenhagen
                        this.applet.getHarbor().setNewHarbor(cityName, true);
                    else
                        this.applet.getHarbor().setNewHarbor(cityName, false);
                    this.applet.getCity().setNewCity(cityName);
                }
            }
            else // If ship is hitting land, then player looses some reparation points
            {
                this.currentPlayer.setReparation(this.currentPlayer.getReparation() - 3);
            }
        }
        
        // An attempt to change position is always considered a move, even if the ship isn't moved
        this.currentPlayer.addMove();
        this.currentPlayer.checkPlayerStatus();
        
        // Check if an event occur (if still at sea and player not dead from above move)
        if (this.applet.getCurrentAction() == kaper.actionType.MAP && this.currentPlayer.getDeathReason() == player.causeOfDeath.NOT_YET)
            this.checkForSeaEvent();
    }
    
    /**
     * Check for events at sea
     */
    this.checkForSeaEvent = function()
    {
        //Random r = new Random();
        var d = Math.random();

        if (0.25 > d) // About 25% chance that an event occur
        {
            var event = 1 + Math.floor(Math.random() * 10); // Nine things can happen (including one with double chance)

            if (event > 8) // About 20% chance for a mist
                this.applet.setCurrentAction(kaper.actionType.MIST);
            else // About 80% chance for an enemy ship
            {
                // Enemy only attacking if player not fought on this position before
                var mapValue = this.currentMapData[this.currentPlayer.getPosY() - 1][this.currentPlayer.getPosX() - 1];
                if (mapValue == 1) this.applet.setCurrentAction(kaper.actionType.ATTACK);
            }
        }
    }
    
    
    // ------------------- PROPERTIES -------------------
   
    
    /**
     * Mark that player just fought a battle on current position
     */
    this.getCurrentMapDataValue = function()
    {
        return this.currentMapData[this.currentPlayer.getPosY() - 1][this.currentPlayer.getPosX() - 1];
    }

    this.setCurrentMapDataValue = function (value)
    {
        this.currentMapData[this.currentPlayer.getPosY() - 1][this.currentPlayer.getPosX() - 1] = value;
    }
}

