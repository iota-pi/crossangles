/*
 * inlineit.js
 * Inlines CSS styles in HTML which are relevant to CrossAngles timetable
 *
 * Author: David Adams
 */

/*jshint browser:true */

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
        html += '<html><head><title>CrossAngles Timetable</title>' +
            '<link rel="stylesheet" href="' + window.location.href + 'css/timetable.min.css" type="text/css" />' +
            '<link href="https://fonts.googleapis.com/css?family=Roboto:400,700" rel="stylesheet">' +
            '</head><body>';
        html += clone.outerHTML.replace(/^\s*/gm, '');
        html += '</body></html>';
        return html;
    }

    function removeHidden(node) {
        // Remove the node if it is hidden
        if (node.style.display === 'none') {
            node.parentNode.removeChild(node);
            return;
        }

        // Remove all ids, since they don't change the appearance
        if (node.id && node.id !== 'timetable') {
            node.removeAttribute('id');
        }

        // Call this function recursively on child nodes
        for (var i = node.children.length - 1; i >= 0; i -= 1) {
            removeHidden(node.children[i]);
        }
    }

    return {
        compile: compileHTML
    };
}());
