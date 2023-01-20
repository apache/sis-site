---
title: Get the EPSG code or URN of an existing CRS
---

The _identifier_ of a Coordinate Reference System (CRS) object can be obtained by the `getIdentifiers()` method,
which usually return a collection of zero or one element.
If the {{% CRS %}} has been created from a Well Known Text (WKT) parsing
and the {{% WKT %}} ends with an `AUTHORITY["EPSG", "xxxx"]` ({{% WKT %}} version 1)
or `ID["EPSG", xxxx]` ({{% WKT %}} version 2) element,
then the identifier (an EPSG numerical code in this example) is the _xxxx_ value in that element.
If the {{% CRS %}} has been created from the EPSG geodetic dataset (for example by a call to `CRS.forCode("EPSG:xxxx")`),
then the identifier is the _xxxx_ code given to that method.
If the {{% CRS %}} has been created in another way, then the collection returned by the `getIdentifiers()` method
may or may not be empty depending if the program that created the {{% CRS %}} took the responsibility of providing identifiers.

If the collection of identifiers is empty, the most effective fix is to make sure that the {{% WKT %}}
contains an `AUTHORITY` or `ID` element (assuming that the {{% CRS %}} was parsed from a {{% WKT %}}).
If this is not possible, then the `org.apache.sis.referencing.IdentifiedObjects` class contains some convenience methods which may help.
In the following example, the call to `lookupEPSG(…)` will scan the EPSG database for a {{% CRS %}} equals
(ignoring metadata) to the given one. *Note that this scan is sensitive to axis order.*
Most geographic {{% CRS %}} in the EPSG database are declared with (_latitude_, _longitude_) axis order.
Consequently if the given {{% CRS %}} has (_longitude_, _latitude_) axis order, then the scan is likely to find no match.


# Direct dependencies

Maven coordinates                           | Module info                           | Remarks
------------------------------------------- | ------------------------------------- | -----------------------------
`org.apache.sis.storage:sis-referencing`    | `org.apache.sis.referencing`          |
`org.apache.sis.non-free:sis-embedded-data` | `org.apache.sis.referencing.database` | Optional. Non-Apache license.

The [EPSG dependency](../epsg.html) is not needed if the {{% WKT %}} string declares an `AUTHORITY` element.
But it is required if the `AUTHORITY` element is absent and Apache {{% SIS %}} needs to scan the EPSG database
for finding its value.


# Code example

{{< highlight java >}}
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.util.FactoryException;
import org.apache.sis.referencing.CRS;
import org.apache.sis.referencing.IdentifiedObjects;

public class LookupAuthorityCode {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws FactoryException if an error occurred while creating the CRS or searching in EPSG database.
     */
    public static void main(String[] args) throws FactoryException {
        CoordinateReferenceSystem crs = CRS.fromWKT(
        """
        PROJCRS["NTF (Paris) / zone to be discovered by the demo",
          BASEGEODCRS["NTF (Paris)",
            DATUM["Nouvelle Triangulation Francaise",
              ELLIPSOID["Clarke 1880 (IGN)", 6378249.2, 293.4660212936269]],
              PRIMEM["Paris", 2.5969213],
            UNIT["grade", 0.015707963267948967]],
          CONVERSION["Lambert zone II",
            METHOD["Lambert Conic Conformal (1SP)"],
            PARAMETER["Latitude of natural origin", 52.0],
            PARAMETER["Longitude of natural origin", 0.0],
            PARAMETER["Scale factor at natural origin", 0.99987742],
            PARAMETER["False easting", 600000.0],
            PARAMETER["False northing", 2200000.0]],
          CS[Cartesian, 2],
            AXIS["Easting (E)", east],
            AXIS["Northing (N)", north],
            LENGTHUNIT["metre", 1],
          REMARK["EPSG:27572 identifier intentionally omitted."]]
        """);

        System.out.println("Identifier declared in the CRS: "
                + IdentifiedObjects.getIdentifier(crs, null));

        System.out.println("Searching in EPSG database: "
                + IdentifiedObjects.lookupEPSG(crs));

        System.out.println("Same, but more generic: "
                + IdentifiedObjects.lookupURN(crs, null));
    }
}
{{< / highlight >}}


# Output

```
Identifier declared in the CRS: null
Searching in EPSG database: 27572
Same, but more generic: urn:ogc:def:crs:EPSG:9.9.1:27572

```
