---
title: Add vertical and temporal axes to an horizontal CRS
---

This example creates a 4-dimensional Coordinate Reference System (CRS)
with an horizontal, a vertical and a temporal component.
While it is possible to create a `CompoundCRS` programmatically,
it is much easier to do that from authority codes when those codes exist.
There is two syntaxes standardized by the Open Geospatial Consortium (OGC):
One syntax using an identifier starting with `http://www.opengis.net/def/crs-compound`
followed by the components in the query part of the URL,
and a shorter but less common syntax starting with `urn:ogc:def:crs`.
Apache SIS accepts both, illustrated below.



# Direct dependencies

Maven coordinates                     | Module info
------------------------------------- | ----------------------------
`org.apache.sis.core:sis-referencing` | `org.apache.sis.referencing`


# Code example

```java
import org.apache.sis.referencing.CRS;

public class Compound {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws FactoryException if an error occurred while creating the CRS
     *         or searching for a coordinate operation.
     */
    public static void main(String[] args) throws FactoryException {
        var crs = CRS.forCode(
                "http://www.opengis.net/def/crs-compound?"+
                "1=http://www.opengis.net/def/crs/epsg/0/4326&"+
                "2=http://www.opengis.net/def/crs/epsg/0/5714&" +
                "3=http://www.opengis.net/def/crs/OGC/0/JulianDate");
        /*
         * The following is a more compact way to request the same CRS.
         * If (longitude, latitude) axis order is desired, just replace
         * "EPSG::4326" by "OGC::84".
         */
        var alternative = CRS.forCode("urn:ogc:def:crs,crs:EPSG::4326,crs:EPSG::5714,crs:OGC::JulianDate");

        System.out.println(crs);
        System.out.println();
        System.out.println("Compact alternative is equal: " + crs.equals(alternative));
    }
}
```

Alternatively, if the components are already available as `CoordinateReferenceSystem` object, the
[compound method](../apidocs/org.apache.sis.referencing/org/apache/sis/referencing/CRS.html#compound(org.opengis.referencing.crs.CoordinateReferenceSystem...))
can be invoked instead.


# Output

```
CompoundCRS["WGS 84 + MSL height + Julian",
  GeographicCRS["WGS 84",
    Ensemble["World Geodetic System 1984 ensemble",
      (... ensemble members omitted for brevity ...)
      Ellipsoid["WGS 84", 6378137.0, 298.257223563],
      EnsembleAccuracy[2.0]],
    CS[ellipsoidal, 2],
      Axis["Latitude (B)", north],
      Axis["Longitude (L)", east],
      Unit["degree", 0.017453292519943295],
    Id["EPSG", 4326, "12.047"]],
  VerticalCRS["MSL height",
    VerticalDatum["Mean Sea Level"],
    CS[vertical, 1],
      Axis["Gravity-related height (H)", up],
      Unit["metre", 1],
    Id["EPSG", 5714, "12.047"]],
  TimeCRS["Julian",
    TimeDatum["Julian", TimeOrigin[-4713-11-24T12:00:00.000]],
    CS[temporal, 1],
      Axis["Time (t)", future],
      TimeUnit["day", 86400],
    Id["OGC", "JulianDate"]],
  Usage[
    BBox[-90.00, -180.00, 90.00, 180.00]]]

Compact alternative is equal: true
```
