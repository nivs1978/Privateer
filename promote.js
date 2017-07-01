/**
 * <p>
 * Controls the player promotion and win of game
 * <p>
 * 
 * @(#)promote.java   v1.20 08/04/10
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
function promote(k)
{
    this.applet = k;
    this.currentPlayer = k.getCurrentPlayer();
    this.font = k.getCGAFont();

    /**
     * Fake paint method called from Applet.paint
     */
    this.paint = function(g)
    {
        this.font.setCurrentMode(cgafont.modes.CGA_MODE2);
        g.drawImage(this.font.getResource("Promote1"), 0, 0);
        g.drawImage(this.font.getResource("Promote2"), 0, 32);
        g.drawImage(this.font.getResource("Promote3"), 0, 48);
        g.drawImage(this.font.getResource("Promote4"), 0, 80);
        
        var moreLines = 0;
        
        // Check if more promotions left before player wins game
        if (this.currentPlayer.getDifficulty() < 9)
        {
            g.drawImage(this.font.getResource("Promote5"), 0, 96, this.applet);
            g.drawImage(this.font.getResource("Promote6", this.currentPlayer.getRankType2(), this.currentPlayer.getName()), 0, 112, this.applet);
        }
        else
        {
            // Game won (player just got the highest promotion)
            g.drawImage(this.font.getResource("Promote7"), 0, 96, this.applet);
            g.drawImage(this.font.getResource("Promote8"), 0, 112, this.applet);
            g.drawImage(this.font.getResource("EndGame4", this.currentPlayer.getMen()), 0, 144, this.applet);
            g.drawImage(this.font.getResource("EndGame5", this.currentPlayer.getReparation()), 0, 160, this.applet);
            moreLines = 48;
        }

        g.drawImage(this.font.getResource("Continue"), 0, 128 + moreLines, this.applet);
    }
    
    /**
     * Controls keyboard character events
     */
    this.keyEvent = function(c) // All key events ends the promotion
    {
        // Go back to map
    this.applet.setCurrentAction(kaper.actionType.MAP);
        
        // Check if game won (player just got the highest promotion)
    if (this.currentPlayer.getDifficulty() == 10)
        this.applet.setCurrentStep(kaper.stepType.HIGHSCORE);
    }

}
