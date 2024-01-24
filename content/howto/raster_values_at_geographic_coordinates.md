---
title: Get raster values at geographic coordinates
---

This example fetches values at given geospatial coordinates in a raster.
The coordinates can be expressed in different Coordinate Reference System (CRS).
Conversions from geographic or projected coordinates to pixel coordinates,
optionally followed by conversions from raster data to units of measurement,
are done automatically.
Raster data and spatiotemporal coordinates can have more than two dimensions.

This example assumes a preloaded three-dimensional raster.
For the loading part,
see [read from a netCDF file](read_netcdf.html)
or [read from a GeoTIFF file](read_geotiff.html)
code examples.

Some file formats store values as integers for compactness reasons,
but provide a _transfer function_ for converting those integers to "real world" values.
Apache SIS can provide either the original integers or the converted values, at user's choice.
This choice is specified by the boolean argument in the `data.​forConvertedValues(…)` call.


# Direct dependencies

Maven coordinates                 | Module info              | Remarks
--------------------------------- | ------------------------ | -------
`org.apache.sis.code:sis-feature` | `org.apache.sis.feature` |


# Code example

The geographic coordinates in following code need to be updated for yours data.

```java
import java.util.Map;
import javax.measure.Unit;
import org.apache.sis.coverage.grid.GridCoverage;
import org.apache.sis.geometry.GeneralDirectPosition;
import org.apache.sis.referencing.CommonCRS;
import org.apache.sis.measure.Units;

public class RasterValuesAtGeographicCoordinates {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     */
    public static void main(String[] args) {
        GridCoverage data = ...;      // See "Read netCDF" or "Read GeoTIFF" code examples.
        /*
         * Switch to a view of the data in the units of measurement.
         * Then get the unit of measurement of the first band (0).
         * If no unit is specified, fallback on dimensionless unit.
         */
        data = data.forConvertedValues(true);
        int band = 0;
        Unit<?> unit = data.getSampleDimensions().get(band).getUnits().orElse(Units.UNITY);
        /*
         * Get raster values at geographic coordinates expressed in WGS84.
         * Coordinate values in this example are in (latitude, longitude) order.
         * Any compatible coordinate reference system (CRS) can be used below,
         * Apache SIS will automatically transform to the CRS used by the raster.
         * If the raster data are three-dimensional, a 3D CRS should be specified.
         */
        System.out.println("Evaluation at some (latitude, longitude) coordinates:");
        var point = new GeneralDirectPosition(CommonCRS.WGS84.geographic());
        GridCoverage.Evaluator eval = data.evaluator();
        /*
         * If the data are three-dimensional but we still want to use two-dimensional
         * coordinates, we need to specify a default value for the temporal dimension.
         * This code set the default to slice 0 (the first slice) in dimension 2.
         * Omit this line if the data are two-dimensional or if `point` has a 3D CRS.
         */
        eval.setDefaultSlice(Map.of(2, 0L));
        /*
         * The same `Evaluator` can be reused as often as needed for evaluating
         * at many points.
         */
        point.setCoordinate(40, -10);           // 40°N 10°W
        double[] values = eval.apply(point);
        System.out.printf("- Value at %s is %g %s.%n", point, values[band], unit);

        point.setCoordinate(30, -15);           // 30°N 15°W
        values = eval.apply(point);
        System.out.printf("- Value at %s is %g %s.%n", point, values[band], unit);
    }
}
```


# Output

The output depends on the raster data and the locale.
Below is an example:

```
Evaluation at some (latitude, longitude) coordinates:
- Value at POINT(40 -10) is 0.188000 m.
- Value at POINT(30 -15) is 0.619000 m.
```
