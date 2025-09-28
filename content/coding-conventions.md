---
title: Coding conventions for SIS developers
---

This page describes some coding conventions applied in Apache {{% SIS %}} development.
Note that the [recommended code patterns for SIS users](code-patterns.html) apply also to {{% SIS %}} development.

{{< toc >}}




# License header    {#license}

All Java source files (`*.java`) shall begin with the current ASF license header as described in [ASF Source Header][srcheaders].
Properties source files (`*.properties`) used as inputs to some processor (e.g. the resource compiler)
shall have the same license header, but with lines prefixed by `#` instead of `*`.
Properties files distributed as-is in the JAR files can summarize the license on a single line for saving space,
as below:

```
# Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements.
```




# Public API    {#public-api}

The public API is made of all public types in all exported packages,
i.e. packages declared in non-qualified `exports` statements in the `module-info.java` file.
All other classes are for SIS usage only and may change without warning in any future release.
Those classes are excluded from Javadoc and normally not accessible to users.
Contrarily to previous SIS versions, there is no longer any particular naming convention for internal package.
They may or may not have `internal` in their name.

## Substitution for non-available JDK classes    {#substitutions}

When using a JDK 12+ class that does not exist on JDK 11, define a class such as `JDK12` in
the `org.apache.sis.pending.jdk` package with the minimal amount of needed functionalities,
provided that it can be done with reasonable effort.
This packages is internal (non-exported).




# Naming convention    {#naming}

Classes implementing GeoAPI interfaces usually (but not always) begin with `Abstract`, `Default`, `Simple` or `General` prefix.

* The `Abstract` prefix is used when a class is abstract according {{% ISO %}} specifications — it may or may not be be abstract in the Java sense.
* The `General` prefix is used when an implementation is designed for use in the general case,
  as opposed to other implementations specialized for a fixed number of dimensions or other conditions.
* Implementations specialized for a fixed number of dimensions are suffixed with `1D`, `2D`, `3D` or `4D` rather than being prefixed.

Example: the `GeneralEnvelope` class is an implementation of `Envelope` interface for the multi-dimensional case.
The `Envelope2D` class is another implementation of the same interface specialized for the two-dimensional case.

Member fields do not have any particular prefix (no `m_` prefix).




# Code formatting    {#formatting}

Apache {{% SIS %}} uses the standard Java conventions,
except the 80 characters line length restriction which is relaxed.
The conventions listed below are guidelines.
Some [exceptions to coding conventions](#tabular-formatting) can occur but should be rare.
For making merges between branches easier, refrain from doing massive code reformatting unless:

* the modified files do not yet exist on the other branches;
* or the modified lines are known to be identical on all active branches (merges work well in such cases);
* or the committer is willing to resolve the merge conflicts.

## Import statements    {#imports}

There is currently no strict rule about the order of `import` statements in Apache SIS code base, except one:
if a class is different in the `main`, `geoapi-3.1` and `geoapi-4.0` branches, and if those differences imply
different import statements, then the imports that are different should be grouped last with a comment.
Example:

```java
import java.io.File;
import java.util.List;
import org.opengis.metadata.Metadata;

// Specific to the geoapi-3.1 and geoapi-4.0 branches:
import org.opengis.filter.Filter;
import org.opengis.filter.Expression;
```

The purpose is to reduce the number of conflicts during the merges between branches.
The import statements can be rearranged automatically by the `ReorganizeImports` class in `buildSrc`.
This tool requires checkouts of all three branches (`main`, `geoapi-3.1` and `geoapi-4.0`) in order
to identify which imports are branch-specific.

## Spaces, brackets and keywords    {#spaces}

* **Indentation:**
  + Use 4 space indents (not tab) for Java files.
  + Use 2 space indents for XML files, because {{% ISO %}}/{{% OGC %}} {{% XML %}} schemas tend to have a very deep structure.
* **Spaces:**
  * Put a space after `if`, `else`, `for`, `try`, `catch` and similar keywords (not after method names).
  * Remove all trailing whitespaces at the end of lines.
    + Eclipse users can use the _Source_ - _Cleanup_ option to accomplish this.
    + NetBeans users can use the use the _Source_ - _Remove trailing spaces_ on a file-by-file basis,
      or set the _Preferences_ - _Editor_ - _On Save_ - _Remove trailing whitespaces_ option.
* **Line wrapping:**
  *  Use 120-column line width for Java code and Javadoc.
  * Some exceptions to above rule may exist for preserving tabular structures, but should be rare.
* **Curly brackets:**
  * The `{` and `}` brackets are mandatory for `if`, `else`, `while` and other blocks,
    except if the instruction after the keyword is on the same line (e.g. `else if`).
* **Member declarations:**
  * Keywords should appear in the "customary order" of the [Java Language Specification][JLS-order]:
    `public`, `protected` or `private`, then `abstract` or `static`, finally `final`.
  * The `var` keyword should be used only if the type is obvious on the same line,
    e.g. before a `new` statement or a cast.

## Exceptions to coding conventions    {#tabular-formatting}

Many mathematical operations in a two-dimensional space (or more) have symmetry.
Formatting the code in a way that emphase their symmetrical nature, for example
aligning identical terms in columns, can help to understand the overall pattern
and to identify bugs. Example:

```java
if (x < xmin) xmin = x;
if (x > xmax) xmax = x;
if (y < ymin) ymin = y;
if (y > ymax) ymax = y;
```

The `var` keyword may also be used aven when the type is not obvious if doing so simplify merges between branches.
For example, a method returning `Feature` on the GeoAPI 3.1 branch may return `AbstractFeature` on the GeoAPI 3.0 branch.
The decision to use standard or tabular format is made on a case-by-case basis.
Of course, tabular format shall not be abused.




# Documentation formatting    {#javadoc}

Javadoc comments are written in HTML, not Markdown,
both for historical reasons and because HTML allows richer semantic.
Apache {{% SIS %}} uses the standard Javadoc conventions,
except for the 80 characters line length restriction which is relaxed.
Javadoc lines should not exceed 120 characters,
but exceptions to this rule may exist for preserving the structure of `<table>` elements.

## Javadoc annotations    {#javadoc-tags}

SIS uses standard javadoc annotations. The meaning of some tags are refined as below:

* `@since`   - the SIS version when the annotated element (class, method, <i>etc.</i>) was first introduced in public API.
* `@version` - the last SIS version when the code of the annotated class got a significant change.
* `@author`  - developer name in <var>FirstName</var> <var>LastName</var> (<var>Organization</var>) format.
  A separated `@author` tag is added for each developer.
  The intent is to allow other developers to know to who to ask questions if needed.

The `@since` and `@version` Javadoc tags should be used only on classes, interfaces, enumerations, methods or fields
that are part of public API. They should not be put on package-private classes or classes in non-exported packages.
The reason is that non-public classes can be moved, splitted or merged without warning,
which gives confusing meaning to the `@since` tag.
Furthermore, restricting the use of those tags to public API is also a way to remind developers
that the class that they are editing is part of public API, so backward-compatibility concerns apply.

In addition, the Java code in `buildSrc` provides the following custom javadoc taglets:

Javadoc tag    | Description
-------------- | -------------------------------------------------------------------------------------------
`{@include}`   | Include the content of a given HTML file below a `<h2>` section having the given title.

## HTML elements    {#html}

HTML tags and entities shall be used only when there is no equivalent Javadoc tag.
For example:

* Instead of "`<code>Foo</code>`", use "`{@code Foo}`".
* Instead of "`a &lt; b &lt; c`", use "`{@literal a < b < c}`".
* Instead of "`<pre>Foo</pre>`" for a Java listing, use "`{@snippet lang=java : Foo}`".

When many HTML tags produce the same visual effect, choose the one with proper semantic.
For example, for formatting a text in italic, choose the most appropriate of the following tags:

* `<em>`   for emphasis. A screen reader may pronounce the words using verbal stress.
* `<var>`  for a variable to show like a mathematical symbol.
* `<dfn>`  for introducing a word defined by the nearby sentences.
* `<cite>` for the title of a document, in particular an OGC/ISO standard.
  Apache SIS uses also this tag for the name of a geodetic object in the EPSG geodetic database,
  in which case the object definition is considered as a document.
  This tag can also be used for section titles.
* `<i>` for rendering in italic for any reason other than the above reasons.

### Paragraphs    {#paragraph}

Usages of the `<p>` tag should be relatively rare, since we use CSS styles (see below)
as much as possible for controlling the margin between elements like lists and tables.
Do **not** use `<p>` for the first paragraph in a package, class or member documentation,
or for the first paragraph after a `</ul>`, `</ol>`, `</table>`, `</blockquote>`, `</pre>`,
or `{@snippet}` element.
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
For examples of MathML usage in SIS, search for the `<math …>` XML tag in Java source files.
For an introduction to MathML, see:

* [MathML learn & use][mathml-W3C] on W3C
* [Working with MathML][mathml-wolfram] on Wolfram Mathematica

MathML is supported natively in Firefox, Safari and Opera.
Internet Explorer users need to [install a plugin][mathml-plugin-ie].
Firefox users can optionally install the [fonts for Mozilla's MathML engine][mathml-fonts] for better results.
Note that a [JavaScript display engine][mathml-mathjax] is available for all browsers, but not yet used by SIS.




# Compiler warnings    {#warnings}

When a local variable in a method has the same name as a field in the enclosing class,
some compilers emit a _"Local variable hides a field"_ warning.
This warning can be disabled with a `@SuppressWarnings` annotation.
However, by convention Apache SIS applies this annotation only when the local variable should have the same value as the field.
Otherwise, the warning should be resolved by renaming a variable.
When a code hides a field, it should be a statement such as:

```java
@SuppressWarnings("LocalVariableHidesMemberVariable")
final Foo foo = this.foo;   // May also be `getFoo()`
```

Those statements may exist for the following reasons:

* `this.foo` is non-final and the developer wants to make sure that the field is not modified by accident in the method.
* `this.foo` is a volatile field, therefore should be read only once and cached in the method for performance reasons.
* `getFoo()` computes the value of `this.foo` lazily.




# Logging    {#logging}

Apache {{% SIS %}} uses the `java.util.logging` framework.
It does not necessarily mean that all SIS users are forced to use this framework,
as it is possible to use `java.util.logging` as an API and have logging redirected to another system.
For example, the logging can be redirect to SLF4J by adding the `jul-to-slf4j` dependency to a project.

The logger names are usually the package name of the class emitting log messages, but not necessarily.
In particular, we do not follow this convention if the class is located in an internal package
(`org.apache.sis.internal.*`) since those packages are considered private.
In such cases, the logger name should be the package name of the public class invoking the internal method.
The reason for that rule is that logger names are considered part of the public API,
since developers use them for configuring their logging (verbosity, destination, <i>etc.</i>).

All logging at `Level.INFO` or above shall be targeted to users or administrators, not to developers.
In particular `Level.SEVERE` shall be reserved for critical errors that compromise the application stability —
it shall not be used for exceptions thrown while parsing user data (file or database).




[srcheaders]:       https://www.apache.org/legal/src-headers.html
[JLS-order]:        https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-8.1.1
[mathml-W3C]:       https://www.w3.org/Math/
[mathml-wolfram]:   https://reference.wolfram.com/language/XML/tutorial/MathML.html
[mathml-fonts]:     https://developer.mozilla.org/en-US/docs/Web/MathML/Fonts
[mathml-plugin-ie]: https://info.wiris.com/mathplayer-info
[mathml-mathjax]:   https://www.mathjax.org/
