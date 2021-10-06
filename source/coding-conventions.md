---
title: Source code
---

This page describes some coding conventions applied in Apache {{% SIS %}} development.

{{< toc >}}

# License header    {#license}

All Java source files (`*.java`) shall begin with the current ASF license header as described in [ASF Source Header][srcheaders].
Properties source files (`*.properties`) used as inputs to some processor (e.g. the resource compiler)
shall have the same license header, but with lines prefixed by `#` instead of `*`.
Properties files distributed as-is in the JAR files can summarize the license on a single line for saving space,
as below:

{{< highlight text >}}
# Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements.
{{< / highlight >}}

# Naming convention    {#naming}

Classes that do not implement an interface are usually not prefixed, even if abstract.
Classes implementing GeoAPI interfaces usually (but not always) begin with `Abstract`, `Default`, `Simple` or `General` prefix.

* The `Abstract` prefix is used when a class is abstract according {{% ISO %}} specifications — it may or may not be be abstract in the Java sense.
* The `General` prefix is used when an implementation is designed for use in the general case,
  as opposed to other implementations specialized for a fixed number of dimensions or other conditions.
* Implementations specialized for a fixed number of dimensions are suffixed with `1D`, `2D`, `3D` or `4D` rather than being prefixed.

Example: the `GeneralEnvelope` class is an implementation of `Envelope` interface for the multi-dimensional case.
The `Envelope2D` class is another implementation of the same interface specialized for the two-dimensional case.

## Internal packages    {#internal}

All classes in `org.apache.sis.internal` sub-packages are for SIS usage only and may change without warning in any future release.
Those classes are excluded from Javadoc and will not be exported by SIS Jigsaw modules.
Those packages may be renamed after SIS upgraded to JDK 9+.

## Substitution for non-existent classes    {#substitutions}

When using a JDK 9+ class that does not exist on JDK 8, define a class of the same name in a
`org.apache.sis.internal` sub-package with the minimal amount of needed functionalities,
provided that it can be done with reasonable effort.
Otherwise just delete the JDK9-dependent code from the development branch.

# Code formatting    {#formatting}

Apache {{% SIS %}} uses the standard Java conventions, except for the 80 characters line length restriction.
The conventions listed below are guidelines. Some exceptions to those conventions can occur but should
be rare (see [exceptions to coding conventions](#tabular-formatting)).

For making merges between branches easier, refrain from doing massive code reformatting unless:

* the modified files do not yet exist on the other branches;
* or the modified lines are known to be identical on all active branches (merges work well in such cases);
* or the committer is willing to resolve the merge conflicts.

## Import statements    {#imports}

Isolate at the end of the imports section any import statements that are specific to a platform.
This separation allows any branch to re-arrange the common import statements without generating
conflicts with the platform-dependent import statements. Example:

{{< highlight java >}}
import java.io.File;
import java.util.List;
import org.opengis.metadata.Metadata;

// Branch-specific imports
import org.opengis.feature.Feature;
{{< / highlight >}}

## Spaces and line length    {#spaces}

* **Indentation:** Use a consistent space indents and never use tabs.
  + Use 4 space indents for Java files.
  + Use 2 space indents for XML files, because {{% ISO %}}/{{% OGC %}} {{% XML %}} schemas tend to have a very deep structure.
* **Space after keyword:** Put a space after `if`, `else`, `for`, `try`, `catch` and similar keywords
  (not after method names).
* **Trailing Whitespaces:** Remove all trailing whitespaces.
  + Eclipse users can use the _Source_ - _Cleanup_ option to accomplish this.
  + NetBeans users can use the use the _Source_ - _Remove trailing spaces_ on a file-by-file basis,
    or set the _Preferences_ - _Editor_ - _On Save_ - _Remove trailing whitespaces_ option.
* **Line wrapping:** Use 120-column line width for Java code and Javadoc.
  Some exceptions to this rule may exist for preserving tabular structures, but should be rare.

## Brackets    {#brackets}

* **Curly brackets:** The `{` and `}` brackets are mandatory for `if`, `else`, `while` and other blocks,
  except if the instruction after the keyword is on the same line (e.g. `else if`).

## Member declarations    {#declarations}

* Class, method and field declarations shall use the keywords in the following order.
  This is known as the "customary order" in the [Java Language Specification][JLS-order]:
  + `public`, `protected` or `private`,
  + `abstract` or `static`,
  + `final`,
  + `strictfp` (should be applied on all test classes).
* Member fields do not have any particular prefix (no `m_` prefix).

## Exceptions to coding conventions    {#tabular-formatting}

Many mathematical operations in a two-dimensional space (or more) have symmetry.
Formatting the code in a way that emphase their symmetrical nature, for example
aligning identical terms in columns, can help to understand the overall pattern
and to identify bugs. Example:

{{< highlight java >}}
if (x < xmin) xmin = x;
if (x > xmax) xmax = x;
if (y < ymin) ymin = y;
if (y > ymax) ymax = y;
{{< / highlight >}}

The decision to use standard or tabular format is made on a case-by-case basis.
Of course, tabular format shall not be abused.

# Documentation formatting    {#javadoc}

Apache {{% SIS %}} uses the standard Javadoc conventions, except for the 80 characters line length restriction.
Javadoc lines should not exceed 120 characters, but exceptions to this rule may exist for preserving the
structure of `<table>` elements.

## Javadoc annotations    {#javadoc-tags}

SIS uses standard javadoc annotations. The meaning of some tags are refined as below:

* `@since`   - the SIS version when the annotated element (class, method, <i>etc.</i>) was first introduced.
* `@version` - the last SIS version when the code of the annotated class got a significant change.
* `@author`  - developer name in <var>FirstName</var> <var>LastName</var> (<var>Organization</var>) format.
  A separated `@author` tag is added for each developer.
  The intent is to allow other developers to know to who to ask questions if needed.

In addition, the `sis-build-helper` modules provides the following custom javadoc taglets:

Javadoc tag    | Description
-------------- | -------------------------------------------------------------------------------------------
`@module`      | Create links to the module where the class is defined, source code and Maven artifacts.
`{@include}`   | Include the content of a given HTML file below a `<h2>` section having the given title.
`{@preformat}` | An inline taglet for pre-formatted text. The first word inside the taglet shall be one of `java`, `xml`, `sql`, `wkt`, `text`, `math` or `shell`.

## HTML elements    {#html}

HTML tags and entities shall be used only when there is no equivalent Javadoc tag.
For example:

* Instead of "`<code>✎</code>`", use "`{@code ✎}`".
* Instead of "`a &lt; b &lt; c`", use "`{@literal a < b < c}`".
* Instead of "`<pre>✎</pre>`" for a Java listing, use "`{@preformat java ✎}`"
  (this Javadoc tag is specific to Apache {{% SIS %}} — see above table).

### Paragraphs    {#paragraph}

Usages of the `<p>` tag should be relatively rare, since we use CSS styles (see below)
as much as possible for controlling the margin between elements like lists and tables.
Do **not** use `<p>` for the first paragraph in a package, class or member documentation,
or for the first paragraph after a `</ul>`, `</ol>`, `</table>`, `</blockquote>`, `</pre>`,
or `{@preformat}` element.
The `<p>` tag shall be used only for separating a new paragraph from a previous one.
In such cases, `<p>` shall have a matching `</p>` tag at the paragraph end in order to form valid HTML.

### Javadoc CSS    {#css}

Avoid using HTML attributes other than `class` as much as possible.
Instead, rely on styling. Some HTML tags having a style definition in Apache {{% SIS %}} are:

HTML tag                  | Description
------------------------- | -------------------------------------------------------------------------------------------
`<div class="note">`      | Indented text with smaller font, used for notes or examples.
`<div class="warning">`   | Text in red color, used for warning about probable API changes.
`<ul>` and `<ol>`         | Default list styles with few space between items (suitable for compact lists).
`<ul class="verbose">`    | A list style with space between items. Used for lists having verbose (multi-lines) items.
`<table class="compact">` | Table without border and no space between rows. Used for lists with columns alignment.
`<table class="sis">`     | Table with a border, blue headers, light background and some space between columns.
`<th class="hsep">`       | In SIS tables, draw a line on the top border. Used for drawing table section separators.
`<th class="sep">`        | In SIS tables, draw a bright line on the left border. Used for drawing column separators.
`<td class="sep">`        | In SIS tables, draw a bright line on the left border. Used for drawing column separators.

## MathML elements    {#mathml}

The source code occasionally uses MathML for formulas that are difficult to render with only Unicode characters.
PNG images are not extensively used for formulas because they are difficult to edit after creation,
and their content are invisible to search operations (for example when a variable is renamed).
For examples of MathML usage in SIS, search for the `<math …>` XML tag in Java source files
(note: there is also legacy `{@preformat math …}` custom Javadoc tags, but they may be phased out as MathML adoption increase).
For an introduction to MathML, see:

* [MathML learn & use][mathml-W3C] on W3C
* [Working with MathML][mathml-wolfram] on Wolfram Mathematica

MathML is supported natively in Firefox, Safari and Opera.
Internet Explorer users need to [install a plugin][mathml-plugin-ie].
Firefox users can optionally install the [fonts for Mozilla's MathML engine][mathml-fonts] for better results.
Note that a [JavaScript display engine][mathml-mathjax] is available for all browsers, but not yet used by SIS.

[srcheaders]:       http://www.apache.org/legal/src-headers.html
[JLS-order]:        https://docs.oracle.com/javase/specs/jls/se8/html/jls-8.html#jls-8.1.1
[mathml-W3C]:       https://www.w3.org/Math/
[mathml-wolfram]:   https://reference.wolfram.com/language/XML/tutorial/MathML.html
[mathml-fonts]:     https://developer.mozilla.org/en-US/docs/Web/MathML/Fonts
[mathml-plugin-ie]: https://info.wiris.com/mathplayer-info
[mathml-mathjax]:   https://www.mathjax.org/
