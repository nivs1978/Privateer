
/**
 * <p>
 * Controls the harbor event (player entering a city)
 * <p>
 * 
 * @(#)harbor.java   v1.20 08/04/10
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
function harbor(k)
{
    this.applet = k;
    this.currentPlayer = k.getCurrentPlayer();
    this.font = k.getCGAFont();
    
    this.collectPrizes = null; // Tells if this visit to a harbor includes collecting of prizes
    this.currentCity = null; // Name of city where player currently is

    this.currentAction = null; // Tells in which stage the is in the harbor
    
    this.currentWind = null; // In which direction does the wind come from
    
    this.harborShips = []; // Location of other ships in harbor ((x,y),(x,y)...)
    this.playerShip = []; // Location of player ship (x,y)
    this.harborHoleSize = 0;
    this.harborHoleLocation = null;
    this.playerMove = null;
    this.showWindArrows = null;

    /**
     * Fake paint method called from Applet.paint
     */
    this.paint = function(g)
    {
        font.setCurrentMode(cgafont.modes.CGA_MODE2);

        switch (this.currentAction)
        {
            case harbor.actionType.INTRO: // Show harbor instructions to player
                g.drawImage(this.font.getResource("Harbor1", this.currentCity), 0, 0);
                g.drawImage(this.font.getResource("Harbor2"), 0, 16);
                g.drawImage(this.font.getResource("Harbor3"), 0, 32);
                g.drawImage(this.font.getResource("Harbor4"), 0, 48);
                g.drawImage(this.font.getResource("Harbor5"), 0, 64);
                g.drawImage(this.font.getResource("Harbor6"), 0, 96);
                g.drawImage(this.font.getResource("Harbor7"), 0, 112);
                g.drawImage(this.font.getResource("Harbor8"), 0, 128);
                g.drawImage(this.font.getResource("Harbor9"), 0, 144);
                g.drawImage(this.font.getResource("Harbor10"), 0, 160);
                g.drawImage(this.font.getResource("Harbor11"), 0, 192);
                if (this.currentWind == harbor.windType.LEFT)
                {
                    g.drawImage(this.font.getResource("Harbor12"), 208, 208);
                    g.drawImage(this.font.getString(String.fromCharCode(27)), 256, 224); // Arrow pointing right
                }
                else
                {
                    g.drawImage(this.font.getResource("Harbor13"), 208, 208);
                    g.drawImage(this.font.getString(String.fromCharCode(26)), 256, 224); // Arrow pointing left
                }
                g.drawImage(this.font.getResource("Continue"), 0, 256);
                break;
                
            case harbor.actionType.SAILING: // Player entering the harbor
                for (var i = 0; i < harborShips.length; i++)
                {
                    var x = this.harborShips[i][0] * 20;
                    var y = this.harborShips[i][1] * 20 - this.playerShip[1] * 16;
                    g.drawImage(img_ship_harbor, x, y);
                }
                var bottomY = 332 - this.playerShip[1] * 16;
                g.drawImage(img_harbor_border_bottom, 14, bottomY);
                g.drawImage(img_harbor_border_bottom, 612, bottomY);
                for (var i = 1; i <= this.harborHoleLocation - 2; i++)
                    g.drawImage(img_harbor_border_bottom, 16*i, bottomY);
                for (var i = harborHoleLocation + harborHoleSize - 1; i <= 38; i++)
                    g.drawImage(img_harbor_border_bottom, 16*i, bottomY);
                var borderY = 12 - this.playerShip[1] * 16;
                g.drawImage(img_harbor_border, 0, borderY);
                g.drawImage(img_harbor_bottom, 624, borderY);
                var shipX = 60 + this.playerShip[0] * 20;
                g.drawImage(img_ship_map_mode2, shipX, 40);
                var arrowsX = (shipX / 16) * 16; // Should use Math.round instead?
                if (this.showWindArrows && this.currentWind == harbor.windType.LEFT)
                {
                    var arrow = String.fromCharCode(27);
                    g.drawImage(this.font.getString(arrow+arrow+arrow), arrowsX, 16); // Arrow pointing right
                }
                else if (showWindArrows && currentWind == windType.RIGHT)
                {
                    var arrow = String.fromCharCode(26);
                    g.drawImage(this.font.getString(arrow+arrow+arrow), arrowsX, 16); // Arrow pointing right
                }
                break;
                
            case harbor.actionType.HARBOR_PRIZES: // Collect players prizes
                g.drawImage(this.font.getResource("Prize1"), 0, 0);
                g.drawImage(this.font.getResource("Prize2", this.currentPlayer.getPrizeMen()), 0, 16);
                g.drawImage(this.font.getResource("Prize3"), 0, 32);
                g.drawImage(this.font.getResource("Prize4", this.currentPlayer.getPrizeMoney()), 0, 48);
                g.drawImage(this.font.getResource("Prize5"), 0, 64);
                g.drawImage(this.font.getResource("Continue"), 0, 96);
                break;
                
            case harbor.actionType.HARBOR_DEAD:
                g.drawImage(this.font.getResource("Dead1"), 0, 0);
                if (this.font.getResourceAsString("Dead2").length > 0)
                {
                    g.drawImage(this.font.getResource("Dead2"), 0, 16);
                    g.drawImage(this.font.getResource("Continue"), 0, 32);
                }
                else
                {
                    g.drawImage(this.font.getResource("Continue"), 0, 16);
                }
        }
    }
    
    /**
     * Controls keyboard character events
     */
    this.keyEvent = function(c)
    {
        switch (this.currentAction)
        {
            case harbor.actionType.INTRO: // All keys start the sailing action scene
                this.currentAction = harbor.actionType.SAILING;
                break;
                
            case harbor.actionType.SAILING:
                if (this.playerShip[1] == 0) // Start animation
                    this.applet.animationRepaint = true;
                    // Start animation if not allready started
                    if (this.playerShip[1] == 0)
                        this.applet.animationRepaint = true;

                    // Move ship if arrow left or right pressed
                    if (this.playerMove == 0) {
                        if (i == 37)
                            this.playerMove = 1; // Player moves left
                        else if (i == 39)
                            this.playerMove = 2; // Player moves right
                    }
                
                break;
                
            case harbor.actionType.HARBOR_PRIZES: // Collect players prizes
                this.currentPlayer.collectPrizes();
                this.applet.setCurrentAction(kaper.actionType.CITY);
                break;
                
            case harbor.actionType.HARBOR_DEAD: // Player died from sailing into harbor
                this.applet.setCurrentStep(kaper.stepType.HIGHSCORE);
                break;
        }
    }
    
    // ------------------- Methods in this game object not specified by interface -------------------

    
    /**
     * Set information on new harbor
     */
    this.setNewHarbor = function(cityName, collect)
    {
        this.collectPrizes = collect;
        this.currentCity = cityName;
        this.currentAction = actionType.INTRO;
        this.playerShip = new int[2];
        this.playerShip[0] = 12;
        this.playerShip[1] = 0;
        this.playerMove = 0;
        this.showWindArrows = false;
        
        // Calculate random wind
        //Random r = new Random();
        this.currentWind = (Math.floor(Math.random()*2) < 1) ? harbor.windType.LEFT : harbor.windType.RIGHT;
        
        // Calculate random ships
        var noOfShips = this.currentPlayer.getDifficulty() * 5 + 1;
        this.harborShips = []
        for (var i = 0; i < noOfShips; i++)
        {
            this.harborShips[i][0] = Math.round(Math.random()*29) + 1; // X coordinate
            this.harborShips[i][1] = Math.round(Math.random()*14) + 1; // Y coordinate
        }
        
            // Calculate harbor hole
        var diff = this.currentPlayer.getDifficulty();
            // The original code said 7 - ..... (but it looks like the game behaves as below)
        this.harborHoleSize = 9 - Math.round(diff / 2);
        this.harborHoleLocation = 12 - diff + Math.round(1 + Math.random() * (6 + 2 * diff));
        }
    
            /**
             * Show animation of ship sailing into harbor
             * (with help from run method in kaper class)
             */
    this.showSailingAnimation = function()
        {
            // Move ship downwards
        this.playerShip[1] += 1;
        
            // Check for wind
        //Random r = new Random();
        if (Math.random() <= currentPlayer.getDifficulty() / 18)
        {
            this.showWindArrows = true;
            
            if (this.currentWind == harbor.windType.LEFT)
                this.playerShip[0] += 1;
        else
                this.playerShip[0] -= 1;
        }
        else
        {
            this.showWindArrows = false;
        }

            // Move ship sideways if arrow left or right pressed
        if (!this.showWindArrows && this.playerMove == 1 && this.playerShip[0] >= 0)
            this.playerShip[0] -= 1;
        else if (!this.showWindArrows && this.playerMove == 2 && this.playerShip[0] <= 25)
            this.playerShip[0] += 1;
        this.playerMove = 0; // Reset player move
        
            // Check if player hit another harbor ship
        for (var i = 0; i < this.harborShips.length; i++)
        {
            var harborShipX = this.harborShips[i][0] * 20;
            var harborShipY = this.harborShips[i][1] * 20 - this.playerShip[1] * 16;
            var playerShipX = 60 + this.playerShip[0] * 20;
            var playerShipY = 40 + 12; // Specific pixel of players y-axis to test
            
            // Test if specific pixel has contact with another harbor ship
            if (this.playerShipX == this.harborShipX && this.playerShipY >= this.harborShipY && this.playerShipY < this.harborShipY + 16)
        {
                this.currentPlayer.setReparation(this.currentPlayer.getReparation() - 15 * this.currentPlayer.getDifficulty());
                if (this.currentPlayer.getReparation() <= 20) // Maybe player died from hitting a harbor ship
        {
                    this.currentAction = harbor.actionType.HARBOR_DEAD;
                    return;
        }
        }
        }

            // End animation if border at bottom reached
        if (this.playerShip[1] == 18)
        {
            this.applet.animationRepaint = false;
            
            // Check if player has reached the border hole
            var harborLeftBorderEnd = (this.harborHoleLocation - 1) * 16 - 1;
            var harborRightBorderStart = (this.harborHoleLocation + harborHoleSize - 1) * 16;
            var playerX = 60 + this.playerShip[0] * 20 + 10; // Center of player ships x-axis
            if (playerX <= harborLeftBorderEnd || playerX >= harborRightBorderStart)
        {
                this.currentPlayer.setReparation(0); // Player always dies from hitting the harbor bottom border
                this.currentAction = harbor.actionType.HARBOR_DEAD;
                return;
        }

            // Check if prizes to collect or just entering the city
            if (this.collectPrizes && this.currentPlayer.getPrizeMen() > 0)
                this.currentAction = harbor.actionType.HARBOR_PRIZES;
        else
                this.applet.setCurrentAction(kaper.actionType.CITY);
        }
        }
    
    
            // ------------------- PROPERTIES -------------------


            /**
             * Property for getting current action
             */
    this.getCurrentAction = function()
        {
        return this.currentAction;
        }

}

harbor.actionType = { INTRO:0, SAILING:1, HARBOR_PRIZES:2, HARBOR_DEAD:3 };
harbor.windType = { LEFT:0, RIGHT:0 };
