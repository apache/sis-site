---
title: Transform envelopes (bounding boxes)
---

The transformation of envelopes (or bounding boxes) is a much more difficult task
than transforming the four corners of a rectangle.
The rectangle straight lines in source {{% CRS %}} may become curves in the target {{% CRS %}}
with minimum and maximum values that are not located in any corner.
The calculation is also more complicated if the envelope contains a pole or crosses the anti-meridian.
Apache {{% SIS %}} handles those complexities in convenience static methods.
This is demonstrated by comparing the result of using Apache {{% SIS %}} methods
with the result of transforming the four corners.
The latter naive approach has an error of 40 kilometres in this example.

While the example below uses a two-dimensional envelope,
the same Apache {{% SIS %}} methods can transform efficiently _N_-dimensional envelopes.


# Direct dependencies

Maven coordinates                           | Module info
------------------------------------------- | ----------------------------
`org.apache.sis.storage:sis-referencing`    | `org.apache.sis.referencing`


# Code example

Note that all geographic coordinates below express latitude *before* longitude.

{{< highlight java >}}
import org.opengis.geometry.Envelope;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.CoordinateOperation;
import org.opengis.referencing.operation.TransformException;
import org.opengis.util.FactoryException;
import org.apache.sis.referencing.CRS;
import org.apache.sis.referencing.CommonCRS;
import org.apache.sis.geometry.Envelopes;
import org.apache.sis.geometry.GeneralEnvelope;
import org.apache.sis.geometry.DirectPosition2D;

public class TransformEnvelopes {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws FactoryException   if an error occurred while creating a Coordinate Reference System (CRS).
     * @throws TransformException if an error occurred while transforming coordinates to the target CRS.
     */
    public static void main(String[] args) throws FactoryException, TransformException {
        CoordinateReferenceSystem sourceCRS = CommonCRS.WGS84.geographic();
        CoordinateReferenceSystem targetCRS = CommonCRS.WGS84.universal(90, 0);  // Polar stereographic.

        GeneralEnvelope bbox = new GeneralEnvelope(sourceCRS);
        bbox.setRange(0,  84, 88);             // Latitudes.
        bbox.setRange(1, -20, 50);             // Longitudes.

        Envelope transformed = Envelopes.transform(bbox, targetCRS);
        Envelope corners = transformCorners(bbox, CRS.findOperation(sourceCRS, targetCRS, null));

        System.out.println("Source:  " + bbox);
        System.out.println("Result:  " + transformed);
        System.out.println("Corners: " + corners);
        System.out.println("Errors on Y axis: "
                + (corners.getMinimum(1) - transformed.getMinimum(1)) + " metres.");
    }

    /**
     * Transforms the 4 corners of a two-dimensional envelope. This is not recommended.
     * This method is provided only for demonstrating that this approach is not sufficient.
     *
     * @param  bbox       the bounding box to transform.
     * @param  operation  the coordinate operation to use for transforming corners.
     * @return the result of transforming the 4 corners of the provided bounding box.
     * @throws TransformException if a coordinate cannot be converted.
     */
    private static Envelope transformCorners(Envelope bbox, CoordinateOperation operation) throws TransformException {
        double[] corners = {
            bbox.getMinimum(0), bbox.getMinimum(1),
            bbox.getMaximum(0), bbox.getMinimum(1),
            bbox.getMaximum(0), bbox.getMaximum(1),
            bbox.getMinimum(0), bbox.getMaximum(1)
        };
        operation.getMathTransform().transform(corners, 0, corners, 0, 4);
        GeneralEnvelope result = new GeneralEnvelope(operation.getTargetCRS());
        for (int i=0; i<result.getDimension(); i++) {
            result.setRange(i, corners[i], corners[i]);
        }
        for (int i=0; i<corners.length;) {
            result.add(new DirectPosition2D(corners[i++], corners[i++]));
        }
        return result;
    }
}
{{< / highlight >}}


# Output

```
Source:  BOX(84 -20, 88 50)
Result:  BOX(1771965.695226812 1333272.44494046, 2510743.0524805877 1857256.625440407)
Corners: BOX(1771965.695226812 1373480.89677463, 2510743.0524805877 1857256.625440407)
Errors on Y axis: 40208.451834172476 metres.
```
