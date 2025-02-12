---
title: Union or intersection of envelopes in different CRS
---

Before to compute the union or intersection of two or more envelopes (bounding boxes),
all envelopes must be [transformed](transform_envelopes.html) to the same Coordinate Reference System (CRS).
But the choice of a common {{% CRS %}} is not easy.
We must verify that all envelopes are inside the domain of validity of the common {{% CRS %}},
which may require to choose a common {{% CRS %}} different than the {{% CRS %}} of all envelopes.
Apache {{% SIS %}} can handle this task automatically.


# Direct dependencies

Maven coordinates                     | Module info
------------------------------------- | ----------------------------
`org.apache.sis.core:sis-referencing` | `org.apache.sis.referencing`


# Code example

Note that all geographic coordinates below express latitude *before* longitude.

```java
import org.opengis.geometry.Envelope;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.TransformException;
import org.opengis.util.FactoryException;
import org.apache.sis.referencing.CommonCRS;
import org.apache.sis.geometry.Envelopes;
import org.apache.sis.geometry.Envelope2D;

public class UnionOfEnvelopes {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws FactoryException   if an error occurred while creating a Coordinate Reference System (CRS).
     * @throws TransformException if an error occurred while transforming coordinates to the target CRS.
     */
    public static void main(String[] args) throws FactoryException, TransformException {
        CoordinateReferenceSystem crs1 = CommonCRS.WGS84.universal(40, 10);     // 40°N 10°E
        CoordinateReferenceSystem crs2 = CommonCRS.WGS84.universal(40, 20);     // 40°N 20°E

        Envelope2D bbox1 = new Envelope2D(crs1, 500_000, 400_000, 100_000, 100_000);
        Envelope2D bbox2 = new Envelope2D(crs2, 400_000, 500_000, 100_000, 100_000);
        Envelope   union = Envelopes.union(bbox1, bbox2);

        System.out.println("First CRS:    " + crs1.getName());
        System.out.println("Second CRS:   " + crs2.getName());
        System.out.println("Selected CRS: " + union.getCoordinateReferenceSystem().getName());
        System.out.println("Union result: " + union);
    }
}
```


# Output

```
First CRS:    EPSG:WGS 84 / UTM zone 32N
Second CRS:   EPSG:WGS 84 / UTM zone 34N
Selected CRS: EPSG:WGS 84
Union result: BOX(3.6184285185271796 9, 5.428225419697392 21)
```
