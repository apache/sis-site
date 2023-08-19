---
title: Build from source
---

Apache {{% SIS %}} is built by Gradle.
It requires Java 18 or higher for building, but the compilation result can be executed on Java 11 or higher.
For installing the JAR files in the local Maven repository, execute the following command
from the SIS project root:

{{< highlight bash >}}
gradle assemble publishToMavenLocal
{{< / highlight >}}

The JavaFX application is excluded by default because it depends on
the [JavaFX platform][JavaFX] which is distributed under GPL license
(note that the SIS module stay under Apache 2 licence).
Likewise the [EPSG geodetic dataset](epsg.html) is excluded by default for licensing reasons.
For including the JavaFX module in the build, define the `PATH_TO_FX` environment variable
with the path to the directory containing all JavaFX JAR files.
Example on a Linux system (the path may vary):

{{< highlight bash >}}
export PATH_TO_FX=/usr/lib/jvm/openjfx
{{< / highlight >}}

The remaining of this page provides more advanced tips for SIS developers.

{{< toc >}}

# Distribution file   {#dist}

The distribution archive is a file with the `.zip` extension containing most SIS modules
(excluding the ones in the incubator sub-project), together with mandatory dependencies.
For users convenience, we provide shell scripts launching the SIS command line tool or the JavaFX application.
Those shell scripts, together with other files (`README`, `LICENSE`, <i>etc.</i>) are bundled in a ZIP file
created in the `optional/build/bundle/` directory.
To test, uncompress in any directory and execute `apache-​sis-​<version>/​bin/sis`.

# SIS-specific Gradle plugin   {#build-helper}

Apache {{% SIS %}} uses a plugin in `buildSrc/` for SIS-specific tasks and Javadoc customization.
This plugin is used automatically by Gradle. Consequently the remaining of this page can be safely ignored.
This page is provided only as a reference for developers wanting to take a closer look to SIS build system.

## Localized resources compiler    {#resources}

Localized resources are provided in `*.properties` files as specified by the `java.util.Property­Resource­Bundle` standard class.
However SIS does not use those resources files directly. Instead `*.properties` files are transformed into binary files having
the same filename but the `.utf` extension. This conversion is done for efficiency, for convenience (the compiler applies the
`java.text.Message­Format` _doubled single quotes_ rule itself), and for compile-time safety.

In addition to generating the `*.utf` files, the resource compiler may modify the `*.java` files having the same name than the
resource files. For example given a set of `Vocabulary*.properties` files (one for each supported language), the compiler will
generate the corresponding `Vocabulary*.utf` files, then look for a `Vocabulary.java` source file. If such source file is found
and contains a public static inner class named `Keys`, then the compiler will rewrite the constants declared in that inner class
with the list of keys found in the `Vocabulary*.properties` files.


[JavaFX]: https://openjfx.io/
