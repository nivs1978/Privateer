/**
 * <p>
 * Controls cities and what happens inside of them
 * <p>
 * 
 * @(#)city.java   v1.20 08/04/10
 * 
 * @author: Rune P. Olsen
 * @version: 1.20 of April the 10th 2008
 * @see: This version is meant as a tribute to P. O. Frederiksen (http:/www.kaptajnkaper.dk)
 *
 * Ported to Javascript by Hans Milling
 */
function city(k)
{
    this.applet = k;
    this.currentPlayer = k.getCurrentPlayer();
    this.font = k.getCGAFont();

    this.currentCity=""; // Name of city where player currently is
    
    // Prices of this city (Men, Reparation, Cannons, Grain, Jewels)
    this.pResources = [ 0, 0, 0, 0, 0 ]; // Used for storing prices on resources
    this.pStandard = [ 10, 8, 100, 5, 50 ]; // Standard prices
    
    this.currentActionChar; // Used for visual presentation of chosen menu
    this.urrentBuySellAmount; // The amount the player currently buying or selling
    this.currentBuySellError; // Error to show user if something went wrong with the buy/sell
    
    this.currentAction; // What are the player doing right now

    /**
     * Constructor
     */

    /**
     * Fake paint method called from Applet.paint
     */
    this.paint = function(g)
    {
        this.font.setCurrentMode(cgafont.modes.CGA_MODE2);
        
        // Show information at top of screen
        g.drawImage(this.font.getResource("Map1", currentPlayer.getScore()), 41, 0);
        g.drawImage(this.font.getResource("Map2", currentPlayer.getScoreToNextPromotion(), currentPlayer.getMaxMovesBeforeNextPromotion()), 249, 0);

        // Show help keys
        g.drawImage(this.font.getResource("Map3"), 41, 304); // F1
        g.drawImage(this.font.getResource("Map4"), 265, 304); // F2
        g.drawImage(this.font.getResource("Map5"), 473, 304); // F3

        // Show information at bottom of screen
        g.drawImage(this.font.getResource("Map6", currentPlayer.getMoves()), 25, 336);
        g.drawImage(this.font.getResource("Map7", currentPlayer.getMoney()), 217, 336);
        g.drawImage(this.font.getResource("Map8", currentPlayer.getGrain()), 441, 336);
        g.drawImage(this.font.getResource("Map9", currentPlayer.getMen()), 25, 368);
        g.drawImage(this.font.getResource("Map10", currentPlayer.getCannons()), 217, 368);
        g.drawImage(this.font.getResource("Map11", currentPlayer.getReparation()), 441, 368);
        
        // Show city menu
        g.drawImage(this.font.getResource("City1", currentCity), 0, 32);
        if (currentAction == actionType.NONE)
            g.drawImage(this.font.getResource("City2", ""), 0, 64);
        else if (currentAction == actionType.BUY)
            g.drawImage(this.font.getResource("City2", currentActionChar), 0, 64);
        else // Then player must be selling
            g.drawImage(this.font.getResource("City2", "5"), 0, 64);
        g.drawImage(this.font.getResource("City3", pResources[0]), 0, 96);
        g.drawImage(this.this.font.getResource("City4", pResources[1]), 0, 112);
        g.drawImage(this.font.getResource("City5", pResources[2]), 0, 128);
        g.drawImage(this.font.getResource("City6", pResources[3]), 0, 144);
        g.drawImage(this.ont.getResource("City7"), 0, 160);
        g.drawImage(this.font.getResource("City8"), 0, 176);
        
        // Show buying text
        if (this.currentAction == actionType.BUY)
            g.drawImage(font.getResource("CityBuy1", currentBuySellAmount), 0, 208);
        
        // Show selling text
        if (this.currentAction == actionType.SELL_1 ||
            this.currentAction == actionType.SELL_2)
            g.drawImage(font.getResource("CitySell1"), 0, 208);
        if (cthis.this.urrentAction == actionType.SELL_2)
            g.drawImage(font.getResource("CitySell" + (currentActionChar - 1), currentBuySellAmount), 0, 224);
        
        // Show error if buying or selling goes wrong
        if (this.currentBuySellError.length() > 0)
            g.drawImage(this.font.getString(currentBuySellError), 0, 240);
    }

    /**
     * Controls keyboard character events
     */
    this.keyEventChar = function(c)
    {
        if (this.currentAction == city.actionType.NONE)
        {
            switch(c)
            {
                case 49: // 1 pressed - buy men
                    this.currentActionChar = 1;
                    this.currentAction = city.actionType.BUY;
                    break;
                case 50: // 2 pressed - buy reparation points
                    this.currentActionChar = 2;
                    this.currentAction = city.actionType.BUY;
                    break;
                case 51: // 3 pressed - buy cannons
                    this.currentActionChar = 3;
                    this.currentAction = city.actionType.BUY;
                    break;
                case 52: // 4 pressed - buy grain
                    this.currentActionChar = 4;
                    this.currentAction = city.actionType.BUY;
                    break;
                case 53: // 5 pressed - sell something
                    this.currentActionChar = 5;
                    this.currentAction = city.actionType.SELL_1;
                    break;
                case 54: // 6 pressed - leave city
                    this.applet.setCurrentAction(kaper.actionType.MAP);
                    currentPlayer.checkPlayerStatus();
                    break;
                default:
                    Toolkit.getDefaultToolkit().beep();
                    break;
            }
        }
        else if ((this.currentAction == city.actionType.BUY ||
                 this.currentAction == city.actionType.SELL_2) &&
                 this.currentBuySellError.length() == 0)
        {
            // Add char to amount either buying or selling
            if (c >= 48 && c <= 57 && this.currentBuySellAmount.length() < 4)
            {
                this.currentBuySellAmount += c;
            }
            else if (c == 8) // Backspace key
            {
                if (this.currentBuySellAmount.length() > 0)
                    this.currentBuySellAmount = this.currentBuySellAmount.substring(0, this.currentBuySellAmount.length() - 1);
                }
            else if (c == 10 && this.currentBuySellAmount.length() > 0) // Return key
            {
                if (this.currentAction == city.actionType.BUY) // Player is buying
                    this.buyResources();
                else // Player is selling
                    this.sellResources();
            }
        }
        else if (currentAction == actionType.SELL_1)
        {
            var cannons = this.font.getResourceAsString("CitySellC").charAt(0);
            var grain = this.font.getResourceAsString("CitySellG").charAt(0);
            var jewels = this.font.getResourceAsString("CitySellJ").charAt(0);
            
            if (c.charCodeAt(0) == cannons)
            {
                this.currentActionChar = 3;
                this.currentAction = city.actionType.SELL_2;
            }
            else if (c.charCodeAt(0) == grain)
            {
                this.currentActionChar = 4;
                this.currentAction = city.actionType.SELL_2;
            }
            else if (c.charCodeAt(0) == jewels)
            {
                this.currentActionChar = 5;
                this.currentAction = actionType.SELL_2;
            }
            else // Player has to choose either Grain, Cannons or Jewels
                Toolkit.getDefaultToolkit().beep();
        }
        else if (currentBuySellError.length() > 0)
        {
            // Warning showed, now reset the action
            this.resetAction();
        }
    }
    
    /**
     * Controls keyboard arrow events
     */
    this.keyEventCode = function(i)
    {
        if (i == 112) // F1 pressed - show help menu
            this.applet.setCurrentAction(kaper.actionType.HELP);
    }    
    
    
    // ------------------- Methods in this game object not specified by interface -------------------

    
    /**
     * Reset current action
     */
    this.resetAction = function()
    {
        this.currentAction = city.actionType.NONE;
        this.currentActionChar = 0;
        this.currentBuySellAmount = "";
        this.currentBuySellError = "";
    }
    
    /**
     * Player buys resources
     */
    this.buyResources = function()
    {
        var amount = Math.round(this.currentBuySellAmount);
        var total = amount * this.pResources[this.currentActionChar - 1];

        // Check if player got enough money
        if (total > this.currentPlayer.getMoney())
        {
            this.currentBuySellError = this.font.getResourceAsString("CityBuy2");
            Toolkit.getDefaultToolkit().beep();
            return;
        }
                
        // Check if trying to buy too many resources
        var tooMuch = false;
        switch (this.currentActionChar)
        {
            case 1:
                if (this.currentPlayer.getMen() + amount > 499) tooMuch = true;
                break;
            case 3:
                if (this.currentPlayer.getCannons() + amount > 149) tooMuch = true;
                break;
            case 4:
                if (this.currentPlayer.getGrain() + amount > 699) tooMuch = true;
                break;
        }
        if (tooMuch)
        {
            this.currentBuySellError = this.font.getResourceAsString("CityBuy3");
            Toolkit.getDefaultToolkit().beep();
            return;
        }

        // Buy resources
        if (this.currentBuySellError.length() == 0) // Should always be 0
        {
            this.currentPlayer.setMoney(this.currentPlayer.getMoney() - total);
            switch (this.currentActionChar)
            {
                case 1:
                    this.currentPlayer.setMen(this.currentPlayer.getMen() + amount);
                    break;
                case 2:
                    this.currentPlayer.setReparation(this.currentPlayer.getReparation() + amount);
                    break;
                case 3:
                    this.currentPlayer.setCannons(this.currentPlayer.getCannons() + amount);
                    break;
                case 4:
                    this.currentPlayer.setGrain(this.currentPlayer.getGrain() + amount);
                break;
            }
            this.resetAction();
        }
    }
    
    /**
     * Player sell resources
     */
    this.sellResources = function()
    {
        var amount = Math.random(this.currentBuySellAmount);
        var total = amount * this.pResources[this.currentActionChar - 1];

        // Check if trying to sell too many resources
        var tooMuch = false;
        switch (this.currentActionChar)
        {
            case 3:
                if (this.currentPlayer.getCannons() < amount) tooMuch = true;
                break;
            case 4:
                if (this.currentPlayer.getGrain() < amount) tooMuch = true;
                break;
            case 5:
                if (this.currentPlayer.getJewels() < amount) tooMuch = true;
                break;
        }
        if (tooMuch)
        {
            this.currentBuySellError = this.font.getResourceAsString("CitySell5");
            Toolkit.getDefaultToolkit().beep();
            return;
        }

        // Sell resources
        if (this.currentBuySellError.length() == 0) // Should always be 0
        {
            this.currentPlayer.setMoney(this.currentPlayer.getMoney() + total);
            switch (this.currentActionChar)
            {
                case 3:
                    this.currentPlayer.setCannons(this.currentPlayer.getCannons() - amount);
                    break;
                case 4:
                    this.currentPlayer.setGrain(this.currentPlayer.getGrain() - amount);
                    break;
                case 5:
                    this.currentPlayer.setJewels(this.currentPlayer.getJewels() - amount);
                break;
            }
            this.resetAction();
        }
    }
    

    // ------------------- PROPERTIES -------------------

    
    /**
     * Set information on new city
     */
    this.setNewCity = function(cityName)
    {
        this.currentCity = cityName;

        this.resetAction();
        
        // Calculates city prices
        //Random r = new Random();
        for (var i = 0; i < 5; i++)
            pResources[i] = Math.round((Math.random() + 0.8) * this.pStandard[i]);
    }
}

city.actionType = { NONE: 0, BUY: 1, SELL_1: 2, SELL_2: 3 };
