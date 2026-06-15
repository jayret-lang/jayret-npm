# jayret-npm

NPM package for the command-line interface of the [Jayret programming
language](https://github.com/jayret-lang/jayret-lang) — a
Java-flavored surface syntax for [Pyret](https://pyret.org).

When installing this package, the Jayret compiler is cloned and built
from a pinned release tag of
[jayret-lang/jayret-lang](https://github.com/jayret-lang/jayret-lang)
(currently `jayret-v0.1.0`). The same `jayret` command compiles both
`.jrt` (Jayret) and `.arr` (Pyret) sources, since Jayret reuses Pyret's
full compiler and runtime.

## Install

```
npm install -g jayret-npm
```

## Usage

```
$ cat hello.jrt
void main() { print("Ahoy world!"); }

$ jayret hello.jrt
Starting Parley server...
1/1 modules compiled
Ahoy world!
```

Run `jayret --help` for the full option list.

## Architecture

`jayret-npm` is a thin wrapper around the Pyret compiler bundle that
ships inside the package at `jayret-lang/build/phaseA/pyret.jarr`. The
bundle includes the Jayret translator (`src/js/trove/parse-java.js` in
the language repo), which dispatches on the `.jrt` extension. The
wrapper drives a long-lived **Parley compile server** over a Unix
socket so that repeat compiles avoid Node JIT warmup cost.

This package is a fork of [brownplt/pyret-npm](https://github.com/brownplt/pyret-npm).

## Issues

Report Jayret issues at
[jayret-lang/jayret-lang](https://github.com/jayret-lang/jayret-lang/issues).
Underlying Pyret-compiler issues likely belong at
[brownplt/pyret-lang](https://github.com/brownplt/pyret-lang/issues).
