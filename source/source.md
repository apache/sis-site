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
We use `ApacheSIS` directory name in this page, but that name can be anything;
replace that name in the shell commands below if another name is used.
The Apache {{% SIS %}} source code can be cloned in that directory as below
(lines starting with `#` are comments and can be ignored):

{{< highlight bash >}}
mkdir ApacheSIS
cd ApacheSIS
git clone https://gitbox.apache.org/repos/asf/sis
#
# Alternatively, GitHub mirror can also be used:
# git clone https://github.com/apache/sis
#
# or Subversion (read-only):
# svn checkout https://github.com/apache/sis/trunk
{{< / highlight >}}

That is all. Apache {{% SIS %}} can be built by running `mvn install` in the `sis` subdirectory.
At this stage, the `ApacheSIS` parent directory is redundant with the `sis` subdirectory,
but we recommend to create that parent directory anyway in anticipation
for more subdirectories to be created later, when desired.
The remaining of this page describes those optional configurations for more advanced developments.

# Advanced installation    {#advanced}

This section assumes that above-described basic checkout has been done.
All subsections below are optional. It is not mandatory to execute all of them,
but we recommend to at least create the data directory described below
because some other optional services depend on it.

## Create data directory    {#data}

Apache {{% SIS %}} needs a directory where to store database, datum shift files and other optional data.
That directory is specified by the `SIS_DATA` environment variable and can be located anywhere.
A convenient location is a subdirectory of the `ApacheSIS` directory created in the "basic checkout" section.
For example (with `ApacheSIS` as the current directory):

{{< highlight bash >}}
mkdir Data
export SIS_DATA=$PWD/Data
#
# For making that environment variable available in future shell sessions,
# the output of following command can be added to .bash_profile or .bashrc
# file in user home directory.
#
echo export SIS_DATA=$SIS_DATA
{{< / highlight >}}

## Checkout non-free data    {#non-free}

The EPSG geodetic dataset is recommended for operations related to Coordinate Reference Systems.
Without the EPSG database, only a [small subset](apidocs/org/apache/sis/referencing/CRS.html#forCode-java.lang.String-)
of coordinate reference systems can be created from EPSG codes.
The EPSG database can be [installed in various ways][epsg-install],
but this section describes an alternative way more suitable to Apache {{% SIS %}} development.
Before to continue, make sure to agree with [EPSG terms of use][EPSG-ToU].
Then following command can be executed with `ApacheSIS` as the current directory:

{{< highlight bash >}}
# Executing this command imply agreement with EPSG terms of use.
svn checkout https://svn.apache.org/repos/asf/sis/data/non-free/
{{< / highlight >}}

Then copy or link the EPSG scripts in the directory where Apache {{% SIS %}} looks for optional data.
Adjust the relative paths as needed if the `SIS_DATA` environment variable
points to another location than the one used in above section:

{{< highlight bash >}}
mkdir $SIS_DATA/Databases
mkdir $SIS_DATA/Databases/ExternalSources
cd $SIS_DATA/Databases/ExternalSources
ln -s ../../../non-free/sis-epsg/src/main/resources/org/apache/sis/referencing/factory/sql/epsg/Data.sql    EPSG_Data.sql
ln -s ../../../non-free/sis-epsg/src/main/resources/org/apache/sis/referencing/factory/sql/epsg/FKeys.sql   EPSG_FKeys.sql
ln -s ../../../non-free/sis-epsg/src/main/resources/org/apache/sis/referencing/factory/sql/epsg/Tables.sql  EPSG_Tables.sql
cd -
{{< / highlight >}}

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
* `org.apache.sis.test.extensive` Java property set to `true`.

The `SpatialMetadataTest` database should stay empty when not running tests,
because Apache {{% SIS %}} always delete the temporary schema after tests completion,
regardless if the tests were successful or not.
The role and database can be created by the following SQL instructions
(replace `my_unix_user_name` by your actual user name):

{{< highlight sql >}}
CREATE ROLE my_unix_user_name LOGIN;
CREATE DATABASE "SpatialMetadataTest" WITH OWNER = my_unix_user_name;
COMMENT ON DATABASE "SpatialMetadataTest" IS 'For Apache SIS tests only.';
{{< / highlight >}}

For opening access to that database without password, it may be necessary
to add following line (ignoring comment lines) in the `pg_hba.conf` file.
Location of this file is system-dependent; it may be `/var/​lib/​pgsql/​data`:

{{< highlight text >}}
# IPv4 local connections:
# TYPE  DATABASE               USER                 ADDRESS         METHOD
host    SpatialMetadataTest    my_unix_user_name    127.0.0.1/32    trust
{{< / highlight >}}

The last step for allowing Apache {{% SIS %}} to run tests on PostgreSQL is to set the
`org.apache.sis.test.extensive` Java property to `true` (see next section).
This requirement has been added for avoiding undesired interference with host.
Note that this step is likely to change after Apache {{% SIS %}} upgrade to JUnit 5.

## Running extensive tests    {#tests}

A simple `mvn install` execution in the `sis` directory
will build and test Apache {{% SIS %}} with the default set of JUnit tests.
Some tests are skipped by default, either because they would have some effects outside
the `sis` directory (for example writing in `SpatialMetadataTest` database on PostgreSQL),
or because those tests take a long time to execute.
For enabling all tests, use the following command:

{{< highlight bash >}}
cd sis
mvn install -Dorg.apache.sis.test.extensive=true
{{< / highlight >}}

## Switch to development branch    {#branches}

The source code repository contains `master`, `geoapi-3.1` and `geoapi-4.0` branches.
Apache {{% SIS %}} releases are created from `master`, which depends on the latest GeoAPI version
released by the Open Geospatial Consortium (OGC), currently [GeoAPI 3.0.1][geoapi-stable].
However daily developments occur on the `geoapi-4.0` branch before to be merged (indirectly) to `master`.
Those branches exist in order to experiment early new API and technologies — since they may impact
the library design — while keeping the releases compatible with officially released API.
In summary:

* The `geoapi-4.0` branch implements interfaces defined in GeoAPI 4.0 snapshots.
* The `geoapi-3.1` branch implements interfaces defined in [GeoAPI 3.1 snapshots][geoapi-snapshot].
* The `master` implements interfaces defined by the [GeoAPI 3.0.1 stable release][geoapi-stable].

Developments on `geoapi-4.0` branch are merged to `geoapi-3.1` branch, which is then merged to `master`.
When commits reach `master` they become unmodifiable; the `git push --force` command is not allowed on that branch.
Contributors to Apache {{% SIS %}} project should switch to the current development branch before submitting patches:

{{< highlight bash >}}
cd sis
git checkout geoapi-4.0
{{< / highlight >}}

Note that those `geoapi-xxx` branches may disappear or be replaced by something else
after {{% OGC %}} releases the corresponding GeoAPI versions.

# Opening Apache SIS in NetBeans    {#netbeans}

Apache {{% SIS %}} build is defined by Maven `pom.xml` files.
All major IDE, including NetBeans, can open a project defined by those files.
However in the particular case of NetBeans IDE, we also provide a way to open Apache {{% SIS %}} using Ant configuration files.
Compared to "Java with Maven" project, the "Java with Ant" project is faster to build and debug,
makes easier to see all modules at once, and provides more configuration options.
Those configuration files are available in the `ide-project/NetBeans` directory.
This project will fetch dependencies directly from the `.m2/repository` local directory,
and will refer to the resources `*.utf` files compiled by Maven in the `sis-*/target` directories.
Consequently it is important to run `mvn install` manually (on the command line)
before opening the project and after any change in the project dependencies or in the resources.

Users can customize their project configuration by editing the `ide-project/NetBeans/nbproject/private/config.properties` file.
The `private` directory is excluded by the versioning system, so it okay to put user-specific information there.
For example in order to overwrite the default location of the local Maven repository and to define a system property at execution time,
one can use:

{{< highlight ini >}}
maven.repository = /path/to/my/local/repository
run.jvmargs = -DmyProperty=myValue
{{< / highlight >}}

# History    {#history}

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
