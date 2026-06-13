#!/bin/bash
set -e

# Clone the jarret-lang source pinned to the release tag this npm
# package ships. The build/phaseA/pyret.jarr bundle produced here is
# the compiler + Jarret translator that the wrapper invokes.

rm -rf jarret-lang
git clone --single-branch --branch jarret-v0.1.0 https://github.com/ulysses4ever/jarret-lang.git

pushd jarret-lang
npm install
make phaseA libA
touch .npmignore
popd
