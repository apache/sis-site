---
title: Read raster from a GeoTIFF file
---

This example reads data in GeoTIFF format.
Contrarily to other formats such as PNG or JPEG,
a GeoTIFF file can contain an arbitrary number of images.
For this reason, `GeoTiffStore` does not implement directly `GridCoverageResource`.
Instead, `GeoTiffStore` implements the `Aggregate` interface.

This example assumes that the raster, optionally clipped to a subregion, can fit in memory.
For potentially much bigger rasters,
see [rasters bigger than memory](rasters_bigger_than_memory.html) code example.


# Direct dependencies

Maven coordinates                           | Module info                           | Remarks
------------------------------------------- | ------------------------------------- | -----------------------------
`org.apache.sis.storage:sis-geotiff`        | `org.apache.sis.storage.geotiff`      |
`org.apache.sis.non-free:sis-embedded-data` | `org.apache.sis.referencing.database` | Optional. Non-Apache license.

The [EPSG dependency](../epsg.html) may or may not be needed,
depending how the Coordinate Reference System (CRS) is encoded in the GeoTIFF file.


# Code example

The file name and geospatial coordinates in following code need to be updated for yours data.

{{< highlight java >}}
import java.io.File;
import java.util.Collection;
import java.awt.image.ImagingOpException;
import org.apache.sis.storage.Resource;
import org.apache.sis.storage.Aggregate;
import org.apache.sis.storage.DataStore;
import org.apache.sis.storage.DataStores;
import org.apache.sis.storage.DataStoreException;
import org.apache.sis.storage.GridCoverageResource;
import org.apache.sis.coverage.grid.GridCoverage;
import org.apache.sis.coverage.grid.GridGeometry;
import org.apache.sis.coverage.grid.GridOrientation;
import org.apache.sis.geometry.GeneralEnvelope;
import org.apache.sis.referencing.CommonCRS;

public class ReadGeoTIFF {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws DataStoreException if an error occurred while reading the raster.
     * @throws ImagingOpException unchecked exception thrown if an error occurred while loading a tile.
     */
    public static void main(String[] args) throws DataStoreException {
        example();
    }

    /**
     * Reads an example file and prints some information about it.
     *
     * @return the raster data.
     * @throws DataStoreException if an error occurred while reading the raster.
     */
    public static GridCoverage example() throws DataStoreException {
        GridCoverage data;
        try (DataStore store = DataStores.open(new File("Aéroport.tiff"))) {
            /*
             * This data store is an aggregate because a GeoTIFF file may contain many images.
             * Not all data stores are aggregate, so the following casts do not apply to all.
             * For this example, we know that the file is GeoTIFF and we take the first image.
             */
            Collection<? extends Resource> allImages = ((Aggregate) store).components();
            GridCoverageResource firstImage = (GridCoverageResource) allImages.iterator().next();
            /*
             * Read the resource immediately and fully.
             */
            data = firstImage.read(null, null);
            System.out.printf("Information about the selected image:%n%s%n", data);
            /*
             * Read only a subset of the resource. The Area Of Interest can be specified
             * in any Coordinate Reference System (CRS). The envelope will be transformed
             * automatically to the CRS of the data (the data are not transformed).
             * This example uses Universal Transverse Mercator (UTM) zone 31 North.
             */
            var areaOfInterest = new GeneralEnvelope(CommonCRS.WGS84.universal(49, 2.5));
            areaOfInterest.setRange(0,   46600,  467000);       // Minimal and maximal easting values (metres)
            areaOfInterest.setRange(1, 5427000, 5428000);       // Minimal and maximal northing values (metres).
            data = firstImage.read(new GridGeometry(null, areaOfInterest, GridOrientation.HOMOTHETY), null);
            System.out.printf("Information about the resource subset:%n%s%n",
                              data.getGridGeometry().getExtent());
        }
        /*
         * By default, it is possible to continue to use the `GridCoverage` (but not the `Resource`) after
         * the `DataStore` has been closed because data are in memory. Note that it would not be the case
         * if deferred data loading was enabled has shown in "Handle rasters bigger than memory" example.
         */
        return data;
    }
}
{{< / highlight >}}


# Output

If logging at fine level is enabled, the logs should contain some entries like below.
The "Slowness" level is an Apache SIS custom level for operations taking more than an arbitrary time limit.

```
Slowness [GridCoverageResource] Loaded grid coverage between 48°59′N – 49°02′N and 2°31′E – 2°35′E from file “Aéroport.tiff” in 1.249 seconds.
FINE [GridCoverageResource] Loaded grid coverage between 48°59.6′N – 49°00.3′N and 2°31′E – 2°33′E from file “Aéroport.tiff” in 0.033 seconds.
```

The output depends on the raster data and the locale.
Below is an example:

```
Information about the selected image:
GridCoverage2D
  ├─Coverage domain
  │   ├─Grid extent
  │   │   ├─Column: [0 … 8191] (8192 cells)
  │   │   └─Row:    [0 … 8191] (8192 cells)
  │   ├─Geographic extent
  │   │   ├─Lower bound:  48°59′20″N  02°31′33″E
  │   │   └─Upper bound:  49°01′08″N  02°34′16″E
  │   ├─Envelope
  │   │   ├─Easting:    465,341.6 … 468,618.39999999997  ∆E = 0.4 m
  │   │   └─Northing: 5,426,352.8 … 5,429,629.6          ∆N = 0.4 m
  │   ├─Coordinate reference system
  │   │   └─EPSG:32631 — WGS 84 / UTM zone 31N
  │   └─Conversion (origin in a cell center)
  │       └─┌                      ┐
  │         │ 0.4   0     465341.8 │
  │         │ 0    -0.4  5429629.4 │
  │         │ 0     0          1   │
  │         └                      ┘
  └─Image layout
      ├─Origin: 0, 0
      ├─Tile size: 8,192 × 128
      ├─Data type: byte
      └─Image is opaque.

Information about the resource subset:
Column: [   0 … 4145] (4146 cells)
Row:    [3968 … 6655] (2688 cells)
```
