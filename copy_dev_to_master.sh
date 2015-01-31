#!/bin/bash

# cleanup workspace
git clean -f -d

# check out master
git checkout master

# check out latest files from dev
git checkout dev LICENSE
git checkout dev README.md
git checkout dev .gitignore
git checkout dev .jshintrc
git checkout dev Gruntfile.js
git checkout dev package.json
git checkout dev wig.js
git checkout dev examples