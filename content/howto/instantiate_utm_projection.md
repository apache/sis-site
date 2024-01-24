---
title: Instantiate a UTM projection
---

The Universal Transverse Mercator (UTM) projection divides the world in 60 zones.
If the UTM zone is unknown, an easy way to instantiate the projection
is to invoke the `universal(…)` method on one of the `CommonCRS` predefined constants.
That method receives in argument a geographic coordinate in (_latitude_, _longitude_) order and computes the UTM zone from it.
It takes in account the special cases of Norway and Svalbard.

An alternative, more standard, way using geographic coordinates is to format an "AUTO" authority code.
The syntax is `"AUTO2:​42001,​1,​<longitude>,​<latitude>"`.
However this approach works only for the WGS84 datum.

If the UTM zone is known, another way is to use the "EPSG" authority factory.
The EPSG code of some UTM projections can be determined as below, where _zone_ is a number from 1 to 60 inclusive (unless otherwise specified):

* WGS 84 (northern hemisphere): 32600 + _zone_
* WGS 84 (southern hemisphere): 32700 + _zone_
* WGS 72 (northern hemisphere): 32200 + _zone_
* WGS 72 (southern hemisphere): 32300 + _zone_
* NAD 83 (northern hemisphere): 26900 + _zone_ (zone 1 to 23 only)
* NAD 27 (northern hemisphere): 26700 + _zone_ (zone 1 to 22 only)
* See the EPSG dataset for additional UTM definitions
  (WGS 72BE, SIRGAS 2000, SIRGAS 1995, SAD 69, ETRS 89, _etc._).

The code example below instantiates the same {{% CRS %}} using the three approaches.


# Direct dependencies

Maven coordinates                           | Module info                           | Remarks
------------------------------------------- | ------------------------------------- | -----------------------------
`org.apache.sis.storage:sis-referencing`    | `org.apache.sis.referencing`          |
`org.apache.sis.non-free:sis-embedded-data` | `org.apache.sis.referencing.database` | Optional. Non-Apache license.

The [EPSG dependency](../epsg.html) is optional for examples using the `CommonCRS` enumeration
or the "AUTO" authority, but is required for examples using the "EPSG" authority.


# Code example

Note that all geographic coordinates below express latitude *before* longitude,
except in "AUTO2" authority code.

```java
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.util.FactoryException;
import org.apache.sis.referencing.CRS;
import org.apache.sis.referencing.CommonCRS;
import org.apache.sis.util.Utilities;

public class InstantiateUTM {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws FactoryException if an error occurred while creating the Coordinate Reference System (CRS).
     */
    public static void main(String[] args) throws FactoryException {
        /*
         * Get UTM projection for whatever zone is valid for 40°N 14°E.
         */
        double latitude  = 40;      // Will determine the hemisphere.
        double longitude = 14;      // Will determine the UTM zone.
        CoordinateReferenceSystem crsFromPoint = CommonCRS.WGS84.universal(latitude, longitude);
        CoordinateReferenceSystem crsFromAUTO2 = CRS.forCode("AUTO2:42001,1," + longitude + "," + latitude);
        /*
         * Get the UTM projection for a specific zone.
         */
        int zone = 33;              // UTM zone 33.
        int code = 32600 + zone;    // For WGS84 northern hemisphere
        CoordinateReferenceSystem crsFromCode = CRS.forCode("EPSG:" + code);
        /*
         * Compare the results.
         */
        System.out.println("Are the CRS equivalent?");
        System.out.println("AUTO2: " + Utilities.equalsIgnoreMetadata(crsFromPoint, crsFromAUTO2));
        System.out.println("EPSG:  " + Utilities.equalsIgnoreMetadata(crsFromPoint, crsFromCode));
    }
}
```


# Output

```
Are the CRS equivalent?
AUTO2: true
EPSG:  true
```
