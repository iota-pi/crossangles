/* timetable.js
 *
 * Handles display (and maybe generation?) of timetables
 */

/* --- JSLint Options --- */
/*jslint browser: true*/
/*global $, jQuery, SVG, console */

$(document).ready(function () {
    "use strict";
    // Create SVG
    var draw = SVG('timetable').size('100%', '100%');
    
    // Fix subpixel offset
    draw.spof();
    SVG.on(window, 'resize', function () { draw.spof(); });
    
    
});
