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
function harbor(k) {
    this.applet = k;
    this.currentPlayer = k.getCurrentPlayer();
    this.font = k.getCGAFont();

    this.collectPrizes = null; // Tells if this visit to a harbor includes collecting of prizes
    this.currentCity = null; // Name of city where player currently is

    this.currentAction = null; // Tells in which stage the is in the harbor

    this.currentWind = null; // In which direction does the wind come from

    this.harborShips = null; // Location of other ships in harbor ((x,y),(x,y)...)
    this.playerShip = null; // Location of player ship (x,y)
    this.harborHoleSize = 0;
    this.harborHoleLocation = null;
    this.playerMove = null;
    this.showWindArrows = null;

    /**
     * Fake paint method called from Applet.paint
     */
    this.paint = function (g) {
        this.font.setCurrentMode(cgafont.modes.CGA_MODE2);

        switch (this.currentAction) {
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
                if (this.currentWind == harbor.windType.LEFT) {
                    g.drawImage(this.font.getResource("Harbor12"), 208, 208);
                    g.drawImage(this.font.getString(String.fromCharCode(129)), 256, 224); // Arrow pointing right
                }
                else {
                    g.drawImage(this.font.getResource("Harbor13"), 208, 208);
                    g.drawImage(this.font.getString(String.fromCharCode(128)), 256, 224); // Arrow pointing left
                }
                g.drawImage(this.font.getResource("Continue"), 0, 256);
                break;

            case harbor.actionType.SAILING: // Player entering the harbor
                for (var i = 0; i < this.harborShips.length; i++) {
                    var x = this.harborShips[i].x * 20;
                    var y = this.harborShips[i].y * 16 - this.playerShip.y * 16;
                    g.drawImage(img_ship_harbor, x, y);
                }
                var bottomY = 332 - this.playerShip.y * 16;
                g.drawImage(img_harbor_border_bottom, 14, bottomY);
                g.drawImage(img_harbor_border_bottom, 612, bottomY);
                for (var i = 1; i <= this.harborHoleLocation; i++)
                    g.drawImage(img_harbor_border_bottom, 20 * i, bottomY);
                for (var i = this.harborHoleLocation + this.harborHoleSize; i <= 31; i++)
                    g.drawImage(img_harbor_border_bottom, 20 * i, bottomY);
                var borderY = 12 - this.playerShip.y * 16;
                g.drawImage(img_harbor_border, 0, borderY);
                g.drawImage(img_harbor_border, 624, borderY);
                var shipX = this.playerShip.x * 20;
                g.drawImage(img_ship_map_mode2, shipX, 32);
                var arrowsX = Math.round(shipX);
                if (this.showWindArrows && this.currentWind == harbor.windType.LEFT) {
                    var arrow = String.fromCharCode(129);
                    g.drawImage(this.font.getString(arrow + arrow + arrow), arrowsX, 16); // Arrow pointing left
                }
                else if (this.showWindArrows && this.currentWind == harbor.windType.RIGHT) {
                    var arrow = String.fromCharCode(128);
                    g.drawImage(this.font.getString(arrow + arrow + arrow), arrowsX, 16); // Arrow pointing right
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
                if (this.font.getResourceAsString("Dead2").length > 0) {
                    g.drawImage(this.font.getResource("Dead2"), 0, 16);
                    g.drawImage(this.font.getResource("Continue"), 0, 32);
                }
                else {
                    g.drawImage(this.font.getResource("Continue"), 0, 16);
                }
        }
    }

    /**
     * Controls keyboard character events
     */
    this.keyEvent = function (c) {
        switch (this.currentAction) {
            case harbor.actionType.INTRO: // All keys start the sailing action scene
                this.currentAction = harbor.actionType.SAILING;
                break;

            case harbor.actionType.SAILING:
                if (this.playerShip.y == 0) // Start animation if not allready started
                    this.applet.animationRepaint = true;

                // Move ship if arrow left or right pressed
                if (this.playerMove == 0) {
                    if (c == "4" || c == "ArrowLeft")
                        this.playerMove = 1; // Player moves left
                    else if (c == "6" || c == "ArrowRight")
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
    this.setNewHarbor = function (cityName, collect) {
        this.collectPrizes = collect;
        this.currentCity = cityName;
        this.currentAction = harbor.actionType.INTRO;
        this.playerShip = {"x":12,"y":0};
        this.playerMove = 0;
        this.showWindArrows = false;

        // Calculate random wind
        //Random r = new Random();
        this.currentWind = (Math.floor(Math.random() * 2) < 1) ? harbor.windType.LEFT : harbor.windType.RIGHT;

        // Calculate random ships
        var noOfShips = this.currentPlayer.getDifficulty() * 5 + 1;
        this.harborShips = []
        for (var i = 0; i < noOfShips; i++) {
            this.harborShips[i] = {
                x: Math.round(Math.random() * 29) + 1, // X coordinate
                y: Math.round(Math.random() * 14) + 1  // Y coordinate
            }
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
    this.showSailingAnimation = function () {
        // Move ship downwards
        this.playerShip.y += 1;

        // Check for wind
        //Random r = new Random();

        
        if (Math.random() <= this.currentPlayer.getDifficulty() / 18) {
            this.showWindArrows = true;
            
            if (this.currentWind == harbor.windType.LEFT)
                this.playerShip.x += 1;
            else
                this.playerShip.x -= 1;
        }
        else {
            this.showWindArrows = false;
        }

        // Move ship sideways if arrow left or right pressed
        if (!this.showWindArrows && this.playerMove == 1 && this.playerShip.x >= 0)
            this.playerShip.x -= 1;
        else if (!this.showWindArrows && this.playerMove == 2 && this.playerShip.x <= 25)
            this.playerShip.x += 1;
        this.playerMove = 0; // Reset player move

        // Check if player hit another harbor ship
        for (var i = 0; i < this.harborShips.length; i++) {
            var harborShipX = this.harborShips[i].x;
            var harborShipY = this.harborShips[i].y;
            var playerShipX = this.playerShip.x;
            var playerShipY = this.playerShip.y;

            // Test if specific pixel has contact with another harbor ship
            if (playerShipX == harborShipX && playerShipY == harborShipY) {
                this.currentPlayer.setReparation(this.currentPlayer.getReparation() - 15 * this.currentPlayer.getDifficulty());
                if (this.currentPlayer.getReparation() <= 20) // Maybe player died from hitting a harbor ship
                {
                    this.currentAction = harbor.actionType.HARBOR_DEAD;
                    return;
                }
            }
        }

        // End animation if border at bottom reached
        if (this.playerShip.y == 18) {
            this.applet.animationRepaint = false;

            // Check if player has reached the border hole
            var harborRightBorderStart = (this.harborHoleLocation + this.harborHoleSize);
            if (this.playerShip.x <= this.harborHoleLocation || this.playerShip.x >= harborRightBorderStart) {
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
    this.getCurrentAction = function () {
        return this.currentAction;
    }

}

harbor.actionType = { INTRO: 0, SAILING: 1, HARBOR_PRIZES: 2, HARBOR_DEAD: 3 };
harbor.windType = { LEFT: 0, RIGHT: 1 };
