---
title: How to use EPSG geodetic dataset
---

The [EPSG geodetic dataset][EPSG] is a de-facto standard providing
[thousands of Coordinate Reference System (CRS) definitions](tables/CoordinateReferenceSystems.html)
together with information about how to perform coordinate operations, their accuracies and their domains of validity.
The EPSG dataset is owned and maintained by the [International Association of Oil & Gas producers][IOGP].
Usage of EPSG dataset with Apache {{% SIS %}} is optional but strongly recommended:
without that geodetic dataset, only a small subset of CRS definitions will be available
(basically the constants enumerated in the [`CommonCRS`](apidocs/org/apache/sis/referencing/CommonCRS.html) Java class)
unless full definitions are provided in _Well Known Text_ (WKT) or _Geographic Markup Language_ (GML) formats.
Furthermore, coordinate operations between any given pair of CRS may be less accurate
and their domains of validity may be unspecified if Apache {{% SIS %}} cannot query EPSG.

The EPSG geodetic dataset is not distributed with Apache {{% SIS %}} because the [EPSG terms of use][EPSG-ToU]
are incompatible with Apache license. The following items are quoted from those terms of use:

* The [EPSG][EPSG] Facilities are published by [IOGP][IOGP] at no charge. Distribution for profit is forbidden.
* The data may be included in any commercial package provided that any commerciality is based on value added
  by the provider and not on a value ascribed to the EPSG Dataset which is made available at no charge.
* Ownership of the EPSG Dataset by IOGP must be acknowledged in any publication or transmission
  (by whatever means) thereof (including permitted modifications).
* Modification of parameter values is permitted as described in the table 1 to allow change to the content
  of the information provided that numeric equivalence is achieved.
* No data that has been modified other than as permitted in these Terms of Use shall be attributed to the EPSG Dataset.

In order to use the EPSG geodetic dataset with Apache {{% SIS %}}, apply *one* of the following choices:

{{< toc >}}

# Install a local copy with command-line tool    {#command-line}

The installation process described in this section makes clear that EPSG dataset
is distributed under a different license and asks users for their agreement.
This process can be used with the [Apache SIS {{% version %}} binary bundle](downloads.html#bundles).
If the [command-line tool](command-line.html) has been downloaded and installed, just query any CRS.
For example:

{{< highlight bash >}}
sis crs EPSG:6676
{{< / highlight >}}

Alternatively if the [JavaFX application](javafx.html) is used, just start the application.
It may be necessary to open a random data file for triggering the EPSG dataset initialization.
In both cases, the first time that the command-line tool or JavaFX application needs to query EPSG,
it will prompt the user for authorization to download EPSG geodetic dataset from Maven Central.
If the user accepts EPSG terms of use, then a local copy of the EPSG geodetic dataset will be created
and stored in the `apache-sis-{{% version %}}/data` sub-directory.

## How to use the local copy in other applications    {#use-local}

The EPSG dataset installed by the command-line tools or the JavaFX application can also be used with other applications.
For using the installed EPSG geodetic dataset in your own application, apply *one* of the following choices:

* Set the `SIS_DATA` environment variable to the path of `apache-sis-{{% version %}}/data` directory _(recommended)_.
* Set the `derby.system.home` Java property to the path of `apache-sis-{{% version %}}/data/Databases` directory.

Examples are shown below for Unix systems, assuming that the current directory is the directory where `apache-sis-{{% version %}}-bin.zip`
has been unzipped (replace `myApp` and `MyMainClass` by the application to launch):

{{< highlight bash >}}
export SIS_DATA=apache-sis-{{% version %}}/data
java --class-path apache-sis-{{% version %}}/lib/sis-referencing.jar:myApp.jar MyMainClass
{{< / highlight >}}

If the `SIS_DATA` environment variable cannot be set, Java property can be used as a fallback:

{{< highlight bash >}}
java -Dderby.system.home=apache-sis-{{% version %}}/data/Databases \
     --class-path apache-sis-{{% version %}}/lib/sis-referencing.jar:myApp.jar \
     MyMainClass
{{< / highlight >}}

Alternatively `SIS_DATA` or `derby.system.home` can be set to the path of any other directory which contain the same files.

# Add a Maven dependency    {#maven}

Maven projects can get the EPSG geodetic dataset automatically, _without any prompt for terms of use agreement_,
if they add a `sis-epsg` or `sis-embedded-data` dependency (from `org.apache.sis.non-free` group) in their project.
Those two approaches have advantages and inconvenient described in following sub-sections.
In both cases, we assume that developers who add those dependencies explicitly in their project agree with
[EPSG terms of use][EPSG-ToU].

## As database installer     {#maven-epsg}

With `sis-epsg` artifact on the classpath, Apache {{% SIS %}} will create a local copy of EPSG database when first needed.
The target database must be specified by users with *one* of the following choices:

* Set the `SIS_DATA` environment variable to the path of an initially empty directory _(recommended)_.
  The specified directory must exist, but sub-directories will be created as needed.
* Set the `derby.system.home` Java property to the path of an initially empty directory,
  or a directory that contain other Derby databases. The specified directory must exist.
* Register a `DataSource` under the `java:comp/env/jdbc/SpatialMetadata` name in a JNDI directory
  (see [next section](#jndi)). The database must exist but can be initially empty.
* Set a `DataSource` [from Java code](./apidocs/org/apache/sis/setup/Configuration.html).

The Maven dependency is as below (the Derby dependency can be replaced by another database driver
if that database is specified by JNDI):

{{< highlight xml >}}
<dependencies>
  <dependency>
    <groupId>org.apache.sis.non-free</groupId>
    <artifactId>sis-epsg</artifactId>
    <version>{{% version %}}</version>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>org.apache.derby</groupId>
    <artifactId>derby</artifactId>
    <version>10.14.2.0</version>
    <scope>runtime</scope>
  </dependency>
</dependencies>
{{< / highlight >}}

See the [download](downloads.html#epsg) page for more information about Maven dependency declaration.

## As embedded database     {#maven-embedded}

With `sis-embedded-data` artifact on the classpath, there is no need to setup environment variable, Java property or JNDI.
However this simplicity come with the following inconvenient:

* a larger download,
* no option for choosing which data to use (and consequently which license to accept),
* no possibility to choose the database engine (i.e. the database software is fixed to Derby),
* no possibility to add user data (i.e. the database is read-only),
* slower execution of `CRS.forCode(…)` and `CRS.findCoordinateOperation(…)` methods, unless the JAR file is uncompressed.

This dependency can be declared as below
(see the [download](downloads.html#epsg) page for more information about Maven dependency declaration).
Note that `sis-epsg` and `sis-embedded-data` should not be specified in the same project; only one is needed:

{{< highlight xml >}}
<dependencies>
  <dependency>
    <groupId>org.apache.sis.non-free</groupId>
    <artifactId>sis-embedded-data</artifactId>
    <version>{{% version %}}</version>
    <scope>runtime</scope>
  </dependency>
</dependencies>
{{< / highlight >}}

The performance issue can be avoided if the JAR file is uncompressed.
But uncompressed `sis-embedded-data.jar` file is more than 5 times larger than the compressed file.
Given that `CRS​.forCode(…)` and `CRS​.findCoordinateOperation(…)` should not be invoked too often,
and that performance degradation does not apply to the `CoordinateOperation` instances created by those method calls,
the JAR file is distributed on the Maven repository in its compressed form.
If desired, better performance can be achieved by using one of the other configurations described in this page,
or by uncompressing the `sis-embedded-data.jar` file locally.

# Use an existing EPSG database    {#existing}

Applications can use their own EPSG database.
In addition of Derby, Apache {{% SIS %}} is also tested on HSQL and PostgreSQL.
For using an arbitrary database, register a `javax.sql.DataSource` instance through one of the methods described below.
The database must exist but can be empty, in which case it will be populated with an EPSG schema when first needed
if the <code style="white-space:normal">org.apache.sis.non-free:​sis-epsg:​{{% version %}}</code> dependency is on the classpath
(see [above section](#maven-epsg)).
If non-empty, the database should contain the tables created by SQL scripts downloaded from [EPSG][EPSG].
**Note thas as of Apache SIS 1.2, only EPSG dataset version 9 is supported.
EPSG datasets version 10 and later are not yet supported.**

## Registration by Java code    {#setup}

The data source can be specified by Java code as below
(replace the `main` method by any method where initialization occurs):

{{< highlight java >}}
import javax.sql.DataSource;
import org.apache.sis.setup.Configuration;

public void MyApp {
    public static void main(String[] args) {
        Configuration.current().setDatabase(MyApp::createDataSource);
    }

    private static DataSource createDataSource() {
        DataSource ds = ...;        // Initialize the data source here.
        return ds;
    }
}
{{< / highlight >}}

## Registration by Java Naming and Directory Interface    {#jndi-java}

Registration in JNDI can be done programmatically (by Java code) or by configuring XML files in some environments.
Registration can be done by the following Java code, provided that a JNDI implementation is available on the classpath:

{{< highlight java >}}
// Example using PostgreSQL data source (org.postgresql.ds.PGSimpleDataSource)
PGSimpleDataSource ds = new PGSimpleDataSource();
ds.setDatabaseName("SpatialMetadata");
// Server default to "localhost".

// Registration assuming that a JNDI implementation is available
Context env = (Context) InitialContext.doLookup("java:comp/env");
env.bind("jdbc/SpatialMetadata", ds);
{{< / highlight >}}

If there is no JNDI environment, the `org.apache.sis.setup.Configuration` class can be used as a fallback:

{{< highlight bash >}}
// Fallback if no JNDI environment is available.
Configuration.current().setDatabase(() -> ds);
{{< / highlight >}}

## Registration in web application containers    {#jndi-webapp}

JNDI implementations are provided by web application containers like Apache Tomcat.
When Apache {{% SIS %}} is used in a JavaEE container, the data source can be configured as below:

1. Make the JDBC driver available to the web container and its applications.
   On Tomcat, this is accomplished by installing the driver's JAR files into the `$CATALINA_HOME/lib` directory.

2. If using Derby, copy `derby.war` into the `$CATALINA_HOME/webapps` directory and specify the directory where
   the Derby databases are located (skip this step if another database is used):

{{< highlight bash >}}
export JAVA_OPTS=-Dderby.system.home=$SIS_DATA/Databases
{{< / highlight >}}

3. Declare the JNDI name in application `WEB-INF/web.xml` file:

{{< highlight xml >}}
<resource-ref>
  <description>EPSG dataset and other metadata used by Apache SIS.</description>
  <res-ref-name>jdbc/SpatialMetadata</res-ref-name>
  <res-type>javax.sql.DataSource</res-type>
  <res-auth>Container</res-auth>
</resource-ref>
{{< / highlight >}}

4. Configure the data source in `$CATALINA_HOME/conf/context.xml` or in application `META-INF/context.xml` file
   (change attribute values as needed for the chosen JDBC driver):

{{< highlight xml >}}
<Context crossContext="true">
  <WatchedResource>WEB-INF/web.xml</WatchedResource>
  <Resource name            = "jdbc/SpatialMetadata"
            auth            = "Container"
            type            = "javax.sql.DataSource"
            username        = "sa"
            password        = "sa"
            driverClassName = "org.apache.derby.jdbc.EmbeddedDriver"
            url             = "jdbc:derby:SpatialMetadata"/>
</Context>
{{< / highlight >}}

5. If using Derby, verify on the `localhost:8080/derby/derbynet` page (skip this step if another database is used).

More advanced configurations are possible. For example Tomcat can invoke a custom Java method instead of
fetching the data source from the `context.xml` file.

[IOGP]:     https://www.iogp.org/
[EPSG]:     https://epsg.org/
[EPSG-ToU]: https://epsg.org/terms-of-use.html
[Derby]:    http://db.apache.org/derby/derby_downloads.html
