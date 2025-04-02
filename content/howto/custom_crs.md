---
title: Extend with custom Coordinate Reference Systems
---

An application can associate its own authority codes to custom Coordinate Reference System (CRS) definitions.
Such custom CRS definitions can be written in Well-Known Text (WKT) format in any text file,
and declared to Apache SIS using the service provider mechanism.
After those steps, custom Coordinate Reference Systems can be created
in the same way as for EPSG definitions, with calls to `CRS.forCode(String)`.


# Direct dependencies

Maven coordinates                     | Module info
------------------------------------- | ----------------------------
`org.apache.sis.core:sis-metadata`    | `org.apache.sis.metadata`
`org.apache.sis.core:sis-referencing` | `org.apache.sis.referencing`


# Example of CRS definitions

The first step is to choose an authority name.
This page uses "MyOrg", but applications should replace by their own names.
Then, the additional CRS definitions can be written in WKT format in a text file.
The file can contain as many definitions as desired.
Each CRS definition must end with an `ID[authority, code]` element where _authority_
is the chosen authority name, and _code_ is an arbitrary code managed by that authority.
The codes are often numerical, but not necessarily:
alphanumeric codes between quotes are also accepted.
Example:

```wkt
ProjectedCRS["North Pole Azimuthal Equidistant",
 BaseGeodCRS["WGS 1984",
  Datum["World Geodetic System 1984",
   Ellipsoid["WGS 1984", 6378137, 298.257223563]],
  AngleUnit["Degree", 0.0174532925199433]],
 Conversion["North Pole Azimuthal Equidistant",
  Method["Azimuthal Equidistant (Spherical)"],
  Parameter["Latitude of natural origin", 90]],
 CS[Cartesian, 2],
  Axis["Easting (E)", east],
  Axis["Northing (N)", north],
  Unit["metre", 1],
 Id["MyOrg", 102016]]

ProjectedCRS["North Pole Stereographic",
  ...
  Id["MyOrg", 102018]]
```


## More compact definitions (non-standard)

A file with many CRS definitions may contain a lot of redundancy.
For example, the `BaseGeodCRS` and `CS` elements are often repeated verbatim in many `ProjectedCRS` definitions.
Apache SIS has a non-standard mechanism for declaring WKT fragments and reusing them in many CRS definitions.
The fragments can be declared with a `SET` directive, and reused by prefixing a fragment name with `$`.
Example for the same CRS than above:

```wkt
SET WGS84_BASE =
 BaseGeodCRS["WGS 1984",
  Datum["World Geodetic System 1984",
   Ellipsoid["WGS 1984", 6378137, 298.257223563]],
  AngleUnit["Degree", 0.0174532925199433]]

SET CARTESIAN_CS =
 CS[Cartesian, 2],
  Axis["Easting (E)", east],
  Axis["Northing (N)", north],
  Unit["metre", 1]

ProjectedCRS["North Pole Azimuthal Equidistant",
 $WGS84_BASE,
 Conversion["North Pole Azimuthal Equidistant",
  Method["Azimuthal Equidistant (Spherical)"],
  Parameter["Latitude of natural origin", 90]],
 $CARTESIAN_CS,
 Id["MyOrg", 102016]]
```

The above examples are available with more explanations in a [text file][ESRI_CRS].


# Java code

A Java application can load CRS definitions from above file like below
(see the [Javadoc][WKTDictionary] for more information).
Replace `"MyOrg"` by the chosen authority name and `"MyRegistry.txt"` by the
filename of the text file containing CRS definitions in WKT format:

```java
package org.myorg;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.apache.sis.io.wkt.WKTDictionary;
import org.apache.sis.metadata.iso.citation.DefaultCitation;
import org.opengis.referencing.crs.CRSAuthorityFactory;
import org.opengis.util.FactoryException;

public class MyRegistry extends WKTDictionary implements CRSAuthorityFactory {
    MyRegistry() throws IOException, FactoryException {
        super(new DefaultCitation("MyOrg"));
        try (BufferedReader source = Files.newBufferedReader(Path.of("MyRegistry.txt"))) {
            load(source);
        }
    }
}
```

Finally, the application needs to declare the above class as a service in its `module-info.java` file:

```java
module org.myorg {
    requires org.apache.sis.referencing;
    provides org.opengis.referencing.crs.CRSAuthorityFactory with org.myorg.MyRegistry;
}
```

Alternatively, non-modular applications can register in `META-INF/services/` instead.


# Usage

After all above steps have been completed, the `org.apache.sis.referencing.CRS` class should recognize the custom authority codes.
For example, a call to `CRS.forCode("MyOrg:102016")` should return the `ProjectedCRS` defined in above example.


[ESRI_CRS]:      https://sis.apache.org/apidocs/org.apache.sis.referencing/org/apache/sis/io/wkt/doc-files/ESRI.txt
[WKTDictionary]: https://sis.apache.org/apidocs/org.apache.sis.referencing/org/apache/sis/io/wkt/WKTDictionary.html
