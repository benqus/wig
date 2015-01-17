#!/bin/bash

# check out master
git checkout master

# check out latest files from dev
git checkout dev LICENSE
git checkout dev README.md
git checkout dev .jshintrc
git checkout dev package.json
git checkout dev wig.js

# commit latest version of the files in
git add .
git commit -m "Update latest version"
git push