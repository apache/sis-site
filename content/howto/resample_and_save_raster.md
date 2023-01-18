---
title: Resample a raster and write to a file
---

This example reads a raster in a GeoTIFF file
and reprojects it to a different Coordinate Reference System (CRS).
The result is saved as a World File in PNG format.


# Direct dependencies

Maven coordinates                           | Module info                           | Remarks
------------------------------------------- | ------------------------------------- | -----------------------------
`org.apache.sis.storage:sis-geotiff`        | `org.apache.sis.storage.geotiff`      |
`org.apache.sis.non-free:sis-embedded-data` | `org.apache.sis.referencing.database` | Non-Apache license.

The [EPSG dependency](../epsg.html) is necessary for this example
because a Coordinate Reference System (CRS) is instantiated from its EPSG code.
But it would also be possible to specify a CRS without EPSG code,
for example using Well Known Text (WKT) format.


# Code snippet

The file name in following snippet need to be updated for yours data.

{{< highlight java >}}
import java.nio.file.Paths;
import java.util.Collection;
import java.awt.image.ImagingOpException;
import org.apache.sis.storage.Resource;
import org.apache.sis.storage.Aggregate;
import org.apache.sis.storage.DataStore;
import org.apache.sis.storage.DataStores;
import org.apache.sis.storage.DataStoreException;
import org.apache.sis.storage.GridCoverageResource;
import org.apache.sis.coverage.grid.GridCoverage;
import org.apache.sis.coverage.grid.GridCoverageProcessor;
import org.apache.sis.image.Interpolation;
import org.apache.sis.referencing.CRS;
import org.opengis.referencing.operation.TransformException;
import org.opengis.util.FactoryException;

public class ResampleAndSaveRaster {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws DataStoreException if an error occurred while reading the raster.
     * @throws FactoryException   if an error occurred while creating the Coordinate Reference System (CRS).
     * @throws TransformException if an error occurred while transforming coordinates to the target CRS.
     * @throws ImagingOpException unchecked exception thrown if an error occurred while resampling a tile.
     */
    public static void main(String[] args) throws DataStoreException, FactoryException, TransformException {
        try (DataStore store = DataStores.open(Paths.get("Airport.tiff"))) {
            /*
             * This data store is an aggregate because a GeoTIFF file may contain many images.
             * Not all data stores are aggregate, so the following casts do not apply to all.
             * For this example, we know that the file is GeoTIFF and we take the first image.
             */
            Collection<? extends Resource> allImages = ((Aggregate) store).components();
            GridCoverageResource firstImage = (GridCoverageResource) allImages.iterator().next();
            /*
             * The following code read fully the specified resource.
             * For reading only a subset, or for handling data bigger
             * than memory, see "How to..." in Apache SIS web site.
             */
            GridCoverage data = firstImage.read(null, null);
            System.out.printf("Information about the selected image:%n%s%n", data);
            /*
             * Reproject to "WGS 84 / World Mercator" (EPSG::3395) using bilinear interpolation.
             * This example lets Apache SIS choose the output grid size and resolution.
             * But it is possible to specify those aspects if desired.
             */
            var processor = new GridCoverageProcessor();
            processor.setInterpolation(Interpolation.BILINEAR);
            data = processor.resample(data, CRS.forCode("EPSG::3395"));
            System.out.printf("Information about the image after reprojection:%n%s%n", data);
            /*
             * TODO: Apache SIS is missing an `DataStores.write(…)` convenience method.
             * Writing a TIFF World File is possible but requires use of internal API.
             * A public convenience method will be added in next version.
             */
        }
    }
}
{{< / highlight >}}


# Output

The output depends on the raster data and the locale.
Below is an example:

```
Information about the image after reprojection:
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

Information about the image after reprojection:
GridCoverage2D
  ├─Coverage domain
  │   ├─Grid extent
  │   │   ├─Dimension 0: [0 … 8239] (8240 cells)
  │   │   └─Dimension 1: [0 … 8240] (8241 cells)
  │   ├─Geographic extent
  │   │   ├─Lower bound:  48°59′20″N  02°31′33″E
  │   │   └─Upper bound:  49°01′08″N  02°34′16″E
  │   ├─Envelope
  │   │   ├─Easting:   281,190.4273301751 … 286,207.11249780044  ∆E = 0.60882102 m
  │   │   └─Northing: 6,240,752.860382801 … 6,245,770.154371441  ∆N = 0.60882102 m
  │   ├─Coordinate reference system
  │   │   └─EPSG:3395 — WGS 84 / World Mercator
  │   └─Conversion (origin in a cell center)
  │       └─┌                                                            ┐
  │         │ 0.6088210154885099   0                  281190.73174068285 │
  │         │ 0                   -0.60882101548851  6245769.8499609330  │
  │         │ 0                    0                       1             │
  │         └                                                            ┘
  └─Image layout
      ├─Origin: 0, 0
      ├─Tile size: 1,648 × 201
      ├─Data type: byte
      └─Image is opaque.
```
