import java.awt.Graphics;

/**
 * All Kaptajn Kaper game object should implement this interface
 * 
 * @(#)gameobject.java   v1.20 08/04/10
 * 
 * @author: Rune P. Olsen
 * @version: 1.20 of April the 10th 2008
 * @see: This version is meant as a tribute to P. O. Frederiksen (http:/www.kaptajnkaper.dk)
 */
public interface gameobject
{
    public void paint(Graphics g); // Draws graphics
    
    public void keyEvent(int i); // Handles keyboard arrow events
    public void keyEvent(char c); // Handles keyboard character events
}
