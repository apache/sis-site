This directory contains the source files for the developer guide in HTML5 format.
Those files are assembled into a single file in the "../../static/book/ directory"
by the `org.apache.sis.internal.book.Assembler` class in `sis-build-helper` module.

Assuming the following directory structure:

(current directory)
├─ main
│   └─ buildSrc
└─ site
    ├─ main
    │   └─ content
    └─ asf-staging
        └─ book

Then the command can be used as below on Unix systems:

java -classpath main/buildSrc/build/classes/java/main org.apache.sis.internal.book.Assembler site
