#!/bin/bash
# Builds CrossAngles to dist/
# Assumptions:
#  - No <style> tags in index.html; otherwise output will be in strange order (use <link>s instead)
#
# Install dependencies: (from inside project root directory)
#  - sudo npm install grunt-cli clean-css-cli html-minifier -g
#  - npm install grunt grunt-critical
#
# Running:
#  - Run from project root directory
#  - './build'
#

# Run grunt to get critical CSS
echo -n 'Running grunt... '
grunt >/dev/null
echo 'Done'



echo -n 'Reducing critical CSS... '

# Find style `critical` styles
sed '/<style/,/<\/style>/!d' 'dist/index.html' | sed '1d;$d' |\

# Remove leading whitespace, except for one space to mark properties
sed 's/^\s\s*/ /g' |\
# Remove leading space for selectors & brackets
sed 's/^ \(.*[,{}]\)/\1/g' |\

# Substitute newlines for carriage returns to allow sed to work on newlines
tr '\n' '\r' |\
# Remove blank lines (adjacent '\r's were adjacent newlines; i.e. blank lines)
# NB: must be done before removing media queries
sed 's/\r\r*/\r/g' |\
# Remove media queries
#sed 's/@media[^{]*{\r\([^\r]*\r\)*\s*}\r}//g' |\
sed 's/}\r*}/}}/g' |\
# Put opening brackets on a new line
sed 's/\s*{/\r{/g' |\
# Substitute back again
tr '\r' '\n' |\
sed '/@media/,/}}/d' |\
# Remove font faces
sed '/@font-face/,/}/d' |\

# Only keep lines with specific properties, or lines which are only selectors or brackets
# NB: any line that doesn't start with a space is a selector or bracket
grep -E '^[^ ]|'"`cat "tools/critical-css-rules" | tr '\n' '|' | sed 's/|*$//'`" |\

# Get rid of uninteresting selectors
grep -vE "`cat "tools/critical-css-exclude" | tr '\n' '|' | sed 's/|*$//'`" |\

tr '\n' '\r' |\
# Remove empty rules
sed ':a;s/^[^{]*\r{\r*}//;s/}\r*[^{]*\r{\r*}/}/;t a' |\
# Remove rules with no selectors
sed ':a;s/}\r*{[^}]*}/}/g;t a' |\
# Remove any commas at the end of a list of selectors
sed 's/,\s*{/\r{/g' |\
tr '\r' '\n' |\

# Remove blank lines again
sed '/^$/d' >tmp
echo 'Done'



echo -n 'Minifying HTML file with critical CSS... '

# Put back into dist/index.html
# Put everything up to <style> line
sed -n '1,/<style/p' 'dist/index.html' >'dist/index.min.html'

# Minify CSS
#! sudo npm install clean-css-cli -g
cleancss -O2 <tmp >>'dist/index.min.html'
rm tmp

# Put everything after </style> line
sed -n '/<\/style>/,$p' 'dist/index.html' >>'dist/index.min.html'

# Minify HTML
#! sudo npm install html-minifier -g
html-minifier 'dist/index.min.html' -o 'dist/index.html' --collapse-whitespace --html5 --remove-comments --remove-script-type-attributes --remove-style-link-type-attributes --minify-js
rm 'dist/index.min.html'
echo 'Done'

# Copy minified CSS/JS files
echo -n 'Copying files to dist/... '
cp css/*.min.css dist/css/
cp js/*.min.js dist/js/

# Copy timetable data file
cp data/timetable.json dist/data/

# Copy fonts and images
cp -r fonts/ dist/fonts/
cp -r img/ dist/img/

# Copy favicon
cp favicon.png dist/

# Copy scraper
cp favicon.png dist/
echo 'Done'
echo
echo 'Build complete'

