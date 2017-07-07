/**
 * <p>
 * Controls the mist and what happens inside of it
 * <p>
 * 
 * @(#)mist.java   v1.20 08/04/10
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
function mist(k)
{
    this.applet = k;
    this.currentPlayer = k.getCurrentPlayer();
    this.font = k.getCGAFont();
    
    this.currentMist = 0; // Which type of mist to show. No mist investigated yet
    thiscurrentAmount = 0; // Amount of what has been found. Nothing found yet
    
    /**
     * Fake paint method called from Applet.paint
     */
    this.paint = function(g)
    {
        this.font.setCurrentMode(cgafont.modes.CGA_MODE2);
        this.applet.getMap().paint(g); // Paint stats in bottom of screen

        if (this.currentMist == 0) // Not investigated mist yet
        {
            g.drawImage(this.font.getResource("Mist1"), 0, 0);
            g.drawImage(this.font.getResource("Mist2"), 0, 16);
            g.drawImage(this.font.getResource("Mist3"), 0, 32);
            g.drawImage(this.font.getResource("Mist4"), 0, 48);
            g.drawImage(this.font.getResource("Mist5"), 0, 64);
            g.drawImage(this.font.getResource("Mist6"), 0, 80);
            g.drawImage(this.font.getResource("Mist7", this.currentPlayer.getRankType1(), this.currentPlayer.getName()), 0, 112);
            g.drawImage(this.font.getResource("Mist8"), 0, 128);
            g.drawImage(this.font.getResource("Mist9"), 0, 160);
        }
        else // Investigating mist
        {
            playsound("b5th");
            var moreLines = 0; // Depending on mist type, extra lines may need to be added

            g.drawImage(this.font.getResource("MistType" + this.currentMist + "1"), 0, 0);
            var temp = this.font.getResourceAsString("MistType" + this.currentMist + "2");
            if (this.currentMist == 3 || this.currentMist == 4)
                temp = temp.replace("{0}", this.currentAmount); // Grain or jewels found
            g.drawImage(this.font.getString(temp), 0, 16);
                
            // Some mist types has more text lines to add
            if (this.currentMist > 4)
            {
                temp = this.font.getResourceAsString("MistType" + this.currentMist + "3");
                if (this.currentMist == 5) temp = temp.replace("{0}", this.currentAmount); // Taels found
                g.drawImage(this.font.getString(temp), 0, 32);
                moreLines += 16;
            }
            if (this.currentMist > 7)
            {
                g.drawImage(this.font.getResource("MistType" + this.currentMist + "4"), 0, 48);
                g.drawImage(this.font.getResource("MistType" + this.currentMist + "5"), 0, 64);
                g.drawImage(this.font.getResource("MistType" + this.currentMist + "6"), 0, 80);
                moreLines += 48;
            }
            
            g.drawImage(this.font.getResource("Continue"), 0, 48 + moreLines);
        }
    }

    /**
     * Controls keyboard character events
     */
    this.keyEvent = function(c)
    {
        if (this.currentMist == 0) // User has not desided whether to investigate yet
        {
            // Encountering a mist is an event (which means experience)
            this.currentPlayer.addToExperience();

            var yes = this.font.getResourceAsString("QuestionY").charAt(0);
            var no = this.font.getResourceAsString("QuestionN").charAt(0);
                            
            if (c.toLowerCase() == yes) // Investigate mist
                this.investigateMist();
            else if (c.toLowerCase() == no) // Go back to map
                this.applet.setCurrentAction(kaper.actionType.MAP);
            else // Player has to choose either Yes or No
                playsound("beep"); //Toolkit.getDefaultToolkit().beep();
        }
        else if (this.currentMist == 1) // Enemy ship appears - go to attack screen
        {
            this.currentMist = 0;
            this.currentAmount = 0;
            this.applet.setCurrentAction(kaper.actionType.ATTACK);
        }
        else // All other types goes back to map afterwards
        {
            this.currentMist = 0;
            this.currentAmount = 0;
            this.applet.setCurrentAction(kaper.actionType.MAP);
            this.currentPlayer.checkPlayerStatus(); // Check if player has too many resources after mist
        }
    }
    
    // ------------------- Methods in this game object not specified by interface -------------------


    /**
     * Investigate a random mist
     */
    this.investigateMist = function()
    {
        // Find random mist type
        //Random r = new Random();
        var i = 1 + Math.floor(Math.random() * 9); // Eight types of mist (including one with double chance)
        this.currentMist = i;
        
        // Mist was empty (type 2 has double chance)
        if (this.currentMist > 2) this.currentMist -= 1;
        
        // Take action on found mist type (some mist types has no action)
        switch (this.currentMist)
        {
            case 3: // Island with sacks of grain
                this.currentAmount = 2 + Math.floor(Math.random() * 6);
                this.currentPlayer.setGrain(this.currentPlayer.getGrain() + this.currentAmount);
                break;
                
            case 4: // Island with jewels
                this.currentAmount = 2 + Math.floor(Math.random() * 6);
                this.currentPlayer.setJewels(this.currentPlayer.getJewels() + this.currentAmount);
                break;
            
            case 5: // Island with chest full of taels
                this.currentAmount = 600;
                this.currentPlayer.setMoney(this.currentPlayer.getMoney() + this.currentAmount);
                break;
            
            case 6: // Island with abandoned cannon
                this.currentPlayer.setCannons(this.currentPlayer.getCannons() + 1);
                break;
                
            case 7: // Island with shipwrecked crew
                this.currentAmount = 9 + Math.floor(Math.random() * 40);
                this.currentPlayer.setMen(this.currentPlayer.getMen() + this.currentAmount);
                break;
                
            case 8: // Island with shipwrecked plaque victim
                var men = this.currentPlayer.getMen();
                men = men - men / 3;
                this.currentPlayer.setMen(men);
        }
    }
}
