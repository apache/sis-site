---
title: Recommended code patterns
---

This page lists some recommended code pattern for developing or using Apache {{% SIS %}}.

{{< toc >}}




# Referencing    {#referencing}

This section lists recommended code pattern when using the `sis-referencing` module.

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

This section lists recommended code pattern when using the `sis-coverage` module.

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

This section lists recommended code pattern for internationalization.

## Specify timezone    {#timezone}

Geospatial data often cover a wide geographic area, spanning many time zones.
Timezone are sometimes specified as metadata in the header of data files to be read,
or is sometimes fixed to {{% UTC %}} by applications managing world-wide data.
Some Apache {{% SIS %}} objects have `Locale` and `TimeZone` information.
Such locale and timezone are given to `java.text.DateFormat` or `java.util.Calendar` constructors among others.

When reading dates or timestamps from a {{% JDBC %}} database,
always use the `ResultSet` method accepting a `Calendar` argument, when such method is available.
For example prefer the `getTimestamp(int, Calendar)` method instead of `getTimestamp(int)`.
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
Those "characters" are called <cite>code points</cite>.
Consequently, when iterating over characters in a string, the following pattern should be used:

```java
for (int i=0; i<string.length();) {
    final int c = string.codePointAt(i);
    // ... do some stuff ...
    i += Character.charCount(c);
}
```




# Logging    {#logging}

Apache {{% SIS %}} uses the `java.util.logging` framework.
It does not necessarily means that all SIS users are forced to use this framework,
as it is possible to use `java.util.logging` as an API and have logging redirected to another system.
For example the logging can be redirect to SLF4J by adding the `jul-to-slf4j` dependency to a project.

The logger names are usually the package name of the class emitting log messages, but not necessarily.
In particular, we do not follow this convention if the class is located in an internal package
(`org.apache.sis.internal.*`) since those packages are considered privates.
In such cases, the logger name should be the package name of the public class invoking the internal methods.
The reason for that rule is that logger names are considered part of the public API,
since developers use them for configuring their logging (verbosity, destination, <i>etc.</i>).

All logging at `Level.INFO` or above shall be targeted to users or administrators, not to developers.
In particular `Level.SEVERE` shall be reserved for critical errors that compromise the application stability —
it shall not be used for exceptions thrown while parsing user data (file or database).




# Compiler warnings    {#warnings}

When a local variable in a method has the same name as a field in the enclosing class,
some compilers emit a _"Local variable hides a field"_ warning.
This warning can be disabled with a `@SuppressWarnings("LocalVariableHidesMemberVariable")` annotation.
However, by convention Apache SIS applies this annotation only when the local variable should have the same value as the field.
Otherwise, the warning should be resolved. When a code hides a field, it should be a statement such as
`final Foo foo = this.foo;` or `final Foo foo = getFoo();` and may exist for the following reasons:

* `this.foo` is non-final and we want to make sure that it is not modified by accident in the method.
* `this.foo` is a volatile field, therefor should be read only once and cached in the method for performance.
* `getFoo()` computes the value of `this.foo` lazily.




# Javadoc    {#javadoc}

Javadoc comments are written in HTML, not Markdown, both for historical reasons and because HTML allows richer semantic.
For example, for formatting a text in italic, the Javadoc should choose the most appropriate of the following tags:

* `<em>`   for emphasis. A screen reader may pronounce the words using verbal stress.
* `<var>`  for a variable to show like a mathematical symbol.
* `<dfn>`  for introducing a word defined by the nearby sentences.
* `<cite>` for the title of a document, in particular an OGC/ISO standard.
  Apache SIS uses also this tag for the name of a geodetic object in the EPSG geodetic database,
  in which case the object definition is considered as a document.
  This tag can also be used for section titles.
* `<i>` for rendering in italic for any reason than the above reasons.
