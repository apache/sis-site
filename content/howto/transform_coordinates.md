---
title: Transform coordinates
---

The following Java code projects geographic coordinates from the _World Geodetic System 1984_ (WGS84) to _WGS 84 / UTM zone 33N_.
In order to make the example a little bit simpler, this code uses predefined constants given by the `CommonCRS` convenience class.
But more advanced applications may use [EPSG codes](../epsg.html) or definitions in Well-Known Text (WKT) instead.

**Note:** if the result of a coordinate transformation seems wrong, see the [FAQ](../faq.html) page.
Unexpected results are often caused by wrong axis order.


# Direct dependencies

Maven coordinates                           | Module info                           | Remarks
------------------------------------------- | ------------------------------------- | -----------------------------
`org.apache.sis.storage:sis-referencing`    | `org.apache.sis.referencing`          |
`org.apache.sis.non-free:sis-embedded-data` | `org.apache.sis.referencing.database` | Optional. Non-Apache license.

The [EPSG dependency](../epsg.html) is optional for this example.
But if present, the Coordinate Reference Systems will have more metadata.
Consequently, coordinate transformation results between some pairs of reference systems
may be different depending on whether the EPSG dataset is present or not.
In general, results are more accurate and/or more reliable in presence of EPSG dataset.


# Code example

Note that all geographic coordinates below express latitude *before* longitude.

```java
import org.opengis.geometry.DirectPosition;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.CoordinateOperation;
import org.opengis.referencing.operation.TransformException;
import org.opengis.util.FactoryException;
import org.apache.sis.referencing.CRS;
import org.apache.sis.referencing.CommonCRS;
import org.apache.sis.geometry.DirectPosition2D;

public class TransformCoordinates {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws FactoryException   if an error occurred while creating the Coordinate Reference System (CRS).
     * @throws TransformException if an error occurred while transforming coordinates to the target CRS.
     */
    public static void main(String[] args) throws FactoryException, TransformException {
        CoordinateReferenceSystem sourceCRS = CommonCRS.WGS84.geographic();
        CoordinateReferenceSystem targetCRS = CommonCRS.WGS84.universal(40, 14);  // UTM zone for 40°N 14°E.
        CoordinateOperation operation = CRS.findOperation(sourceCRS, targetCRS, null);
        /*
         * The above lines are costly and should be performed only once before to project many points.
         * In this example, the operation that we got is valid for coordinates in geographic area from
         * 12°E to 18°E (UTM zone 33) and 0°N to 84°N.
         */
        System.out.println("Domain of validity:");
        System.out.println(CRS.getGeographicBoundingBox(operation));

        DirectPosition ptSrc = new DirectPosition2D(40, 14);           // 40°N 14°E
        DirectPosition ptDst = operation.getMathTransform().transform(ptSrc, null);

        System.out.println("Source: " + ptSrc);
        System.out.println("Target: " + ptDst);
    }
}
```


# Output

Note: for some pairs of Coordinate Reference Systems,
the output may vary depending on whether the [EPSG geodetic dataset](../epsg.html) is present or not.

```
Domain of validity:
Geographic bounding box
  ├─West bound longitude…… 12°E
  ├─East bound longitude…… 18°E
  ├─South bound latitude…… 0°N
  └─North bound latitude…… 84°N

Source: POINT(40 14)
Target: POINT(414639.5381572213 4428236.064633072)
```
