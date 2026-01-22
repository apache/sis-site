---
title: How to use EPSG geodetic dataset
---

The [EPSG geodetic dataset][EPSG] is a widely-used database providing
[thousands of Coordinate Reference System (CRS) definitions](tables/CoordinateReferenceSystems.html)
together with information about how to perform coordinate operations, their accuracies and their domains of validity.
The EPSG dataset is owned and maintained by the [International Association of Oil & Gas producers][IOGP].
Usage of EPSG dataset with Apache {{% SIS %}} is optional but strongly recommended:
without that geodetic dataset, only a small subset of CRS definitions will be available
(basically the constants enumerated in the [`CommonCRS`](apidocs/org.apache.sis.referencing/org/apache/sis/referencing/CommonCRS.html) Java class)
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

```bash
sis crs EPSG:6676
```

Alternatively, if the [JavaFX application](javafx.html) is used, just start the application.
It may be necessary to open a random data file for triggering the EPSG dataset initialization.
In both cases, the first time that the command-line tool or JavaFX application needs to query EPSG,
it will prompt the user for authorization to download the EPSG geodetic dataset from Maven Central.
If the user accepts EPSG terms of use, then a local copy of the EPSG geodetic dataset will be created
and stored in the `apache-sis-{{% version %}}/data` sub-directory.

## How to use the local copy in other applications    {#use-local}

The EPSG dataset installed by the command-line tools or the JavaFX application can also be used with other applications.
For using the installed EPSG geodetic dataset in your own application, apply *one* of the following choices:

* Set the `SIS_DATA` environment variable to the path of `apache-sis-{{% version %}}/data` directory _(recommended)_.
* Set the `derby.system.home` Java property to the path of `apache-sis-{{% version %}}/data/Databases` directory.

Examples are shown below for Unix systems, assuming that the current directory is the directory where `apache-sis-{{% version %}}-bin.zip`
has been unzipped (replace `myApp` and `MyMainClass` by the application to launch):

```bash
export SIS_DATA=apache-sis-{{% version %}}/data
java --class-path apache-sis-{{% version %}}/lib/sis-referencing.jar:myApp.jar MyMainClass
```

If the `SIS_DATA` environment variable cannot be set, Java property can be used as a fallback:

```bash
java -Dderby.system.home=apache-sis-{{% version %}}/data/Databases \
     --class-path apache-sis-{{% version %}}/lib/sis-referencing.jar:myApp.jar \
     MyMainClass
```

The `SIS_DATA` environment variable or `derby.system.home` Java property
can be set to the path of any other directory which contain the same files.




# Add a Maven dependency    {#maven}

Maven projects can get the EPSG geodetic dataset automatically, _without any prompt for EPSG Terms of Use agreement_,
if the users add a `sis-embedded-data` or `sis-epsg` dependency (from `org.apache.sis.non-free` group) in their project.
Those two approaches have advantages and inconvenient described in following sub-sections.
In both cases, we assume that the developers who add those dependencies explicitly in their project
have agreed with the [EPSG Terms of Use][EPSG-ToU].

## As embedded database     {#maven-embedded}

With `sis-embedded-data` artifact on the classpath, there is no need to setup environment variable, Java property or JNDI.
However, this simplicity come at the cost of a larger download with no possibility to choose the database engine
(i.e. the database software is fixed to Derby), and no possibility to add's user data (i.e. the database is read-only).
This embedded data dependency can be declared as below
(see the [download](downloads.html#epsg) page for more information about Maven dependency declaration).

```xml
<dependencies>
  <dependency>
    <groupId>org.apache.sis.non-free</groupId>
    <artifactId>sis-embedded-data</artifactId>
    <version>{{% version %}}</version>
    <scope>runtime</scope>
  </dependency>
</dependencies>
```

## As database installer     {#maven-epsg}

For applications which already have a database engine, or which use a different version of the Derby database,
it may be desirable to install the EPSG geodetic dataset in their existing database rather than having two databases in parallel.
With `sis-epsg` artifact on the classpath, Apache {{% SIS %}} will create a local copy of EPSG database when first needed.
The target database must be specified by users with *one* of the following choices:

* set the `SIS_DATA` environment variable to the path of an initially empty directory _(recommended for Derby users)_,
* or set the `derby.system.home` Java property to the path of an initially empty directory
  or a directory that contain other Derby databases,
* or register a `DataSource` under the `java:comp/env/jdbc/SpatialMetadata` name in a JNDI directory
  (see [next section](#jndi)),
* or set a `DataSource` [from Java code](./apidocs/org.apache.sis.util/org/apache/sis/setup/Configuration.html).

In all cases, the specified directory or database must exist but may be empty.
Sub-directories or database schema will be created as needed.
Then, the Maven dependency can be declared in a project as below,
with the Derby dependency replaced by another database driver if desired:

```xml
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
```

Note that `sis-epsg` and `sis-embedded-data` artifacts should not be specified in the same project. Only one is needed.




# Ask user's permission then download    {#ask-user}

If an application does not want to bundle EPSG data by default,
either for licensing reasons or for saving space, the application can ask user's permission the first time
that EPSG data are needed, then (if agreed) download and install the data automatically.
It can be done with a Java code similar to the following:

```java
import org.apache.sis.setup.OptionalInstallations;

public class OptionalInstallDialog extends OptionalInstallations {
    public OptionalInstallDialog() {
        super("text/plain");     // Desired format for the `license` argument below.
    }

    @Override
    protected boolean askUserAgreement(String authority, String license) {
        if ("EPSG".equals(authority)) {
            return false;    // If not interested in data other than EPSG.
        } else if (license == null) {
            // Ask here to user if she wants to download the EPSG data.
        } else {
            // Ask here to user if she accepts the EPSG terms of use.
        }
    }
}
```

The above class needs to be declared as an implementation of the `InstallationResources` service in `module-info.java`
or, if the application does not use Java modules, in the `META-INF/services/org.apache.sis.setup.InstallationResources` file.
In addition, the `SIS_DATA` environment variable needs to be set to the destination directory where to write data on the user's machine.
With this configuration, Apache SIS will automatically asks for user agreement and, if agreed, download EPSG data when first needed.
This approach can be combined with the next section for writing the EPSG data in a custom database.




# Use an existing EPSG database    {#existing}

Applications can use their own EPSG database.
In addition of Derby, Apache {{% SIS %}} is also tested on HSQL and PostgreSQL.
For using an arbitrary database, register a `javax.sql.DataSource` instance through one of the methods described below.
The database must exist but can be empty, in which case it will be populated with an EPSG schema when first needed
if the <code style="white-space:normal">org.apache.sis.non-free:​sis-epsg:​{{% version %}}</code> dependency is on the classpath
(see [above section](#maven-epsg)).
If non-empty, the database should contain the tables created by SQL scripts downloaded from [EPSG][EPSG].

## Registration by Java code    {#setup}

The data source can be specified by Java code as below
(replace the `main` method by any method where initialization occurs):

```java
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
```

## Registration by Java Naming and Directory Interface    {#jndi}

Registration in JNDI can be done programmatically (by Java code) or by configuring XML files in some environments.
Registration can be done by the following Java code, provided that a JNDI implementation is available on the classpath:

```java
// Example using PostgreSQL data source (org.postgresql.ds.PGSimpleDataSource)
PGSimpleDataSource ds = new PGSimpleDataSource();
ds.setDatabaseName("SpatialMetadata");
// Server default to "localhost".

// Registration assuming that a JNDI implementation is available
Context env = (Context) InitialContext.doLookup("java:comp/env");
env.bind("jdbc/SpatialMetadata", ds);
```

If there is no JNDI environment, the `org.apache.sis.setup.Configuration` class can be used as a fallback:

```bash
// Fallback if no JNDI environment is available.
Configuration.current().setDatabase(() -> ds);
```

## Registration in web application containers    {#jndi-webapp}

JNDI implementations are provided by web application containers like Apache Tomcat.
When Apache {{% SIS %}} is used in a JavaEE container, the data source can be configured as below:

1. Make the JDBC driver available to the web container and its applications.
   On Tomcat, this is accomplished by installing the driver's JAR files into the `$CATALINA_HOME/lib` directory.

2. If using Derby, copy `derby.war` into the `$CATALINA_HOME/webapps` directory and specify the directory where
   the Derby databases are located (skip this step if another database is used):

```bash
export JDK_JAVA_OPTIONS=-Dderby.system.home=$SIS_DATA/Databases
```

3. Declare the JNDI name in application `WEB-INF/web.xml` file:

```xml
<resource-ref>
  <description>EPSG dataset and other metadata used by Apache SIS.</description>
  <res-ref-name>jdbc/SpatialMetadata</res-ref-name>
  <res-type>javax.sql.DataSource</res-type>
  <res-auth>Container</res-auth>
</resource-ref>
```

4. Configure the data source in `$CATALINA_HOME/conf/context.xml` or in application `META-INF/context.xml` file
   (change attribute values as needed for the chosen JDBC driver):

```xml
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
```

5. If using Derby, verify on the `localhost:8080/derby/derbynet` page (skip this step if another database is used).

More advanced configurations are possible. For example Tomcat can invoke a custom Java method instead of
fetching the data source from the `context.xml` file.

[IOGP]:     https://www.iogp.org/
[EPSG]:     https://epsg.org/
[EPSG-ToU]: https://epsg.org/terms-of-use.html
[Derby]:    http://db.apache.org/derby/derby_downloads.html
