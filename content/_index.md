---
title: The Apache SIS™ library
---

Apache Spatial Information System (SIS) is a free software, Java language library for developing geospatial applications.
SIS provides data structures for geographic features and associated metadata along with methods to manipulate those data structures.
The library is an implementation of [GeoAPI 3.0.2][geoapi] interfaces and can be used for desktop or server applications.

The SIS metadata module enables the creation of metadata objects
which comply with the model of {{% OGC %}}/{{% ISO %}} international standards.
The SIS referencing module enables the construction of data structures for coordinate reference system definitions,
along with the associated operations which enable the transformation of coordinates between different systems of reference.
The SIS storage modules provide a common approach to the reading and writing of metadata, features and coverages
applicable to simple imagery as to many dimensional data structures.
SIS provides processing functions such as multi-threaded rasters reprojection and isolines computation from raster data.
The API and the data encodings follow [international standards](standards.html) when available.

<details>
  <summary>
    More information on international standards and features supported by Apache {{% SIS %}}:
  </summary>

* Raster formats:
  * Read [NetCDF-3 Classic and 64-bit Offset Format][netCDF].
  * Read [GeoTIFF][geoTIFF] or Cloud Optimized GeoTIFF (COG), including BigTIFF extension.
  * Read Landsat (groups of GeoTIFF files).
  * Read ESRI BIL/BIP/BSQ and read/write ERSI ASCII Grid.
  * Read/write World Files with any image format supported by Image I/O.
* Feature formats:
  * Read [Moving Feature Comma Separated Values (CSV) encoding][MF_CSV].
  * Read [Moving Feature netCDF encoding][netCDF_MF].
  * Read/Write {{% GPX %}} (a {{% XML %}} schema for {{% GPS %}} data).
  * Read [features from {{% SQL %}} spatial databases][SF_SQL] by analysing the database schema.
* Geographic metadata (ISO 19115):
  * Read ISO 19115 metadata from all above-listed raster and feature formats.
  * Read and write XML documents compliant with ISO 19115-3 (current standard) or ISO 19139 (older standard).
  * Automatic conversions between the old metadata model published in 2003 and the revision published in 2014.
* Units of measurement:
  * Implementation of [JSR-363][JSR_363]
    with parsing, formating and unit conversion functionalities.
  * The same implementation is available as a [small standalone separated project][seshat].
* Referencing by coordinates (ISO 19111):
  * Read and write Well Known Text (WKT) version 1 and 2 (ISO 19162).
  * Read and write [Geographic Markup Language][GML] (GML) version 3.2 (ISO 19136).
  * Use [EPSG geodetic dataset](epsg.html) for geodetic definitions and for coordinate operations.
    * More than 6000 [supported coordinate reference systems](tables/CoordinateReferenceSystems.html).
    * Mercator, Transverse Mercator, Lambert Conic Conformal, stereographic
      and more [supported operation methods](tables/CoordinateOperationMethods.html).
* Referencing by identifiers (ISO 19112):
  * Geohashes (a simple encoding of geographic coordinates into short strings of letters and digits).
  * Military Grid Reference System (MGRS), also used for some civilian uses.
* Processing:
  * Multi-threaded raster reprojection.
  * Multi-threaded isolines computation from raster data.
  * [Filtering of features][filter] (ISO 19143 conceptual model).
</details>



## Using Apache SIS    {#user}

The latest SIS release is {{% version %}}, released in October 2023,
and can be [downloaded](downloads.html) as a `zip` files or as Maven dependencies.
The EPSG geodetic dataset is optional for licensing reasons, but recommended.
EPSG database installation is [described in a separated page](epsg.html).
This Apache SIS version requires Java 11 or later and uses the Java Platform Module System (JPMS).
Consequently applications should declare SIS JAR files on their module-path rather than their class-path,
but a compatibility mechanism makes possible to nevertheless use SIS on the class-path.
Note that this class-path compatibility may be removed in future versions.

Apache {{% SIS %}} is a Java library for use by other applications.
Leveraging the full SIS capabilities or getting the best performance require that users write their own applications on top of SIS.
The [developer guide](book/en/developer-guide.html), [online Javadoc](apidocs/index.html) and [recommended code patterns](code-patterns.html) page
provide instructions about developing with SIS.
However a [command-line tool](command-line.html) and a [JavaFX application](javafx.html)
are also provided for allowing users to experiment some SIS functionalities before writing code.


[geoapi]:    http://www.geoapi.org/
[GML]:       https://www.ogc.org/standards/gml
[SF_SQL]:    https://www.ogc.org/standards/sfs
[filter]:    https://www.ogc.org/standards/filter
[geoTIFF]:   https://www.ogc.org/standards/geotiff
[netCDF]:    https://www.ogc.org/standards/netcdf
[netCDF_MF]: http://docs.opengeospatial.org/bp/16-114r3/16-114r3.html
[MF_CSV]:    http://docs.opengeospatial.org/is/14-084r2/14-084r2.html
[JSR_363]:   https://jcp.org/en/jsr/detail?id=363
[seshat]:    https://unitsofmeasurement.github.io/seshat/
