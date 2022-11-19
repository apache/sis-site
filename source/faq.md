---
title: Frequently asked questions
---

This page lists some Frequently Asked Questions (FAQ) when using Apache {{% SIS %}}.

{{< toc >}}

# Referencing    {#referencing}

## Getting started    {#referencing-intro}

### How do I transform a coordinate?    {#transform-point}

The following Java code projects a geographic coordinate from the _World Geodetic System 1984_ (WGS84) to _WGS 84 / UTM zone 33N_.
In order to make the example a little bit simpler, this code uses predefined constants given by the `CommonCRS` convenience class.
But more advanced applications will typically use EPSG codes instead.
Note that all geographic coordinates below express latitude *before* longitude.

  {{< highlight java >}}
import org.opengis.geometry.DirectPosition;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.CoordinateOperation;
import org.opengis.referencing.operation.TransformException;
import org.opengis.util.FactoryException;
import org.apache.sis.referencing.CRS;
import org.apache.sis.referencing.CommonCRS;
import org.apache.sis.geometry.DirectPosition2D;

public class MyApp {
    public static void main(String[] args) throws FactoryException, TransformException {
        CoordinateReferenceSystem sourceCRS = CommonCRS.WGS84.geographic();
        CoordinateReferenceSystem targetCRS = CommonCRS.WGS84.universal(40, 14);  // Get whatever zone is valid for 14°E.
        CoordinateOperation operation = CRS.findOperation(sourceCRS, targetCRS, null);
        /*
         * The above lines are costly and should be performed only once before to project many points.
         * In this example, the operation that we got is valid for coordinates in geographic area from
         * 12°E to 18°E (UTM zone 33) and 0°N to 84°N.
         */
        DirectPosition ptSrc = new DirectPosition2D(40, 14);           // 40°N 14°E
        DirectPosition ptDst = operation.getMathTransform().transform(ptSrc, null);

        System.out.println("Source: " + ptSrc);
        System.out.println("Target: " + ptDst);
    }
}
{{< / highlight >}}

### Which map projections are supported?    {#operation-methods}

The operation _methods_ (including, but not limited to, map projections) supported by
Apache {{% SIS %}} are listed in the [Coordinate Operation Methods](tables/CoordinateOperationMethods.html) page.
The amount of map projection methods is relatively small,
but the amount of _projected Coordinate Reference Systems_ that we can build from them can be very large.
For example with only three family of methods (_Cylindrical Mercator_, _Transverse Mercator_ and _Lambert Conic Conformal_)
used with different parameter values, we can cover thousands of projected {{% CRS %}} listed in the EPSG geodetic dataset.

In order to use a map projection method, we need to know the value to assign to the projection parameters.
For convenience, thousands of projected {{% CRS %}} with predefined parameter values are are assigned a unique identifier.
A well-known source of such definitions is the EPSG geodetic dataset, but other authorities also exist.
The predefined {{% CRS %}} known to Apache {{% SIS %}} are listed in the
[Coordinate Reference Systems](tables/CoordinateReferenceSystems.html) page.

### What is the axis order issue and how is it addressed?    {#axisOrder}

The axis order is specified by the authority (typically a national agency) defining the Coordinate Reference System (CRS).
The order depends on the {{% CRS %}} type and the country defining the {{% CRS %}}.
In the case of geographic {{% CRS %}}, the (_latitude_, _longitude_) axis order is widely used by geographers and pilots for centuries.
However software developers tend to consistently use the (_x_, _y_) order for every kind of {{% CRS %}}.
Those different practices resulted in contradictory definitions of axis order for almost every {{% CRS %}} of kind `GeographicCRS`,
for some `ProjectedCRS` in the South hemisphere (South Africa, Australia, _etc._) and for some polar projections among others.

For any {{% CRS %}} identified by an EPSG code, the official axis order can be checked on the
official EPSG registry at [https://epsg.org/](https://epsg.org/)
(not to be confused with other sites having "epsg" in their name,
but actually unrelated to the organization in charge of EPSG definitions):
click on the _"Retrieve by code"_ link and enter the numerical code.
Then click on the _"View"_ link on the right side,
and click on the _"+"_ symbol of the left side of _"Axes"_.

Recent {{% OGC %}} standards mandate the use of axis order as defined by the authority.
Oldest {{% OGC %}} standards used the (_x_, _y_) axis order instead, ignoring any authority specification.
Among the legacy {{% OGC %}} standards that used the non-conform axis order,
an influent one is version 1 of the _Well Known Text_ (WKT) format specification.
According that widely-used format, {{% WKT %}} definitions without explicit `AXIS[…]` elements
shall default to (_longitude_, _latitude_) or (_x_, _y_) axis order.
In version 2 of the {{% WKT %}} format, `AXIS[…]` elements are no longer optional
and should contain an explicit `ORDER[…]` sub-element for making the intended order yet more obvious.

Many software products still use the old (_x_, _y_) axis order, sometimes because it is easier to implement.
But Apache {{% SIS %}} rather defaults to axis order _as defined by the authority_ (except when parsing a {{% WKT %}} 1 definition),
but allows changing axis order to the (_x_, _y_) order after {{% CRS %}} creation.
This change can be done with the following code:

{{< highlight java >}}
CoordinateReferenceSystem crs = ...; // CRS obtained by any means.
crs = AbstractCRS.castOrCopy(crs).forConvention(AxesConvention.RIGHT_HANDED)
{{< / highlight >}}

## Coordinate Reference Systems    {#crs}

### How do I instantiate a Universal Transverse Mercator (UTM) projection?    {#UTM}

If the UTM zone is unknown, an easy way is to invoke the `universal(…)` method on one of the `CommonCRS` predefined constants.
That method receives in argument a geographic coordinate in (_latitude_, _longitude_) order and computes the UTM zone from it.
See the [above Java code example](#transform-point).

If the UTM zone is know, one way is to use the "EPSG" or "AUTO" authority factory.
The EPSG code of some UTM projections can be determined as below, where _zone_ is a number from 1 to 60 inclusive (unless otherwise specified):

* WGS 84 (northern hemisphere): 32600 + _zone_
* WGS 84 (southern hemisphere): 32700 + _zone_
* WGS 72 (northern hemisphere): 32200 + _zone_
* WGS 72 (southern hemisphere): 32300 + _zone_
* NAD 83 (northern hemisphere): 26900 + _zone_ (zone 1 to 23 only)
* NAD 27 (northern hemisphere): 26700 + _zone_ (zone 1 to 22 only)

Note that the above list is incomplete. See the EPSG database for additional UTM definitions
(WGS 72BE, SIRGAS 2000, SIRGAS 1995, SAD 69, ETRS 89, _etc._, most of them defined only for a few zones).
Once the EPSG code of the UTM projection has been determined, the {{% CRS %}} can be obtained as in the example below:

{{< highlight java >}}
int code = 32600 + zone;    // For WGS84 northern hemisphere
CoordinateReferenceSystem crs = CRS.forCode("EPSG:" + code);
{{< / highlight >}}

### How do I instantiate a Google projection?    {#google}

The Google projection is a Mercator projection that pretends to be defined on the WGS84 datum,
but actually ignores the ellipsoidal nature of that datum and uses the simpler spherical formulas instead.
Since version 6.15 of EPSG geodetic dataset, the preferred way to get that projection is to invoke `CRS.forCode("EPSG:3857")`.
Note that the use of that projection is **not** recommended, unless needed for compatibility with other data.

The EPSG:3857 definition uses a map projection method named _"Popular Visualisation Pseudo Mercator"_.
The EPSG geodetic dataset provides also some other map projections that use spherical formulas.
Those methods have "(Spherical)" in their name, for example _"Mercator (Spherical)"_
(which differs from _"Popular Visualisation Pseudo Mercator"_ by the use of a more appropriate sphere radius).
Those projection methods can be used in Well Known Text (WKT) definitions.

If there is a need to use spherical formulas with a projection that does not have a "(Spherical)" counterpart,
this can be done with explicit declarations of `"semi_major"` and `"semi_minor"` parameter values in the {{% WKT %}} definition.
Those parameter values are usually inferred from the datum, but Apache {{% SIS %}} allows explicit declarations to override the inferred values.

### How can I identify the projection kind of a CRS?    {#projectionKind}

The "kind of projection" (Mercator, Lambert Conformal, _etc._) is called _Operation Method_ in {{% ISO %}} 19111 terminology.
One approach is to check the value of `OperationMethod.getName()` and compare them against the {{% OGC %}} or EPSG names
listed in the [Coordinate Operation Methods](tables/CoordinateOperationMethods.html) page.

### How do I get the EPSG code of an existing CRS?    {#lookupEPSG}

The _identifier_ of a Coordinate Reference System (CRS) object can be obtained by the `getIdentifiers()` method,
which usually return a collection of zero or one element.
If the {{% CRS %}} has been created from a Well Known Text (WKT) parsing
and the {{% WKT %}} ends with an `AUTHORITY["EPSG", "xxxx"]` ({{% WKT %}} version 1)
or `ID["EPSG", xxxx]` ({{% WKT %}} version 2) element,
then the identifier (an EPSG numerical code in this example) is the _xxxx_ value in that element.
If the {{% CRS %}} has been created from the EPSG geodetic dataset (for example by a call to `CRS.forCode("EPSG:xxxx")`),
then the identifier is the _xxxx_ code given to that method.
If the {{% CRS %}} has been created in another way, then the collection returned by the `getIdentifiers()` method
may or may not be empty depending if the program that created the {{% CRS %}} took the responsibility of providing identifiers.

If the collection of identifiers is empty, the most effective fix is to make sure that the {{% WKT %}}
contains an `AUTHORITY` or `ID` element (assuming that the {{% CRS %}} was parsed from a {{% WKT %}}).
If this is not possible, then the `org.apache.sis.referencing.IdentifiedObjects` class contains some convenience methods which may help.
In the following example, the call to `lookupEPSG(…)` will scan the EPSG database for a {{% CRS %}} equals
(ignoring metadata) to the given one. *Note that this scan is sensitive to axis order.*
Most geographic {{% CRS %}} in the EPSG database are declared with (_latitude_, _longitude_) axis order.
Consequently if the given {{% CRS %}} has (_longitude_, _latitude_) axis order, then the scan is likely to find no match.

{{< highlight java >}}
CoordinateReferenceSystem myCRS = ...;
Integer identifier = IdentifiedObjects.lookupEPSG(myCRS);
if (identifier != null) {
    System.out.println("The EPSG code has been found: " + identifier);
}
{{< / highlight >}}

### How do I get the "urn:ogc:def:crs:…" URN of an existing CRS?    {#lookupURN}

{{% OGC %}} defines URN for {{% CRS %}} identifiers, for example `"urn:​ogc:​def:​crs:​epsg:​7.1:​4326"`
where `"7.1"` is the version of the EPSG database used.
URN may or may not be present in the set of identifiers returned by `crs.getIdentifiers()`.
In many cases (especially if the {{% CRS %}} was parsed from a Well Known Text), only simple identifiers like `"EPSG:​4326"` are provided.
An easy way to build the full URN is to use the code below.
That example may scan the EPSG database for finding the information if it was not explicitly provided in the given {{% CRS %}}.

{{< highlight java >}}
CoordinateReferenceSystem myCRS = ...;
String urn = IdentifiedObjects.lookupURN(myCRS);
{{< / highlight >}}

### Is IdentifiedObjects.lookupEPSG(…) a reliable inverse of CRS.forCode(…)?   {#lookupReliability}

For {{% CRS %}} created from the EPSG geodetic dataset, usually yes.
Note however that `IdentifiedObjects.getIdentifier(…)` is cheaper and insensitive to the details of {{% CRS %}} definition,
since it never query the database. But it works only if the {{% CRS %}} declares explicitly its code,
which is the case for {{% CRS %}} created from the EPSG database or parsed from a Well Known Text (WKT) having an `AUTHORITY` or `ID` element.
The `lookupEPSG(…)` method on the other hand is robust to erroneous code declaration,
since it always compares the {{% CRS %}} with the database content.
But it may fail if there is slight mismatch (for example rounding errors in projection parameters)
between the supplied {{% CRS %}} and the {{% CRS %}} found in the database.

### How can I determine if two CRS are "functionally" equal?    {#equalsIgnoreMetadata}

Two Coordinate Reference Systems may not be considered equal if they are associated to different metadata
(name, identifiers, scope, domain of validity, remarks), even though they represent the same logical {{% CRS %}}.
In order to test if two {{% CRS %}} are functionally equivalent, use `Utilities​.equals­Ignore­Metadata(myFirstCRS, mySecondCRS)`.

### Are CRS objects safe for use as keys in HashMap?    {#crsHashCode}

Yes, every classes defined in the `org.apache.sis.referencing.crs`, `cs` and `datum` packages
define properly their `equals(Object)` and `hashCode()` methods.
The Apache {{% SIS %}} library itself uses {{% CRS %}} objects in `HashMap`-like containers for caching purpose.

## Coordinate transformations    {#transforms}

### My transformed coordinates are totally wrong!    {#axisOrderInTransforms}

This is most frequently caused by coordinate values given in the wrong order.
Developers tend to assume a (_x_, _y_) or (_longitude_, _latitude_) axis order.
But geographers and pilots are using (_latitude_, _longitude_) axis order for centuries,
and the EPSG geodetic dataset defines geographic Coordinate Reference Systems that way.
If a coordinate transformation seems to produce totally wrong values,
the first thing to do should be to print the source and target Coordinate Reference Systems:

{{< highlight java >}}
System.out.println(sourceCRS);
System.out.println(targetCRS);
{{< / highlight >}}

Attention should be paid to the order of `AXIS` elements.
In the example below, the Coordinate Reference System clearly uses (_latitude_, _longitude_) axis order:

{{< highlight text >}}
GeodeticCRS["WGS 84",
  Datum["World Geodetic System 1984",
    Ellipsoid["WGS 84", 6378137.0, 298.257223563]],
  CS[ellipsoidal, 2],
    Axis["Geodetic latitude (Lat)", north],
    Axis["Geodetic longitude (Lon)", east],
    Unit["degree", 0.017453292519943295]]
{{< / highlight >}}

If (_longitude_, _latitude_) axis order is really wanted, Apache {{% SIS %}} can be forced to that order [as described above](#axisOrder).

### I have correct axis order but my transformed coordinates are still wrong.   {#projectionName}

Make sure that the right projection is used. Some projection names are confusing.
For example _"Oblique Mercator"_ and _"Hotine Oblique Mercator"_ (in EPSG naming) are two different projections.
But _"Oblique Mercator"_ (not Hotine) in EPSG naming is also called _"Hotine Oblique Mercator Azimuth Center"_ by ESRI,
while _"Hotine Oblique Mercator"_ (EPSG naming) is called _"Hotine Oblique Mercator Azimuth Natural Origin"_ by ESRI.

The _"Oblique Stereographic"_ projection (EPSG name) is called _"Double Stereographic"_ by ESRI.
ESRI also defines a _"Stereographic"_ projection, which is actually an oblique projection like the former but using different formulas.

### I just used the WKT of a well-known authority and my transformed coordinates are still wrong!    {#parameterUnits}

The version 1 of Well Known Text (WKT) specification has been interpreted in different ways by different implementors.
One subtle issue is the angular units of prime meridian and projection parameter values.
The {{% WKT %}} 1 specification clary states: _"If the `PRIMEM` clause occurs inside a `GEOGCS`,
then the longitude units will match those of the geographic coordinate system"_ (source: {{% OGC %}} 01-009).
However ESRI and GDAL among others unconditionally use decimal degrees, ignoring this part of the {{% WKT %}} 1 specification
(note: this remark does not apply to {{% WKT %}} 2).
This problem can be identified by {{% WKT %}} inspection as in the following extract:

{{< highlight text >}}
PROJCS["Lambert II étendu",
  GEOGCS["Nouvelle Triangulation Française", ...,
    PRIMEM["Paris", 2.337229167],
    UNIT["grad", 0.01570796326794897]]
  PROJECTION["Lambert_Conformal_Conic_1SP"],
  PARAMETER["latitude_of_origin", 46.8], ...]
{{< / highlight >}}

The Paris prime meridian is located at approximately 2.597 gradians from Greenwich, which is 2.337 degrees.
From this fact, we can see that the above {{% WKT %}} uses decimal degrees despite its `UNIT["grad"]` declaration.
This mismatch applies also to the parameter value, which declare 46.8° in the above example while the official value is 52 gradians.
By default, Apache {{% SIS %}} interprets those angular values as gradians when parsing such {{% WKT %}}, resulting in a large error.
In order to get the intended result, there is a choice:

* Replace `UNIT["grad", 0.01570796326794897]` by `UNIT["degree", 0.017453292519943295]`,
  which ensure that Apache {{% SIS %}}, GDAL and ESRI understand that {{% WKT %}} 1 in the same way.

* Or ask explicitly Apache {{% SIS %}} to parse the {{% WKT %}} using the ESRI or GDAL conventions, by specifying the
  `Convention.WKT1_COMMON_UNITS` enumeration value to `WKTFormat` in the `org.apache.sis.io.wkt` package.

Note that the GeoPackage standard explicitly requires {{% OGC %}} 01-009 compliant {{% WKT %}}
and the new {{% WKT %}} 2 standard also follows the {{% OGC %}} 01-009 interpretation.
The default Apache {{% SIS %}} behavior is consistent with those two standards.

### I verified all the above and still have an error of about one kilometer.    {#BursaWolf}

Coordinate Reference Systems (CRS) approximate the Earth’s shape by an ellipsoid.
Different ellipsoids (actually different _datum_) are used in different countries of the world and at different time in history.
When transforming coordinates between two {{% CRS %}} using the same datum, no Bursa-Wolf parameters are needed.
But when the transformation involves a change of datum, the referencing module needs some information about how to perform that datum shift.

There is many way to specify how to perform a datum shift, and most of them are only approximation.
The Bursa-Wolf method is one of them, not the only one. However it is one of the most frequently used methods.
The Bursa-Wolf parameters can be specified inside a `TOWGS84` element with version 1 of Well Known Text (WKT) format,
or in a `BOUNDCRS` element with version 2 of {{% WKT %}} format.
If the CRS are parsed from a {{% WKT %}} string, make sure that the string contains the appropriate element.

### I get slightly different results depending on the environment I’m running in.    {#slightDifferences}

The results of coordinate transformations when running in a web application container (JBoss, _etc._)
may be a few meters off compared to coordinates transformations in an IDE (NetBeans, Eclipse, _etc._).
The results depend on whether an EPSG factory is available on the classpath, **regardless how the {{% CRS %}} were created**,
because the EPSG factory specifies explicitly the coordinate operation to apply for some pairs of {{% CRS %}}.
In such case, the coordinate operation specified by EPSG has precedence over the Burwa-Wolf parameters
(the `TOWGS84` element in version 1 of Well Known Text format).

A connection to the EPSG database may have been established for one environment
(typically the JEE one) and not the other (typically the IDE one) because only the former has {{% JDBC %}} driver.
The recommended way to uniformize the results is to add in the second environment (IDE)
the same {{% JDBC %}} driver than the one available in the first environment (JEE).
It should be one of the following: JavaDB (a.k.a. Derby), HSQL or PostgreSQL.
Make sure that the [connection parameters to the EPSG database](epsg.html) are also the same.

### Can I always expect a transform from an arbitrary CRS to WGS84 to succeed?    {#toWGS84}

For 2D horizontal {{% CRS %}} created from the EPSG database, calls to `CRS.findOperation(…)` should generally succeed.
For 3D {{% CRS %}} having any kind of height different than ellipsoidal height, or for a 2D {{% CRS %}} of type `EngineeringCRS`, it may fail.
Note however that even if the call to `CRS.findOperation(…)` succeed, the call to `MathTransform.transform(…)` may fail
or produce `NaN` or infinity values if the coordinate to transform is far from the domain of validity.

# Metadata    {#metadata}

## Custom implementations    {#metadata-implementation}

### My metadata are stored in a database-like framework. Implementing every GeoAPI interfaces for them is impractical.    {#metadata-proxy}

Developers do not need to implement directly the metadata interfaces.
If the underlying storage framework can access metadata from their class and attribute names (either Java names
or {{% ISO %}}/{{% OGC %}} names), then it is possible to implement a single engine accessing any kind of metadata and let the
Java Virtual Machine implements the GeoAPI interfaces on-the-fly, using the `java.lang.reflect.Proxy` class.
See the `Proxy` Javadoc for details, keeping in mind that the {{% ISO %}}/{{% OGC %}} name of a `java.lang.Class` or
`java.lang.reflect.Method` object can be obtained as below:

{{< highlight java >}}
UML uml = method.getAnnotation(UML.class);
if (uml != null) {
    String name = uml.identifier();
    // Fetch the metadata here.
}
{{< / highlight >}}

This is indeed the approach taken by the `org.apache.sis.metadata.sql` package for providing an implementation
of all GeoAPI metadata interfaces reading their values directly from a SQL database.

### I cannot marshall my custom implementation.    {#metadata-unknownClass}

The classes given to the JAXB marshaller shall contain JAXB annotations,
otherwise the following exception is thrown:

{{< highlight text >}}
javax.xml.bind.JAXBException: class MyCustomClass nor any of its super class is known to this context.
{{< / highlight >}}

The easiest workaround is to wrap the custom implementation into one of the implementations
provided in the `org.apache.metadata.iso` package.
All those SIS implementation classes provide shallow copy constructor for making that easy.
Note that you need to wrap only the root class, not the attributes.
The attribute values will be wrapped automatically as needed by JAXB adapters.
