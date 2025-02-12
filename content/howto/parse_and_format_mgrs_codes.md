---
title: Parse and format MGRS codes
---

The following example converts geographic coordinates to
Military Grid Reference System (MGRS) codes and conversely.
MGRS codes can be seen as a kind of GeoHash but with better properties.
Apache SIS supports also GeoHash if desired, in a way similar to this example.


# Direct dependencies

Maven coordinates                     | Module info
------------------------------------- | ----------------------------
`org.apache.sis.core:sis-referencing` | `org.apache.sis.referencing`


# Code example

Note that all geographic coordinates below express latitude *before* longitude.

```java
import org.apache.sis.geometry.DirectPosition2D;
import org.apache.sis.referencing.CommonCRS;
import org.apache.sis.referencing.gazetteer.MilitaryGridReferenceSystem;
import org.opengis.referencing.gazetteer.Location;
import org.opengis.referencing.operation.TransformException;

public class MGRS {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws TransformException if an error occurred when encoding or decoding a position.
     */
    public static void main(String[] args) throws  TransformException {
        var rs    = new MilitaryGridReferenceSystem();
        var point = new DirectPosition2D(CommonCRS.WGS84.geographic(), 40, 5);
        var coder = rs.createCoder();
        var code  = coder.encode(point);
        System.out.printf("MGRS code of %s is %s%n", point, code);

        coder.setPrecision(1000);           // Limit to a precision of 1 km.
        code = coder.encode(point);
        System.out.printf("Same code reduced to 1 km precision: %s%n", code);

        Location reverse = coder.decode(code);
        System.out.printf("Back to geographic coordinates: %s%n", reverse);
    }
}
```


# Output

The output depends on the locale.
Below is an example:

```
MGRS code of POINT(40 5) is 31TFE7072529672
Same code reduced to 1 km precision: 31TFE7029
Back to geographic coordinates:
┌─────────────────────────────────────────────────────────────────┐
│ Location type:               Grid coordinate                    │
│ Geographic identifier:       31TFE7029                          │
│ West bound:                    670,000 m    —     4°59′28″E     │
│ Representative value:          670,500 m    —     4°59′51″E     │
│ East bound:                    671,000 m    —     5°00′12″E     │
│ South bound:                 4,429,656 m    —    40°00′00″N     │
│ Representative value:        4,429,828 m    —    40°00′05″N     │
│ North bound:                 4,430,000 m    —    40°00′12″N     │
│ Coordinate reference system: WGS 84 / UTM zone 31N              │
│ Administrator:               North Atlantic Treaty Organization │
└─────────────────────────────────────────────────────────────────┘
```
