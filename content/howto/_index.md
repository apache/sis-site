---
title: How to
---

Java code examples for performing some tasks with Apache {{% SIS %}}.
The examples are grouped in the following sections:

{{< toc >}}


# Referencing by coordinates    {#referencing}

* [Instantiate a Universal Transverse Mercator (UTM) projection](howto/instantiate_utm_projection.html)
* [Instantiate a Pseudo Mercator (a.k.a. Google) projection](faq.html#google)
* [Get the EPSG code or URN of an existing reference system](howto/lookup_crs_urn.html)
* [Transform points between two reference systems](howto/transform_coordinates.html)
* [Transform envelopes between two reference systems](howto/transform_envelopes.html)
* [Union or intersection of envelopes in different reference systems](howto/envelopes_in_different_crs.html)
* [Determine if two reference systems are functionally equal](howto/crs_equality.html)


# Metadata    {#metadata}

* [Get the geographic bounding box of a data file](howto/geographic_bounding_box.html)
* [Export metadata of a data file to standard XML](howto/export_metadata_to_xml.html)


# Grid coverages (rasters)    {#raster}

* [Get raster values at geographic coordinates](howto/raster_values_at_geographic_coordinates.html)
* [Handle rasters bigger than memory](howto/rasters_bigger_than_memory.html)
* [Resample a raster and write to a file](howto/resample_and_save_raster.html)
