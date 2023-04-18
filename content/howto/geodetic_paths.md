---
title: Compute geodetic distances and paths
---

The following example computes the geodetic distance between given positions.
The geodetic distance is the shortest distance on Earth ellipsoid.
Apache SIS can also compute the path as a Béziers curve,
with the property that the azimuths at the two curve extremities are preserved.


# Direct dependencies

Maven coordinates                        | Module info                  | Remarks
---------------------------------------- | ---------------------------- | -------
`org.apache.sis.storage:sis-referencing` | `org.apache.sis.referencing` |


# Code example

Note that all geographic coordinates below express latitude *before* longitude.

{{< highlight java >}}
import java.awt.Shape;
import org.apache.sis.referencing.CommonCRS;
import org.apache.sis.referencing.GeodeticCalculator;

public class GeodeticPaths {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     */
    public static void main(String[] args) {
        var calculator = GeodeticCalculator.create(CommonCRS.WGS84.geographic());
        calculator.setStartGeographicPoint(40, 5);
        calculator.setEndGeographicPoint(42, 3);
        System.out.printf("Result of geodetic calculation: %s%n", calculator);

        double d;
        d  = calculator.getRhumblineLength();
        d -= calculator.getGeodesicDistance();
        System.out.printf("The rhumbline is %1.2f %s longer%n", d, calculator.getDistanceUnit());

        Shape path = calculator.createGeodesicPath2D(100);
        System.out.printf("Java2D shape class for approximating this path: %s%n", path.getClass());
    }
}
{{< / highlight >}}


# Output

The output depends on the locale.
Below is an example:

```
Result of geodetic calculation:
Coordinate reference system: WGS 84
┌─────────────┬─────────────────┬────────────────┬────────────┐
│             │    Latitude     │   Longitude    │  Azimuth   │
│ Start point │ 40°00′00.0000″N │ 5°00′00.0000″E │ -36°29′45″ │
│ End point   │ 42°00′00.0000″N │ 3°00′00.0000″E │ -37°48′29″ │
└─────────────┴─────────────────┴────────────────┴────────────┘
Geodesic distance: 278,632.68 m

The rhumbline is 6.09 m longer
Java2D shape class for approximating this path: class java.awt.geom.QuadCurve2D$Double
```
