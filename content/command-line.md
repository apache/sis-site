---
title: Command-line interface
---

A command-line interface is provided for extracting information from data files or authority codes,
and for performing coordinate operations.
That command-line tool is provided for allowing users to experiment some Apache {{% SIS %}} functionalities
without writing Java code.
For each example, key Java APIs are listed for allowing users to reproduce the functionality
in their own application.

{{< toc >}}

# Installation    {#install}

Select "Apache {{% SIS %}} {{% version %}} binary" from the [downloads page](downloads.html) an unzip in any directory.
The directory structure will be as below:

{{< highlight text >}}
apache-sis-{{% version %}}
├─ bin
├─ conf
├─ data
├─ lib
└─ log
{{< / highlight >}}

The `bin` sub-directory contains a `sis` command for Unix systems (Linux or MacOS — we have not yet done a `sis.bat` file for Windows).
The `bin` sub-directory can be added to the `PATH` environment variable for convenience, but this is not mandatory.
Example:

{{< highlight bash >}}
export PATH=$PWD/apache-sis-{{% version %}}/bin:$PATH
{{< / highlight >}}

The remaining of this page assumes that the `bin` directory is on the search path.
If not, the same examples can still be executed by replacing the `sis` command by `./apache-sis-{{% version %}}/bin/sis`.

## Optional dependencies    {#dependencies}

Every JAR files present in the `lib` sub-directory will be included on the classpath during `sis` command execution.
By default, the `lib` directory contains the `sis-*.jar` files together with GeoAPI, JAXB and Apache Derby dependencies.
However users can add other JAR files in that directory for the following optional dependencies:

* **UCAR netCDF library —**
  by default, SIS uses its own embedded netCDF reader which supports only the classical netCDF format, as standardized by OGC.
  If there is a need to read files encoded in GRID or HDF formats, then copy the UCAR netCDF library in the `lib` sub-directory.
  If presents, the UCAR library should be detected and used automatically when SIS cannot read a netCDF file by itself.

# Usage    {#usage}

Invoking `sis` without argument shows a summary of available commands and all options.
For executing a command, the syntax is:

{{< highlight bash >}}
sis <command> [options] [files]
{{< / highlight >}}

Available commands are:

<table>
  <tr><td><code>help</code></td>       <td>Show a help overview.</td></tr>
  <tr><td><code>about</code></td>      <td>Show information about Apache {{% SIS %}} and system configuration.</td></tr>
  <tr><td><code>mime-type</code></td>  <td>Show MIME type for the given file.</td></tr>
  <tr><td><code>metadata</code></td>   <td>Show metadata information for the given file.</td></tr>
  <tr><td><code>crs</code></td>        <td>Show Coordinate Reference System (CRS) information for the given file or code.</td></tr>
  <tr><td><code>identifier</code></td> <td>Show identifiers for metadata and referencing systems in the given file.</td></tr>
  <tr><td><code>transform</code></td>  <td>Convert or transform coordinates from given source {{% CRS %}} to target {{% CRS %}}.</td></tr>
</table>

The set of legal options and the expected number of file arguments depend on the command being executed.
However all commands support the `--help` option, which lists the options available for that command.
Available options will be from the following list:

<table>
  <tr><td><code>--sourceCRS</code></td> <td>The Coordinate Reference System of input data.</td></tr>
  <tr><td><code>--targetCRS</code></td> <td>The Coordinate Reference System of output data.</td></tr>
  <tr><td><code>--format</code></td>    <td>The output format: <code>xml</code>, <code>wkt</code>, <code>wkt1</code> or <code>text</code>.</td></tr>
  <tr><td><code>--locale</code></td>    <td>The locale to use for the command output.</td></tr>
  <tr><td><code>--timezone</code></td>  <td>The timezone for the dates to be formatted.</td></tr>
  <tr><td><code>--encoding</code></td>  <td>The encoding to use for the command output.</td></tr>
  <tr><td><code>--colors</code></td>    <td>Whether colorized output shall be enabled.</td></tr>
  <tr><td><code>--brief</code></td>     <td>Whether the output should contains only brief information.</td></tr>
  <tr><td><code>--verbose</code></td>   <td>Whether the output should contains more detailed information.</td></tr>
  <tr><td><code>--debug</code></td>     <td>Prints full stack trace in case of failure.</td></tr>
  <tr><td><code>--help</code></td>      <td>Lists the options available for a specific command.</td></tr>
</table>

The `--locale`, `--timezone` and `--encoding` options apply to the command output sent to the standard output stream,
but usually do not apply to the error messages sent to the standard error stream.
The reason is that command output may be targeted to a client, while the error messages are usually for the operator.

# Examples    {#examples}

The following examples first show how to get a Coordinate Reference System (CRS) from different kinds of definitions.
{{% CRS %}} contain necessary information for locating points on Earth.
Those information include the geodetic datum, the map projection (if any), the axes and their units of measurement.
When two such {{% CRS %}} are known (the _source_ and the _target_), it is possible to convert or transform points between those {{% CRS %}}.
However the coordinate operation depends not only on the source and target {{% CRS %}}, but also on the _area of interest_ as shown
by the example transforming city coordinates in USA and in Canada.
Then another example show how to get a wider set of metadata, with the {{% CRS %}} as only one specific element of those metadata.

## Print Coordinate Reference Systems (CRS) definition    {#crs}

Apache {{% SIS %}} can read Coordinate Reference System (CRS) definitions from various sources:

* Codes from the EPSG geodetic dataset
* Texts in _Well Known Text_ (WKT) format version 1 and 2
* {{% XML %}} files conform to _Geographic Markup Language_ (GML) schema version 3.2

The easiest way to see a {{% CRS %}} definition is to use an EPSG code.
The [EPSG geodetic dataset](epsg.html) is a widely-used source of definitions for thousands of Coordinate Reference Systems.
Appache SIS provides a [list of supported codes](tables/CoordinateReferenceSystems.html), which can be queried from the command line.
For example the following command prints the definition of the _"JGD2011 / Japan Plane Rectangular CS VIII"_ Coordinate Reference System:

{{< highlight bash >}}
sis crs EPSG:6676
{{< / highlight >}}

<details>
  <summary>Expected output (click to expand):</summary>
<pre>ProjectedCRS["JGD2011 / Japan Plane Rectangular CS VIII",
  BaseGeodCRS["JGD2011",
    Datum["Japanese Geodetic Datum 2011",
      Ellipsoid["GRS 1980", 6378137.0, 298.257222101]],
    Unit["degree", 0.017453292519943295]],
  Conversion["Japan Plane Rectangular CS zone VIII",
    Method["Transverse Mercator"],
    Parameter["Latitude of natural origin", 36.0],
    Parameter["Longitude of natural origin", 138.5],
    Parameter["Scale factor at natural origin", 0.9999],
    Parameter["False easting", 0.0],
    Parameter["False northing", 0.0]],
  CS[Cartesian, 2],
    Axis["Northing (X)", north],
    Axis["Easting (Y)", east],
    Unit["metre", 1],
  Scope["Large and medium scale topographic mapping, cadastral and engineering survey."],
  Area["Japan - onshore - Honshu between approximately 137°45'E and 139°E - Niigata-ken; Nagano-ken; Yamanashi-ken; Shizuoka-ken."],
  BBox[34.54, 137.32, 38.58, 139.91],
  Id["EPSG", 6676, "9.9.1", URI["urn:ogc:def:crs:EPSG:9.9.1:6676"]],
  Remark["Replaces JGD2000 / Japan Plane Rectangular CS VIII (CRS code 2450) with effect from 21st October 2011."]]</pre>
</details>
<br/>

The first time that a command requires the EPSG dataset, Apache {{% SIS %}} will propose to download and install a local copy.
This automatic download happens only when using the command-line tools described in this page or the [JavaFX](javafx.html) application.
Developers who wish to use the EPSG dataset in their applications can use the Maven artifact
documented in [download](downloads.html#epsg) page.

The above output is compatible with version 2 of _Well Known Text_ (WKT) format.
The output format can be controlled as below:

* Some applications are restricted to {{% WKT %}} version 1.
  For an output using the legacy {{% WKT %}} 1 format, add the `--format wkt1` option to above command-line.

* The “{{% WKT %}} 2” specification allows some flexibility in keyword names and in the way to specify units of measurement.
  By default, the command-line uses this flexibility for producing less verbose but still legal {{% WKT %}} 2 output.
  If an output closer to {{% WKT %}} 2 recommendations is desired, add the `--format wkt2` option to above command.
  The result will be slightly more verbose.

* Apache {{% SIS %}} can also read and write {{% CRS %}} definitions in the _Geographic Markup Language_ (GML) format.
  For {{% GML %}} output, add the `--format xml` option to the above command.
  The result will be much more verbose than {{% WKT %}} outputs.

Java API for accessing functionalities shown in above examples are:

* Convenience static methods in `org.apache.sis.referencing` package:
  + `CRS.forCode(String)`
  + `CRS.fromWKT(String)`
  + `CRS.fromXML(String)`
* Classes in other packages (less convenient but give more control):
  + `org.apache.sis.io.wkt.WKTFormat` — control {{% WKT %}} version, syntax highlighting, _etc._
  + `org.apache.sis.xml.MarshallerPool` — control {{% GML %}} version, link resolutions,  _etc._

## Getting a verified EPSG identifier from a Coordinate Reference System    {#identifier}

Because the EPSG geodetic dataset is so commonly used,
a very common practice is to specify a {{% CRS %}} using only its EPSG code instead of its full definition.
Such codes can be written in different ways. For example all the following strings are for the same code:

* `"EPSG:4326"`
* `"urn:ogc:def:crs:EPSG::4326"`
* `"http://www​.opengis​.net/def/crs/epsg/0/4326"` (not yet supported on the command-line)
* `"http://www​.opengis​.net/gml/srs/epsg​.xml#4326"` (not yet supported on the command-line)

In a _Well Known Text_ (WKT) string, the code can appear at the bottom of the definition
in an optional element like `ID["EPSG", 4326]` or `AUTHORITY["EPSG", "4326"]`.
However in many cases the code is missing.
Sometimes Apache {{% SIS %}} can find a missing code by comparing a given {{% CRS %}} against the definitions in the EPSG database.
The following example reads a {{% WKT %}} for the _“NTF (Paris) / Lambert zone II”_ Coordinate Reference System,
but in which the `ID["EPSG", 27572]` element has been intentionally omitted.
Furthermore, the _“NTF (Paris) / Lambert zone II”_ name has been replaced by _“NTF (Paris) / zone to be discovered by the demo”_ name.
Executing the following command:

{{< highlight bash >}}
sis identifier https://sis.apache.org/examples/crs/MissingIdentifier.wkt
{{< / highlight >}}

produces an output like below:

{{< highlight text >}}
urn:ogc:def:crs:EPSG:9.9.1:27572  | NTF (Paris) / Lambert zone II
{{< / highlight >}}

As we can see, Apache {{% SIS %}} has been able to find back the identifier code and the actual {{% CRS %}} name.

Sometimes a {{% WKT %}} declares wrongly an EPSG code.
The most frequent case is a {{% WKT %}} that defines a Coordinate Reference System with (_longitude_, _latitude_) axes,
but declare an EPSG code for a {{% CRS %}} with (_latitude_, _longitude_) axes.
Apache {{% SIS %}} can detect such mismatches.
For example executing the following command:

{{< highlight bash >}}
sis identifier https://sis.apache.org/examples/crs/WrongAxisOrder.wkt
{{< / highlight >}}

produces an output like below:

{{< highlight text >}}
!   urn:ogc:def:crs:EPSG:8.9:4979    | WGS 84

Legend:
!   Identified object matches definition provided by authority except for coordinate system axes.
{{< / highlight >}}

Apache {{% SIS %}} can perform such analysis because it “understands” the {{% CRS %}} definition.
This analysis capability can be tested by altering the {{% CRS %}} definition.
The next example asks the identifier of a {{% CRS %}} which is normally defined as below:

{{< highlight text >}}
ProjectedCRS["WGS 84 / Mercator 41",
  (... definition omitted for brevity ...)
    Method["Mercator (variant B)"],
    Parameter["Latitude of 1st standard parallel", -41.0],
  (... definition omitted for brevity ...)
{{< / highlight >}}

However in this example, we will provide a {{% CRS %}} defined as below:

{{< highlight text >}}
ProjectedCRS["Scaled Mercator",
  (... definition omitted for brevity ...)
    Method["Mercator (variant A)"],
    Parameter["Scale factor at natural origin", 0.7557992272019596"],
    Parameter["Latitude of natural origin", -0.0],
  (... definition omitted for brevity ...)
{{< / highlight >}}

Executing the following command:

{{< highlight bash >}}
sis identifier https://sis.apache.org/examples/crs/EquivalentDefinition.wkt
{{< / highlight >}}

produces an output like below:

{{< highlight text >}}
urn:ogc:def:crs:EPSG:9.9.1:3994  | WGS 84 / Mercator 41
{{< / highlight >}}

In above example, Apache {{% SIS %}} used the fact that a
_“Mercator (variant A)”_ projection with a _“Scale factor at natural origin”_ parameter value of 0.755799… on the WGS84 datum is numerically equivalent to a
_“Mercator (variant B)”_ projection with a _“Latitude of 1st standard parallel”_ parameter value of 41° on the same datum.
This recognition allowed SIS to return the EPSG:3994 code
even if it stands for a {{% CRS %}} defined as a _“Mercator (variant B)”_ projection rather than variant A.

Java API for accessing functionalities shown in above example are:

* Convenience static method in `org.apache.sis.referencing` package:
  + `IdentifiedObjects.lookupURN(IdentifiedObject, Citation)`
* Class in other package (less convenient but give more control):
  + `org.apache.sis.referencing.factory.IdentifiedObjectFinder`

## Performing coordinate conversions or transformations    {#coordinateOperation}

Coordinates represented in a given {{% CRS %}} can be transformed into coordinates represented in another {{% CRS %}}.
The coordinate transformations depend mostly on the _source_ and _target_ {{% CRS %}}, but the _area of interest_
can also have an influence; while optional, that area should be specified when it is known.

The following example transform coordinates from the North American Datum 1927 (EPSG:4267) to WGS84 (EPSG:4326).
The example is run twice: once for cities in USA, then once for cities in Canada:
(Note: the application may log warnings to the console. Those warnings can be ignored)

{{< highlight bash >}}
wget https://sis.apache.org/examples/coordinates/AmericanCities.csv
wget https://sis.apache.org/examples/coordinates/CanadianCities.csv
sis transform --sourceCRS EPSG:4267 --targetCRS EPSG:4326 AmericanCities.csv
sis transform --sourceCRS EPSG:4267 --targetCRS EPSG:4326 CanadianCities.csv
{{< / highlight >}}

The first execution should print the following header, followed by transformed coordinate values.
Note the operation code (EPSG:1173), domain of validity (United State) and accuracy.

{{< highlight text >}}
# Source:      NAD27 (EPSG:4267)
# Destination: WGS 84 (EPSG:4326)
# Operations:  NAD27 to WGS 84 (4) (EPSG:1173)
# Domain:      United States (USA) - onshore
# Accuracy:    10.0 metres
{{< / highlight >}}

The second execution should print the following header, followed by transformed coordinate values.
Note that the operation code (EPSG:1172), domain of validity (Canada) and accuracy are not the same
than in previous example.

{{< highlight text >}}
# Source:      NAD27 (EPSG:4267)
# Destination: WGS 84 (EPSG:4326)
# Operations:  NAD27 to WGS 84 (3) (EPSG:1172)
# Domain:      Canada - onshore and offshore
# Accuracy:    20.0 metres
{{< / highlight >}}

The difference between those two operations become more visible by adding the `--verbose` option
to the above `sis transform` commands.
This option shows the coordinate operation in Well Known Text (WKT) or pseudo-WKT format.
When transforming coordinates in USA, the operation contains the following parameter values:

{{< highlight text >}}
Method["Geocentric translations (geog2D domain)"],
  Parameter["X-axis translation", -8.0, Unit["metre", 1]],
  Parameter["Y-axis translation", 160.0, Unit["metre", 1]],
  Parameter["Z-axis translation", 176.0, Unit["metre", 1]]
{{< / highlight >}}

But when transforming coordinates in Canada, the operation rather contains the following parameter values:

{{< highlight text >}}
Method["Geocentric translations (geog2D domain)"],
  Parameter["X-axis translation", -10.0, Unit["metre", 1]],
  Parameter["Y-axis translation", 158.0, Unit["metre", 1]],
  Parameter["Z-axis translation", 187.0, Unit["metre", 1]],
{{< / highlight >}}

As seen in the above examples, the parameter values differ slightly with the geographic area of the coordinates to transform.
Those parameters could also be different if _datum shift grids_ are available. For example in USA:

{{< highlight text >}}
    Method["NADCON"],
      Parameter["Latitude difference file", "conus.las"],
      Parameter["Longitude difference file", "conus.los"],\
{{< / highlight >}}

Java API for accessing functionalities shown in above examples are:

* Convenience static method in `org.apache.sis.referencing` package:
  + `CRS.findOperation(CoordinateReferenceSystem, CoordinateReferenceSystem, GeographicBoundingBox)`
* Class in other package (less convenient but give more control):
  + `org.apache.sis.referencing.operation.DefaultCoordinateOperationFactory`

## Extracting ISO 19115 Metadata    {#metadata}

Apache {{% SIS %}} can read the header of a data file and print the metadata in an {{% ISO %}} 19115 structure.
The data file given in argument can be a local file or a URL.
By default, the metadata are shown in a relatively compact tree-table format.
But the metadata can optionally be exported as an {{% ISO %}} 19139 compliant XML document.
The following example shows the metadata of a netCDF file accessible from the web:

{{< highlight bash >}}
    sis metadata https://github.com/opengeospatial/geoapi/raw/master/geoapi-conformance/src/main/resources/org/opengis/test/dataset/Cube4D_projected_float.nc
{{< / highlight >}}
<details>
  <summary>Fragment of expected output (click to expand):</summary>
<pre>Metadata
  ├─Identification info
  │   ├─Citation………………………………………………………………………………… Sea Surface Temperature Analysis Model
  │   │   ├─Date………………………………………………………………………………… Sep 22, 2005 2:00:00 AM
  │   │   │   └─Date type………………………………………………………… Creation
  │   │   └─Identifier………………………………………………………………… NCEP/SST/Global_5x2p5deg/SST_Global_5x2p5deg_20050922_0000.nc
  │   │       └─Authority………………………………………………………… edu.ucar.unidata
  │   ├─Abstract………………………………………………………………………………… NCEP SST Global 5.0 x 2.5 degree model data
  │   ├─Descriptive keywords
  │   │   ├─Keyword………………………………………………………………………… EARTH SCIENCE &gt; Oceans &gt; Ocean Temperature &gt; Sea Surface Temperature
  │   │   ├─Type………………………………………………………………………………… Theme
  │   │   └─Thesaurus name……………………………………………………… GCMD Science Keywords
  │   ├─Resource constraints
  │   │   └─Use limitation……………………………………………………… Freely available
  │   ├─Spatial representation type……………………………… Grid
  │   └─Extent
  │       ├─Geographic element
  │       │   ├─West bound longitude…………………………… 180°W
  │       │   ├─East bound longitude…………………………… 180°E
  │       │   ├─South bound latitude…………………………… 90°S
  │       │   ├─North bound latitude…………………………… 90°N
  │       │   └─Extent type code……………………………………… true
  │       └─Vertical element
  │           ├─Minimum value……………………………………………… 0
  │           └─Maximum value……………………………………………… 0
  └─Content info
      └─Dimension
          ├─Descriptor………………………………………………………………… Sea temperature
          └─Sequence identifier………………………………………… SST</pre>
</details>
<br/>

Adding the `--format xml` option to the above command will format the same metadata in a {{% XML %}} document.
The output is not shown in this page because of its verbosity.
**Note:** in current Apache {{% SIS %}} version, XML output requires manual installation of additional dependencies.
See [issue SIS-545](https://issues.apache.org/jira/browse/SIS-545) for more information.

Java API for accessing functionalities shown in above examples are:

* Convenience static methods in `org.apache.sis.xml` package:
  + `XML.marshal(…)`
  + `XML.unmarshal(…)`
* Class in other package (less convenient but give more control):
  + `org.apache.sis.xml.MarshallerPool`

# Performance consideration    {#performance}

If there is a large amount of files to process, invoking the above command many time may be inefficient
because it would restart a new JVM on every invocation.
If the operation requires the EPSG dataset, booting the Derby database also has a significant cost.
For such cases, it is more efficient to loop inside a small Java program using the [SIS API](apidocs/index.html).
