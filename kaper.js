/**
 * <p>
 * Kaptajn Kaper Applet version
 * (this class controls all parts besides the game itself,
 *  which is controlled by several game objects)
 * <p>
 * 
 * @(#)kaper.java   v1.20 08/04/10
 * 
 * @author: Rune P. Olsen
 * @version: 1.20 of April the 10th 2008
 * @see: This version is meant as a tribute to P. O. Frederiksen (http:/www.kaptajnkaper.dk)
 *
 * Ported to Javascript by Hans Milling
 */
function kaper()
{
    this.currentVersion = "0.1a (2017/06/25)"; // Current version of this game
    
    this.osimg = null; // Offscreen image to be used for double buffering
    this.osgrp = null; // Offscreen graphics to be used for double buffering
    this.APPLET_WIDTH = 640; // Width of Applet
    this.APPLET_HEIGHT = 400; // Height of Applet

    this.font = null; // Emulation of the old CGA font
    this.currentPlayer = null; // Holds all player data
    
    this.animation = null;
    this.animationRepaint = false;
    
    // Game objects
    this.gMap = null;
    this.gPromote = null;
    this.gMist = null;
    this.gAttack = null;
    this.gHarbor = null;
    this.gCity = null;
    this.gHelp = null;

    this.currentStep = null; // Where in the game are the player
    this.currentAction = null; // If playing, what is the current game action

    var okaper = this; // To be able to access this object from the keyboard functions

    this.addKeyListener = function()
    {
        if (document.addEventListener) {
            document.addEventListener('keydown', this.keyPressed, false);
 //           document.addEventListener('keypress', this.keyPressed, false);
        }
        else if (document.attachEvent) {
            document.attachEvent('keydown', this.keyPressed);
 //           document.attachEvent('keypress', this.keyPressed);
        }
    }

    /**
     * Set all global object variables to initial values
     */
    this.init = function()
    {
        // This is a workaround for a security conflict with some browsers
        // including some versions of Netscape & Internet Explorer which do 
        // not allow access to the AWT system event queue which JApplets do 
        // on startup to check access.
//        JRootPane rootPane = this.getRootPane();    
//        rootPane.putClientProperty("defeatSystemEventQueueCheck", Boolean.TRUE);
    
        // Creates an offscreen image to be used for double buffer drawing
//        this.maincontainer = document.createElement("div");
//        this.maincontainer.style.width = "100%";
        this.osimg = document.createElement("canvas"); // createImage(APPLET_WIDTH, APPLET_HEIGHT);
        this.osimg.width=640;
        this.osimg.height = 400;

        this.osimg.style.paddingLeft = 0;
        this.osimg.style.paddingRight = 0;
        this.osimg.style.marginLeft = "auto";
        this.osimg.style.marginRight = "auto";
        this.osimg.style.display = "block";
        this.osimg.style.width = "640px";

//        this.maincontainer.appendChild(this.osimg);
        //document.getElementById("maincontainer").appendChild(this.osimg);
        document.getElementsByTagName("body")[0].appendChild(this.osimg);
        this.osgrp = this.osimg.getContext("2d"); // osimg.getGraphics();
        //osgrp.setXORMode(new Color(0,0,168));

        // Add keyboard listener (the Applet handles all keyboard input)
        this.addKeyListener();
        
        // Set first step and action of game
        this.currentStep = kaper.stepType.INTRO_WELCOME;
        this.currentAction = kaper.actionType.MAP;
        
        // Load resources and initialize a new player
        this.font = new cgafont(this);
        this.currentPlayer = new player(this);

        // Initialize game objects
        this.gMap = new map(this);
        this.gPromote = new promote(this);
        this.gMist = new mist(this);
        this.gAttack = new attack(this);
        this.gHarbor = new harbor(this);
        this.gCity = new city(this);
        this.gHelp = new help(this);

    }
    
    /**
     * The main paint method which call game obejcts paint methods
     * (this methods controls the start and end of game, game objects controls the game itself)
     */
    this.paint = function()
    {
        // Set background for orignal CGA blue color

        this.osgrp.fillStyle = getColor(0, 0, 168); // this.osgrp.setColor();
        this.osgrp.fillRect(0, 0, this.osimg.width, this.osimg.height); // this.osgrp.fillRect(0, 0, APPLET_WIDTH, APPLET_HEIGHT);

        //console.log("currentStep: " + this.currentStep);
        // Draw graphics of the current step
        switch (this.currentStep)
        {
            case kaper.stepType.INTRO_WELCOME:
            case kaper.stepType.INTRO_ENTER_NAME:
                this.font.setCurrentMode(cgafont.modes.CGA_MODE1);
                this.osgrp.drawImage(this.font.getResource("Welcome1"), 128, 32);
                this.osgrp.drawImage(this.font.getResource("Welcome2"), 32, 80);
                this.osgrp.drawImage(this.font.getResource("Welcome3"), 32, 96);
                this.osgrp.drawImage(this.font.getResource("Welcome4"), 32, 112);
                this.osgrp.drawImage(this.font.getResource("Welcome5"), 32, 160);
                this.osgrp.drawImage(this.font.getResource("Welcome6"), 16, 176);
                this.osgrp.drawImage(this.font.getResource("Welcome7"), 128, 192);
                this.osgrp.drawImage(this.font.getResource("Welcome9"), 64, 256);
                this.osgrp.drawImage(this.font.getResource("Welcome10"), 128, 272);
                this.osgrp.drawImage(this.font.getString(this.font.getResourceAsString("Welcome8") + "  v" + this.currentVersion), 32, 384);
                if (this.currentStep == kaper.stepType.INTRO_WELCOME) break;
                this.osgrp.drawImage(this.font.getResource("PlayerName1"), 96, 304);
                this.osgrp.drawImage(img_ship_map_mode1, 528, 304);
                this.osgrp.drawImage(this.font.getResource("PlayerName2"), 128, 320);
                this.osgrp.drawImage(this.font.getString(this.currentPlayer.getName()), 432, 320);
                break;
                
            case kaper.stepType.TITLE_SCREEN:
                playsound("intro");
                var img = eval("img_title_" + this.font.getCurrentLocale());
                this.osgrp.drawImage(img, 12, 0);
                this.osgrp.drawImage(this.font.getResource("Continue"), 0, 384);
                break;
                
            case kaper.stepType.GAME_PLAYING:
                // The actual game is made with game objects which are called from here
                switch (this.currentAction)
                {
                    case kaper.actionType.MAP:
                        this.gMap.paint(this.osgrp);
                        break;
                    case kaper.actionType.PROMOTE:
                        this.gPromote.paint(this.osgrp);
                        break;
                    case kaper.actionType.MIST:
                        this.gMist.paint(this.osgrp);
                        break;
                    case kaper.actionType.ATTACK:
                        this.gAttack.paint(this.osgrp);
                        break;
                    case kaper.actionType.HARBOR:
                        this.gHarbor.paint(this.osgrp);
                        break;
                    case kaper.actionType.CITY:
                        this.gCity.paint(this.osgrp);
                        break;
                    case kaper.actionType.HELP:
                        this.gHelp.paint(this.osgrp);
                        break;
                }
                break;
                
            case kaper.stepType.GAME_LOST: // This below part is very confusing due to the many reasons for player death
                this.font.setCurrentMode(cgafont.modes.CGA_MODE2);
                var moreLines = 0; // Depending on death reason, extra lines may need to be added
                var temp= null; // Used when building up text strings
                
                if (this.currentPlayer.getDeathReason() == player.causeOfDeath.TOO_MANY_MOVES)
                {
                    this.osgrp.drawImage(this.font.getResource("CauseOfDeath_TOO_MANY_MOVES1"), 0, 0);
                    this.osgrp.drawImage(this.font.getResource("CauseOfDeath_TOO_MANY_MOVES2"), 0, 32);
                    this.osgrp.drawImage(this.font.getResource("CauseOfDeath_TOO_MANY_MOVES3"), 0, 64);
                    this.osgrp.drawImage(this.font.getResource("CauseOfDeath_TOO_MANY_MOVES4"), 0, 80);
                    this.osgrp.drawImage(this.font.getResource("CauseOfDeath_TOO_MANY_MOVES5"), 0, 112);
                }
                else
                {
                    this.osgrp.drawImage(this.font.getResource("EndGame1"), 0, 64);
                    this.osgrp.drawImage(this.font.getResource("EndGame2"), 0, 80);
                    this.osgrp.drawImage(this.font.getResource("EndGame3", this.currentPlayer.getScore(), this.currentPlayer.getMoney()), 0, 96);

                    if (this.currentPlayer.getDeathReason() != player.causeOfDeath.TOO_FEW_RESOURCES)
                    {
                        this.osgrp.drawImage(this.font.getResource("CauseOfDeath_" + this.currentPlayer.getDeathReason()), 0, 144);
                        this.osgrp.drawImage(this.font.getResource("CauseOfDeath"), 0, 160);
                        moreLines = 64;
                    }
                }
                
                this.osgrp.drawImage(this.font.getResource("EndGame4", this.currentPlayer.getMen()), 0, 144 + moreLines);
                this.osgrp.drawImage(this.font.getResource("EndGame5", this.currentPlayer.getReparation()), 0, 160 + moreLines);
                this.osgrp.drawImage(this.font.getResource("Continue"), 0, 176 + moreLines);
                break;
                
            case kaper.stepType.HIGHSCORE:
                this.font.setCurrentMode(cgafont.modes.CGA_MODE2);
                this.osgrp.drawImage(this.font.getResource("HighScore1", this.currentPlayer.getScore()), 192, 160);
                this.osgrp.drawImage(this.font.getResource("HighScore2"), 0, 336);
                break;
        }
        
        // Draws double buffered image from memory onto screen
        //g.drawImage(this.osimg, 0, 0);
    }
    
    this.update = function() {
        this.paint(); // Update screen without erasing it first (no flickering)
    }

    this.repaint = function() {
        this.update();
    }

    /**
     * Runnable events
     * (this controls all animations in game)
     */

/*
    this.start()
    {
        animation = new Thread(this);
        if (animation != null)
        {
            animation.start();
        }
    }

    public void stop()
    {
        if (animation != null)
        {
            // animation.stop(); // Java depricated
            animation = null;
        }
    }
*/
    this.run = function()
    {
        //console.log("run()");
        //Thread thisThread = Thread.currentThread();
        // Listen for animation events during entire game
        //while (animation == thisThread)
        //{
            // Wait time if no animation occurring
            // (No need to do fast updates when not doing animations)
            var sleepTime = 200; 
            
            // Check if any animation is currently being drawed
            if (this.animationRepaint && this.currentAction == kaper.actionType.ATTACK &&
                this.gAttack.getCurrentBoard().getCurrentState() == board.stateType.SHIP_ANIMATION)
            {
                console.log("- boarding enemy");
                // Boarding enemy animation happening
                this.gAttack.getCurrentBoard().showShipAnimation();
                sleepTime = 20;
                this.repaint();
            }
            else if (this.animationRepaint && this.currentAction == kaper.actionType.ATTACK &&
                     this.gAttack.getCurrentBoard().getCurrentState() == board.stateType.FLAG_ANIMATION)
            {
                console.log("- enemy surrender");
                // Enemy surrender animation
                this.gAttack.getCurrentBoard().showFlagAnimation();
                sleepTime = 10;
                this.repaint();
            }
            else if (this.animationRepaint && this.currentAction == kaper.actionType.HARBOR &&
                     this.gHarbor.getCurrentAction() == harbor.actionType.SAILING)
            {
                console.log("- sailing trough harbor");
                // Sailing through harbour animation
                this.gHarbor.showSailingAnimation();
                // Faster animation later in game (made as in the original version)
                sleepTime = 150 - (this.currentPlayer.getDifficulty() - 2) * 2;
                this.repaint();
            }
            
        // Sleep until next frame update
            var runthis = this;
            setTimeout(function(){ runthis.run(); }, sleepTime);
/*            try
            {
                thisThread.sleep(sleepTime);
            }
            catch (Exception ex) {}*/
        //}
    }
    
    /**
     * If asked the Applet should return information about the game
     */
    this.getAppletInfo = function()
    {
        return "Title: Java Applet version of Kaptajn Kaper i Kattegat\nAuthor: Rune P. Olsen\nVersion: " + currentVersion;
    }


    /**
     * KeyListener events
     * (this controls key events for the start and end of game,
     *  and passes key events on to game objects while in the game itself)
     */
    //public void keyReleased(KeyEvent e) {} // Not used

    this.keyPressed = function (e)
    {
        var c = e.key;

        /*if (c != KeyEvent.CHAR_UNDEFINED)
        {*/

        switch (okaper.currentStep)
            {
            case kaper.stepType.INTRO_WELCOME:
                    if (c.toLowerCase() == 'e')
                    {
                        okaper.font.setCurrentLocale(cgafont.localeType.ENGLISH);
                        okaper.setCurrentStep(kaper.stepType.INTRO_ENTER_NAME);
                        okaper.repaint();
                    }
                    else if (c.toLowerCase() == 'd')
                    {
                        okaper.font.setCurrentLocale(cgafont.localeType.DANISH);
                        okaper.setCurrentStep(kaper.stepType.INTRO_ENTER_NAME);
                        okaper.repaint();
                    }
                    break;
                    
            case kaper.stepType.INTRO_ENTER_NAME:
                if (c == "Enter" && okaper.currentPlayer.getName().length > 0) // Return key - start game
                    {
                        okaper.setCurrentStep(kaper.stepType.TITLE_SCREEN);
                        okaper.repaint();
                    }
                    else if (c == "Backspace") // Backspace key
                    {
                        if (okaper.currentPlayer.getName().length > 0)
                        {
                            okaper.currentPlayer.setName(okaper.currentPlayer.getName().substring(0, okaper.currentPlayer.getName().length - 1));
                            okaper.repaint();
                        }
                    }
                    else if (c.length==1)// Normal characters
                    {
                        okaper.currentPlayer.setName(okaper.currentPlayer.getName() + c);
                        okaper.repaint();
                    }
                    break;
                    
            case kaper.stepType.TITLE_SCREEN:
                    okaper.setCurrentStep(kaper.stepType.GAME_PLAYING); // Go on no matter what has been pressed
                    okaper.repaint();
                    break;
                    
            case kaper.stepType.GAME_PLAYING:
                switch (okaper.currentAction)
                    {
                        case kaper.actionType.MAP:
                            okaper.gMap.keyEvent(c);
                            break;
                        case kaper.actionType.PROMOTE:
                            okaper.gPromote.keyEvent(c);
                            break;
                        case kaper.actionType.MIST:
                            okaper.gMist.keyEvent(c);
                            break;
                        case kaper.actionType.ATTACK:
                            okaper.gAttack.keyEvent(c);
                            break;
                        case kaper.actionType.HARBOR:
                            okaper.gHarbor.keyEvent(c);
                            break;
                        case kaper.actionType.CITY:
                            okaper.gCity.keyEvent(c);
                            break;
                        case kaper.actionType.HELP:
                            okaper.gHelp.keyEvent(c);
                            break;
                    }
                    okaper.repaint();
                    break;
                    
            case kaper.stepType.GAME_LOST:
                    okaper.setCurrentStep(kaper.stepType.HIGHSCORE);
                    okaper.repaint();
                    break;
                    
            case kaper.stepType.HIGHSCORE:
                    // Last screen - start game anew
                    okaper.currentPlayer.resetPlayer();
                    okaper.gMap.resetMap();
                    okaper.setCurrentAction(kaper.actionType.MAP);
                    okaper.setCurrentStep(kaper.stepType.INTRO_WELCOME);
                    okaper.repaint();
                    break;
            }
            
            //e.consume(); // Remove from list of typed keys
        //}
    }
    
    
    // ------------------- PROPERTIES -------------------
   
    
    /**
     * Property for game step
     */
    this.setCurrentStep = function(step)
    {
        this.currentStep = step;
    }
    
    /**
     * Properties for game action
     */
    this.getCurrentAction = function()
    {
        return this.currentAction;
    }

    this.setCurrentAction = function(action)
    {
        this.currentAction = action;
    }

    /**
     * Property for current player
     */
    this.getCurrentPlayer = function()
    {
        return this.currentPlayer;
    }
    
    /**
     * Property for cgafont
     */
    this.getCGAFont = function()
    {
        return this.font;
    }
    
    /**
     * Property for map
     */
    this.getMap = function()
    {
        return this.gMap;
    }

    /**
     * Property for harbor
     */
    this.getHarbor = function()
    {
        return this.gHarbor;
    }
    
    /**
     * Property for city
     */
    this.getCity = function()
    {
        return this.gCity;
    }
}

kaper.actionType = { MAP: 0, PROMOTE: 1, MIST: 2, ATTACK: 3, HARBOR: 4, CITY: 5, HELP: 6 };
kaper.stepType = { INTRO_WELCOME: 0, INTRO_ENTER_NAME: 1, TITLE_SCREEN: 2, GAME_PLAYING: 3, GAME_LOST: 4, HIGHSCORE: 5 };
