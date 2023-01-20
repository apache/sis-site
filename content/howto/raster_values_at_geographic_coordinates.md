---
title: Get raster values at geographic coordinates
---

This example reads a netCDF file and fetches values at given coordinates.
The coordinates can be expressed in different Coordinate Reference System (CRS).
Conversions from geographic coordinates to pixel coordinates,
followed by conversions from raster data to units of measurement,
are done automatically.
Raster rata and spatiotemporal coordinates can have more than two dimensions.

This example uses data in netCDF format.
A netCDF file can contain an arbitrary amount of variables.
For this reason, the data store implements the `Aggregate` interface
and the desired variable must be specified.
A similar code can be used for reading data in other
formats supported by Apache {{% SIS %}} such as GeoTIFF,
but not all formats are aggregates.
For some file formats, the data store implements directly
the `GridCoverageResource` interface instead of `Aggregate`.


# Direct dependencies

Maven coordinates                   | Module info                     | Remarks
----------------------------------- | ------------------------------- | --------------------
`org.apache.sis.storage:sis-netcdf` | `org.apache.sis.storage.netcdf` |
`edu.ucar:cdm-core`                 |                                 | For netCDF-4 or HDF5

The `cdm-core` dependency can be omitted for netCDF-3 (a.k.a. "classic"),
GeoTIFF or any other [formats supported by Apache SIS](../formats.html).
For the dependencies required for reading GeoTIFF instead of netCDF files,
see the [rasters bigger than memory](rasters_bigger_than_memory.html) code example.


# Code example

The file name, resource name and geographic coordinates
in following code need to be updated for yours data.

{{< highlight java >}}
import java.io.File;
import java.util.Map;
import javax.measure.Unit;
import org.apache.sis.storage.Resource;
import org.apache.sis.storage.Aggregate;
import org.apache.sis.storage.DataStore;
import org.apache.sis.storage.DataStores;
import org.apache.sis.storage.DataStoreException;
import org.apache.sis.storage.GridCoverageResource;
import org.apache.sis.coverage.grid.GridCoverage;
import org.apache.sis.geometry.GeneralDirectPosition;
import org.apache.sis.referencing.CommonCRS;
import org.apache.sis.measure.Units;

public class RasterValuesAtGeographicCoordinates {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws DataStoreException if an error occurred while reading the raster.
     */
    public static void main(String[] args) throws DataStoreException {
        try (DataStore store = DataStores.open(new File("CMEMS.nc"))) {
            /*
             * See what is inside this file. One of the components listed
             * below can be given in argument to `findResource(String)`.
             */
            printComponents(store);
            /*
             * The following code read fully the specified resource.
             * For reading only a subset, or for handling data bigger
             * than memory, see "How to..." in Apache SIS web site.
             */
            Resource resource = store.findResource("sea_surface_height_above_geoid");
            GridCoverage data = ((GridCoverageResource) resource).read(null, null);
            System.out.printf("Information about the selected resource:%n%s%n", data);
            /*
             * Switch to a view of the data in the units of measurement.
             * Then get the unit of measurement of the first band (0).
             * If no unit is specified, fallback on dimensionless unit.
             */
            data = data.forConvertedValues(true);
            int band = 0;
            Unit<?> unit = data.getSampleDimensions().get(band).getUnits().orElse(Units.UNITY);
            /*
             * Get raster values at geographic coordinates expressed in WGS84.
             * Coordinate values in this example are in (latitude, longitude) order.
             * Any compatible coordinate reference system (CRS) can be used below,
             * Apache SIS will automatically transform to the CRS used by the raster.
             * If the raster data are three-dimensional, a 3D CRS should be specified.
             */
            System.out.println("Evaluation at some (latitude, longitude) coordinates:");
            var point = new GeneralDirectPosition(CommonCRS.WGS84.geographic());
            GridCoverage.Evaluator eval = data.evaluator();
            /*
             * If the data are three-dimensional but we still want to use two-dimensional
             * coordinates, we need to specify a default value for the temporal dimension.
             * This code set the default to slice 0 (the first slice) in dimension 2.
             * Omit this line if the data are two-dimensional or if `point` has a 3D CRS.
             */
            eval.setDefaultSlice(Map.of(2, 0L));
            /*
             * The same `Evaluator` can be reused as often as needed for evaluating
             * at many points.
             */
            point.setCoordinate(40, -10);           // 40°N 10°W
            double[] values = eval.apply(point);
            System.out.printf("- Value at %s is %g %s.%n", point, values[band], unit);

            point.setCoordinate(30, -15);           // 30°N 15°W
            values = eval.apply(point);
            System.out.printf("- Value at %s is %g %s.%n", point, values[band], unit);
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
        if (store instanceof Aggregate a) {
            System.out.println("Components found in the data store:");
            for (Resource component : a.components()) {
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

Evaluation at some (latitude, longitude) coordinates:
- Value at POINT(40 -10) is 0.188000 m.
- Value at POINT(30 -15) is 0.619000 m.
```
