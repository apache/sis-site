---
title: The Apache SIS™ library
---

Apache Spatial Information System (SIS) is a free software, Java language library for developing geospatial applications.
SIS provides data structures for geographic features and associated metadata along with methods to manipulate those data structures.
The library is an implementation of [GeoAPI 3.0.1][geoapi] interfaces and can be used for desktop or server applications.

The SIS metadata module forms the base of the library and enables the creation of metadata objects
which comply with the model of {{% OGC %}}/{{% ISO %}} international standards.
The SIS referencing module enable the construction of geodetic data structures for geospatial referencing
such as axis, projection and coordinate reference system definitions,
along with the associated operations which enable the transformation of coordinates between different systems of reference.
The SIS storage modules provide a common approach to the reading and writing of metadata, features and coverages
applicable to simple imagery as to many dimensional data structures.
SIS provides processing functions such as multi-threaded rasters reprojection and isolines computation from raster data.

<details open>
  <summary>
    Some international standards and other features supported by Apache {{% SIS %}} are:
  </summary>

* Raster formats:
  * Read NetCDF-3 Classic and 64-bit Offset Format ([OGC 10-092][netCDF]).
  * Read GeoTIFF ([OGC 19-008][geoTIFF]) including BigTIFF extension.
  * Read Landsat (groups of GeoTIFF files).
* Feature formats:
  * Read Moving Feature Comma Separated Values (CSV) encoding ([OGC 14-084][MF_CSV]).
  * Read Moving Feature netCDF encoding ([OGC 16-114][netCDF_MF]).
  * Read GPX (a {{% XML %}} schema for {{% GPS %}} data).
  * Read features from {{% SQL %}} spatial databases by analysing the database schema.
* Geographic metadata (ISO 19115-1:2014):
  * Read ISO 19115 metadata from all above-listed raster and feature formats.
  * Read and write XML documents compliant with ISO 19115-3:2016 (current standard) or ISO 19139:2007 (older standard).
  * Automatic conversions between the metadata model published in 2003 and the revision published in 2014.
* Units of measurement:
  * Implementation of [JSR-363][JSR_363]
    with parsing, formating and unit conversion functionalities.
  * The same implementation is available as a [small standalone separated project][seshat].
* Referencing by coordinates (ISO 19111:2007):
  * Read and write Well Known Text (WKT) version 1 and 2 (ISO 19162:2015).
  * Read and write Geographic Markup Language (GML) version 3.2 (ISO 19136:2007).
  * Use [EPSG geodetic dataset](epsg.html) for geodetic definitions and for coordinate operations.
    * More than 6000 [supported coordinate reference systems](tables/CoordinateReferenceSystems.html).
    * Mercator, Transverse Mercator, Lambert Conic Conformal, stereographic
      and more [supported operation methods](tables/CoordinateOperationMethods.html).
* Referencing by identifiers (ISO 19112:2003):
  * Geohashes (a simple encoding of geographic coordinates into short strings of letters and digits).
  * Military Grid Reference System (MGRS), also used for some civilian uses.
* Processing:
  * Multi-threaded raster reprojection.
  * Multi-threaded isolines computation from raster data.
  * Filtering of features (ISO 19143:2010 conceptual model).
</details>



## Using Apache SIS    {#user}

The latest SIS release is {{% version %}}, released November 2021,
and can be [downloaded](downloads.html) as a `zip` files or as Maven dependencies.
Apache {{% SIS %}} requires Java 17 or higher for [building](build.html), but can be executed on Java 8 or higher.
The EPSG geodetic dataset is optional for licensing reasons, but recommended.
EPSG database installation is [described in a separated page](epsg.html).

Apache {{% SIS %}} is a Java library for use by other applications.
Leveraging the full SIS capabilities or getting the best performance require that users write their own applications on top of SIS.
The [developer guide](book/index.html), [online Javadoc](apidocs/index.html) and [recommended code patterns](code-patterns.html) page
provide instructions about developing with SIS.
However a [command-line tool](command-line.html) is also provided for allowing users to experiment some SIS functionalities before writing code.


[geoapi]:    http://www.geoapi.org/
[netCDF]:    https://portal.ogc.org/files/?artifact_id=43734
[netCDF_MF]: http://docs.opengeospatial.org/bp/16-114r3/16-114r3.html
[geoTIFF]:   http://docs.opengeospatial.org/is/19-008r4/19-008r4.html
[MF_CSV]:    http://docs.opengeospatial.org/is/14-084r2/14-084r2.html
[JSR_363]:   https://www.jcp.org/aboutJava/communityprocess/final/jsr363/index.html
[seshat]:    https://unitsofmeasurement.github.io/seshat/
