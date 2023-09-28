---
title: From data lake to data cube
---

This example opens a few files where each file represent a slice in a data cube.
Then the slices are aggregated together in a single multi-dimensional data cube.
For example each file may be a raster representing Sea Surface Temperature (SST) at a specific day,
and those files can be a aggregated in a single three-dimensional raster with a temporal dimension.

A current limitation is that each slice must have the same number of dimensions than the data cube.
For the example of SST raster for a specific day, the raster CRS must still have a temporal axis
even if the grid contains only one cell in the temporal dimension.
A future Apache SIS version will provide methods for adding dimensions.

This example assumes that all slice have the same size, resolution and coordinate reference system.
If this is not the case, the aggregation will still work but instead of producing a data cube,
it may produce an `Aggregate` resource containing a tree like below:

```
Root aggregate
├─ All coverages with same sample dimensions #1
│  └─ ...
└─ All coverages with same sample dimensions #2
   ├─ Coverages with equivalent reference systems #1
   │  └─ ...
   └─ Coverages with equivalent reference systems #2
      ├─ Slices with compatible "grid to CRS" #1
      ├─ Slices with compatible "grid to CRS" #2
      └─ ...</pre>
```

A future Apache SIS version will provide methods for controlling the way to aggregate
such heterogeneous data set.

This example works with `Resource` instances, which are not necessarily data loaded in memory.
Consequently the `DataStore` instances must be kept open for all the duration of data cube usage.


# Direct dependencies

Maven coordinates                   | Module info                     | Remarks
----------------------------------- | ------------------------------- | --------------------
`org.apache.sis.code:sis-feature`   | `org.apache.sis.feature`        |
`org.apache.sis.storage:sis-netcdf` | `org.apache.sis.storage.netcdf` |
`edu.ucar:cdm-core`                 |                                 | For netCDF-4 or HDF5

The `cdm-core` dependency can be omitted for netCDF-3 (a.k.a. "classic"),


# Code example

The file name and geospatial coordinates in following code need to be updated for yours data.

{{< highlight java >}}
import java.io.File;
import org.apache.sis.storage.DataStore;
import org.apache.sis.storage.DataStores;
import org.apache.sis.storage.DataStoreException;
import org.apache.sis.storage.GridCoverageResource;
import org.apache.sis.storage.aggregate.CoverageAggregator;

public class DataLakeToDataCube {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws DataStoreException if an error occurred while reading the raster.
     */
    public static void main(String[] args) throws DataStoreException {
        try (DataStore s1 = DataStores.open(new File("CMEMS_20220301.nc"));
             DataStore s2 = DataStores.open(new File("CMEMS_20220302.nc"));
             DataStore s3 = DataStores.open(new File("CMEMS_20220303.nc")))
        {
            /*
             * Following casts are okay if we know that the resources are raster data,
             * all of them having the same grid geometry. Otherwise the code can still
             * work but would require more `if (x instanceof Y)` checks.
             */
            var r1 = (GridCoverageResource) s1.findResource("sea_surface_height_above_geoid");
            var r2 = (GridCoverageResource) s2.findResource("sea_surface_height_above_geoid");
            var r3 = (GridCoverageResource) s3.findResource("sea_surface_height_above_geoid");

            System.out.printf("Extent of first set of slices:%n%s%n",  r1.getGridGeometry().getExtent());
            System.out.printf("Extent of second set of slices:%n%s%n", r2.getGridGeometry().getExtent());
            System.out.printf("Extent of third set of slices:%n%s%n",  r3.getGridGeometry().getExtent());

            var aggregator = new CoverageAggregator();
            aggregator.add(r1);
            aggregator.add(r2);
            aggregator.add(r3);
            var dataCube = (GridCoverageResource) aggregator.build();
            /*
             * From this point, the data cube can be used as a three-dimension grid coverage.
             * See "Get raster values at geographic (or pixel) coordinates" for usage examples.
             * However all usages must be done inside this `try` block.
             */
            System.out.printf("Extent of the data cube:%n%s%n", dataCube.getGridGeometry().getExtent());
        }
    }
}
{{< / highlight >}}


# Output

The output depends on the raster data and the locale.
Below is an example:

```
Extent of first set of slices:
Column: [0 …  864]  (865 cells)
Row:    [0 … 1080] (1081 cells)
Time:   [0 …   95]   (96 cells)

Extent of second set of slices:
Column: [0 …  864]  (865 cells)
Row:    [0 … 1080] (1081 cells)
Time:   [0 …   95]   (96 cells)

Extent of third set of slices:
Column: [0 …  864]  (865 cells)
Row:    [0 … 1080] (1081 cells)
Time:   [0 …   95]   (96 cells)

Extent of the data cube:
Column: [0 …  864]  (865 cells)
Row:    [0 … 1080] (1081 cells)
Time:   [0 …  287]  (288 cells)
```
