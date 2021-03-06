﻿/*
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

String.prototype.format = String.prototype.format ||
function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};

function lzHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function getColor(r,g,b)
{
    return "#" + lzHex(r) + lzHex(g) + lzHex(b);
}

var totalimages = 23;
var imagesloaded = 0;

function launch()
{
    setTimeout(function () {
        var app = new kaper();
        app.init();
        app.repaint(); // We have no automatic paint event call like the applet does, so we call manually.
        app.run();
    }, 1000); // Small delay to make sure all scripts are loaded before starting.
}


function getImage(url)
{
    var img = new Image();
    img.src = url;
    img.onload = function () {
        imagesloaded++;
        if (imagesloaded==totalimages)
          launch()
    }
    return img;
}

var audioplayer = null;

function playsound(name)
{
    if (audioplayer)
        audioplayer.pause();
    audioplayer = new Audio("audio/" + name + ".mp3");
    audioplayer.play();
}

var img_ship_board_en = getImage("images/ship-board-en.png");
var img_ship_board_da = getImage("images/ship-board-da.png");
var img_flag_pole = getImage("images/flag-pole.png");
var img_flag_pirate = getImage("images/flag-pirate.png");
var img_flag_en = getImage("images/flag-en.png");
// Load font maps which include the original CGA font from Kaptajn Kaper
var img_fm1 = getImage("images/font-mode1.png");
var img_fm2 = getImage("images/font-mode2.png");
var img_ship_harbor = getImage("images/ship-harbor.png");
var img_harbor_border_bottom = getImage("images/harbor-border-bottom.png");
var img_harbor_border = getImage("images/harbor-border.png");
var img_ship_map_mode2 = getImage("images/ship-map-mode2.png");
var img_shoot_help = getImage("images/shoot-help.png");
var img_ship_map_mode1 = getImage("images/ship-map-mode1.png");
var img_title_da = getImage("images/title-da.png");
var img_title_en = getImage("images/title-en.png");
var img_shoot = getImage("images/shoot.png");
var img_shoot_wind = getImage("images/shoot-wind.png");
var img_shoot_cross = getImage("images/shoot-cross.png");
var img_shoot_hit = getImage("images/shoot-hit.png");
var img_shoot_miss1 = getImage("images/shoot-miss1.png");
var img_map_mode2 = getImage("images/map-mode2.png");
var img_ship_map_mode2 = getImage("images/ship-map-mode2.png");
var img_map_mode1 = getImage("images/map-mode1.png");
