---
title: Parallel computation
---

Some grid coverages will read or compute chunks of data only when first requested.
For example when a coverage is the [result of a reprojection](resample_raster.html),
or when a big coverage [uses deferred tile reading](rasters_bigger_than_memory.html).
However if tiles are always requested in the same thread,
it will result in a sequential, mono-threaded computation.
Furthermore it may cause a lot of seek or "HTTP range" operations if tiles are read in random order.
For parallel computation using all available processors,
or for more efficient read operations,
we need to inform Apache SIS in advance about which pixels are about to be requested.


# Direct dependencies

Maven coordinates                 | Module info              | Remarks
--------------------------------- | ------------------------ | -------
`org.apache.sis.code:sis-feature` | `org.apache.sis.feature` |


# Code example

{{< highlight java >}}
import java.awt.image.ImagingOpException;
import java.awt.image.RenderedImage;
import org.apache.sis.coverage.grid.GridCoverage;
import org.apache.sis.image.ImageProcessor;

public class ParallelTileComputation {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws ImagingOpException unchecked exception thrown if an error occurred while computing a tile.
     */
    public static void main(String[] args) {
        GridCoverage coverage = ...;        // See "Resample a raster" code example.
        /*
         * Get all data from the coverage, assuming that the grid is two-dimensional.
         * If there is three or more dimensions, the null value needs to be replaced
         * by a `GridExtent` specifying the two-dimensional slice to fetch.
         */
        RenderedImage data = coverage.render(null);
        /*
         * With above `RenderedImage`, tiles are computed when first requested and cached for future uses.
         * If all tiles will be requested in the same thread, it results in a sequential tile computation.
         * For parallel computation using all available processors, we need to inform Apache SIS in advance
         * about which pixels will be requested. The `null` argument below means "all pixels in the image".
         * Don't use that null argument if the image is very big!
         */
        var processor = new ImageProcessor();
        data = processor.prefetch(data, null);
        /*
         * See for example "Get raster values at pixel coordinates" for using this image.
         */
    }
}
{{< / highlight >}}
