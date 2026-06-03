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
    this.currentVersion = "1.0 (2026/05/15)"; // Current version of this game
    
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
    this.endScreenInputUnlockedAt = 0; // Timestamp when end screen key input is allowed again

    this.highScoreStorageKey = "privateer.highscore.v1";
    this.highScore = { score: 0, name: "" }; // Original game stores one record holder

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
        this.loadHighScore();

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

        // Draw graphics of the current step
        switch (this.currentStep)
        {
            case kaper.stepType.INTRO_WELCOME:
                this.font.setCurrentMode(cgafont.modes.CGA_MODE1);
                this.osgrp.drawImage(this.font.getResource("Welcome1"), 128, 32);
                this.osgrp.drawImage(this.font.getResource("Welcome2"), 32, 80);
                this.osgrp.drawImage(this.font.getResource("Welcome3"), 32, 96);
                this.osgrp.drawImage(this.font.getResource("Welcome4"), 32, 112);
                this.osgrp.drawImage(this.font.getResource("Welcome5"), 32, 160);
                this.osgrp.drawImage(this.font.getResource("Welcome6"), 16, 176);
                this.osgrp.drawImage(this.font.getResource("Welcome7"), 128, 192);
                this.osgrp.drawImage(this.font.getResource("Welcome9"), 64, 240);
                this.osgrp.drawImage(this.font.getResource("Welcome10"), 128, 256);
                this.osgrp.drawImage(this.font.getString(this.font.getResourceAsString("Welcome8")), 96, 360);
                this.osgrp.drawImage(this.font.getString("v" + this.currentVersion), 196, 384);

                var recordName = this.highScore.name && this.highScore.name.length > 0 ? this.highScore.name : "Nelson himself!";
                var recordValue = this.highScore.score || 256;
                this.osgrp.drawImage(this.font.getResource("RecordLabel"), 40, 296);
                this.osgrp.drawImage(this.font.getResource("RecordHolderLabel"), 144, 296);                
                this.osgrp.drawImage(this.font.getString(((""+recordValue).padStart(5, " "))), 24, 312);
                this.osgrp.drawImage(this.font.getString(recordName), 144, 312);

                break;

            case kaper.stepType.INTRO_ENTER_NAME:
                this.font.setCurrentMode(cgafont.modes.CGA_MODE1);
                var labelImg = this.font.getResource("PlayerName1");
                this.osgrp.drawImage(labelImg, 0, 112);
                var label_x_offset = labelImg.width + 32;
                this.osgrp.drawImage(img_ship_map_mode1, label_x_offset, 112);
                var nameImg = this.font.getResource("PlayerName2");
                this.osgrp.drawImage(nameImg, 0, 128);
                var name = this.currentPlayer.getName();
                var showCursor = (Date.now() % 1000) < 500;
                var nameWithCursor = name + (showCursor ? "_" : " ");
                var name_x_offset = nameImg.width + 16;
                this.osgrp.drawImage(this.font.getString(nameWithCursor), name_x_offset, 128);
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
                var highScoreHolder = this.highScore.name && this.highScore.name.length > 0 ? this.highScore.name : "---";
                this.osgrp.drawImage(this.font.getResource("HighScore1", this.currentPlayer.getScore()), 192, 160);
                this.osgrp.drawImage(this.font.getResource("RecordLabel", this.highScore.score), 192, 192);
                this.osgrp.drawImage(this.font.getResource("RecordHolderLabel", highScoreHolder), 192, 208);
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
                // Boarding enemy animation happening
                this.gAttack.getCurrentBoard().showShipAnimation();
                sleepTime = 20;
                this.repaint();
            }
            else if (this.animationRepaint && this.currentAction == kaper.actionType.ATTACK &&
                     this.gAttack.getCurrentBoard().getCurrentState() == board.stateType.FLAG_ANIMATION)
            {
                // Enemy surrender animation
                this.gAttack.getCurrentBoard().showFlagAnimation();
                sleepTime = 10;
                this.repaint();
            }
            else if (this.animationRepaint && this.currentAction == kaper.actionType.HARBOR &&
                     this.gHarbor.getCurrentAction() == harbor.actionType.SAILING)
            {
                // Sailing through harbour animation
                this.gHarbor.showSailingAnimation();
                // Faster animation later in game (made as in the original version)
                sleepTime = 150 - (this.currentPlayer.getDifficulty() - 2) * 2;
                this.repaint();
            }
            else if (this.currentStep == kaper.stepType.INTRO_ENTER_NAME)
            {
                // Keep redrawing while entering name so the cursor can blink.
                sleepTime = 100;
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
        var endScreenLocked = Date.now() < okaper.endScreenInputUnlockedAt;

        /*if (c != KeyEvent.CHAR_UNDEFINED)
        {*/

        switch (okaper.currentStep)
            {
            case kaper.stepType.INTRO_WELCOME:
                    if (c.toLowerCase() == 'e')
                    {
                        okaper.font.setCurrentLocale(cgafont.localeType.ENGLISH);
                        okaper.setCurrentStep(kaper.stepType.TITLE_SCREEN);
                        okaper.repaint();
                    }
                    else if (c.toLowerCase() == 'd')
                    {
                        okaper.font.setCurrentLocale(cgafont.localeType.DANISH);
                        okaper.setCurrentStep(kaper.stepType.TITLE_SCREEN);
                        okaper.repaint();
                    }
                    else if (c.toLowerCase() == 'c')
                    {
                        okaper.clearHighScore();
                        okaper.repaint();
                    }
                    break;
                    
            case kaper.stepType.INTRO_ENTER_NAME:
                if (c == "Enter" && okaper.currentPlayer.getName().length > 0) // Return key - start game
                    {
                        okaper.setCurrentStep(kaper.stepType.GAME_PLAYING);
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
                    okaper.setCurrentStep(kaper.stepType.INTRO_ENTER_NAME); // Go to player name entry
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
                    if (endScreenLocked)
                    {
                        break;
                    }
                    okaper.setCurrentStep(kaper.stepType.HIGHSCORE);
                    okaper.repaint();
                    break;
                    
            case kaper.stepType.HIGHSCORE:
                    if (endScreenLocked)
                    {
                        break;
                    }
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
        var wasEndScreen = this.currentStep == kaper.stepType.GAME_LOST || this.currentStep == kaper.stepType.HIGHSCORE;
        var isEndScreen = step == kaper.stepType.GAME_LOST || step == kaper.stepType.HIGHSCORE;

        this.currentStep = step;

        if (step == kaper.stepType.HIGHSCORE)
        {
            this.trySetHighScore(this.currentPlayer.getScore(), this.currentPlayer.getName());
        }

        // Ignore accidental key presses for a short time when entering end-game screens.
        if (isEndScreen && !wasEndScreen)
        {
            this.endScreenInputUnlockedAt = Date.now() + 5000;
        }
        else if (!isEndScreen)
        {
            this.endScreenInputUnlockedAt = 0;
        }
    }
    
    this.loadHighScore = function()
    {
        try
        {
            var raw = localStorage.getItem(this.highScoreStorageKey);
            if (!raw) return;

            var parsed = JSON.parse(raw);
            if (parsed && typeof parsed.score === "number")
            {
                this.highScore.score = Math.max(0, Math.floor(parsed.score));
                this.highScore.name = parsed.name ? ("" + parsed.name) : "";
            }
        }
        catch (err)
        {
            // Ignore storage/parsing errors and keep defaults.
        }
    }

    this.saveHighScore = function()
    {
        try
        {
            localStorage.setItem(this.highScoreStorageKey, JSON.stringify(this.highScore));
        }
        catch (err)
        {
            // Ignore write errors when storage is not available.
        }
    }

    this.clearHighScore = function()
    {
        this.highScore.score = 0;
        this.highScore.name = "";

        try
        {
            localStorage.removeItem(this.highScoreStorageKey);
        }
        catch (err)
        {
            // Ignore storage errors when localStorage is unavailable.
        }
    }

    this.trySetHighScore = function(score, name)
    {
        var normalizedScore = Math.max(0, Math.floor(score || 0));
        if (normalizedScore <= this.highScore.score) return;

        this.highScore.score = normalizedScore;
        this.highScore.name = name ? ("" + name) : "";
        this.saveHighScore();
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
