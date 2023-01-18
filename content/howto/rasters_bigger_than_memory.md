---
title: Handle rasters bigger than memory
---

This example opens a big GeoTIFF file without reading the tiles immediately.
Instead, tiles will be read only when requested by a call to the Java2D `RenderedImage.getTile(int, int)` method.
Loaded tiles are cached by soft references, i.e. they may be discarted and reloaded when needed again.
This approach allows processing of raster data larger than memory,
provided that the application does not request all tiles at once.
It integrates well with operations provided by Apache {{% SIS %}} such as
[raster resampling](resample_and_save_raster.html) and
[getting values at geographic coordinates](raster_values_at_geographic_coordinates.html).

The example in this page works with pixel coordinates.
For working with geographic coordinates, see
[values at geographic coordinates](raster_values_at_geographic_coordinates.html) snippet.


# Direct dependencies

Maven coordinates                           | Module info                           | Remarks
------------------------------------------- | ------------------------------------- | -----------------------------
`org.apache.sis.storage:sis-geotiff`        | `org.apache.sis.storage.geotiff`      |
`org.apache.sis.non-free:sis-embedded-data` | `org.apache.sis.referencing.database` | Optional. Non-Apache license.

The [EPSG dependency](../epsg.html) may or may not be needed,
depending how the Coordinate Reference System (CRS) is encoded in the GeoTIFF file.


# Code snippet

The file name in following snippet need to be updated for yours data.

{{< highlight java >}}
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
            /*
             * This data store is an aggregate because a GeoTIFF file may contain many images.
             * Not all data stores are aggregate, so the following casts do not apply to all.
             * For this example, we know that the file is GeoTIFF and we take the first image.
             */
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
            System.out.printf("Information about the selected image:%n%s%n", data);
            /*
             * Get an arbitrary tile, then get an arbitrary sample value in an arbitrary band
             * (the blue channel) of that tile.
             */
            RenderedImage image = data.render(null);
            System.out.printf("The image has %d × %d tiles.%n", image.getNumXTiles(), image.getNumYTiles());

            Raster tile = image.getTile(130, 80);               // This is where tile loading actually happen.
            System.out.printf("Got a tile starting at coordinates %d, %d.%n", tile.getMinX(), tile.getMinY());
            System.out.printf("A sample value in a tile: %d%n", tile.getSample(93710, 57680, 2));
            /*
             * If we know in advance which tiles will be requested, specifying them in advance allows
             * the GeoTIFF reader to use a better strategy than loading the tiles in random order.
             */
            var processor = new ImageProcessor();
            image = processor.prefetch(image, new Rectangle(90000, 50000, 1000, 1000));
            tile = image.getTile(130, 80);
            System.out.printf("Same, but from prefetched image: %d%n%n", tile.getSample(93710, 57680, 2));
        }
    }
}
{{< / highlight >}}


# Output

The output depends on the raster data and the locale.
Below is an example:

```
Information about the selected image:
CompressedSubset
  └─Coverage domain
      ├─Grid extent
      │   ├─Column: [0 … 172799] (172800 cells)
      │   └─Row:    [0 …  86399]  (86400 cells)
      ├─Geographic extent
      │   ├─Lower bound:  90°00′00″S  180°00′00″W
      │   └─Upper bound:  90°00′00″N  180°00′00″E
      ├─Envelope
      │   ├─Geodetic longitude: -180.000 … 180.000  ∆Lon = 0.00208333°
      │   └─Geodetic latitude:   -90.000 … 90.000   ∆Lat = 0.00208333°
      ├─Coordinate reference system
      │   └─CRS:84 — WGS 84
      └─Conversion (origin in a cell center)
          └─┌                                                                    ┐
            │ 0.0020833333333333333   0                      -179.99895833333332 │
            │ 0                      -0.0020833333333333333    89.99895833333333 │
            │ 0                       0                         1                │
            └                                                                    ┘

The image has 240 × 120 tiles.
Got a tile starting at coordinates 93600, 57600.
A sample value in a tile: 20
Same, but from prefetched image: 20
```
