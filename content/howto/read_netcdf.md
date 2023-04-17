---
title: Read raster from a netCDF file
---

This example reads data in netCDF format.
Contrarily to other formats such as PNG or JPEG,
a netCDF file can contain an arbitrary number of variables
with none of them identified as the main data.
Furthermore those data are not necessarily rasters.
For this reason, `NetcdfStore` does not implement directly `GridCoverageResource`.
Instead, `NetcdfStore` implements the `Aggregate` interface
and the desired variable must be specified.
The variables may be instances of `GridCoverageResource`, but not necessarily.


# Direct dependencies

Maven coordinates                   | Module info                     | Remarks
----------------------------------- | ------------------------------- | --------------------
`org.apache.sis.storage:sis-netcdf` | `org.apache.sis.storage.netcdf` |
`edu.ucar:cdm-core`                 |                                 | For netCDF-4 or HDF5

The `cdm-core` dependency can be omitted for netCDF-3 (a.k.a. "classic"),


# Code example

The file name, resource name and geographic coordinates
in following code need to be updated for yours data.

{{< highlight java >}}
import java.io.File;
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

public class ReadNetCDF {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws DataStoreException if an error occurred while reading the raster.
     */
    public static void main(String[] args) throws DataStoreException {
        try (DataStore store = DataStores.open(new File("CMEMS_R20220516.nc"))) {
            /*
             * See what is inside this file. One of the components listed
             * below can be given in argument to `findResource(String)`.
             * For this example we use a hard-coded variable name.
             */
            printComponents(store);
            Resource resource = store.findResource("sea_surface_height_above_geoid");
            if (resource instanceof GridCoverageResource gridded) {
                /*
                 * Read the resource immediately and fully.
                 */
                GridCoverage data = gridded.read(null, null);
                System.out.printf("Information about the selected resource:%n%s%n", data);
                /*
                 * Read only a subset of the resource. The Area Of Interest can be specified
                 * in any Coordinate Reference System (CRS). The envelope will be transformed
                 * automatically to the CRS of the data (the data are not transformed).
                 */
                var areaOfInterest = new GeneralEnvelope(CommonCRS.WGS84.geographic());
                areaOfInterest.setRange(0, 30, 40);     // Minimal and maximal latitude values.
                areaOfInterest.setRange(1, -5,  4);     // Minimal and maximal longitude values.
                data = gridded.read(new GridGeometry(null, areaOfInterest, GridOrientation.HOMOTHETY), null);
                System.out.printf("Information about the resource subset:%n%s%n",
                                  data.getGridGeometry().getExtent());
            }
        }
    }

    /**
     * Lists the components found in the given data store.
     * They are the values that can be given to {@link DataStore#findResource(String).
     *
     * @param  store  the data store from which to get the components.
     * @throws DataStoreException if an error occurred while reading the raster.
     */
    private static void printComponents(DataStore store) throws DataStoreException {
        if (store instanceof Aggregate agg) {
            System.out.println("Components found in the data store:");
            for (Resource component : agg.components()) {
                component.getIdentifier().ifPresent((id) -> System.out.println("- " + id));
            }
        } else {
            System.out.println("The data store is not an aggregate.");
        }
        System.out.println();
    }
}
{{< / highlight >}}


# Output

If logging at fine level is enabled, the logs should contain some entries like below.
The "Slowness" level is an Apache SIS custom level for operations taking more than an arbitrary time limit.

```
Slowness [GridCoverageResource] Loaded grid coverage between 25°N – 57°N and 19°W – 6°E from file “CMEMS.nc” in 1.03 seconds.
FINE     [GridCoverageResource] Loaded grid coverage between 29°N – 41°N and  5°W – 5°E from file “CMEMS.nc” in 0.246 seconds.
```

The output depends on the raster data and the locale.
Below is an example:

```
Components found in the data store:
- sea_surface_height_above_geoid
- sea_water_velocity

Information about the selected resource:
Raster
  ├─Coverage domain
  │   ├─Grid extent
  │   │   ├─Column: [0 …  864]  (865 cells)
  │   │   ├─Row:    [0 … 1080] (1081 cells)
  │   │   └─Time:   [0 …   95]   (96 cells)
  │   ├─Geographic extent
  │   │   ├─Lower bound:  25°59′09″N  19°00′50″W  2022-05-16T00:00:00Z
  │   │   └─Upper bound:  56°00′50″N  05°00′50″E  2022-05-17T00:00:00Z
  │   ├─Envelope
  │   │   ├─Geodetic longitude: -19.01388888888889 … 5.013888888888888   ∆Lon = 0.02777778°
  │   │   ├─Geodetic latitude:   25.98611111111111 … 56.013888888888886  ∆Lat = 0.02777778°
  │   │   └─time:                        634,392.0 … 634,416.0           ∆t   = 0.25 h
  │   ├─Coordinate reference system
  │   │   └─time latitude longitude
  │   └─Conversion (origin in a cell center)
  │       └─┌                                                              ┐
  │         │ 0.027777777777777776  0                     0        -19.000 │
  │         │ 0                     0.027777777777777776  0         26.000 │
  │         │ 0                     0                     0.25  634392.125 │
  │         │ 0                     0                     0          1     │
  │         └                                                              ┘
  └─Sample dimensions
      └─┌────────────────────┬────────────────────────┬────────────────────┐
        │       Values       │        Measures        │        Name        │
        ╞════════════════════╧════════════════════════╧════════════════════╡
        │ zos                                                              │
        ├────────────────────┬────────────────────────┬────────────────────┤
        │           -32,767  │ NaN #0                 │ Fill value         │
        │ [-10,000 … 10,000] │ [-10.0000 … 10.0000] m │ Sea surface height │
        └────────────────────┴────────────────────────┴────────────────────┘

Information about the resource subset:
Column: [504 … 828] (325 cellules)
Row:    [144 … 504] (361 cellules)
Time:   [  0 …  95]  (96 cellules)
```
