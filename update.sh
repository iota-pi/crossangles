#!/bin/bash

# NB: gfs-sydney is for testing purposes only!
cat << EOF | sftp -P 20022 gfssyde3@gfs-sydney.org:public_html/crossangles/
put -pr js
put -pr css
put -pr data
put index.html
EOF
