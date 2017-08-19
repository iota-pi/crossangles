/*
 * inlineit.js
 * Inlines CSS styles in HTML which are relevant to CrossAngles timetable
 *
 * Author: David Adams
 */

/*jshint browser:true */
/*globals console */

var inlineit = (function () {
    var relevantProperties = [
        'backgroundColor',
        'position',
        'top',
        'bottom',
        'left',
        'right',
        'transform',
        'fontFamily',
        'fontSize',
        'fontWeight',
        'opacity',
        'maxWidth',
        'width',
        'maxHeight',
        'height',
        'lineHeight',
        'margin',
        'padding',
        'display',
        'overflow',
        'textAlign',
        'flexDirection',
        'flexBasis',
        'flexFlow',
        'flexGrow',
        'flexShrink',
        'flexWrap',
        'zIndex'
    ];

    function compileHTML(node) {
        // Create a deep copy of the given node
        var clone = node.cloneNode(true);

        // Remove all child nodes with "display: none"
        removeHidden(clone);

        // Get HTML string
        var html = '';
        html += '<html><head><title>CrossAngles Timetable</title><link rel="stylesheet" href="' + window.location.href + 'css/timetable.min.css" type="text/css" /></head><body>';
        html += clone.outerHTML;
        html += '</body></html>';
        return html;
    }

    function removeHidden(node) {
        if (node.style.display === 'none') {
            node.parentNode.removeChild(node);
            return;
        }
        for (var i = node.children.length - 1; i >= 0; i -= 1) {
            removeHidden(node.children[i]);
        }
    }

    return {
        compile: compileHTML
    };
}());
