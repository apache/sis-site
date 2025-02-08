---
title: JavaFX application
---

Apache {{% SIS %}} provides an optional JavaFX application for testing SIS capability to read,
transform and visualize data files.
(note: a [command line interface](command-line.html) is also available).
The graphical application is in early development stage and very far from providing
all services that we can expect from a Geographic Information System (GIS).
Furthermore this application covers a very small subset of Apache {{% SIS %}} capabilities.
But it can give an idea of what is available there.

{{< toc >}}

# Installation    {#install}

Select "Apache {{% SIS %}} {{% version %}} binary" from the [downloads page](downloads.html) an unzip in any directory.
See the [command line](command-line.html) page for a description of the directory structure.
For launching the application, execute (on Unix system):

```bash
./apache-sis-{{% version %}}/bin/sisfx
```

On first execution, the application will ask user to download the [JavaFX framework][JavaFX] (if not already done).
That framework is not included in the Apache {{% SIS %}} binaries for licensing reasons (it is under GPL license).
Later on, the application will offer to download the [EPSG geodetic dataset](epsg.html) when first needed.
That dataset is not included neither again for licensing reasons.

## Troubleshooting

If the application fails to start and the error message said _"Error initializing QuantumRenderer: no suitable pipeline found"_,
then the JavaFX SDK is probably for the wrong platform.
For example users on Intel platforms need to choose `x64` (not `aarch64`) on the download page.

## First look

After those two steps are completed, user can see an application like below
(click on an image to expand):

<table class="images">
  <tr>
    <td><img style="width:265.25px; height:169.00px" src="images/application/Summary.png" title="Main metadata (title, geographic extent…) in a summary pane"></td>
    <td><img style="width:249.00px; height:201.00px" src="images/application/Visual.png"  title="Visualizing raster data (credit: JAXA GCOM)"></td>
    <td><img style="width:250.25px; height:174.00px" src="images/application/Data.png"    title="Viewing raster numerical values"></td>
  </tr><tr>
    <td><img style="width:265.25px; height:172.25px" src="images/application/Metadata.png" title="ISO 19115 metadata as a tree"></td>
    <td><img style="width:327.75px; height:166.75px" src="images/application/Isolines.png" title="Drawing isolines on a raster"></td>
    <td></td>
  </tr>
</table>


# Open files

Drag and drop some netCDF, GeoTIFF, ASCII Grid or World Files in the explorer
(the white area on the left side of main window).
Multiple files or entire directories can be dragged.
Opened files are listed and variables are shown below each file as a tree.
Files can be closed with the contextual menu (click on a file with the right mouse button).
The panel on the right side gives a summary of the selected file or variable;
more information can be read in the “Metadata” tab.
The summary panel shows the data geographic area as a blue bounding box on a world map.
If the geographic area crosses the anti-meridian (the meridian at ±180° of longitude),
the bounding box will be shown with two parts on each side of the map.
Many (but not all) classes of the Apache {{% SIS %}} library are capable to handle such situation.

## Data on cloud

Apache {{% SIS %}} can open data on Amazon S3.
This is not enabled by default in the JavaFX application because of the large amount of dependencies required.
An option for downloading the dependencies may be provided in a future release.
In the meantime, SIS has to be built from the source for enabling this functionality.

## File size limit

There is usually no size limit when viewing only the metadata, because only the file headers are read at that time.
When viewing the data, there is no size limit if the data are pyramided and tiled with tiles of reasonable size,
because the application loads only the tiles needed for the area being displayed.
An example of file format supporting tiling is GeoTIFF.
If a format does not support tiling (e.g. netCDF-3) or if data does not use the tiling capability of the format,
then the data are fully loaded as one big tile.
A future version of the JavaFX application may allow to load only a subset of the data
(the Apache {{% SIS %}} API already allows that).


# Explore metadata

Two kinds of information can be explored: the metadata and the data.
The metadata provide information necessary for understanding the data.
Metadata answer questions such as “what”, “where”, “when” and “how”.
Apache {{% SIS %}} adopts the {{% ISO %}} 19115 — Geographic information — Metadata international standard
as a universal structure for describing all data that the application can read, regardless data format.
The content of selected file can be viewed by clicking on the “Metadata” tab.
Contextual menu allows to export selected nodes and its children to various formats,
including {{% ISO %}} 19115-3 (a {{% XML %}} format) and Geographic Markup Language (GML).


# View data

Data can be viewed in two ways: either as an image, or as tabular values.
Those two visualization modes are provided by “Visual” and “Data” tabs respectively.
The "Visual" tab visualizes the selected variable.
The image is initially shown in the native Coordinate Reference System (CRS) of the data, but can be reprojected.
User can pan the raster, zoom with mouse wheel or rotate with keyboard (Alt + arrows).
Colors can be modified by clicking on the "Colors" title on the left side.

Raster data can use more than one value for representing missing data.
The kinds of values are listed in the "Category" section.
Example of missing value categories are: "Missing", "Retrieval error", "Cloud" or "Land".
Each kind of missing value can be assigned a different color by clicking the corresponding cell in the "Colors" column.

## Coordinates and data values under mouse cursor

By moving mouse cursor over the image, user can see the value and spatial coordinates of the pixel under cursor.
Raster values are shown in their units of measurement (e.g. "°C") if sufficient information is available in metadata.
If the mouse cursor is over a missing value, the category name (e.g. "Cloud") will be shown.
The Coordinate Reference System (CRS) used by the status bar can be changed independently of image {{% CRS %}}
by clicking with the right mouse button on the status bar.
For example it is possible to view the image in a Mercator projection
and still show mouse positions with geographic coordinates.

## Coordinates precision

The coordinates shown on the status bar use the minimal amount of fraction digits
needed for separating two screen pixels at current zoom level.
This precision varies with map scales:
user can see the number of fraction digits increasing during zoom-in, and conversely during zoom-out.
This calculation works even if the image and the status bar use different map projections.
For example the number of fraction digits may increase when the mouse moves toward a pole
(depending on the map projections).

The process of transforming mouse coordinates to raster coordinates to status bar coordinates may be complex.
If that chain involves a datum change, then the results have an uncertainty
which can be anything between a few millimeters to a kilometer.
If the uncertainty is smaller than the precision of coordinates shown in the status bar,
then the accuracy is not provided.
But if user zooms enough, the coordinate precision may become finer than positional accuracy.
In that case a text such "± 1 m" appears.

## Raster reprojection

The raster can be reprojected to different Coordinate Reference Systems (CRS).
For applying a reprojection, click with the right mouse button somewhere on the image.
The click location is significant, because Apache {{% SIS %}} will adjust zoom and rotation
after reprojection for minimizing visual changes around that point.
The contextual menu offers two ways to choose a {{% CRS %}}:
the first way is the “Reference system” menu item, which offers a list of predefined {{% CRS %}}.
If the desired {{% CRS %}} is not in the initial short list,
click on “Others” for choosing among the +6000 {{% CRS %}} supported by Apache {{% SIS %}}.
(Note: this list is available only if the [EPSG geodetic dataset](epsg.html) has been installed,
which is not the case by default for licensing reason).
The “Filter” field can help to find the desired {{% CRS %}}.
The dialog box shows a warning in red if the selected {{% CRS %}}
does not have a domain of validity intersecting the raster geographic area.

The second way to select a {{% CRS %}} is the “Centered projection” menu item.
It offers projections configured for the location where mouse click occurred.
For example if the “Universal Transverse Mercator” (UTM) sub-menu is selected,
then Apache {{% SIS %}} will chose automatically the appropriate UTM zone.
It often makes shapes more recognizable.
Another choice offered by “Centered projection” menu item is “Azimuthal equidistant”.
When choosing this sub-menu item, the mouse click position become the map projection center.
Distances and angles measured from that point are corrects
(but only from that point, not between arbitrary pair of points).


[JavaFX]: https://openjfx.io/
