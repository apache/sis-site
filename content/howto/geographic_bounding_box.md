---
title: Geographic bounding box of a data file
---

This example prints the bounding box of a GeoTIFF image.
The pixel values are not read, only the GeoTIFF file header is read.
If the file contains many images, the bounding box of each image is printed.


# Direct dependencies

Maven coordinates                           | Module info                           | Remarks
------------------------------------------- | ------------------------------------- | -----------------------------
`org.apache.sis.storage:sis-geotiff`        | `org.apache.sis.storage.geotiff`      |
`org.apache.sis.non-free:sis-embedded-data` | `org.apache.sis.referencing.database` | Optional. Non-Apache license.

The [EPSG dependency](../epsg.html) may or may not be needed,
depending how the Coordinate Reference System (CRS) is encoded in the GeoTIFF file.


# Code example

The file name in following code need to be updated for yours data.

{{< highlight java >}}
import java.io.File;
import org.apache.sis.storage.Aggregate;
import org.apache.sis.storage.DataStore;
import org.apache.sis.storage.DataStores;
import org.apache.sis.storage.DataStoreException;
import org.apache.sis.metadata.iso.extent.Extents;
import org.apache.sis.storage.Resource;

public class GetBBOX {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws DataStoreException if an error occurred while reading the data file.
     */
    public static void main(String[] args) throws DataStoreException {
        try (DataStore store = DataStores.open(new File("Airport.tiff"))) {
            System.out.println("For the whole file");
            System.out.println(Extents.getGeographicBoundingBox(store.getMetadata()));
            if (store instanceof Aggregate agg) {
                for (Resource component : agg.components()) {
                    System.out.println("For component " + component.getIdentifier());
                    System.out.println(Extents.getGeographicBoundingBox(component.getMetadata()));
                }
            }
        }
    }
}
{{< / highlight >}}


# Output

The output depends on the data and the locale.
Below is an example:

```
For the whole file
Geographic bounding box
  ├─West bound longitude…… 2°31′33.51153867218″E
  ├─East bound longitude…… 2°34′15.75923342244″E
  ├─South bound latitude…… 48°59′20.7793385101″N
  ├─North bound latitude…… 49°01′07.5236778991″N
  └─Extent type code……………… True

For component Optional[Airport:1]
Geographic bounding box
  ├─West bound longitude…… 2°31′33.51153867218″E
  ├─East bound longitude…… 2°34′15.75923342244″E
  ├─South bound latitude…… 48°59′20.7793385101″N
  ├─North bound latitude…… 49°01′07.5236778991″N
  └─Extent type code……………… True
```
