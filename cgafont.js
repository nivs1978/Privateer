/**
 * <p>
 * This class encapsulates the original 8x8 font used in 320x200 CGA mode 1 and 2
 * Couldn't get the Applet to load a custom TTF font from within a browser - therefore this manual hack
 * <p>
 * 
 * @(#)cgafont.java   v1.20 08/04/10
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
function cgafont()
{
    this.fontMap1 = null;
    this.fontMap2 = null; // Font maps

    this.currentMode = null; // Current screen mode
    
    this.resources = null;; // All text strings in entire game
    this.currentLocale = null; // Chosen language

        // Wait for image maps to finish loading
/*        MediaTracker mt = new MediaTracker(k);
        mt.addImage(fm1,0);
        mt.addImage(fm2,1);
        try 
        {   
            mt.waitForAll();
        }
        catch (Exception ex) {}
  */      
        // Convert to BufferedImages
        // (Needed for clipping chars out of font map)
        //fontMap1 = convertImageToBufferedImage(fm1);
        //fontMap2 = convertImageToBufferedImage(fm2);
        
    /**
     * Convert an Image to a BufferedImage
     * (which is easier to manipulate)
     */
    /*
     this.convertImageToBufferedImage = function(Image im)
    {
        var w = im.getWidth(null);
        int h = im.getHeight(null);
        BufferedImage bi = new BufferedImage(w,h,BufferedImage.TYPE_INT_RGB);
        Graphics2D grp = bi.createGraphics();
        grp.drawImage(im, 0, 0, w, h, 0, 0, w, h, null);
        grp.dispose();
        return bi;
    }*/

    /**
     * Get resource string as String
     */
    this.getResourceAsString = function(res)
    {
        // Return text directly from resource manager
        return eval("document.kaperresources['" + res + "']");
    }

    /**
     * Get resource string as image in original CGA font
     * (Method is overloaded for easier access to replacement of strings)
     */
    /*

    this.getResource = function(res)
    {
        // Get text from resource manager
        var str = resources.getString(res);
        
        // Return image with CGA font text
        return getString(str);
}

    this.getResource = function(res, replaceString1)
    {
        // Get text from resource manager and replace string as told
        var str = resources.getString(res);
        str = str.replace("{0}", replaceString1);
        
        // Return image with CGA font text
        return getString(str);
}

    this.getResource = function(res, replaceInt1)
    {
        // Get text from resource manager and replace string as told
        var str = resources.getString(res);
        str = str.replace("{0}", replaceInt1.toString());
        
        // Return image with CGA font text
        return getString(string);
}

    this.getResource = function(res, replaceString1, replaceString2)
    {
        // Get text from resource manager and replace string as told
        String string = resources.getString(res);
        string = string.replace("{0}", replaceString1);
        string = string.replace("{1}", replaceString2);
        
        // Return image with CGA font text
        return getString(string);
    }
    */
    this.adjustCharCode = function(i)
    {
        switch (i) // Adjust to local font image
        {
            case 198: // Æ
                return 133;
            case 216: // Ø
                return 134;
            case 197: // Å
                return 135;
            case 230: // æ
                return 130;
            case 248: // ø
                return 131;
            case 229: // å
                return 132;
                break;
        }
        return i;
    }

    this.getResource = function(res, replace1, replace2)
    {
        // Get text from resource manager and replace string as told
        var str = this.getResourceAsString(res);
        //console.log("Skriver tekst: " + str);
        if (replace1!=null)
            str = str.replace("{0}",""+replace1);
        if (replace2!=null)
          str = str.replace("{1}",""+replace2);
        
        // Return image with CGA font text
        var img = document.createElement("canvas");
        img.width = str.length*16;
        img.height = 16;

        var ctx = img.getContext("2d");
        ctx.clearRect(0, 0, img.width, img.height);

        var cursorx = 0;

        for (var i = 0; i < str.length; i++) {
            var chr = str.charCodeAt(i);
            chr = this.adjustCharCode(chr);
            //console.log(str[i] + " = " + chr);
            chr = chr - 32;
            var x = chr % 16;
            var y = Math.floor(chr / 16);
            ctx.drawImage(img_fm1, x * 16, y * 16, 16, 16, cursorx * 16, 0, 16, 16);
            cursorx++;
        }
    
        return img;
    }

    /**
     * Get normal String as image with original CGA font text
     */
   
    this.getString = function(str)
    {
        str = str.toString();
        //console.log("getString: " + str);
        // Return image with CGA font text
            var img = document.createElement("canvas");
            img.width = str.length*16;
            img.height = 16;
    
            var ctx = img.getContext("2d");
    
            //ctx.clearRect(0, 0, img.width, img.height);

            var cursorx = 0;
    
            for (var i = 0; i < str.length; i++) {
                var chr = str.charCodeAt(i);
                chr = this.adjustCharCode(chr);
                //console.log(str[i] + " = " + chr);
                chr = chr - 32;
                var x = chr % 16;
                var y = Math.floor(chr / 16);
                ctx.drawImage(img_fm1, x * 16, y * 16, 16, 16, cursorx * 16, 0, 16, 16);
                cursorx++;
        }
      
        return img;
    }
    
    
    // ------------------- PROPERTIES -------------------

    
    /**
     * Properties for screen mode
     */
    this.getCurrentMode = function()
    {
        return this.currentMode;
    }

    this.setCurrentMode = function(mode)
    {
        this.currentMode = mode;
    }

    /**
     * Properties for locale
     */
    this.getCurrentLocale = function()
    {
        return this.currentLocale;
    }

    this.setCurrentLocale = function(locale)
    {
        if (locale == cgafont.localeType.DANISH) {
            //console.log("Setting localeType to DANISH");
            this.currentLocale = "da";
        }
        else {
            //console.log("Setting localeType to ENGLISH");
            this.currentLocale = "en";
        }

        this.loadResources();
    }
    
    /**
     * Property for loading resources according to locale
     */
    this.loadResources = function()
    {
        //console.log("Setting locale to: "+this.currentLocale);
        this.resources = lang[this.currentLocale]; //ResourceBundle.getBundle("resources", currentLocale);
        document.kaperresources = this.resources;
    }

    // Load resource strings in default language
    this.setCurrentLocale(cgafont.localeType.ENGLISH);
    this.loadResources();

    // Set default CGA mode
    this.setCurrentMode(cgafont.modes.CGA_MODE1);

}

cgafont.modes = { CGA_MODE1: 1, CGA_MODE2: 2 };
cgafont.localeType = { DANISH: "da", ENGLISH: "en" };
