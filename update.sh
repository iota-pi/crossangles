#!/bin/bash

cat << EOF | sftp -P 20022 gfssyde3@gfs-sydney.org:public_html/crossangles/
put -pr js
put -pr css
put index.html
EOF
