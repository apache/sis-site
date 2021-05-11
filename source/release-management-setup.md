---
title: Release management setup
---

The following instructions need to be done only once by new release managers,
or when configuring a new machine for performing the releases.
If those steps have already been done, jump directly to the [Release Management](release-management.html) page.

{{< toc >}}

# Directory layout    {#directory-layout}

The steps described in the _release management_ page assume the following directory layout.
Some directories are Git checkout, other are ordinary directories. Any other layout can be used.
However in the later case, all relative paths in the _release management_ page will need to be adjusted accordingly.

{{< highlight text >}}
<any root directory for SIS>
├─ master
├─ non-free
│  ├─ sis-epsg
│  └─ sis-embedded-data
├─ releases
│  ├─ distribution
│  └─ integration-test
│     └─ maven
└─ site
{{< / highlight >}}

Create the above directory structure as below:

{{< highlight bash >}}
mkdir releases
git clone    https://gitbox.apache.org/repos/asf/sis.git master
svn checkout https://svn.apache.org/repos/asf/sis/data/non-free
svn checkout https://svn.apache.org/repos/asf/sis/site/trunk site
svn checkout https://svn.apache.org/repos/asf/sis/release-test releases/integration-test
svn checkout https://dist.apache.org/repos/dist/dev/sis releases/distribution
{{< / highlight >}}

# Generate GPG key    {#generate-key}

The releases have to be signed by public key cryptography signatures.
Detailed instructions about why releases have to be signed are provided on the [Release Signing][signing] page.
The standard used is OpenPGP (_Open Pretty Good Privacy_), and a popular software implementation of that standard is GPG (_GNU Privacy Guard_).
The [OpenPGP instructions][PGP] list out detailed steps on managing your keys.
The following steps provide a summary:

Edit the `~/.gnupg/gpg.conf` configuration file and add the following configuration options,
or edit the existing values if any:

{{< highlight text >}}
personal-digest-preferences SHA512
cert-digest-algo SHA512
default-preference-list SHA512 SHA384 SHA256 SHA224 AES256 AES192 AES CAST5 ZLIB BZIP2 ZIP Uncompressed
{{< / highlight >}}

If a private key already exists for emails or other purposes, it may be a good idea to keep that key as the default one.
Add or modify the following line in the `gpg.conf` file, replacing `<previous_key_id>` by the existing key identifier
(a value like `621CC013`):

{{< highlight text >}}
default-key <previous_key_id>
{{< / highlight >}}

Generate 4096 bits RSA key pair using the following command-line. GPG will prompts for various informations.
The list below the command suggests some values, keeping in mind that the new key should be used only for
signing Apache software packages - not for daily emails.

{{< highlight bash >}}
gpg --gen-key
{{< / highlight >}}

* Kind of key: RSA and RSA (default). Do not create DSA key.
* Key size: 4096 bits.
* Validity time: 0 (key does not expire).
* Real name: the developer's name.
* Email address: developer's email address at `@apache.org`.
* Comment: "CODE SIGNING KEY".
* Passphrase: please choose a strong one.

Verify the key information (replace _Real Name_ by the above-cited developer's name, keeping quotes in the command below).
Note the key identifier, which is a value like `74383E9D`. This key identifier will be needed for the next steps.

{{< highlight bash >}}
gpg --list-sigs "Real Name"
{{< / highlight >}}

Sends the public key to a keys server (replace `<key_id>` by the above-cited key identifier).
The default GPG configuration sends the key to `hkp://keys.gnupg.net`.
Note that while there is many key servers, most of them synchronize changes with each other,
so a key uploaded to one should be disseminated to the rest.

{{< highlight bash >}}
gpg --send-key <key_id>
{{< / highlight >}}

The key publication can be verified by going on the [MIT server][MIT],
then entering the developer's "Real Name" in the _Search String_ field.
It may take a few hours before the published key is propagated.

Generate a revocation certificate. This is not for immediate use, but generating the certificate now
is a safety in case the passphrase is lost. Keep the revocation certificate in a safe place,
preferably on a removable device.

{{< highlight bash >}}
gpg --output revocation_certificate.asc --gen-revoke <key_id>
{{< / highlight >}}

## Web of trust    {#trust}

Have the key signed by at least three Apache commiters. This can be done by executing the following commands on
the machine of the other Apache commiter, where `<key_to_use>` is the identifier of the other commiter's key.
Those operation should preferably be done in some event where the commiters can meet face-to-face.
The other commiter should verify that the `gpg --fingerprint` command output matches the fingerprint of the key to sign.

{{< highlight bash >}}
gpg --recv-keys <key_id>
gpg --fingerprint <key_id>
gpg --default-key <key_to_use> --sign-key <key_id>
gpg --send-key <key_id>
{{< / highlight >}}

The above-cited _Release Signing_ page provides more instructions.
Then, the signed public key shall be appended to the `KEYS` file on the [SIS source code repository][source],
then copied to the [SIS distribution directory][dist].

# Maven Configuration & Nexus Setup    {#maven}

Detailed instructions are at [Publishing Maven Artifacts][maven].
In summary, the developer needs to specify his Apache username and password (**not** the PGP passphrase)
in his local `~/.m2` directory, and the GPG key identifier.
First, if not already done, create a Maven master password:

{{< highlight bash >}}
mvn --encrypt-master-password <password>
{{< / highlight >}}

The command will produce an encrypted version of the given password, something like `{jSMOWnoPFgsHVpMvz5VrIt5kRbzGpI8u+9EF1iFQyJQ=}`.
Store this password in the `~/.m2/settings-security.xml` file like below:

{{< highlight xml >}}
<?xml version="1.0" encoding="UTF-8"?>
<settingsSecurity>
  <master>{jSMOWnoPFgsHVpMvz5VrIt5kRbzGpI8u+9EF1iFQyJQ=}</master>
</settingsSecurity>
{{< / highlight >}}

Then encrypt the Apache account password (**not** the PGP passphrase) like below:

{{< highlight bash >}}
mvn --encrypt-password <passphrase>
{{< / highlight >}}

The command will produce an encrypted version of the password, something like `{COQLCE6DU6GtcS5P=}`.
Cut-and-paste it in a section of the `~/.m2/settings.xml` file like below,
together with the PGP key name:

{{< highlight xml >}}
<?xml version="1.0" encoding="UTF-8"?>
<settings>
...
  <servers>
    <server>
      <id>apache.releases.https</id>
      <username> <!-- your Apache username --> </username>
      <password>{COQLCE6DU6GtcS5P=}</password>
    </server>
   ...
  </servers>
  <profiles>
    <profile>
      <id>apache-release</id>
      <properties>
        <user.name> <!-- your Apache username --> </user.name>
        <gpg.keyname> <!-- the identifier of the GPG key generated in above steps --> </gpg.keyname>
      </properties>
    </profile>
  </profiles>
</settings>
{{< / highlight >}}

Notes:

* Do not store the PGP passphrase in the `settings.xml` file.
  We will use the `gpg-agent` instead, as described in the [release management](release-management.html) page.
* In the `<profile>` section:
  + The `<user.name>` property can be omitted if the Apache user name matches the user name on the local operating system.
  + The `<gpg.keyname>` property can be omitted if GPG contains only one private key.
  + The whole `<profile>` section can be omitted if the two above-cited properties are omitted.

[PGP]:     http://www.apache.org/dev/openpgp.html
[signing]: http://www.apache.org/dev/release-signing.html
[maven]:   http://www.apache.org/dev/publishing-maven-artifacts.html
[source]:  https://gitbox.apache.org/repos/asf?p=sis.git
[dist]:    http://dist.apache.org/repos/dist/release/sis/
[MIT]:     http://pgp.mit.edu
