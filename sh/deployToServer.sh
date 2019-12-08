#!/bin/bash

npm run-script build

filenameWithoutSuffix="scratch-gui-`date "+%Y-%m-%d_%H-%M-%S"`"
filename="$filenameWithoutSuffix.zip"

cd build
zip -r ../$filename ./*
cd ..

scp $filename root@scratch.flyingbears.cn:/opt/html/
ssh root@scratch.flyingbears.cn "cd /opt/html/; unzip $filename -d $filenameWithoutSuffix; rm /usr/share/nginx/html/editor; ln -s /opt/html/$filenameWithoutSuffix/ /usr/share/nginx/html/editor"