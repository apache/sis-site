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
For convenience, an aggregated Javadoc and pre-compiled JAR files are available as separated downloads.
The precompiled JAR files contain most modules and mandatory dependencies.
Optional dependencies (JAXB implementation, UCAR netCDF library, Amazon SDK) are not included.

* [Apache SIS {{% version %}} sources][src] \[[PGP][src-PGP]\] \[[SHA 512][src-SHA]\]
* [Apache SIS {{% version %}} javadoc][doc] \[[PGP][doc-PGP]\] \[[SHA 512][doc-SHA]\]
* [Apache SIS {{% version %}} binary][bin]  \[[PGP][bin-PGP]\] \[[SHA 512][bin-SHA]\]

## Verify signatures    {#release-gpg}

All downloads can be verified using the Apache {{% SIS %}} code signing [KEYS][keys].
The PGP (_Pretty Good Privacy_) signatures can be verified using any OpenPGP implementation, for example GPG (_GNU Privacy Guard_).
First download the [KEYS][keys] file and the `.asc` signature files for the relevant release packages.
Make sure you get these files from the main distribution directory, rather than from a mirror.
Then verify the signatures using the following:

Using GNU Privacy Guard:

{{< highlight bash >}}
gpg --import KEYS
gpg --verify apache-sis-X.Y.Z.zip.asc
{{< / highlight >}}

Using PGP version 6:

{{< highlight bash >}}
pgp -ka KEYS
pgp apache-sis-X.Y.Z.zip.asc
{{< / highlight >}}

Using PGP version 5:

{{< highlight bash >}}
pgpk -a KEYS
pgpv apache-sis-X.Y.Z.zip.asc
{{< / highlight >}}

# Download as a Maven dependency    {#maven}

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
</dependencies>

<!-- The following dependency can be omitted if XML support is not desired. -->
<dependency>
  <groupId>org.glassfish.jaxb</groupId>
  <artifactId>jaxb-runtime</artifactId>
  <version>2.3.3</version>
  <scope>runtime</scope>
</dependency>
{{< / highlight >}}

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
