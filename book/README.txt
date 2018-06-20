This directory contains the source files for the developer guide in HTML5 format.
Those files are assembled into a single file in the ../content/book directory by
the 'org.apache.sis.internal.book.Assembler' class in 'sis-build-helper' module.

Assuming the following directory structure:

(any directory)
  ├─ master
  └─ site
      ├─ book
      └─ content

Then the command can be used as below on Unix systems:

cd site
java -classpath ../master/core/sis-build-helper/target/classes org.apache.sis.internal.book.Assembler en

Replace "en" by "fr" for generating the French version.
