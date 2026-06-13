# jarret-npm

NPM package for the command-line interface of the [Jarret programming
language](https://github.com/ulysses4ever/jarret-lang) — a
Java-flavored surface syntax for [Pyret](https://pyret.org).

When installing this package, the Jarret compiler is cloned and built
from a pinned release tag of
[ulysses4ever/jarret-lang](https://github.com/ulysses4ever/jarret-lang)
(currently `jarret-v0.1.0`). The same `jarret` command compiles both
`.jrt` (Jarret) and `.arr` (Pyret) sources, since Jarret reuses Pyret's
full compiler and runtime.

## Install

```
npm install -g jarret-npm
```

## Usage

```
$ cat hello.jrt
void main() { print("Ahoy world!"); }

$ jarret hello.jrt
Starting Parley server...
1/1 modules compiled
Ahoy world!
```

Run `jarret --help` for the full option list.

## Architecture

`jarret-npm` is a thin wrapper around the Pyret compiler bundle that
ships inside the package at `jarret-lang/build/phaseA/pyret.jarr`. The
bundle includes the Jarret translator (`src/js/trove/parse-java.js` in
the language repo), which dispatches on the `.jrt` extension. The
wrapper drives a long-lived **Parley compile server** over a Unix
socket so that repeat compiles avoid Node JIT warmup cost.

This package is a fork of [brownplt/pyret-npm](https://github.com/brownplt/pyret-npm).

## Issues

Report Jarret issues at
[ulysses4ever/jarret-lang](https://github.com/ulysses4ever/jarret-lang/issues).
Underlying Pyret-compiler issues likely belong at
[brownplt/pyret-lang](https://github.com/brownplt/pyret-lang/issues).
