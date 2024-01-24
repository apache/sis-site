---
title: Handle rasters bigger than memory
---

This example opens a big GeoTIFF file without reading the tiles immediately.
Instead, tiles will be read only when requested by a call to the Java2D `RenderedImage.getTile(int, int)` method.
Loaded tiles are cached by soft references, i.e. they may be discarted and reloaded when needed again.
This approach allows processing of raster data larger than memory,
provided that the application does not request all tiles at once.
It integrates well with operations provided by Apache {{% SIS %}} such as
[raster resampling](resample_raster.html) and
[getting values at geographic coordinates](raster_values_at_geographic_coordinates.html).

The approach demonstrated in this example has one drawback compared to the default behavior:
the `DataStore` must be kept open during all the time that the `GridCoverage` is used.
Consequently the `data` variable should not be used outside the `try` block in this example.

The example in this page works with pixel coordinates.
For working with geographic coordinates, see
[values at geographic coordinates](raster_values_at_geographic_coordinates.html) code example.


# Direct dependencies

Maven coordinates                           | Module info                           | Remarks
------------------------------------------- | ------------------------------------- | -----------------------------
`org.apache.sis.storage:sis-geotiff`        | `org.apache.sis.storage.geotiff`      |
`org.apache.sis.non-free:sis-embedded-data` | `org.apache.sis.referencing.database` | Optional. Non-Apache license.

The [EPSG dependency](../epsg.html) may or may not be needed,
depending how the Coordinate Reference System (CRS) is encoded in the GeoTIFF file.


# Code example

The file name in following code need to be updated for yours data.

```java
import java.io.File;
import java.util.Collection;
import java.awt.Rectangle;
import java.awt.image.Raster;
import java.awt.image.RenderedImage;
import java.awt.image.ImagingOpException;
import org.apache.sis.image.ImageProcessor;
import org.apache.sis.storage.Resource;
import org.apache.sis.storage.Aggregate;
import org.apache.sis.storage.DataStore;
import org.apache.sis.storage.DataStores;
import org.apache.sis.storage.DataStoreException;
import org.apache.sis.storage.GridCoverageResource;
import org.apache.sis.storage.RasterLoadingStrategy;
import org.apache.sis.coverage.grid.GridCoverage;

public class RasterBiggerThanMemory {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws DataStoreException if an error occurred while reading the raster.
     * @throws ImagingOpException unchecked exception thrown if an error occurred while loading a tile.
     */
    public static void main(String[] args) throws DataStoreException {
        try (DataStore store = DataStores.open(new File("TM250m.tiff"))) {
            Collection<? extends Resource> allImages = ((Aggregate) store).components();
            GridCoverageResource firstImage = (GridCoverageResource) allImages.iterator().next();
            /*
             * Following line requests to load data at `RenderedImage.getTile(…)` invocation time.
             * This is the key line of code for handling rasters larger than memory, but is effective
             * only if the file is tiled as in, for example, Cloud Optimized GeoTIFF (COG) convention.
             * Without this line, the default is to load all data at `GridCoverageResource.read(…)`
             * invocation time.
             */
            firstImage.setLoadingStrategy(RasterLoadingStrategy.AT_GET_TILE_TIME);
            GridCoverage data = firstImage.read(null, null);
            printPixelValue(data, false);
            /*
             * Contrarily to other examples, the `GridCoverage` fetched in deferred reading mode
             * can NOT be used outside this `try` block, because the `DataStore` must be open.
             */
        }
    }

    /**
     * Prints the value of an arbitrary pixel.
     *
     * @param data      the data from which to get sample values.
     * @param prefetch  whether to load some pixels in advance.
     */
    private static void printPixelValue(GridCoverage data, boolean prefetch) {
        RenderedImage image = data.render(null);
        System.out.printf("The image has %d × %d tiles.%n", image.getNumXTiles(), image.getNumYTiles());
        /*
         * If we know in advance which tiles will be requested, specifying them in advance allows
         * the GeoTIFF reader to use a better strategy than loading the tiles in random order.
         * This step is optional.
         */
        if (prefetch) {
            var processor = new ImageProcessor();
            image = processor.prefetch(image, new Rectangle(90000, 50000, 1000, 1000));
        }
        /*
         * Get an arbitrary tile, then get an arbitrary sample value in an arbitrary band (the blue channel).
         * This example handles the tiles directly for demonstration purposes, but it could be simplified
         * by using `PixelIterator` instead.
         */
        Raster tile = image.getTile(130, 80);               // This is where tile loading actually happen.
        System.out.printf("Got a tile starting at coordinates %d, %d.%n", tile.getMinX(), tile.getMinY());
        System.out.printf("A sample value in the arbitrary tile: %d%n", tile.getSample(93710, 57680, 2));
    }
}
```


# Output

The output depends on the raster data and the locale.
Below is an example:

```
The image has 240 × 120 tiles.
Got a tile starting at coordinates 93600, 57600.
A sample value in the arbitrary tile: 20
```

If logging at fine level is enabled, the logs should contain an entry likes below.
The interesting point is that the "loading" of the TIFF file was quick even if the file was very big.
This is because the loading did not really happens at that time,
but instead was deferred at `image.getTile(…)` or `processor.prefetch(…)` time.

```
FINE [GridCoverageResource] Loaded grid coverage between 90°S – 90°N and 180°W – 180°E from file “TM250m.tiff” in 0.779 seconds.
```
