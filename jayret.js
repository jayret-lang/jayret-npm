#!/usr/bin/env node

const usage = require('command-line-usage');
const commandLineArgs = require('command-line-args');
const jayretClient = require('./client-lib');
const path = require('path');
const fs = require('fs');
const stripAnsi = require('strip-ansi');
const {version} = require("./package.json");

const compilerPath = path.join(__dirname, "jayret-lang", "build", "phaseA", "pyret.jarr");

const usages = [
  {
    header: `Jayret Command-line Interface v${version}`,
    content:
      `The {bold jayret} command compiles and runs Jayret programs. Jayret is a Java-flavored surface syntax for Pyret; the same command also accepts {underline .arr} Pyret sources. It helps manage a compile server that runs in the background to speed up compilation jobs, and manages state in a project's working directory to cache compiled files.`
  },
  {
    header: 'Basic Usage',
    content: [
      '  $ cat hello.jrt',
      '  void main() \\{ print("Ahoy world!"); \\}',
      '  $ jayret {underline hello.jrt}',
      '  Starting Parley server...',
      '  1/1 modules compiled',
      '  Ahoy world!',

      '',
      '',
      '  This command compiled and ran {underline hello.jrt}. The first time, this will take a few seconds as a server starts up in the background, in order to make future compiles fast.',

      '',
      '',
      '  The file is compiled into a standalone JavaScript file with the {underline .jarr} extension under {underline .jayret/}:',
      '',

      '  $ node .jayret/{underline hello.jarr}',
      '  Ahoy world!',

      '',
      '',
      '  See https://github.com/jayret-lang/jayret-lang for the language reference and example programs.',
    ]
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'help',
        alias: 'h',
        description: 'Show this help message.'
      },
      {
        name: 'version',
        alias: 'v',
        description: "Print version information"
      },
      {
        name: 'program',
        alias: 'p',
        typeLabel: "{underline <file>.jrt}",
        defaultOption: true,
        description: "This is the default option, so using the flag is optional. Specifies the path to the program to compile (a {underline .jrt} Jayret source or a {underline .arr} Pyret source). Will start a server if one isn't running. Generates a standalone compiled file based on {bold --outfile}, and immediately executes it. The exit code is non-zero if the file fails to compile, and is the exit code of the executed program if it compiles successfully."
      },
      {
        name: 'outfile',
        alias: 'o',
        typeLabel: "{underline <file>.jarr}",
        description: "Specify the file to put the standalone compiled output into. The program can be re-run without re-compiling by using the {bold node} command. Defaults to the name of the {bold --program} with the source extension replaced with {underline .jarr}."
      },
      {
        name: 'quiet',
        alias: 'q',
        description: "Don't show the progress indicator output like \"1/4 modules compiled\""
      },
      {
        name: 'perilous',
        description: "Compromises error semantics for speed. If the program has no errors, it will produce the same outputs and answers. Currently, this means eliding most annotation checks in compiled code and in libraries."
      },
      {
        name: 'type-check',
        alias: 'y',
        description: "Turn on the type-checker, and report errors found by the type checker as compilation errors."
      },
      {
        name: 'checks',
        alias: 'e',
        description: "Specify which checks to execute (all, none, main, or only:<pattern>) (default all)."
      },
      {
        name: 'no-check-mode',
        alias: 'k',
        description: "Omit check blocks during compilation, and generate a standalone program that doesn't print testing information at all."
      },
      {
        name: 'shutdown',
        alias: 's',
        type: Boolean,
        description: "Shuts down the currently-running compile server (if any is running), by sending it a message over the specified or default {bold --port}"
      },
      {
        name: 'port',
        alias: 't',
        type: String,
        description: "Specify the path to a socket file to use to communicate with the server. Defaults to {underline /tmp/parley-<username>/comm.sock}."
      },
    ]
  },
  {
    header: 'The .jayret/ Directory',
    content: [
      'The first time you run the {bold jayret} command in a directory, it creates a {underline .jayret/} directory there.',
      '',
      'This directory is used to store the compiled versions of individual source files in your project. They will appear in {underline .jayret/compiled}.',
      '',
      'Each directory in which you run {bold jayret} will have this sub-directory created. In general, you should never need to look in or modify the directory.'
    ]
  },
  {
    header: 'The Compile Server',
    content: [
      `The compiler will not run without a running server. The {bold jayret} command tries to connect to a compile server on the specified port on startup, and if it cannot, starts one before continuing. The server accepts requests to start and stop compile jobs, and to shut down, and sends messages indicating compile status and when the job is complete.`,
      '',
      `The default mode of operation is to have a single compile server running per user. If multiple compile jobs are sent at the same time, they are queued and processed in FIFO order.`,
      '',
      `If the server gets stuck, you can manually clean up its socket file in {underline /tmp/parley-<username>/}. The server runs a file called {underline pyret.jarr} (the Pyret compiler bundle that also hosts the Jayret translator), so:`,
      '',
      '$ {bold ps} aux | {bold grep} {underline pyret.jarr}'
    ]
  },
  {
    header: 'Support and Contact',
    content: 'Report Jayret issues at https://github.com/jayret-lang/jayret-lang/issues. Jayret is a fork of brownplt/pyret-lang; underlying compiler issues may belong upstream.'
  }
];

const optionDefinitions = [
  { name: 'help', alias: 'h', type: Boolean, group: 'meta', defaultValue: false },
  { name: 'version', alias: 'v', type: Boolean, group: 'meta', defaultValue: false },
  { name: 'quiet', alias: 'q', type: Boolean, group: 'meta' },
  { name: 'norun', alias: 'c', type: Boolean, group: "meta", defaultValue: false },

  { name: 'shutdown', alias: 's', type: Boolean, group: "client", defaultValue: false },
  { name: 'port', alias: 't', type: String, group: "client" },

  { name: 'compiler', type: String, defaultValue: compilerPath, group: "client" },
  { name: 'global-parley', type: String, defaultValue: "~/.parley/" },
  { name: 'local-parley', type: String, defaultValue: ".jayret" },

  { name: 'program', alias: 'p', type: String, group: "pyret-options", defaultOption: true },

  { name: 'base-dir', type: String, group: "pyret-options" },
  { name: 'outfile', alias: 'o', type: String, group: "pyret-options" },
  { name: 'require-config', type: String, group: "pyret-options" },
  { name: 'builtin-js-dir', type: String, multiple: true, group: "pyret-options" },
  { name: 'builtin-arr-dir', type: String, multiple: true, group: "pyret-options" },
  { name: 'allow-builtin-overrides', type: Boolean, group: "pyret-options", defaultValue: false },
  { name: 'checks', defaultValue: 'all', alias: 'e', type: String, group: "pyret-options" },
  { name: 'checks-format', defaultValue: 'text', alias: 'f', type: String, group: "pyret-options" },
  { name: 'no-check-mode', alias: 'k', type: Boolean, group: "pyret-options", defaultValue: false },
  { name: 'compiled-dir', type: String, group: "pyret-options" },
  { name: 'standalone-file', type: String, group: "pyret-options" },
  { name: 'deps-file', type: String, group: "pyret-options" },

  { name: 'perilous', type: Boolean, group: "pyret-options", defaultValue: false },
  { name: 'type-check', alias: 'y', type: Boolean, group: "pyret-options", defaultValue: false },
];

let options;

function printUsage() {
  if(process.stdout.isTTY) {
    console.log(usage(usages));
  }
  else {
    console.log(stripAnsi(usage(usages)));
  }
}

function printVersion() {
  console.log(`Jayret Command-line Interface v${version}`);
}

try {
  options = commandLineArgs(optionDefinitions);
  if(options.meta.help) {
    printUsage();
    process.exit(0);
  }
  else if(options.meta.version) {
    printVersion();
    process.exit(0);
  }
}
catch(e) {
  printUsage();
  process.exit(1);
}

// Default outfile: replace .jrt or .arr with .jarr, place under the local-parley dir
if(!options["pyret-options"]["outfile"] && options["pyret-options"]["program"]) {
  const programName = options["pyret-options"]["program"];
  const parleyName = options["_all"]["local-parley"];
  const ext = path.extname(programName);
  if(ext === ".jrt" || ext === ".arr") {
    const stem = path.basename(programName).slice(0, -ext.length);
    options["pyret-options"]["outfile"] = path.join(parleyName, stem + ".jarr");
  }
}

jayretClient.start(options);
