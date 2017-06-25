/**
 * <p>
 * Controls the help menu
 * <p>
 * 
 * @(#)help.java   v1.20 08/04/10
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
function help(k)
{
    this.applet = k;
    this.font = k.getCGAFont();

    this.currentMenu; // 0-9 normal menus, 10 main menu
    this.currentPage; // 1 is first page, 2 is second page etc.

    /**
 * Reset help menu
 */
    this.resetMenu = function () {
        this.currentMenu = 10;
        this.currentPage = 1;
    }

       
    this.resetMenu();

    /**
     * Fake paint method called from Applet.paint
     */
    this.paint = function(g)
    {
        this.font.setCurrentMode(cgafont.modes.CGA_MODE1);

        // Show help text depending on which page is chosen
        if (this.currentMenu == 10) // Show main menu page
        {
            for (var i = 0; i < 15; i++)
            {
                try
                {
                    // Show text line if it exist
                    g.drawImage(this.font.getResource("HelpMain" + (i + 1)), 0, i * 16);
                }
                catch (ex) {}
            }
        }
        else if (this.currentMenu == 4 && (this.currentPage == 2 || this.currentPage == 4 || this.currentPage == 6 || this.currentPage == 8))
        {
            // Show hardcoded shooting image for help menu 4
            g.drawImage(img_shoot_help, 9, 0); 
            g.drawImage(this.font.getResource("Continue"), 11, 0);
        }
        else // Show all other pages
        {
            var pageEnd = false; // 2 empty text lines in a row means end-of-page
            for (var i = 0; i < 25; i++)
            {
                try
                {
                    // Show text line if it exist
                    g.drawImage(this.font.getResource("HelpMenu" + this.currentMenu + "_" + this.currentPage + "_" + (i + 1)), 0, i * 16);
                    this.pageEnd = false; // Text line fount
                }
                catch (ex)
                {
                    if (this.pageEnd) // 2 empty text lines in a row means end-of-page
                    {
                        g.drawImage(this.font.getResource("Continue"), 0, i * 16);
                        break;
                    }
                    else // First empty text line found
                        this.pageEnd = true;
                }
            }
        }
    }
    
    /**
     * Controls keyboard character events
     */
    this.keyEventChar = function(c)
    {
        // Change menu if number pressed and on main page
        if (this.currentMenu == 10 && c >= 48 && c <= 57)
        {
            // Hack for converting the character representation to int (not the value)
            this.currentMenu = c - '0';
        }
        // Go back to game if character pressed and on main page
        else if (this.currentMenu == 10 && (c < 48 || c > 57))
        {
            this.resetMenu();
            
            // Check if help menu originally initiated from map or from city
            var mapValue = this.applet.getMap().getCurrentMapDataValue();
            if (mapValue > 1 && mapValue < 9)
                this.applet.setCurrentAction(kaper.actionType.CITY);
            else
                this.applet.setCurrentAction(kaper.actionType.MAP); 
        }
        // Change page if character pressed and not on main page
        else if (this.currentMenu != 10)
        {
            var test = "";
            try
            {
                // Try to get first text line from next help page
                test = this.font.getResourceAsString("HelpMenu" + this.currentMenu + "_" + (this.currentPage + 1) + "_" + "1");
            }
            catch (ex)
            {
                try
                {
                    // Try to get first text line from second next help page (help menu 4 has image pages)
                    test = this.font.getResourceAsString("HelpMenu" + this.currentMenu + "_" + (this.currentPage + 2) + "_" + "1");
                }
                catch (ex2) {}
            }
            
            // Show next help page on this menu (if it exist)
            if (test.length() > 0)
                this.currentPage += 1;
            else
                this.resetMenu();
        }
    }
    
    /**
     * Controls keyboard arrow events
     */
    this.keyEventCode = function(i)
    {
    }
    
    
    // ------------------- Methods in this game object not specified by interface -------------------

}
