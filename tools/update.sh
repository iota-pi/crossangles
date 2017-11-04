#!/usr/bin/bash
# Shared server current at 116.90.60.63 (vmres09.web-servers.com.au)

cd `dirname $0`/..

if [ $0 = '--build' ]
then
    ./build >/dev/null && echo 'Build successful'
fi

echo 'put dist.tar.gz' | sftp 'mycbs@116.90.60.63:public_html' >/dev/null && echo 'Transfered dist.tar.gz'
echo 'cd public_html; tar -xf dist.tar.gz; rm dist.tar.gz' | ssh 'mycbs@116.90.60.63' /bin/bash && echo 'Extracted from dist.tar.gz'
echo 'Done'
