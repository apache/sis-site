---
title: Apache SIS downloads
---

Apache {{% SIS %}} {{% version %}} is now available.
See the [release notes](release-notes/{{% version %}}.html) for a list of changes since the previous version.

Apache {{% SIS %}} releases are available under the [Apache License, Version 2.0][license].
See the `NOTICE` file contained in each release artifact for applicable copyright attribution notices.

{{< toc >}}


# Download ZIP files    {#bundles}

Apache {{% SIS %}} is distributed in the form of Java source code in a multi-modules Apache Maven project.
For convenience, Javadoc and pre-compiled JAR files are available as separated downloads.
The precompiled JAR files contain most modules and mandatory dependencies.
Optional dependencies (JAXB implementation, UCAR netCDF library, Amazon SDK) are not included.

* [Apache SIS {{% version %}} binary][bin]  \[[PGP][bin-PGP]\] \[[SHA 512][bin-SHA]\]
* [Apache SIS {{% version %}} javadoc][doc] \[[PGP][doc-PGP]\] \[[SHA 512][doc-SHA]\]
* [Apache SIS {{% version %}} sources][src] \[[PGP][src-PGP]\] \[[SHA 512][src-SHA]\]


## Verify signatures    {#release-gpg}

All downloads can be verified using the Apache {{% SIS %}} code signing [KEYS][keys].
The PGP (_Pretty Good Privacy_) signatures can be verified using any OpenPGP implementation, for example GPG (_GNU Privacy Guard_).
First download the [KEYS][keys] file and the `.asc` signature files for the relevant release packages.
Make sure you get these files from the main distribution directory, rather than from a mirror.
Then verify the signatures using the following (replace `src` by `bin` or `doc` if needed):

Using GNU Privacy Guard:

{{< highlight bash >}}
gpg --import KEYS
gpg --verify apache-sis-{{% version %}}-src.zip.asc
{{< / highlight >}}

Using PGP version 6:

{{< highlight bash >}}
pgp -ka KEYS
pgp apache-sis-{{% version %}}-src.zip.asc
{{< / highlight >}}

Using PGP version 5:

{{< highlight bash >}}
pgpk -a KEYS
pgpv apache-sis-{{% version %}}-src.zip.asc
{{< / highlight >}}


## Build from the sources    {#build}

If the source files were donwloaded instead of the binaries, the sources will need to be built by Gradle.
It requires Java 18 or higher for building, but the compilation result can be executed on Java 11 or higher.
For installing the JAR files in the local Maven repository, execute the following command
from the SIS project root:

{{< highlight bash >}}
cd apache-sis-{{% version %}}
gradle assemble
gradle publishToMavenLocal      # If use with Maven projects is desired.
{{< / highlight >}}

JAR files will be in the `endorsed/build/libs/` sub-directory.
An Open/LibreOffice add-in will be in `endorsed/build/bundle/`.

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

The application will bundled in a ZIP file in the `optional/build/bundle` directory.
To test, uncompress in any directory and execute `apache-​sis-​{{% version %}}/​bin/sisfx`.


## Setting the module-path    {#module-path}

Apache SIS 1.4 and later use the Java Platform Module System (JPMS).
Consequently applications should declare SIS JAR files on their module-path rather than their class-path.
The easiest way is to declare the whole directory like below:

{{< highlight bash >}}
java --module-path apache-sis-{{% version %}}/lib
{{< / highlight >}}

If the application using Apache SIS is not itself modularized,
it may be necessary to add the `--add-modules ALL-MODULE-PATH` option.
If it is not possible to declare SIS JAR files on the module-path,
a compatibility mechanism makes possible to nevertheless use SIS {{% version %}} on the class-path.
Note however that declaring SIS JAR files on the class-path may be no longer supported in a future version
(it does **not** mean that applications using SIS must put themselves on the module-path).


# Download as Maven dependencies    {#maven}

An easy approach to integrate Apache {{% SIS %}} into a Java project uses the [Apache Maven][maven]
dependency management tool to automatically obtain the required Java Archives (JAR) files from the network.
Below are examples of declarations in a `pom.xml` file for building a project with a SIS core module.

{{< highlight xml >}}
<properties>
  <sis.version>{{% version %}}</sis.version>
</properties>

<dependencies>
  <dependency>
    <groupId>org.apache.sis.core</groupId>
    <artifactId>sis-referencing</artifactId>
    <version>${sis.version}</version>
  </dependency>

  <!-- The following dependency can be omitted if XML support is not desired. -->
  <dependency>
    <groupId>org.glassfish.jaxb</groupId>
    <artifactId>jaxb-runtime</artifactId>
    <version>4.0.3</version>
    <scope>runtime</scope>
  </dependency>
</dependencies>
{{< / highlight >}}

The `sis-referencing` module in above example can be replaced by one or many of the following modules:

<table>
  <tr><th>Service</th>                          <th>Java module name</th>                                     <th>Maven group</th>                             <th>Maven artifact</th></tr>
  <tr><td>ISO 19115 metadata</td>               <td><code>org.apache.sis.metadata</code></td>                 <td><code>org.apache.sis.core</code></td>        <td><code>sis-metadata</code></td></tr>
  <tr><td>Referencing by coordinates</td>       <td><code>org.apache.sis.referencing</code></td>              <td><code>org.apache.sis.core</code></td>        <td><code>sis-referencing</code></td></tr>
  <tr><td>Referencing by identifiers</td>       <td><code>org.apache.sis.referencing.gazetteer</code></td>    <td><code>org.apache.sis.core</code></td>        <td><code>sis-referencing-by-identifiers</code></td></tr>
  <tr><td>Features and coverages</td>           <td><code>org.apache.sis.feature</code></td>                  <td><code>org.apache.sis.core</code></td>        <td><code>sis-feature</code></td></tr>
  <tr><td>Feature data from SQL database</td>   <td><code>org.apache.sis.storage.sql</code></td>              <td><code>org.apache.sis.storage</code></td>     <td><code>sis-sqlstore</code></td></tr>
  <tr><td>Feature data from GPX files</td>      <td><code>org.apache.sis.storage.xml</code></td>              <td><code>org.apache.sis.storage</code></td>     <td><code>sis-xmlstore</code></td></tr>
  <tr><td>Features and rasters from NetCDF</td> <td><code>org.apache.sis.storage.netcdf</code></td>           <td><code>org.apache.sis.storage</code></td>     <td><code>sis-netcdf</code></td></tr>
  <tr><td>Raster data from GeoTIFF</td>         <td><code>org.apache.sis.storage.geotiff</code></td>          <td><code>org.apache.sis.storage</code></td>     <td><code>sis-geotiff</code></td></tr>
  <tr><td>Raster data from Landsat</td>         <td><code>org.apache.sis.storage.earthobservation</code></td> <td><code>org.apache.sis.storage</code></td>     <td><code>sis-earth-observation</code></td></tr>
  <tr><td>Raster data from GCOM (JAXA)</td>     <td><code>org.apache.sis.profile.japan</code></td>            <td><code>org.apache.sis.profile</code></td>     <td><code>sis-japan-profile</code></td></tr>
  <tr><td>Connection to storages on cloud</td>  <td><code>org.apache.sis.cloud.aws</code></td>                <td><code>org.apache.sis.cloud</code></td>       <td><code>sis-cloud-aws</code></td></tr>
  <tr><td>Console application</td>              <td><code>org.apache.sis.console</code></td>                  <td><code>org.apache.sis.application</code></td> <td><code>sis-console</code></td></tr>
  <tr><td>Graphical application</td>            <td><code>org.apache.sis.gui</code></td>                      <td><code>org.apache.sis.application</code></td> <td><code>sis-javafx</code></td></tr>
</table>


## Include non-free resources    {#non-free}

The [EPSG geodetic dataset][EPSG] is optional but strongly recommended.
The EPSG dataset is a de-facto standard providing
[thousands of Coordinate Reference System (CRS) definitions](tables/CoordinateReferenceSystems.html)
together with information about how to perform coordinate operations, their accuracies and their domains of validity.
However usage of EPSG dataset requires acceptation of [EPSG terms of use][EPSG-ToU].
If you accept those terms of use, then the following dependency can be added:

{{< highlight xml >}}
<dependencies>
  <dependency>
    <groupId>org.apache.sis.non-free</groupId>
    <artifactId>sis-embedded-data</artifactId>
    <version>${sis.version}</version>
    <scope>runtime</scope>
  </dependency>
</dependencies>
{{< / highlight >}}

Above dependency uses a read-only embedded Derby database.
Note that the need to uncompress the `sis-embedded-data.jar` file
slows down `CRS​.forCode(…)` and `CRS​.findCoordinateOperation(…)` method executions.
For better flexibility and performance, it is also possible to use an uncompressed
and writable Derby database, or to install the EPSG dataset on HSQL or PostgreSQL.
See [How to use EPSG geodetic dataset](epsg.html) page for more information.

[maven]:    http://maven.apache.org/
[keys]:     https://www.apache.org/dist/sis/KEYS
[license]:  http://www.apache.org/licenses/LICENSE-2.0
[src]:      http://www.apache.org/dyn/closer.cgi/sis/{{% version %}}/apache-sis-{{% version %}}-src.zip
[doc]:      http://www.apache.org/dyn/closer.cgi/sis/{{% version %}}/apache-sis-{{% version %}}-doc.zip
[bin]:      http://www.apache.org/dyn/closer.cgi/sis/{{% version %}}/apache-sis-{{% version %}}-bin.zip
[src-PGP]:  https://www.apache.org/dist/sis/{{% version %}}/apache-sis-{{% version %}}-src.zip.asc
[doc-PGP]:  https://www.apache.org/dist/sis/{{% version %}}/apache-sis-{{% version %}}-doc.zip.asc
[bin-PGP]:  https://www.apache.org/dist/sis/{{% version %}}/apache-sis-{{% version %}}-bin.zip.asc
[src-SHA]:  https://www.apache.org/dist/sis/{{% version %}}/apache-sis-{{% version %}}-src.zip.sha512
[doc-SHA]:  https://www.apache.org/dist/sis/{{% version %}}/apache-sis-{{% version %}}-doc.zip.sha512
[bin-SHA]:  https://www.apache.org/dist/sis/{{% version %}}/apache-sis-{{% version %}}-bin.zip.sha512
[EPSG]:     https://epsg.org/
[EPSG-ToU]: https://epsg.org/terms-of-use.html
[JavaFX]:   https://openjfx.io/
