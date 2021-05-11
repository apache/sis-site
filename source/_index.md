---
title: The Apache SIS™ library
---

Apache Spatial Information System (SIS) is a free software, Java language library for developing geospatial applications.
SIS provides data structures for geographic features and associated metadata along with methods to manipulate those data structures.
The library is an implementation of [GeoAPI 3.0.1][geoapi] interfaces and can be used for desktop or server applications.

The SIS metadata module forms the base of the library and enables the creation of metadata objects which comply with the model of OGC/ISO international standards.
The SIS referencing module enable the construction of geodetic data structures for geospatial referencing such as axis, projection and coordinate reference system definitions,
along with the associated operations which enable the transformation of coordinates between different systems of reference.
The SIS storage modules provide a common approach to the reading and writing of metadata, features and coverages
applicable to simple imagery as to many dimensional data structures.

Some Apache SIS features are:

* Geographic metadata (ISO 19115-1:2014)
  * Read from or written to ISO 19115-3:2016 (current standard) or ISO 19139:2007 (older standard) compliant XML documents.
  * Read from netCDF, GeoTIFF, Landsat, GPX and Moving Feature CSV encoding.
  * Automatic conversions between the metadata model published in 2003 and the revision published in 2014.
* Referencing by coordinates (ISO 19111:2007)
  * Well Known Text (WKT) version 1 and 2 (ISO 19162:2015).
  * Geographic Markup Language (GML) version 3.2 (ISO 19136:2007).
  * [EPSG geodetic dataset](epsg.html) for geodetic definitions and for coordinate operations.
    See the list of [supported coordinate reference systems](tables/CoordinateReferenceSystems.html).
  * Mercator, Transverse Mercator, Lambert Conic Conformal, stereographic and more map projections.
    See the list of [supported operation methods](tables/CoordinateOperationMethods.html).
* Referencing by identifiers (ISO 19112:2003)
  * Geohashes (a simple encoding of geographic coordinates into short strings of letters and digits).
  * Military Grid Reference System (MGRS), also used for some civilian uses.
* Units of measurement
  * Implementation of [JSR-363](https://www.jcp.org/aboutJava/communityprocess/final/jsr363/index.html)
    with parsing, formating and unit conversion functionalities.

## Using Apache SIS    {#user}

The latest SIS release is 1.0, released September 2019.
Apache SIS requires Java 10 or higher for building, but can be executed on Java 8 or higher.
If using Java 8 Runtime Environment, nothing else is needed since Java 8 includes JAXB.
If using Java 9 or higher, one of the following configurations is needed
(those extra configurations are temporary until support for Java 8 will be dropped in a future SIS version):

* "`--add-modules java.xml.bind,java.xml.ws.annotation`" option (available with Java 9 or 10 only) added to the `java` command
* or JAXB dependency added from Glassfish or Jakarata projects. See [Maven coordinates](downloads.html#maven).

The EPSG geodetic dataset is optional for licensing reasons, but recommended.
EPSG database installation is [described in a separated page](epsg.html).

Apache SIS is a Java library for use by other applications.
Leveraging the full SIS capabilities or getting the best performance require that users write their own applications on top of SIS.
However a command-line tool is provided for allowing users to experiment some SIS functionalities before writing code.

* [Downloads](downloads.html) as a `zip` files or as Maven dependencies.
* [Developer guide](book/index.html) — note that this is work in progress.
* [Online Javadoc](apidocs/index.html) for API documentation.
* [Command-line interface](command-line.html) for an overview of the command-line tool.
* [Recommended code patterns](code-patterns.html) for writing more robust applications with Apache SIS.

## Developing Apache SIS    {#developer}

Following links are for those who wish to contribute to Apache SIS:

* [New contributor](contributor.html): background knowledge.
* [Source code](source.html): fetching the code, choosing a branch, opening in an IDE.
* [Coding conventions](coding-conventions.html): source code formatting.
* [Build](build.html): build from the source, create the distribution file.
* [Issue tracking][JIRA]: JIRA.
* [Release management](release-management.html) (for release managers)
* [Web site management](site-management.html) (for release managers and site maintainers)
* [SIS Wiki][wiki] for "drawing board" and roadmap.

[geoapi]: http://www.geoapi.org/
[wiki]:   http://cwiki.apache.org/confluence/display/SIS
[JIRA]:   http://issues.apache.org/jira/browse/SIS
