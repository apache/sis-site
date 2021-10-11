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
For launching the application, [download](downloads.html) binaries, unzip then execute (on Unix system):

{{< highlight bash >}}
bash -x apache-sis-{{% version %}}/bin/sisfx
{{< / highlight >}}

On first execution, the application will ask user to download the [JavaFX framework][JavaFX] (if not already done).
That framework is not included in the Apache {{% SIS %}} binaries for licensing reasons (it is under GPL license).
Later on, the application will offer to download the [EPSG geodetic dataset](epsg.html) when first needed.
That dataset is not included neither again for licensing reasons.
After those two steps are completed, user can see an application like below:

<div id="carousel" class="carousel slide" data-bs-ride="carousel">
  <div class="carousel-inner" style="width:983.25px; height:650px">
    <div class="carousel-item active">
      <img style="width:795.75px; height:507px" src="images/application/Summary.png" class="d-block">
      <div class="carousel-caption d-none d-md-block">
        <h5>Main metadata (title, geographic extent…) in a summary pane</h5>
      </div>
    </div>
    <div class="carousel-item">
      <img style="width:747px; height:603px" src="images/application/Visual.png" class="d-block">
      <div class="carousel-caption d-none d-md-block">
        <h5>Visualizing raster data <span style="font-size:medium">(credit: JAXA GCOM)</span></h5>
      </div>
    </div>
    <div class="carousel-item">
      <img style="width:750.75px; height:522px" src="images/application/Data.png" class="d-block">
      <div class="carousel-caption d-none d-md-block">
        <h5>Viewing raster numerical values</h5>
      </div>
    </div>
    <div class="carousel-item">
      <img style="width:795.75px; height:516.75px" src="images/application/Metadata.png" class="d-block">
      <div class="carousel-caption d-none d-md-block">
        <h5>ISO 19115 metadata as a tree</h5>
      </div>
    </div>
    <div class="carousel-item">
      <img style="width:983.25px; height:500.25px" src="images/application/Isolines.png" class="d-block">
      <div class="carousel-caption d-none d-md-block">
        <h5>Drawing isolines on a raster</h5>
      </div>
    </div>
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#carousel" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#carousel" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>


# Open files

Drag and drop some netCDF or GeoTIFF files in the explorer (the white area on the left side of main window).
Multiple files or entire directories can be dragged.
Opened files are listed and netCDF variables are shown below each file as a tree.
Files can be closed with the contextual menu (click on a file with the right mouse button).
The panel on the right side gives a summary of the selected file or variable;
more information can be read in the “Metadata” tab.
The summary panel shows the data geographic area as a blue bounding box on a world map.
If the geographic area crosses the anti-meridian (the meridian at ±180° of longitude),
the bounding box will be shown with two parts on each side of the map.
Many (but not all) classes of the Apache {{% SIS %}} library are capable to handle such situation.


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
