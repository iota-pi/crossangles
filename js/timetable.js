/* timetable.js
 *
 * Handles the display (and maybe generation?) of timetables
 */

/* --- JSLint Options --- */
/*jslint browser: true*/
/*global $, jQuery, SVG, console */

$(document).ready(function () {
    "use strict";
    // Create SVG
    var draw = SVG('timetable').size(690, 800),
        w = $('#timetable svg').width(),
        h = Math.floor(w / 690 * 800);
    draw.size(w, h);
    
    // Fix subpixel offset
    draw.spof();
    SVG.on(window, 'resize', function () { draw.spof(); });
    
    // Draw grid
    (function drawGrid() {
        var x = 90, days  = 5, xstep = Math.floor((w - x) / days),
            y = 44, hours = 14, ystep = Math.floor((h - y) / hours), i;
        
        // Vertical lines
        for (i = 0; i < days; i += 1) {
            draw.line(x + xstep * i, 0, x + xstep * i, h).stroke({ width: 1, color: 'black' });
        }
        // Horizontal lines
        for (i = 0; i < hours; i += 1) {
            draw.line(0, y + ystep * i, w, y + ystep * i).stroke({ width: 1, color: 'black' });
        }
    }());
});
