---
title: New contributor
---

Improving and extending SIS requires extensive knowledge of geographic information science,
object oriented programming, the Java language, and of the library itself. Contributors should
expect that they will need to learn a great deal before being able to become productive.
However, the effort required to become productive should improve the contributor's understanding
and knowledge of geographic information systems, of geodetic and geographic science, and of
effective computer programming.

This document is expected to evolve as the SIS project develops its own mode of operation.

{{< toc >}}

# Background Knowledge    {#knowledge}

All contributors arrive to the project with different knowledge bases, some with scientific
backgrounds, some with a background in computer science, and others with geographic backgrounds
or even no training in geographic information science at all. By sharing the richness of our
individual backgrounds we have acquired a list of subjects which we consider critical to fully
understanding the SIS project. New contributors are highly encouraged to explore these
areas if they have no or little knowledge of them.

## Geographic Information Systems and Science    {#science}

While a background in the field is not required, it nonetheless proves exceedingly useful along the way.
GIS has developed its own language and has particular concerns which return frequently.
Issues of spatial representation, data size, spatial scale, information workflows and other topics
arise frequently and are worth understanding.

A good general introduction to the field is the book _Geographic Information Systems and Science_
by Paul A. Longley, Michael F. Goodchild, David J. Maguire and David W. Rhind published in its
second edition by John Wiley and Sons Ltd. in 2004.
Apache SIS also provides an introduction in the [Developer guide](book/en/developer-guide.html).

## The ISO/OGC Geospatial Model    {#ogc}

SIS builds on the standards developed through a collaboration between the International
Organization for Standardization ({{< abbr title="International Organization for Standardization" text="ISO" >}}) and the Open Geospatial Consortium ({{< abbr title="Open Geospatial Consortium" text="OGC" >}}).
Contributors to SIS should have at least a basic understanding of the model developed in the
{{< abbr title="International Organization for Standardization" text="ISO" >}} 19000 series of specifications, starting with the Abstract model and working through the
_Feature_ model. While the {{< abbr title="International Organization for Standardization" text="ISO" >}} specifications are sold, the {{< abbr title="Open Geospatial Consortium" text="OGC" >}} releases its own, essentially
identical versions of standards which have evolved from the collaboration. The {{< abbr title="Open Geospatial Consortium" text="OGC" >}} specifications
are available for the [{{< abbr title="Open Geospatial Consortium" text="OGC" >}} standards and specification][standards] page.

As time progresses, we hope to develop documentation material to introduce the {{< abbr title="International Organization for Standardization" text="ISO" >}} 19000 specification series.
Most of the documentation provided by SIS can be found in the [Developer guide](book/en/developer-guide.html).

## Object-Oriented Programming in Java    {#java}

SIS is a library designed to be used by other programmers. To play this role effectively,
SIS must consider the various ways that users can reuse Java code: not only through object
instantiation and method calls but also through inheritance. SIS pays special attention to
accessibility constraints ensuring that only the classes and methods which are offered for
use are publicly accessible and that these methods are fully and correctly documented in javadoc.

Contributors are highly recommended to read the book _Effective Java_ by Joshua Block, published
in its second edition by Addison-Wesley in 2008. The book explains the importance of certain
elements in the Java language and discusses subtleties of the language and its use.
Most importantly, the book reveals the full scope a programmer must consider when developing a code library.

The [Recommended code patterns](code-patterns.html) page also discusses some elements
of special importance to Apache SIS.

## Mathematical Background    {#math}

SIS frequently deals with complex calculations using relatively simple mathematics of
trigonometry and matrix algebra. The coordinate operations of the Referencing modules involve
trigonometric transformations on a flattened ellipsoid of rotation, the image transformations in
the Coverage modules and in the Rendering system involve extensive use of Affine transforms, and
the Analytic modules often use their own mathematical operations.
These mathematics cannot be simplified — they reflect the richness of the world around us.

Affine transformations are not particularly complex but critically important both to the
geo-referencing operations of the Referencing modules and to the image transformations of the
Coverage modules. Affines transform coordinates through translation, scaling, rotations, and
shear, though this latter component is used infrequently in the library. Mathematically,
affine transformations are usually applied as a matrix operation applied to a coordinate vector.
There are numerous introductions to affine transformations available on the World Wide Web since
the concept is central to all graphics programming.

## The GeoAPI Interfaces    {#geoapi}

SIS is build partially as an implementation of the GeoAPI interfaces. GeoAPI defines a set
of objects offering particular methods thereby providing an interpretation of the {{< abbr title="International Organization for Standardization" text="ISO" >}}/{{< abbr title="Open Geospatial Consortium" text="OGC" >}}
standards in the Java language. GeoAPI therefore defines the core of the model implemented
by Apache SIS.

GeoAPI can most easily be learned by exploring the [GeoAPI Javadoc][geoapi].

## The SIS library modules    {#modules}

Contributors should gain a basic understanding of the core library including the separation into modules,
the functionality available in the base module, and the functioning of the modules of interest.

[standards]: https://www.ogc.org/standards
[geoapi]:    https://www.geoapi.org/3.0/javadoc/index.html
