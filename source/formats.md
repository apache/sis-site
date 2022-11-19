---
title: Data formats supported by Apache SIS
---

Apache {{% SIS %}} can read data from the formats listed below.
Some formats are supported in read-only mode, others in read/write modes.
Data may be structured as vectors or rasters,
which in Apache {{% SIS %}} are mapped to the `FeatureSet` and `GridCoverageResource` interfaces respectively.
Some formats can contain an arbitrary number of feature types or rasters,
in which case the root resource will be `Aggregate`.

<table>
  <tr>
    <th>Format</th>
    <th>Capability</th>
    <th>Type of resource</th>
  </tr><tr>
    <td>{{% CSV %}}</td>
    <td>Read</td>
    <td><code>FeatureSet</code></td>
  </tr><tr>
    <td>ESRI ASCII Grid</td>
    <td>Read/write</td>
    <td><code>GridCoverageResource</code></td>
  </tr><tr>
    <td>ESRI BIL/BIQ/BSQ</td>
    <td>Read</td>
    <td><code>GridCoverageResource</code></td>
  </tr><tr>
    <td>Folder</td>
    <td>Read/write</td>
    <td><code>Aggregate</code>, <code>FeatureSet</code>, <code>GridCoverageResource</code></td>
  </tr><tr>
    <td>GeoTIFF</td>
    <td>Read</td>
    <td><code>Aggregate</code>, <code>GridCoverageResource</code></td>
  </tr><tr>
    <td>{{% GML %}} ({{% CRS %}} only)</td>
    <td>Read/write⁽¹⁾</td>
    <td><code>Resource</code></td>
  </tr><tr>
    <td>{{% GPX %}}</td>
    <td>Read</td>
    <td><code>FeatureSet</code></td>
  </tr><tr>
    <td>{{% ISO %}} 19115 {{% XML %}}</td>
    <td>Read/write⁽¹⁾</td>
    <td><code>Resource</code></td>
  </tr><tr>
    <td>Landsat</td>
    <td>Read</td>
    <td><code>Aggregate</code>, <code>GridCoverageResource</code></td>
  </tr><tr>
    <td>NetCDF</td>
    <td>Read</td>
    <td><code>Aggregate</code>, <code>FeatureSet</code>, <code>GridCoverageResource</code></td>
  </tr><tr>
    <td>{{% SQL %}}⁽²⁾</td>
    <td>Read</td>
    <td><code>Aggregate</code>, <code>FeatureSet</code></td>
  </tr><tr>
    <td>{{% WKT %}} ({{% CRS %}} only)</td>
    <td>Read/write⁽¹⁾</td>
    <td><code>Resource</code></td>
  </tr><tr>
    <td>World File</td>
    <td>Read/write</td>
    <td><code>GridCoverageResource</code>, sometimes <code>Aggregate<code></td>
  </tr>
</table>

**Notes:**
1. {{% GML %}}, {{% WKT %}} and {{% ISO %}} 19115 cannot yet be written
throught the `DataStore` API. They require the use of specific API.
2. {{% SQL %}} is not a file format but rather a connection to a database throught {{% JDBC %}} driver.


# How to read

The easiest way to open a file in read-only mode is as below.
The `input` argument can be a `File`, `Path`, `URI`, `URL`, `InputStream`, `ReadableByteChannel`
or a {{% JDBC %}} `DataSource` (non-exhaustive list).

{{< highlight java >}}
try (DataStore store = DataStores.open(input)) {
    // Assuming that we know that the data is a single raster:
    GridCoverageResource r = (GridCoverageResource) store;

    // Subset of data could be specified here (no subset in this example):
    GridCoverage coverage = r.read(null, null);

    // Assuming that we know that the data is two-dimensional:
    RenderedImage image = coverage.render(null);
}
{{< / highlight >}}

Most of Apache {{% SIS %}} API is designed for multi-dimensional data.
When requesting a `RenderedImage`, a two-dimensional slice must be specified,
unless the data are already two-dimensional.
The two-dimensional slice can be along any dimensions.
See the [SIS developer guide](book/en/developer-guide.html#DataAccess) for more information.


# Accessing data on the cloud

Data files can be located on Amazon S3 storage service.
For accessing those data, add the following dependency to the Maven project:

{{< highlight xml >}}
<dependencies>
  <dependency>
    <groupId>org.apache.sis.cloud</groupId>
    <artifactId>sis-cloud-aws</artifactId>
    <version>{{% version %}}</version>
    <scope>runtime</scope>
  </dependency>
</dependencies>
{{< / highlight >}}

With above dependency on the classpath, it is possible to instantiate `java.nio.Path` object
with a value of the form `"S3://bucket/pseudo-directory/file"`.
Login and password can be specified in a `~/.aws/credentials` file like below
(Apache SIS does not yet manage credentials by itself).

{{< highlight config >}}
[default]
aws_access_key_id = <some value>
aws_secret_access_key = <some value>
{{< / highlight >}}

An alternative to above configuration is to set the
`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables.
See [AWS developer guide][aws-credentials] for more information.

[aws-credentials]: https://docs.aws.amazon.com/sdkref/latest/guide/file-format.html
