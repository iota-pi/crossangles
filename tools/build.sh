#!/bin/bash
# Builds CrossAngles to dist/
#
# Assumptions:
#  - No <style> tags in index.html; otherwise output will be in strange order (use <link>s instead)
#  - Stylesheet <link>s are contained in a <noscript> tag
#
# Install dependencies: (from inside project root directory)
#  - sudo npm install grunt-cli clean-css-cli uglify-js html-minifier -g
#  - npm install grunt grunt-critical
#
# Running:
#  - Run from project root directory `./build`
#
# Written by David
#

if [ "$1" = "clean" ]; then
	rm -r dist/*
	echo "Cleaned 'dist/'"
	exit
fi

echo -n "Copying files to 'dist/'... "
# Clear dist initially
touch index.html # makes sure 'dist/*' gets expanded to *something*
rm -r dist/*
mkdir dist/css dist/js dist/data dist/img

# Copying timetable stylesheet
cp css/timetable.min.css dist/css/

# Copy timetable data file
cp data/timetable.json dist/data/

# Copy fonts and images
cp -r fonts/ dist/
cp img/*.png dist/img/

# Copy other files
cp favicon.* dist/
cp scraper.py dist/
cp contact.php dist/
cp manifest.json dist/

echo 'Done'

# Get the version and then increment it
version=$((`cat tools/version` + 1))
echo $version >tools/version


# Concat and minify all CSS
# NB: have to list files in the right order; use grep to get the same order as included in index.html
echo -n "Creating 'all.css' and 'all.js'... "
# CSS
cat `grep -o '"css/.*\.css"' index.html | sed 's/"//g'` | cleancss -O2 css/*.min.css -o dist/css/all.css
# JS
cat `grep -o '"js/.*\.js"' index.html | sed 's/"//g'` | uglifyjs -o dist/js/all.js --keep-fnames
echo 'Done'



# Run grunt to get critical CSS
echo -n 'Running grunt... '
grunt >/dev/null
echo 'Done'



echo -n 'Reducing critical CSS... '

# Find 'critical' styles
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
cleancss -O2 <tmp >>'dist/index.min.html'
rm tmp

# Put everything after </style> line
sed -n '/<\/style>/,$p' 'dist/index.html' >>'dist/index.min.html'

# Replace CSS files with 'all.css'
grep -v '<link.*rel="stylesheet"' >tmp <dist/index.min.html
allstyle="<link rel=\"stylesheet\" type=\"text/css\" href=\"css/all.css?_=$version\">"
sed -i "s|\(<noscript.*\)|\1$allstyle|" tmp
mv tmp dist/index.min.html

# Replace JS files with 'all.js'
grep -v '<script.*src="' >tmp <dist/index.min.html
allscript="<script type=\"text/javascript\" src=\"js/all.js?_=$version\" defer></script>"
sed -i "s|</body>|$allscript</body>|" tmp
mv tmp dist/index.min.html

# Minify HTML
html-minifier 'dist/index.min.html' -o 'dist/index.html' --collapse-whitespace --html5 --remove-comments --remove-script-type-attributes --remove-style-link-type-attributes --minify-js
rm 'dist/index.min.html'
echo 'Done'



# All finished!
echo
echo 'Build complete'

