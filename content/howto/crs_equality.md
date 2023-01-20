---
title: Determine if two CRS are functionally equal
---

Two Coordinate Reference Systems may not be considered equal if they are associated to different metadata
(name, identifiers, scope, domain of validity, remarks), even though they represent the same logical {{% CRS %}}.
In order to test if two {{% CRS %}} are functionally equivalent,
`Utilities​.equals­Ignore­Metadata(myFirstCRS, mySecondCRS)` can be used.

In some cases, `equals­Ignore­Metadata(…)` may fail to see that two reference systems are equal.
It may happen for example when two map projections are defined with different parameters,
but are mathematically equivalent.
A more reliable but more costly way to check if two {{% CRS %}} are functionally equivalent
is to request the coordinate operation between them, and check if that operation is identity.


# Direct dependencies

Maven coordinates                           | Module info
------------------------------------------- | ----------------------------
`org.apache.sis.storage:sis-referencing`    | `org.apache.sis.referencing`


# Code example

{{< highlight java >}}
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.util.FactoryException;
import org.apache.sis.referencing.CRS;
import org.apache.sis.referencing.CommonCRS;
import org.apache.sis.util.Utilities;

public class CrsEquality {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws FactoryException if an error occurred while creating the CRS
     *         or searching for a coordinate operation.
     */
    public static void main(String[] args) throws FactoryException {
        CoordinateReferenceSystem crs1 = CommonCRS.WGS84.geographic();
        CoordinateReferenceSystem crs2 = CRS.fromWKT(
        """
        GeodeticCRS["WGS84 with a different name",
          Datum["World Geodetic System 1984",
            Ellipsoid["A different name", 6378137.0, 298.257223563]],
          CS[ellipsoidal, 2],
            Axis["Latitude (B)", north],
            Axis["Longitude (L)", east],
            Unit["degree", 0.017453292519943295]]
        """);

        System.out.println("equals: "
                + crs1.equals(crs2));

        System.out.println("equalsIgnoreMetadata: "
                + Utilities.equalsIgnoreMetadata(crs1, crs2));

        System.out.println("Identity transform: "
                + CRS.findOperation(crs2, crs2, null).getMathTransform().isIdentity());
    }
}
{{< / highlight >}}


# Output

```
equals: false
equalsIgnoreMetadata: true
Identity transform: true
```
