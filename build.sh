#!/bin/bash
set -e

# Clone the jayret-lang source pinned to the release tag this npm
# package ships. The build/phaseA/pyret.jarr bundle produced here is
# the compiler + Jayret translator that the wrapper invokes.

rm -rf jayret-lang
git clone --single-branch --branch jayret-v0.1.0 https://github.com/ulysses4ever/jayret-lang.git

pushd jayret-lang
npm install
make phaseA libA
touch .npmignore
popd
