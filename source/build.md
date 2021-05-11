---
title: Build from source
---

Apache SIS is built by Maven.
For installing the JAR files in the local Maven repository, execute the following command
from the SIS project root:

{{< highlight bash >}}
mvn install
{{< / highlight >}}

For signing the artifacts and producing distribution files (`apache-sis-bin.zip` and `apache-sis.oxt`),
execute the following command.
Note that it requires an OpenPGP (_Open Pretty Good Privacy_) software for cryptography signatures
(more information on the [release management setup](release-management-setup.html#generate-key) page):

{{< highlight bash >}}
mvn install --activate-profiles apache-release
{{< / highlight >}}

The remaining of this page provides more advanced tips for SIS developers.

{{< toc >}}

# Distribution file   {#dist}

The distribution archive is a file with the `.zip` extension containing most SIS modules except `sis-webapp`
(because Web applications use an other packaging) together with their dependencies.
However for users convenience, we provide a shell script launching the SIS command line tool.
That shell script, together with other files (`README`, `LICENSE`, <i>etc.</i>) are bundled in a ZIP file created as below:

{{< highlight bash >}}
cd application/sis-console
mvn package org.apache.sis.core:sis-build-helper:dist
{{< / highlight >}}

This task is executed automatically if the `apache-release` profile is activated at build time.
Above command is for the cases where the developer wants the distribution file without rebuilding the whole project.
Optionally, the Apache SIS version can be inserted as a 4th element between `sis-build-helper:` and `:dist`
if there is many versions of the plugin in the local repository.

The result will be created in the `target/distribution/apache-sis-<version>.zip` file.
To test, uncompress in any directory and execute `apache-sis-<version>/bin/sis`.

## Known limitations   {#limitations}

The current plugin implementation has some hard-coded values, especially:

* The ZIP file content is copied from the `application/sis-console/src/main/artifact` directory.
* The final filename is hard-coded to `apache-sis-<version>.zip`.

# SIS-specific Maven plugin   {#build-helper}

Apache SIS uses a `sis-build-helper` plugin for SIS-specific tasks and Javadoc customization.
This plugin is used automatically by `mvn install`. Consequently the remaining of this page
can be safely ignored. This page is provided only as a reference for developers wanting to
take a closer look to SIS `pom.xml` file.

## Localized resources compiler    {#resources}

Localized resources are provided in `*.properties` files as specified by the `java.util.PropertyResourceBundle` standard class.
However SIS does not use those resources files directly. Instead `*.properties` files are transformed into binary files having
the same filename but the `.utf` extension. This conversion is done for efficiency, for convenience (the compiler applies the
`java.text.MessageFormat` _doubled single quotes_ rule itself), and for compile-time safety.

In addition to generating the `*.utf` files, the resource compiler may modify the `*.java` files having the same name than the
resource files. For example given a set of `Vocabulary*.properties` files (one for each supported language), the compiler will
generate the corresponding `Vocabulary*.utf` files, then look for a `Vocabulary.java` source file. If such source file is found
and contains a public static inner class named `Keys`, then the compiler will rewrite the constants declared in that inner class
with the list of keys found in the `Vocabulary*.properties` files.

The resource compiler is executed at Maven build time if the `pom.xml` file contains the following declaration. Note that current
implementation looks only for resources in any package ending with the `resources` name; all other packages are ignored.

{{< highlight xml >}}
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.sis.core</groupId>
      <artifactId>sis-build-helper</artifactId>
      <version>${sis.plugin.version}</version>
      <executions>
        <execution>
          <goals>
            <goal>compile-resources</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
{{< / highlight >}}

The resources compilation is part of the build process and does not need to be run explicitly.
However, if necessary the resources compiler can be invoked alone by the following command line
in the module containing the resources to recompile. This is sometime useful for regenerating
the constants in the `Keys` inner class in a feaster way than building the project.

{{< highlight bash >}}
mvn org.apache.sis.core:sis-build-helper:compile-resources
{{< / highlight >}}

## JAR files collector    {#jar-collect}

Links or lists all JAR files (including dependencies) in the `target/binaries` directory of the parent project.
This plugin performs a work similar to the standard Maven assembly plugin work, with the following differences:

* In multi-modules projects, this plugin does not create anything in the `target` directory of sub-modules.
  Instead, this plugin groups everything in the `target/binaries` directory of the parent module.
* This plugin does not create any ZIP file. It only links or lists JAR files.
  This plugin uses hard links on platforms that support them,
  so execution of this plugin should be very cheap and consume few disk space.
* Dependencies already present in the `target/binaries` directory are presumed stables and
  are not overwritten. Only artifacts produced by the Maven build are unconditionally overwritten.

This plugin can be activated by the following fragment in the parent `pom.xml` file:

{{< highlight xml >}}
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.sis.core</groupId>
      <artifactId>sis-build-helper</artifactId>
      <version>${sis.plugin.version}</version>
      <executions>
        <execution>
          <goals>
            <goal>collect-jars</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
{{< / highlight >}}
