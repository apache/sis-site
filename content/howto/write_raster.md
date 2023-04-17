---
title: Write a raster to a file
---

This example saves a raster in PNG format.
This example assumes a preloaded raster.
For the loading part,
see [read from a netCDF file](read_netcdf.html)
or [read from a GeoTIFF file](read_geotiff.html)
code examples.

Note: this example is incomplete.
A more complete example will be provided with next Apache SIS release.


# Direct dependencies

Maven coordinates                    | Module info              | Remarks
------------------------------------ | ------------------------ | -------
`org.apache.sis.storage:sis-storage` | `org.apache.sis.storage` |


# Code example

The file name in following code need to be updated for yours data.

{{< highlight java >}}
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;
import org.apache.sis.coverage.grid.GridCoverage;

public class WriteRaster {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws IOException if an error occurred while writing the raster.
     */
    public static void main(String[] args) throws IOException {
        GridCoverage data = ...;      // See "Read netCDF" or "Read GeoTIFF" code examples.
        /*
         * TODO: Apache SIS is missing a `DataStores.write(…)` convenience method.
         * Writing a TIFF World File is possible but requires use of internal API.
         * A public convenience method will be added in next version.
         * For now we use Java I/O API.
         */
        ImageIO.write(data.render(null), "png", new File("test.png"));
    }
}
{{< / highlight >}}
