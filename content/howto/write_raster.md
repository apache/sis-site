---
title: Write a raster to a file
---

This example saves a raster in PNG format together with its WorldFile PRJ and PGW auxiliary files.
This example assumes a preloaded raster.
For the loading part,
see [read from a netCDF file](read_netcdf.html)
or [read from a GeoTIFF file](read_geotiff.html)
code examples.


# Direct dependencies

Maven coordinates                    | Module info              | Remarks
------------------------------------ | ------------------------ | -------
`org.apache.sis.storage:sis-storage` | `org.apache.sis.storage` |


# Code example

The file name in following code need to be updated for yours data.

{{< highlight java >}}
import java.io.File;
import org.apache.sis.storage.DataStore;
import org.apache.sis.storage.DataStores;
import org.apache.sis.storage.DataStoreException;
import org.apache.sis.storage.WritableGridCoverageResource;
import org.apache.sis.coverage.grid.GridCoverage;

public class WriteRaster {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws DataStoreException if an error occurred while reading or writing the raster.
     */
    public static void main(String[] args) throws DataStoreException {
        /*
         * In this example we just read an existing grid coverage,
         * but it could be the result of some calculation instead.
         * See "Read netCDF" or "Read GeoTIFF" code examples.
         */
        GridCoverage data = ReadGeoTIFF.example();
        try (DataStore store = DataStores.openWritable(new File("output.png"), "PNG")) {
            /*
             * In this example, we use the knowledge that PNG format can store only one image.
             * So we can cast to `WritableGridCoverageResource`. If the format supported many
             * images (e.g. GeoTIFF), the store would rather be a `WritableAggregate`.
             */
            var writable = (WritableGridCoverageResource) store;
            writable.write(data);
        }
    }
}
{{< / highlight >}}
