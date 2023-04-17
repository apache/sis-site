---
title: Resample a raster
---

This example reprojects a raster to a different Coordinate Reference System (CRS).
This example assumes a preloaded two-dimensional raster.
For the loading part,
see [read from a netCDF file](read_netcdf.html)
or [read from a GeoTIFF file](read_geotiff.html)
code examples.


# Direct dependencies

Maven coordinates                           | Module info                           | Remarks
------------------------------------------- | ------------------------------------- | -------------------
`org.apache.sis.code:sis-feature`           | `org.apache.sis.feature`              |
`org.apache.sis.non-free:sis-embedded-data` | `org.apache.sis.referencing.database` | Non-Apache license.

The [EPSG dependency](../epsg.html) is necessary for this example
because a Coordinate Reference System (CRS) is instantiated from its EPSG code.
But it would also be possible to specify a CRS without EPSG code,
for example using Well Known Text (WKT) format.


# Code example

The file name in following code need to be updated for yours data.

{{< highlight java >}}
import java.awt.image.ImagingOpException;
import org.apache.sis.coverage.grid.GridCoverage;
import org.apache.sis.coverage.grid.GridCoverageProcessor;
import org.apache.sis.image.Interpolation;
import org.apache.sis.referencing.CRS;
import org.opengis.referencing.operation.TransformException;
import org.opengis.util.FactoryException;

public class ResampleRaster {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws FactoryException   if an error occurred while creating the Coordinate Reference System (CRS).
     * @throws TransformException if an error occurred while transforming coordinates to the target CRS.
     * @throws ImagingOpException unchecked exception thrown if an error occurred while resampling a tile.
     */
    public static void main(String[] args) throws FactoryException, TransformException {
        GridCoverage data = ...;      // See "Read netCDF" or "Read GeoTIFF" code examples.
        System.out.printf("Information about the selected image:%n%s%n", data.getGridGeometry());
        /*
         * Reproject to "WGS 84 / World Mercator" (EPSG::3395) using bilinear interpolation.
         * This example lets Apache SIS choose the output grid size and resolution.
         * But it is possible to specify those aspects if desired.
         */
        var processor = new GridCoverageProcessor();
        processor.setInterpolation(Interpolation.BILINEAR);
        data = processor.resample(data, CRS.forCode("EPSG::3395"));
        System.out.printf("Information about the image after reprojection:%n%s%n", data.getGridGeometry());
    }
}
{{< / highlight >}}


# Output

The output depends on the raster data and the locale.
Below is an example:

```
Information about the image after reprojection:
GridGeometry
  ├─Grid extent
  │   ├─Column: [0 … 8191] (8192 cells)
  │   └─Row:    [0 … 8191] (8192 cells)
  ├─Geographic extent
  │   ├─Lower bound:  48°59′20″N  02°31′33″E
  │   └─Upper bound:  49°01′08″N  02°34′16″E
  ├─Envelope
  │   ├─Easting:    465,341.6 … 468,618.39999999997  ∆E = 0.4 m
  │   └─Northing: 5,426,352.8 … 5,429,629.6          ∆N = 0.4 m
  ├─Coordinate reference system
  │   └─EPSG:32631 — WGS 84 / UTM zone 31N
  └─Conversion (origin in a cell center)
      └─┌                      ┐
        │ 0.4   0     465341.8 │
        │ 0    -0.4  5429629.4 │
        │ 0     0          1   │
        └                      ┘

Information about the image after reprojection:
GridGeometry
  ├─Grid extent
  │   ├─Dimension 0: [0 … 8239] (8240 cells)
  │   └─Dimension 1: [0 … 8240] (8241 cells)
  ├─Geographic extent
  │   ├─Lower bound:  48°59′20″N  02°31′33″E
  │   └─Upper bound:  49°01′08″N  02°34′16″E
  ├─Envelope
  │   ├─Easting:   281,190.4273301751 … 286,207.11249780044  ∆E = 0.60882102 m
  │   └─Northing: 6,240,752.860382801 … 6,245,770.154371441  ∆N = 0.60882102 m
  ├─Coordinate reference system
  │   └─EPSG:3395 — WGS 84 / World Mercator
  └─Conversion (origin in a cell center)
      └─┌                                                            ┐
        │ 0.6088210154885099   0                  281190.73174068285 │
        │ 0                   -0.60882101548851  6245769.8499609330  │
        │ 0                    0                       1             │
        └                                                            ┘
```
