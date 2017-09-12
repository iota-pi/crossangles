#!/bin/bash

# Get working directory
wd=`dirname $0`

# Run grunt to get critical CSS
grunt

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
# Remove font faces
sed 's/@font-face[^{]*{\r\( [^\r]*\r\)*}//g' |\
# Put opening brackets on a new line
sed 's/\s*{/\r{/g' |\
# Substitute back again
tr '\r' '\n' |\
sed '/@media/,/}}/d' |\

# Only keep lines with specific properties, or lines which are only selectors or brackets
# NB: any line that doesn't start with a space is a selector or bracket
grep -E '^[^ ]|'"`cat "$wd/critical-css-rules" | tr '\n' '|' | sed 's/|*$//'`" |\

# Get rid of uninteresting selectors
grep -vE "`cat "$wd/critical-css-exclude" | tr '\n' '|' | sed 's/|*$//'`" |\

tr '\n' '\r' |\
# Remove empty rules
sed ':a;s/^[^{]*\r{\r*}//;s/}\r*[^{]*\r{\r*}/}/;t a' |\
# Remove rules with no selectors
sed ':a;s/}\r*{[^}]*}/}/g;t a' |\
# Remove any commas at the end of a list of selectors
sed 's/,\s*{/\r{/g' |\
# Remove blank lines again (adjacent '\r's were adjacent newlines; i.e. blank lines)
# Also remove blank lines from the start
#sed 's/\r\r*/\r/g' | sed 's/^\r*//g' |\
tr '\r' '\n' |\

# Remove blank lines again
sed '/^$/d' |\

# Minify CSS
cleancss -O2 |\

#TODO: put back into dist/index.html
cat

