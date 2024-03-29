---
title: Checkout source code
---

Apache {{% SIS %}} source code is maintained using [Git][git] version control,
completed by optional data maintained using [Subversion][subversion] version control.
Optional data include in particular the [EPSG geodetic dataset][epsg-install],
which is subject to licensing terms different than Apache ones.
This page describes two ways to checkout Apache {{% SIS %}} source code:

* A basic checkout with only the main repository, the most stable branch, and no configuration requirement.
* A more advanced configuration for active SIS developments, using uncommitted (for now) API
  and including optional data for more extensive tests.

It is possible to start with the basic checkout and migrate to the advanced configuration later,
or to cherry-pick only the interesting parts of the advanced configuration.

{{< toc >}}


# Basic installation    {#basic}

Create an empty directory for the Apache {{% SIS %}} project.
We use `ApacheSIS` directory name in this page, but that name can be anything.
Replace that name in the shell commands below if another name is used.
The Apache {{% SIS %}} source code can be cloned in that directory as below
(lines starting with `#` are comments and can be ignored):

```bash
mkdir ApacheSIS
cd ApacheSIS
git clone https://gitbox.apache.org/repos/asf/sis
#
# Alternatively, GitHub mirror can also be used:
# git clone https://github.com/apache/sis
#
# or Subversion (read-only):
# svn checkout https://github.com/apache/sis/trunk
```

If JavaFX is available on the local machine,
its JAR files location can be specified as below
(edit the `/usr/lib/jvm/openjfx` path as needed).
The JavaFX application is excluded by default because it depends on
the [JavaFX platform][JavaFX] which is distributed under GPL license
(note that the SIS module stay under Apache 2 licence).

```bash
# Syntax for Unix shell
export PATH_TO_FX=/usr/lib/jvm/openjfx
```

Likewise the [EPSG geodetic dataset](epsg.html) is excluded by default for licensing reasons.

Then, Apache {{% SIS %}} can be built as below:

```bash
cd sis
gradle assemble
gradle publishToMavenLocal      # If use with Maven projects is desired.
```

Outputs will be located in the following sub-directories:

* `endorsed/build/libs/`   for the JAR files of the core library and its dependencies.
* `optional/build/libs/`   for the JAR files of modules requiring optional dependencies.
* `incubator/build/libs/`  for the JAR files of modules that are not yet part of releases.
* `endorsed/build/bundle/` for the OXT add-in for Open/LibreOffice Calc.
* `optional/build/bundle/` for the JavaFX application if optional dependencies were specified.

The remaining of this page describes optional configurations for more advanced developments.


# Advanced installation    {#advanced}

This section assumes that above-described basic checkout has been done.
All subsections below are optional, but the "Create data directory" one
is recommended because some other subsections depend on it.


## Create data directory    {#data}

Apache {{% SIS %}} needs a directory where to store database, datum shift files and other optional data.
That directory is specified by the `SIS_DATA` environment variable and can be located anywhere.
A convenient location is a subdirectory of the `ApacheSIS` directory created in the "basic checkout" section.
For example (with `ApacheSIS` as the current directory):

```bash
mkdir Data
export SIS_DATA=$PWD/Data
#
# For making that environment variable available in future shell sessions,
# the output of following command can be added to .bash_profile or .bashrc
# file in user home directory.
#
echo export SIS_DATA=$SIS_DATA
```


## Checkout non-free data    {#non-free}

The EPSG geodetic dataset is recommended for operations related to Coordinate Reference Systems.
Without the EPSG database, only a [small subset](apidocs/org/apache/sis/referencing/CRS.html#forCode-java.lang.String-)
of coordinate reference systems can be created from EPSG codes.
The EPSG database can be [installed in various ways][epsg-install],
but this section describes an alternative way more suitable to Apache {{% SIS %}} development.
Before to continue, make sure to agree with [EPSG terms of use][EPSG-ToU].
Then following command can be executed with `ApacheSIS` as the current directory:

```bash
# Executing this command imply agreement with EPSG terms of use.
svn checkout https://svn.apache.org/repos/asf/sis/data/non-free/
```

Then copy or link the EPSG scripts in the directory where Apache {{% SIS %}} looks for optional data.
Adjust the relative paths as needed if the `SIS_DATA` environment variable
points to another location than the one used in above section:

```bash
mkdir $SIS_DATA/Databases
mkdir $SIS_DATA/Databases/ExternalSources
cd $SIS_DATA/Databases/ExternalSources
ln -s ../../../non-free/sis-epsg/src/main/resources/org/apache/sis/referencing/factory/sql/epsg/Data.sql    EPSG_Data.sql
ln -s ../../../non-free/sis-epsg/src/main/resources/org/apache/sis/referencing/factory/sql/epsg/FKeys.sql   EPSG_FKeys.sql
ln -s ../../../non-free/sis-epsg/src/main/resources/org/apache/sis/referencing/factory/sql/epsg/Tables.sql  EPSG_Tables.sql
cd -
```

This is sufficient for allowing Apache {{% SIS %}} to create the geodetic database
without the need for `sis-epsg` or `sis-embedded-data` module on the classpath.
This setting is not done automatically because Apache projects cannot introduce
non-free dependencies without explicit action from user.
If this action is not taken, some JUnit tests requiring EPSG data may be skipped.
If any EPSG file is updated, deleting the `$SIS_DATA/​Databases/​SpatialMetadata` directory
is sufficient for causing Apache {{% SIS %}} to recreate the Derby database with new data.


## Configure PostgreSQL    {#postgres}

Apache {{% SIS %}} is tested with Derby, HSQL and PostgreSQL databases.
Derby and HSQL are tested automatically using temporary databases in memory.
But testing on PostgreSQL requires the creation of a dedicated database on the developer platform.
The requirements are:

* PostgreSQL server running and listening to `localhost` on default port (5432).
* A role with the same name than Unix user name of the developer running tests.
* An empty database named `"SpatialMetadataTest"`.
* Above-cited role can connect to `SpatialMetadataTest` database without password.
* `org.apache.sis.test.postgresql` Java property set to `true` or the
  `SIS_TEST_OPTIONS` environment variable contains `postgresql`.

The `SpatialMetadataTest` database should stay empty when not running tests,
because Apache {{% SIS %}} always delete the temporary schema after tests completion,
regardless if the tests were successful or not.
The role and database can be created by connecting to the server:

```bash
psql --username=postgres
```

Then the role and database can be created by the following SQL instructions
(replace `my_unix_user_name` by your actual user name):

```sql
CREATE ROLE my_unix_user_name LOGIN;
CREATE DATABASE "SpatialMetadataTest" WITH OWNER = my_unix_user_name;
COMMENT ON DATABASE "SpatialMetadataTest" IS 'For Apache SIS tests only.';
\connect "SpatialMetadataTest"
CREATE EXTENSION postgis;
\q
```

For opening access to that database without password, it may be necessary
to add following line (ignoring comment lines) in the `pg_hba.conf` file.
Location of this file is system-dependent, it may be `/var/lib/pgsql/data/`.
The following lines should be inserted *before* the lines for user `all`:

```
# TYPE  DATABASE               USER                 ADDRESS         METHOD
host    SpatialMetadataTest    my_unix_user_name    127.0.0.1/32    trust
host    SpatialMetadataTest    my_unix_user_name    ::1/128         trust
```

The last step for allowing Apache {{% SIS %}} to run tests on PostgreSQL is to set the
`org.apache.sis.test.postgresql` Java property or the
`SIS_TEST_OPTIONS` environment variable (see next section).
This requirement has been added for avoiding undesired interference with host.


## Running extensive tests    {#tests}

A simple `gradle test` execution in the `sis` directory
will build and test Apache {{% SIS %}} with the default set of JUnit tests.
Some tests are skipped by default, either because they would have some effects outside
the `sis` directory (for example writing in `SpatialMetadataTest` database on PostgreSQL),
or because those tests take a long time to execute.
For enabling all tests, use the following command:

```bash
cd sis
export SIS_TEST_OPTIONS=extensive,postgresql
gradle test
```


## Switch to development branch    {#branches}

The source code repository contains `main`, `geoapi-3.1` and `geoapi-4.0` branches.
Apache {{% SIS %}} releases are created from `main`, which depends on the latest GeoAPI version
released by the Open Geospatial Consortium (OGC), currently [GeoAPI 3.0.2][geoapi-stable].
However daily developments occur on the `geoapi-4.0` branch before to be merged (indirectly) to `main`.
Those branches exist in order to experiment early new API and technologies — since they may impact
the library design — while keeping the releases compatible with officially released API.
In summary:

* The `geoapi-4.0` branch implements interfaces defined in GeoAPI 4.0 snapshots.
* The `geoapi-3.1` branch implements interfaces defined in [GeoAPI 3.1 snapshots][geoapi-snapshot].
* The `main` implements interfaces defined by the [GeoAPI 3.0.2 stable release][geoapi-stable].

Developments on `geoapi-4.0` branch are merged to `geoapi-3.1` branch, which is then merged to `main`.
When commits reach `main` they become unmodifiable; the `git push --force` command is not allowed on that branch.
Contributors to Apache {{% SIS %}} project should switch to the current development branch before submitting patches:

```bash
cd sis
git checkout geoapi-4.0
```

Note that those `geoapi-xxx` branches may disappear or be replaced by something else
after {{% OGC %}} releases the corresponding GeoAPI versions.


# Managing resources   {#resources}

Resources are in the same `src` directories than Java source code.
Resources files are kept close to Java source files because they often need to be edited together.
All resource files are copied to the build directory, except those with the following extensions:

* `tmp`, `bak`, `log` — because they are temporary files.
* `java`, `idl`       — because they are source files.
* `html`, `md`        — because they are documentation files.

The `properties` files are handled in a special way.
Localized resources are provided in `*.properties` files as specified by the `java.util.Property­Resource­Bundle` standard class.
However SIS does not use those resources files directly. Instead `*.properties` files are transformed into binary files having
the same filename but the `.utf` extension. This conversion is done for efficiency, for convenience (the compiler applies the
`java.text.Message­Format` _doubled single quotes_ rule itself), and for compile-time safety.

In addition to generating the `*.utf` files, the resource compiler may modify the `*.java` files having the same name than the
resource files. For example given a set of `Vocabulary*.properties` files (one for each supported language), the compiler will
generate the corresponding `Vocabulary*.utf` files, then look for a `Vocabulary.java` source file. If such source file is found
and contains a public static inner class named `Keys`, then the compiler will rewrite the constants declared in that inner class
with the list of keys found in the `Vocabulary*.properties` files.

Apache {{% SIS %}} uses a plugin in `buildSrc/` for processing resources.
This plugin is used automatically by Gradle.


# History    {#history}

The build system before Apache {{% SIS %}} 1.4 was Maven.
Migration to Gradle was necessary for partial support of Module Source Hierarchy.
All developments and tags prior Apache {{% SIS %}} 1.0 were done on a [Subversion][subversion] repository
and can be [browsed online][viewvc].
Tags for Apache {{% SIS %}} versions 0.1 to 0.8 should be fetched from the [SVN repository][svn-sis-tags].
The development branches on that repository were named `JDK8`, `JDK7`, `JDK6` and `trunk`.

[subversion]:       http://subversion.apache.org
[git]:              http://git-scm.com
[viewvc]:           http://svn.apache.org/viewvc/sis/
[epsg-install]:     epsg.html
[EPSG-ToU]:         https://epsg.org/terms-of-use.html
[svn-sis-tags]:     https://svn.apache.org/repos/asf/sis/tags/
[geoapi-stable]:    http://www.geoapi.org/3.0/index.html
[geoapi-snapshot]:  http://www.geoapi.org/snapshot/index.html
