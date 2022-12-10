---
title: Release management
---

This page describes how to create and deploy the SIS Maven artifacts, binary bundle, javadoc and list of API changes.
The [Release FAQ][release-faq] page describes the foundation wide policies.
Instructions on this page describe the steps specific to SIS (we do not use the `mvn release` command).
The intended audiences are SIS release managers.

{{< toc >}}

# Configure    {#configure}

Before to perform a release, make sure that the following conditions hold:

* Commands will be executed in a Unix shell.
* Git, Subversion, GNU GPG, ZIP, Maven, Ant, Java and the Java compiler are available on the path.
* The [release management setup](release-management-setup.html) steps have been executed once.

For all instructions in this page, `$OLD_VERSION` and `$NEW_VERSION` stand for the version
number of the previous and the new release respectively, and `$RELEASE_CANDIDATE` stands for
the current release attempt. Those versions shall be set on the command line like below (Unix):

{{< highlight bash >}}
gpg --list-keys                     # For getting the value to put in <your key ID>
unset PATH_TO_FX
export OLD_VERSION=1.2
export NEW_VERSION={{% version %}}
export RELEASE_CANDIDATE=1
export SIGNING_KEY=<your key ID>    # hexadecimal number with 8 or 40 digits.
{{< / highlight >}}

## Directory layout    {#directory-layout}

The steps described in this page assume the following directory layout (some directories will be created as
a result of the steps). Any other layout can be used. However if the layout differs, then the relative paths
in this page shall be adjusted accordingly.

{{< highlight text >}}
    <any root directory for SIS>
    ├─ $NEW_VERSION-RC
    ├─ master
    ├─ non-free
    │  └─ sis-epsg
    ├─ releases
    │  ├─ distribution
    │  │  └─ $NEW_VERSION
    │  │     └─ RC$RELEASE_CANDIDATE
    │  └─ tests
    │     ├─ integration
    │     └─ maven
    └─ site
       ├─ main
       ├─ asf-staging
       ├─ asf-site
       └─ javadoc
{{< / highlight >}}

# Review project status before branching    {#prepare-source}

Replace the `$OLD_VERSION` number by `$NEW_VERSION` in the values of following properties on the development branch:

* `DOWNLOAD_URL` in `core/sis-utility/src/main/java/org/apache/sis/setup/OptionalInstallations.java` file.
* `<sis.non-free.version>` in root `pom.xml` file.
* Review the `README` and `NOTICE` files in root directory.
* Review the `README` files in `application/sis-javafx/src/main/artifact/` and subdirectories.

Commit and merge with other branches up to master.

{{< highlight bash >}}
git add --update
git commit --message="Set version number and the EPSG geodetic dataset URL to expected values after release."
# merge with master
{{< / highlight >}}

Before to start the release process, we need to test more extensively the master.
The tests described below often reveal errors that were unnoticed in daily builds.
It is better to detect and fix them before to create the release branch.
First, ensure that a PostgreSQL server is running and listening to the default port on local host
(optional but recommended for more exhaustive testing —
see [PostgreSQL testing configuration](./source.html#postgres) for more details).
Then execute the following commands and fix as much warnings as practical:

{{< highlight bash >}}
systemctl start postgresql.service        # Optional — exact command depends on Linux distribution.
mvn clean install --define org.apache.sis.test.extensive=true
mvn javadoc:aggregate --activate-profiles javafx
{{< / highlight >}}

If the `SIS_DATA` environment variable was set during above build, unset it a try again.
Ideally the build should be tested in both conditions (`SIS_DATA` set and unset).
That test may be done in a separated shell (console window) in order to preserve
the variable value in the shell performing the release.

{{< highlight bash >}}
unset SIS_DATA
echo $SIS_DATA
mvn test
{{< / highlight >}}

## Update the list of supported CRS    {#update-crs-list}

The following steps regenerate
the [CoordinateOperationMethods](./tables/CoordinateOperationMethods.html)
and [CoordinateReferenceSystems](./tables/CoordinateReferenceSystems.html) pages.
Those steps are also useful as additional tests, since failure to generate those pages may reveal problems.

1. Open the `AuthorityCodes` class, search `DEPRECATED=0` (it appears in a SQL fragment) and replace by `(DEPRECATED=0 OR TRUE)`.
   **Do not commit!** This is a temporary hack for including deprecated codes in the CRS list to be generated.
   Those codes will appear with strike for making clear that they are deprecated.
2. Open the `CoordinateOperationMethods` Java class and execute its `main` method, for example in an IDE.
3. Open the `CoordinateReferenceSystems` Java class and execute its `main` method.
4. If successful, HTML files will be generated in the current directory.
   Open those files in a web browser and verify that information are okay,
   in particular the SIS and EPSG version numbers in the first paragraph.
5. If okay, move those two HTML files to the `../site/main/static/tables/` directory, overwriting previous files.
6. Revert the hack in `AuthorityCodes` class.
7. Commit: `git commit --message="Update the list CRS and operation methods supported by Apache SIS $NEW_VERSION."`

## Prepare release notes    {#release-notes}

We update JIRA soon because doing so is sometimes a reminder of uncompleted tasks in source code.
Update [JIRA][JIRA] tasks and prepare release notes as below:

* Ensure that the _Fix Version_ in issues resolved since the last release includes this release version correctly.
* Ensure that all open issues are resolved or closed before proceeding further.
* On the `site` source code repository, create a `content/release-notes/$NEW_VERSION.md` file with all the features added.
* Use `content/release-notes/$OLD_VERSION.md` as a template, omitting the old list of issues.
* The release notes can be obtained from JIRA, by clicking on the _Versions_ tab → the version number → _Release notes_
  and then configuring the release notes to display HTML format and copying it.
  A suggested approach would be to reorganize the release notes as
  _New Features_, then _Improvements_, then _Bug Fixes_, then _Tests_ and finally _Tasks_.
  The _Sub Tasks_ can be classified according the category of their parent issue.

Commit to staging area (not published immediately):

{{< highlight bash >}}
cd ../site/main
cp content/release-notes/$OLD_VERSION.md content/release-notes/$NEW_VERSION.md
# Edit release notes before to continue.
git add content/release-notes/$NEW_VERSION.md
git commit --message "Release notes for Apache SIS $NEW_VERSION."
{{< / highlight >}}

# Create release branch    {#branch}

Execute the following commands.
It is okay to checkout the branch in a separated directory if desired.
The `SIS_RC_DIR` environment variable will specify that directory.

{{< highlight bash >}}
cd ../master
git checkout -b $NEW_VERSION-RC
export SIS_RC_DIR=`pwd`
{{< / highlight >}}

Remove the files and modules that are not yet ready for a release.
This may require removing `<module>` elements in the parent `pom.xml` file.

{{< highlight bash >}}
git rm .asf.yaml
git rm -r core/sis-cql
git rm -r storage/sis-shapefile
git rm -r application/sis-webapp
git add --update    # for the removal of <module> elements in pom.xml files.
git commit --message="Remove the modules to be excluded from $NEW_VERSION release."
{{< / highlight >}}

Open the root `pom.xml` file in an editor and perform the following changes:

* Remove the whole `<pluginRepositories>` block (including comment),
  since it should not be needed for releases (and is actually not allowed).

We need to update the SIS version numbers not only in the `pom.xml` files, but also in a few Java files.
The following command performs the replacement using Ant.

{{< highlight bash >}}
ant -buildfile core/sis-build-helper/src/main/ant/prepare-release.xml branch -Dsis.version=$NEW_VERSION
git rm -r core/sis-build-helper/src/main/ant
{{< / highlight >}}

Validate with `git diff --staged`, search `SNAPSHOT` in the whole source directory in case we missed some, then commit:

{{< highlight bash >}}
git add --update
mvn clean install
git commit --message="Set version number to $NEW_VERSION."
{{< / highlight >}}

## Test branch extensively    {#test-branch}

Build the project with the `apache-release` profile enabled.
This profile performs the following actions:

* Enable extensive tests (i.e. it will set the `org.apache.sis.test.extensive` property to `true`).
* Generate Javadoc. This may fail if the source code contains invalid Javadoc tags or broken HTML.
* Generate additional binary artifacts (`*.zip` and `*.oxt` files).
  This will fail if duplicated class files or resources are found.
  Consequently building the `*.zip` file is an additional test worth to do before deployment.
* Sign the artifacts.

Each of those additional products may cause a failure that did not happen in normal builds.

{{< highlight bash >}}
mvn clean install --activate-profiles apache-release
find . -name "sis-*.asc" -exec gpg --verify '{}' \;     # Verify signatures.
{{< / highlight >}}

Move to the `target` directory and execute all examples documented in the [command-line interface page](./command-line.html)
with the `sis` command replaced by the following:

{{< highlight bash >}}
java -classpath "binaries/*" -enableassertions org.apache.sis.console.Command
{{< / highlight >}}

## Prepare non-free resources    {#maven-nonfree}

Go to the directory that contains a checkout of `https://svn.apache.org/repos/asf/sis/data/non-free/sis-epsg`.
Those modules will not be part of the distribution (except on Maven), but we nevertheless need to ensure that they work.
Replace occurrences of `<version>$OLD_VERSION</version>` by `<version>$NEW_VERSION</version>` in the `pom.xml` files.

{{< highlight bash >}}
cd ../non-free
svn update
mvn clean install
mvn javadoc:javadoc                   # Test that javadoc can be generated.
svn commit --message "Set version number and dependencies to $NEW_VERSION."
{{< / highlight >}}

## Integration test    {#integration-tests}

Open the root `pom.xml` file of integration tests.
Set version numbers to `$NEW_VERSION` without `-SNAPSHOT` suffix.
Verify the configuration and version of Maven plugins.
Then test and commit (note that execution may be slow).

{{< highlight bash >}}
cd ../releases/tests
svn update
cd maven
mvn clean test
svn commit --message "Set version number and dependencies to $NEW_VERSION."
{{< / highlight >}}

# Deploy Maven artifacts    {#maven-deploy}

If above verifications succeeded, performs the following _temporary_ changes
(to be discarded after the deployment to Maven repository):

* Remove temporarily the `sis-openoffice` module from `application/pom.xml`.
* Remove the `test-jar` goal from `maven-jar-plugin` in the root `pom.xml`.
* Remove all SIS dependencies declared with `<type>test-jar</type>` in all `pom.xml` files.
  This hack will force us to skip test compilations.

Then deploy SIS (without test JAR files).
Deploy also the non-free resources in the same staging repository.
If there is any issue with this deployment, the staging repository can easily be dropped and recreated.

{{< highlight bash >}}
cd $SIS_RC_DIR
mvn clean deploy --activate-profiles apache-release --define maven.test.skip=true
cd ../non-free
mvn clean deploy --activate-profiles apache-release --define maven.test.skip=true
{{< / highlight >}}

## Verify and close the Nexus release artifacts    {#nexus-close}

Verify the staged artifacts in the [Nexus repository][repository].
The artifacts can be found under _Build Promotion_ → _Staging repositories_, and searching for `org.apache.sis` in the _Repository_ column.
Navigate through the artifact tree and make sure that all javadoc, source and jar files have `.asc` (GPG signature) and `.sha1` files.
Select any `*-javadoc.jar` file and click on the <cite>Archive Browser</cite> tab on the right side.
Select any `*.html` file which is known to use some of the custom taglets defined in the `sis-build-helper` module.
Click on that file and verify that the custom elements are rendered properly.
In particular, all Java code snippets are missing if the `@preformat` taglet had not be properly registered,
so try to see at least one code snippet.
In the `sis-epsg-$NEW_VERSION.jar` file, verify that `META-INF/LICENSE` contains the EPSG terms of use.

Additional cleaning:

* Delete all `org/apache/sis/parent/$NEW_VERSION/parent-$NEW_VERSION-source-release.zip.*` files on the Nexus repository.
  They should not be there - source release will be deployed on another repository later.
* Delete all `org/apache/sis/non-free/$NEW_VERSION/non-free-$NEW_VERSION-source-release.zip.*` files.
* Delete all `org/apache/sis/non-free/sis-epsg/$NEW_VERSION/sis-epsg-$NEW_VERSION-source.jar.*` files.

Close the Nexus staging repository:

* Click the checkboxes for the open staging repositories (`org.apache.sis-<id>`) and press _Close_ in the menu bar.
* In the description field, enter "`SIS $NEW_VERSION-RC$RELEASE_CANDIDATE`"
  (replace `$NEW_VERSION` and `$RELEASE_CANDIDATE` by appropriate values.
  This will not be done automatically since this field box is not our bash shell!).
* Click on the `org.apache.sis-<id>` link in order to get the URL to the temporary Maven repository created by Nexus.

We will announce later (in the <cite>Put the release candidate up for a vote</cite> section) on the `dev@` mailing list
the availability of this temporary repository for testing purpose.

## Test the Nexus release artifacts    {#nexus-text}

Go to the test Maven project.
Open the root `pom.xml` file and set the `<version>` number to the SIS release to be tested.
Then go to the `<url>` declaration of the first `<repository>` and replace value by the URL
of the temporary Maven repository created by Nexus.
Usually, only the 3 last digits need to be updated.

{{< highlight bash >}}
cd ../releases/tests/maven
# Edit <url> in pom.xml before to continue.
mvn compile
svn commit -m "Test project for SIS $NEW_VERSION-RC$RELEASE_CANDIDATE"
{{< / highlight >}}

Create a temporary directory where Apache {{% SIS %}} will write the EPSG dataset.
Force the Java version to the one supported by Apache SIS (adjust `JDK8_HOME` as needed).
Specify the URL to the nexus repository (will be needed in a future step. Replace `####` as needed).

{{< highlight bash >}}
mkdir target/SpatialMetadata
export SIS_DATA=`pwd`/target/SpatialMetadata
export JAVA_HOME=$JDK8_HOME
export JAVA_OPTS=-Dorg.apache.sis.epsg.downloadURL
export JAVA_OPTS=$JAVA_OPTS=https://repository.apache.org/content/repositories/orgapachesis-####
export JAVA_OPTS=$JAVA_OPTS/org/apache/sis/non-free/sis-epsg/$NEW_VERSION/sis-epsg-$NEW_VERSION.jar
{{< / highlight >}}

Clear the local Maven repository in order to force downloads from the Nexus repository, then test.
This will also verify the checksums.

{{< highlight bash >}}
rm -r ~/.m2/repository/org/apache/sis
mvn package --show-version --strict-checksums
{{< / highlight >}}

Verify that the EPSG dataset has been created, then cleanup:

{{< highlight bash >}}
du --summarize --human-readable $SIS_DATA/Databases/SpatialMetadata
mvn clean
{{< / highlight >}}

# Stage the source, binary and javadoc artifacts    {#stage}

Generate the Javadoc:

{{< highlight bash >}}
cd $SIS_RC_DIR
git checkout .            # Discard local changes, in particular the hack for excluding test files.
mvn clean install --activate-profiles apache-release
mvn javadoc:aggregate --activate-profiles javafx
cd target/site
zip -9 -r apache-sis-$NEW_VERSION-doc.zip apidocs
cd ../..
{{< / highlight >}}

## Initialize the distribution directory    {#dist}

Create the directory for the new version and release candidate within the distribution directory.
The `$RELEASE_CANDIDATE` variable shall be the number of current release attempt.

{{< highlight bash >}}
cd ../releases/distribution
svn update
mkdir -p $NEW_VERSION/RC$RELEASE_CANDIDATE
svn add $NEW_VERSION
cd $NEW_VERSION/RC$RELEASE_CANDIDATE
export DIST_DIR=`pwd`
{{< / highlight >}}

Copy the `HEADER.html` file from the previous release.
Update the file content if necessary.

{{< highlight bash >}}
svn copy https://dist.apache.org/repos/dist/release/sis/$OLD_VERSION/HEADER.html .
{{< / highlight >}}

Move the files generated by Maven to the distribution directory:

{{< highlight bash >}}
mv $SIS_RC_DIR/target/sis-$NEW_VERSION-* .
mv $SIS_RC_DIR/target/site/apache-sis-$NEW_VERSION-* .
mv $SIS_RC_DIR/application/sis-javafx/target/distribution/apache-sis-$NEW_VERSION.zip .
{{< / highlight >}}

Rename the files to something more conform to the convention seen in other Apache projects:

{{< highlight bash >}}
mv apache-sis-$NEW_VERSION.zip             apache-sis-$NEW_VERSION-bin.zip
mv sis-$NEW_VERSION-source-release.zip     apache-sis-$NEW_VERSION-src.zip
mv sis-$NEW_VERSION-source-release.zip.asc apache-sis-$NEW_VERSION-src.zip.asc
{{< / highlight >}}

## Sign, test and commit    {#sign}

Sign the source, javadoc and binary artifacts:

{{< highlight bash >}}
sha512sum apache-sis-$NEW_VERSION-src.zip > apache-sis-$NEW_VERSION-src.zip.sha512

gpg --armor --detach-sign --default-key $SIGNING_KEY apache-sis-$NEW_VERSION-doc.zip
sha512sum apache-sis-$NEW_VERSION-doc.zip > apache-sis-$NEW_VERSION-doc.zip.sha512

gpg --armor --detach-sign --default-key $SIGNING_KEY apache-sis-$NEW_VERSION-bin.zip
sha512sum apache-sis-$NEW_VERSION-bin.zip > apache-sis-$NEW_VERSION-bin.zip.sha512
{{< / highlight >}}

Verify checksums and signatures:

{{< highlight bash >}}
find . -name "*.sha512" -exec sha512sum --check '{}' \;
find . -name "*.asc"    -exec gpg      --verify '{}' \;
{{< / highlight >}}

## Update online Javadoc     {#apidocs}

Copy the Javadoc to the web site staging directory.
Updated Javadoc will be committed locally but not pushed yet.

{{< highlight bash >}}
cd ../../site/javadoc
rm -r *
git reset -- README.md
git checkout -- README.md
unzip $DIST_DIR/apache-sis-$NEW_VERSION-doc.zip
mv apidocs/* .
rmdir apidocs
git add -A
git commit --message "Update javadoc for SIS $NEW_VERSION."
firefox index.html
{{< / highlight >}}

Test the JavaFX and console applications (see [command-line interface page](./command-line.html)
for details about expected output of `sis` command):

{{< highlight bash >}}
cd
mkdir tmp; cd tmp
unzip $DIST_DIR/apache-sis-$NEW_VERSION-bin.zip
wget https://sis.apache.org/examples/coordinates/AmericanCities.csv
wget https://sis.apache.org/examples/coordinates/CanadianCities.csv
./apache-sis-$NEW_VERSION/bin/sis crs EPSG:6676
./apache-sis-$NEW_VERSION/bin/sis identifier https://sis.apache.org/examples/crs/MissingIdentifier.wkt
./apache-sis-$NEW_VERSION/bin/sis identifier https://sis.apache.org/examples/crs/WrongAxisOrder.wkt
./apache-sis-$NEW_VERSION/bin/sis identifier https://sis.apache.org/examples/crs/EquivalentDefinition.wkt
./apache-sis-$NEW_VERSION/bin/sis transform --sourceCRS EPSG:4267 --targetCRS EPSG:4326 AmericanCities.csv
./apache-sis-$NEW_VERSION/bin/sis transform --sourceCRS EPSG:4267 --targetCRS EPSG:4326 CanadianCities.csv
./apache-sis-$NEW_VERSION/bin/sisfx
cd ..
rm -r tmp
cd $DIST_DIR
{{< / highlight >}}

Commit:

{{< highlight bash >}}
svn add apache-sis-$NEW_VERSION-*
cd ../..
svn commit --message "SIS $NEW_VERSION release candidate $RELEASE_CANDIDATE"
{{< / highlight >}}

## Test the release    {#test}

Execute the following commands in any temporary directory for testing the sources:

{{< highlight bash >}}
wget https://dist.apache.org/repos/dist/dev/sis/$NEW_VERSION/RC$RELEASE_CANDIDATE/apache-sis-$NEW_VERSION-src.zip \
     https://dist.apache.org/repos/dist/dev/sis/$NEW_VERSION/RC$RELEASE_CANDIDATE/apache-sis-$NEW_VERSION-src.zip.asc
# Test
gpg --verify apache-sis-$NEW_VERSION-src.zip.asc
unzip apache-sis-$NEW_VERSION-src.zip
cd sis-$NEW_VERSION
mvn install
{{< / highlight >}}

Execute the following commands in any temporary directory for testing the binary:

{{< highlight bash >}}
wget https://dist.apache.org/repos/dist/dev/sis/$NEW_VERSION/RC$RELEASE_CANDIDATE/apache-sis-$NEW_VERSION-bin.zip \
     https://dist.apache.org/repos/dist/dev/sis/$NEW_VERSION/RC$RELEASE_CANDIDATE/apache-sis-$NEW_VERSION-bin.zip.asc
# Test
gpg --verify apache-sis-$NEW_VERSION-bin.zip.asc
unzip apache-sis-$NEW_VERSION-bin.zip
cd apache-sis-$NEW_VERSION
unset SIS_DATA
bin/sis about --verbose
bin/sis crs https://github.com/apache/sis/raw/master/core/sis-referencing/src/test/resources/org/apache/sis/referencing/crs/ProjectedCRS.xml --format WKT
{{< / highlight >}}

# Prepare OpenOffice add-in    {#openoffice}

The OpenOffice add-in source code can be distributed under Apache 2 license only.
But the binary may contain non-free resources, notably the EPSG geodetic dataset.
For now, the release manager should apply the following local modifications before
to build the add-in:

* Move to the `application/sis-openoffice` directory.
* Replace the `src/main/unopkg/license.txt` file by EPSG terms of use.
  A copy is found in the `non-free` group of SIS modules.
* Run `mvn package --activate-profiles non-free`.

# Prepare Web site    {#prepare-website}

Review and update the `static/DOAP.rdf` file on the `site` source code repository.
Add a new `<release>` block for the new release with the estimated release date.

Update the following files (e.g. the release date in `index.md`):

* `content/index.md`
* `content/command-line.md`
* `content/epsg.md` for EPSG dataset version
* `content/download.md` for SIS version and JAXB dependency
* `content/developer-guide/introduction/Installation.html`

Execute `hugo` and browse the documentation in the `public` repository.
If okay, commit and copy to staging repository:

{{< highlight bash >}}
git commit --message "Prepare documentation for the $NEW_VERSION release."

# Copy to staging repository
rm --recursive ../asf-staging/*
mv public/.htaccess public/* ../asf-staging/
rmdir public
cd ../asf-staging/
rm fr.html

# Remove trailing whitespaces
find . -name "*.html" -type f -exec sed -i 's/[[:space:]]*$//' '{}' \;
find . -name "*.xml" -type f -exec sed -i 's/[[:space:]]*$//' '{}' \;

# Commit
git add --all
git commit --message "Staging repository for the $NEW_VERSION release."
git push
```

{{< / highlight >}}

The new web site will be published in the [staging area](https://sis.staged.apache.org/).
It will not yet be published on `https://sis.apache.org`.

# Put the release candidate up for a vote    {#vote}

* Create a VOTE email thread on `dev@` to record votes as replies.
  A template is available [here](templates/release-vote.html).
* Create a DISCUSS email thread on `dev@` for any vote questions.
  A template is available [here](templates/release-discuss.html).
* Perform a review of the release and cast your vote:
* a -1 vote does not necessarily mean that the vote must be redone, however it is usually a good idea
  to rollback the release if a -1 vote is received. See _Recovering from a vetoed release_ below.
* After the vote has been open for at least 72 hours, has at least three +1 PMC votes and no -1 votes,
  then post the results to the vote thread:
  + Reply to the initial email and prepend to the original subject "[RESULT]"
  + Include a list of everyone who voted +1, 0 or -1.

## Recovering from a vetoed release    {#veto}

Reply to the initial vote email and prepend to the original subject:

{{< highlight text >}}
[CANCELED]
{{< / highlight >}}

Delete the svn tag created by the release:perform step:

{{< highlight bash >}}
svn delete https://svn.apache.org/repos/asf/sis/tags/$NEW_VERSION --message "deleting tag from rolled back release"
{{< / highlight >}}

Drop the Nexus staging repository:

* Go to [Nexus repository][repository] → _Build Promotion_ → _Staging repositories_ and search for `org.apache.sis` in the _Repository_ column.
* Right click on the closed staging repositories (`org.apache.sis-<id>`) and select _Drop_.

Make the required updates that caused the vote to be canceled during the release cycle.

# Finalize the release    {#finalize}

The artificats in the repository are not yet mirrored and available for Maven to download.
Promote the staged Nexus artifacts, by releasing them.

* Go to [Nexus repository][repository] → _Build Promotion_ → _Staging repositories_ and search for `org.apache.sis` in the _Repository_ column.
* Click the checkboxes of the closed staging repositories (`org.apache.sis-<id>`) and press _Release_ in the menu bar.

Check in the source and binary artifacts into distribution svn which will be pulled by all mirrors within 24 hours.
The `dist/dev` svn is not mirrored, but the `dist/release` is.
From any directory:

{{< highlight bash >}}
svn move https://dist.apache.org/repos/dist/dev/sis/$NEW_VERSION/RC$RELEASE_CANDIDATE \
         https://dist.apache.org/repos/dist/release/sis/$NEW_VERSION \
    --message "Committing SIS Source and Binary Release Candidate $RELEASE_CANDIDATE for SIS-$NEW_VERSION."

svn delete https://dist.apache.org/repos/dist/dev/sis/$NEW_VERSION \
    --message "Delete SIS $NEW_VERSION staging repository after release."
{{< / highlight >}}

Update [JIRA][JIRA]:

* Update the JIRA versions to mark the version as "released".
* Set the date to the date that the release was approved.
* Prepare for the next release:
  + Make a new release entry in JIRA for the next release.
  + Update the [Roadmap](https://cwiki.apache.org/confluence/display/SIS/Roadmap) wiki page.

## Verify release signatures    {#verify}

Download all source and binary artifacts into a new directory, then execute in that directory:

{{< highlight bash >}}
find . -name "*.asc" -exec gpg --verify '{}' \;
{{< / highlight >}}

The output shall report only good signatures.

## Announce the release    {#announce}

* WAIT 24 hours after committing releases for mirrors to replicate.
* Publish the web site updates:
  * On the `asf-site` branch, execute `git merge asf-staging` and push.
* Make an announcement about the release on the `dev@`, `users@`, and `announce@` mailing lists.
  A template is available [here](templates/release-announce.html).
  The email needs to be sent from an `@apache.org` email address.

Delete the prior version:

{{< highlight bash >}}
svn delete https://dist.apache.org/repos/dist/release/sis/$OLD_VERSION \
    --message "Archive SIS-$OLD_VERSION after release of SIS-$NEW_VERSION."
{{< / highlight >}}

# Update master for the next development cycle    {#next-release}

On the `master` branch:

* Update the version numbers in all `pom.xml` files.
* Edit the value of the `MAJOR_VERSION` or `MINOR_VERSION` constant in the
  `core/sis-utility/src/main/java/org/apache/sis/internal/system/Modules.java` file.

Then on the development branch:

* Edit the version number in the `application/sis-console/src/main/artifact/README` file.

## Delete old artifacts on Maven snapshot repository    {#nexus-clean}

Login in the [Nexus repository][repository]. In the _Repositories_ tag, select _Snapshots_ of type _hosted_
(not to be confused with _Snapshots_ of type _group_). Navigate to the `org/apache/sis` directory and delete
all directories starting with the old version number. The sub-directories need to be cleaned too.

[release-faq]:      http://www.apache.org/dev/release.html
[JIRA]:             http://issues.apache.org/jira/browse/SIS
[repository]:       https://repository.apache.org/index.html
