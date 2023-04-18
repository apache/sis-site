---
title: Get raster values at pixel coordinates
---

This example fetches values at given pixel coordinates in a raster.
This example assumes a preloaded three-dimensional raster.
For the loading part,
see [read from a netCDF file](read_netcdf.html)
or [read from a GeoTIFF file](read_geotiff.html)
code examples.

Some file formats store values as integers for compactness reasons,
but provide a _transfer function_ for converting those integers to "real world" values.
Apache SIS can provide either the original integers or the converted values, at user's choice.
This choice is specified by the boolean argument in the `data.​forConvertedValues(…)` call.

Note that pixel coordinates are relative to the request made in the call to `render(…)`.
They are not directly the grid coordinates of the coverage.
The use of relative coordinates makes possible to avoid 32 bits integer overflow,
and is also convenient for working on an area of interest regardless the grid coverage origin.


# Direct dependencies

Maven coordinates                 | Module info              | Remarks
--------------------------------- | ------------------------ | -------
`org.apache.sis.code:sis-feature` | `org.apache.sis.feature` |


# Code example

The pixel coordinates in following code need to be updated for yours data.

{{< highlight java >}}
import java.awt.Point;
import java.awt.image.RenderedImage;
import javax.measure.Unit;
import org.apache.sis.coverage.grid.GridCoverage;
import org.apache.sis.coverage.grid.GridExtent;
import org.apache.sis.image.PixelIterator;
import org.apache.sis.measure.Units;

public class RasterValuesAtPixelCoordinates {
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
         * If the data are three-dimensional, we need to specify a two-dimensional slice
         * for the `RenderedImage`. Following code arbitrarily takes the first slice.
         */
        GridExtent extent = data.getGridGeometry().getExtent();
        System.out.format("Grid extent:%n%s%n", extent);
        if (extent.getDimension() > 2) {
            long first = extent.getLow(2);
            extent = extent.withRange(2, first, first);
        }
        RenderedImage image = data.render(extent);
        /*
         * Prints the value at a few positions. For avoiding to flood the output stream,
         * this example prints a value only for the 3 first pixel, then an arbitrary pixel.
         */
        int n = 3;
        PixelIterator pit = PixelIterator.create(image);
        while (pit.next()) {
            Point pos = pit.getPosition();
            float value = pit.getSampleFloat(band);
            System.out.printf("Value at (%d,%d) is %g %s.%n", pos.x, pos.y, value, unit);
            if (--n == 0) break;
        }
        pit.moveTo(100, 200);                   // Relative to `extent` low coordinates.
        float value = pit.getSampleFloat(band);
        System.out.printf("Value at (100,200) is %g %s.%n", value, unit);
    }
}
{{< / highlight >}}


# Output

The output depends on the raster data and the locale.
Below is an example:

```
Grid extent:
Column: [0 …  864]  (865 cells)
Row:    [0 … 1080] (1081 cells)
Time:   [0 …   95]   (96 cells)

Value at (0,0) is NaN m.
Value at (1,0) is NaN m.
Value at (2,0) is NaN m.
Value at (100,200) is 0.586000 m.
```
