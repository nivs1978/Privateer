# Privateer
JavaScript version of Privateer aka Kaptajn Kaper i Kattegat  
  
# Original
Read about the original version (in Danish) on Wikipedia: https://da.wikipedia.org/wiki/Kaptajn_Kaper_i_Kattegat  
  
# Port of Java Applet
If the JavaScript code looks a little strange, it's because this is a direct port of a Java Applet created by Rune Peter Olsen. The applet was hosted on http://www.javakaper.dk/, but the site has been taken down. As Java Applets in browsers are not supported anymore, I wanted to port it to JavaScript. This was to preserve the game and make it playable on devices without the need for DOS emulators, etc. I tried to keep it as close to the original code, look, and feel as possible.  
The game is now hosted on https://kaper.barosaurussoftware.com/  
  
The game has been played for countless hours, but it might still contain some bugs. If so, file a bug on GitHub or contact me.  
  
# Sound
Sounds cannot be disabled, you must use the volume controls on your device.  
The original audio sequences were in DOS QBASIC play strings, and a separate project, STR2WAV, was created in C# to convert these playback strings to WAV files for the first JavaScript version. Square wave sound is generated to make it sound like the original PC speakers back in the 80s: https://github.com/nivs1978/STR2WAV  
With the introduction of the Web Audio API, we can now generate the audio on the fly, like the original QBASIC play strings. They have been reintroduced in the source, and the audio files have been removed.  
  
# How to launch the game
Put the files on any static website/server, or in a directory on your computer, and launch index.html in your favorite browser to play the game.