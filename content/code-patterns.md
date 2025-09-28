---
title: Recommended code patterns for SIS users
---

This page lists some recommended code pattern for using Apache {{% SIS %}}.
Coding conventions for {{% SIS %}} developers are in [a separated page](coding-conventions.html).

{{< toc >}}




# Referencing    {#referencing}

## Never explicitly swap coordinates for axis order    {#axisOrder}

The [axis order issue](faq.html#axisOrder) causes lot of confusion,
and developers are sometimes tempted to swap their coordinate values in order to comply with some expected axis ordering.
It should never be necessary, since the Apache {{% SIS %}} referencing engine manages axis order transparently —
provided that the Coordinate Reference System (CRS) definition is accurate.
If a code needs to swap coordinates, this is probably an indication that the {{% CRS %}} has not been properly defined.
Instead of patching the coordinate values, try to make sure that the _Source CRS_ (associated to the original data)
and the _Target CRS_ (the coordinate space where to perform the work) are properly defined,
and let the referencing engine performs the conversion from the source to the target {{% CRS %}}.




# Rasters and coverages    {#coverage}

## Georeference images with affine transforms, _not_ bounding boxes    {#gridToCRS}

Many users define the geographic extent of an image by its corner locations.
This approach may be ambiguous as it does not specify whether the (<var>x</var>,<var>y</var>) axes are interchanged
(see the [axis order issue](faq.html#axisOrder)) or if the <var>y</var> axis is oriented downward.
All images in SIS shall be georeferenced by at least an affine transform (more complex transforms are also possible),
never by a rectangle or bounding box.
In the two-dimensional case, the standard `java.awt.geom.Affine­Transform` class can be used.

## Do not cast `Raster` to `WritableRaster`

Some images are writable. But modifying pixel values should be done by invoking the
`getWritableTile(…)` and `releaseWritableTile(…)` methods of `WritableRenderedImage` interface.
Do not cast directly a `Raster` to `WritableRaster` even when the cast is safe,
because some raster data may be shared by many tiles having identical content.
Furthermore changes in pixel values may be lost if {@code releaseWritableTile(…)} is not invoked.




# International    {#international}

## Specify timezone    {#timezone}

Geospatial data often cover a wide geographic area, spanning many time zones.
Timezone are sometimes specified as metadata in the header of data files to be read,
or is sometimes fixed to {{% UTC %}} by applications managing world-wide data.
Some Apache {{% SIS %}} objects have `Locale` and `TimeZone` information.
Such locale and timezone are given to `java.text.DateFormat` or `java.util.Calendar` constructors among others.

When reading dates or timestamps from a {{% JDBC %}} database,
consider using a `ResultSet` method accepting a `Calendar` argument when such method is available.
For example, prefer the `getTimestamp(int, Calendar)` method instead of `getTimestamp(int)`.
The `Calendar` object should has been created with the appropriate timezone.

## Replace underscores by spaces before sorting    {#sort}

Before to sort programmatic names for human reading, consider replacing all occurrences of the underscore character
(`'_'`) by the space character (`' '`). The ASCII value of the underscore character is greater than `'Z'` but lower
than `'a'`, which sometimes produce unexpected sort results.
For example `"Foo_bar"` is sorted _between_ `"FooBar"` and `"Foobar"`.
The space character produces more consistent sort results because its ASCII value is less than any printable character,
so `"Foo bar"` is sorted before both `"FooBar"` and `"Foobar"`.

## Loop over character sequences using code points    {#unicode-loop}

Since Java 1.5, characters are no longer restricted to 16 bits.
Some "characters" are actually represented using two consecutive `char` elements.
Those "characters" are called _code points_.
Consequently, when iterating over characters in a string, the following pattern should be used:

```java
for (int i=0; i<string.length();) {
    final int c = string.codePointAt(i);
    // ... do some stuff ...
    i += Character.charCount(c);
}
```
