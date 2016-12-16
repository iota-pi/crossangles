/* timetable.js
 *
 * Handles the display (and maybe generation?) of timetables
 */

/* --- JSLint Options --- */
/*jslint browser: true*/
/*global $, jQuery, SVG, console */

function drawGrid(draw) {
    "use strict";
    var i,
        w = draw.viewbox().width,
        h = draw.viewbox().height,
        x = 90,
        y = 44,
        days  = 5,
        hours = 14,
        xstep = (w - x) / days,
        ystep = (h - y) / hours;
    console.log(w, h);
    
    // Vertical lines
    for (i = 0; i < days; i += 1) {
        draw.line(x + xstep * i, 0, x + xstep * i, h).stroke({ width: 1, color: 'black' });
    }
    // Horizontal lines
    for (i = 0; i < hours; i += 1) {
        draw.line(0, y + ystep * i, w, y + ystep * i).stroke({ width: 1, color: 'black' });
    }
}

function drawTable(draw) {
    "use strict";
    draw.clear();
    drawGrid(draw);
}

$(document).ready(function () {
    "use strict";
    // Create SVG
    var draw = SVG('timetable').size('100%', 'auto');
    draw.viewbox(0, 0, 690, 800); // 690x800 coordinate system, regardless of rendering size
    
    // Fix subpixel offset
    draw.spof();
    SVG.on(window, 'resize', function () { draw.spof(); });
    
    // Draw grid
    drawTable(draw);
});
