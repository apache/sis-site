---
title: Geographic bounding box of a data file
---

This example prints the metadata of a netCDF file in the XML format
defined by the ISO 19115-3 international standard.
The coverage values are not read, only the netCDF file header is read.


# Direct dependencies

Maven coordinates                   | Module info                     | Remarks
----------------------------------- | ------------------------------- | --------------------
`org.apache.sis.storage:sis-netcdf` | `org.apache.sis.storage.netcdf` |
`edu.ucar:cdm-core`                 |                                 | For netCDF-4 or HDF5

The `cdm-core` dependency can be omitted for netCDF-3 (a.k.a. "classic"),
GeoTIFF or any other [formats supported by Apache SIS](../formats.html).
For the dependencies required for reading GeoTIFF instead of netCDF files,
see the [geographic bounding box](geographic_bounding_box.html) code example.


# Code example

The file name in following code need to be updated for yours data.

{{< highlight java >}}
import java.util.Map;
import java.io.File;
import java.io.StringWriter;
import javax.xml.bind.JAXBException;
import javax.xml.transform.stream.StreamResult;
import org.opengis.metadata.Metadata;
import org.apache.sis.storage.DataStore;
import org.apache.sis.storage.DataStores;
import org.apache.sis.storage.DataStoreException;
import org.apache.sis.xml.XML;

public class ExportMetadata {
    /**
     * Demo entry point.
     *
     * @param  args  ignored.
     * @throws DataStoreException if an error occurred while reading the data file.
     * @throws JAXBException if an error occurred while marshalling metadata to XML.
     */
    public static void main(String[] args) throws DataStoreException, JAXBException {
        try (DataStore store = DataStores.open(new File("CMEMS.nc"))) {
            Metadata metadata = store.getMetadata();
            System.out.println(XML.marshal(metadata));
            /*
             * By default the XML schema is the most recent version of the standard supported
             * by Apache SIS. But the legacy version published in 2007 is still in wide use.
             * The legacy version can be requested with the `METADATA_VERSION` property.
             */
            Map<String,String> config = Map.of(XML.METADATA_VERSION, "2007");
            StringWriter result = new StringWriter();
            XML.marshal(metadata, new StreamResult(result), config);
            // Result is in `result.toString()`.
        }
    }
}
{{< / highlight >}}


# Output

The output depends on the data and the locale.
Below is an example:

{{< highlight xml >}}
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<mdb:MD_Metadata xmlns:cit="http://standards.iso.org/iso/19115/-3/cit/1.0"
                 xmlns:gco="http://standards.iso.org/iso/19115/-3/gco/1.0"
                 xmlns:mcc="http://standards.iso.org/iso/19115/-3/mcc/1.0"
                 xmlns:mdb="http://standards.iso.org/iso/19115/-3/mdb/1.0"
                 xmlns:mrc="http://standards.iso.org/iso/19115/-3/mrc/1.0"
                 xmlns:mrd="http://standards.iso.org/iso/19115/-3/mrd/1.0"
                 xmlns:mri="http://standards.iso.org/iso/19115/-3/mri/1.0"
                 xmlns:mrl="http://standards.iso.org/iso/19115/-3/mrl/1.0"
                 xmlns:mrs="http://standards.iso.org/iso/19115/-3/mrs/1.0"
                 xmlns:msr="http://standards.iso.org/iso/19115/-3/msr/1.0">
  <mdb:metadataStandard>
    <!-- Omitted for brevity -->
  </mdb:metadataStandard>
  <mdb:spatialRepresentationInfo>
    <msr:MD_GridSpatialRepresentation>
      <msr:numberOfDimensions>
        <gco:Integer>3</gco:Integer>
      </msr:numberOfDimensions>
      <msr:axisDimensionProperties>
        <msr:MD_Dimension>
          <msr:dimensionName>
            <msr:MD_DimensionNameTypeCode codeList="(…snip…)#MD_DimensionNameTypeCode" codeListValue="column">Column</msr:MD_DimensionNameTypeCode>
          </msr:dimensionName>
          <msr:dimensionSize>
            <gco:Integer>865</gco:Integer>
          </msr:dimensionSize>
        </msr:MD_Dimension>
      </msr:axisDimensionProperties>
      <msr:axisDimensionProperties>
        <msr:MD_Dimension>
          <msr:dimensionName>
            <msr:MD_DimensionNameTypeCode codeList="(…snip…)#MD_DimensionNameTypeCode" codeListValue="row">Row</msr:MD_DimensionNameTypeCode>
          </msr:dimensionName>
          <msr:dimensionSize>
            <gco:Integer>1081</gco:Integer>
          </msr:dimensionSize>
        </msr:MD_Dimension>
      </msr:axisDimensionProperties>
      <msr:axisDimensionProperties>
        <msr:MD_Dimension>
          <msr:dimensionName>
            <msr:MD_DimensionNameTypeCode codeList="(…snip…)#MD_DimensionNameTypeCode" codeListValue="time">Time</msr:MD_DimensionNameTypeCode>
          </msr:dimensionName>
          <msr:dimensionSize>
            <gco:Integer>96</gco:Integer>
          </msr:dimensionSize>
        </msr:MD_Dimension>
      </msr:axisDimensionProperties>
      <msr:cellGeometry>
        <msr:MD_CellGeometryCode codeList="(…snip…)#MD_CellGeometryCode" codeListValue="area">Area</msr:MD_CellGeometryCode>
      </msr:cellGeometry>
      <msr:transformationParameterAvailability>
        <gco:Boolean>false</gco:Boolean>
      </msr:transformationParameterAvailability>
    </msr:MD_GridSpatialRepresentation>
  </mdb:spatialRepresentationInfo>
  <mdb:referenceSystemInfo>
    <mrs:MD_ReferenceSystem>
      <mrs:referenceSystemIdentifier>
        <mcc:MD_Identifier>
          <mcc:code>
            <gco:CharacterString>time latitude longitude</gco:CharacterString>
          </mcc:code>
        </mcc:MD_Identifier>
      </mrs:referenceSystemIdentifier>
    </mrs:MD_ReferenceSystem>
  </mdb:referenceSystemInfo>
  <mdb:identificationInfo>
    <mri:MD_DataIdentification>
      <mri:citation>
        <cit:CI_Citation>
          <cit:title>
            <gco:CharacterString>Ocean surface 15-minutes mean fields for the Iberia-Biscay-Ireland (IBI) region</gco:CharacterString>
          </cit:title>
          <cit:identifier>
            <mcc:MD_Identifier>
              <mcc:code>
                <gco:CharacterString>CMEMS_v5r1_IBI_PHY_NRT_PdE_15minav_20220516_20220516_R20220516_FC01</gco:CharacterString>
              </mcc:code>
            </mcc:MD_Identifier>
          </cit:identifier>
          <cit:citedResponsibleParty>
            <cit:CI_Responsibility>
              <cit:role>
                <cit:CI_RoleCode codeList="(…snip…)#CI_RoleCode" codeListValue="originator">Originator</cit:CI_RoleCode>
              </cit:role>
              <cit:party>
                <cit:CI_Organisation>
                  <cit:name>
                    <gco:CharacterString>Puertos del Estado (PdE)</gco:CharacterString>
                  </cit:name>
                </cit:CI_Organisation>
              </cit:party>
            </cit:CI_Responsibility>
          </cit:citedResponsibleParty>
          <cit:otherCitationDetails>
            <gco:CharacterString>http://marine.copernicus.eu/</gco:CharacterString>
          </cit:otherCitationDetails>
        </cit:CI_Citation>
      </mri:citation>
      <mri:pointOfContact>
        <cit:CI_Responsibility>
          <cit:role>
            <cit:CI_RoleCode codeList="(…snip…)#CI_RoleCode" codeListValue="pointOfContact">Point of contact</cit:CI_RoleCode>
          </cit:role>
          <cit:party>
            <cit:CI_Organisation>
              <cit:name>
                <gco:CharacterString>Puertos del Estado (PdE)</gco:CharacterString>
              </cit:name>
            </cit:CI_Organisation>
          </cit:party>
        </cit:CI_Responsibility>
      </mri:pointOfContact>
      <mri:spatialRepresentationType>
        <mcc:MD_SpatialRepresentationTypeCode codeList="(…snip…)#MD_SpatialRepresentationTypeCode" codeListValue="grid">Grid</mcc:MD_SpatialRepresentationTypeCode>
      </mri:spatialRepresentationType>
      <mri:resourceFormat>
        <mrd:MD_Format>
          <mrd:formatSpecificationCitation>
            <cit:CI_Citation>
              <cit:title>
                <gco:CharacterString>Hierarchical Data Format, version 5</gco:CharacterString>
              </cit:title>
              <cit:alternateTitle>
                <gco:CharacterString>NetCDF-4</gco:CharacterString>
              </cit:alternateTitle>
            </cit:CI_Citation>
          </mrd:formatSpecificationCitation>
        </mrd:MD_Format>
      </mri:resourceFormat>
    </mri:MD_DataIdentification>
  </mdb:identificationInfo>
  <mdb:contentInfo>
    <mrc:MD_CoverageDescription>
      <mrc:attributeGroup>
        <mrc:MD_AttributeGroup>
          <mrc:attribute>
            <mrc:MD_SampleDimension>
              <mrc:sequenceIdentifier>
                <gco:MemberName>
                  <gco:aName>
                    <gco:CharacterString>zos</gco:CharacterString>
                  </gco:aName>
                  <gco:attributeType>
                    <gco:TypeName>
                      <gco:aName>
                        <gco:CharacterString>short[865][1081][96]</gco:CharacterString>
                      </gco:aName>
                    </gco:TypeName>
                  </gco:attributeType>
                </gco:MemberName>
              </mrc:sequenceIdentifier>
              <mrc:description>
                <gco:CharacterString>Sea surface height</gco:CharacterString>
              </mrc:description>
              <mrc:name>
                <mcc:MD_Identifier>
                  <mcc:code>
                    <gco:CharacterString>sea_surface_height_above_geoid</gco:CharacterString>
                  </mcc:code>
                </mcc:MD_Identifier>
              </mrc:name>
              <mrc:units>m</mrc:units>
              <mrc:scaleFactor>
                <gco:Real>0.001</gco:Real>
              </mrc:scaleFactor>
              <mrc:offset>
                <gco:Real>0.0</gco:Real>
              </mrc:offset>
            </mrc:MD_SampleDimension>
          </mrc:attribute>
          <mrc:attribute>
            <mrc:MD_SampleDimension>
              <mrc:sequenceIdentifier>
                <gco:MemberName>
                  <gco:aName>
                    <gco:CharacterString>uo</gco:CharacterString>
                  </gco:aName>
                  <gco:attributeType>
                    <gco:TypeName>
                      <gco:aName>
                        <gco:CharacterString>short[865][1081][96]</gco:CharacterString>
                      </gco:aName>
                    </gco:TypeName>
                  </gco:attributeType>
                </gco:MemberName>
              </mrc:sequenceIdentifier>
              <mrc:description>
                <gco:CharacterString>Eastward velocity</gco:CharacterString>
              </mrc:description>
              <mrc:name>
                <mcc:MD_Identifier>
                  <mcc:code>
                    <gco:CharacterString>eastward_sea_water_velocity</gco:CharacterString>
                  </mcc:code>
                </mcc:MD_Identifier>
              </mrc:name>
              <mrc:units>m∕s</mrc:units>
              <mrc:scaleFactor>
                <gco:Real>0.001</gco:Real>
              </mrc:scaleFactor>
              <mrc:offset>
                <gco:Real>0.0</gco:Real>
              </mrc:offset>
            </mrc:MD_SampleDimension>
          </mrc:attribute>
          <mrc:attribute>
            <mrc:MD_SampleDimension>
              <mrc:sequenceIdentifier>
                <gco:MemberName>
                  <gco:aName>
                    <gco:CharacterString>vo</gco:CharacterString>
                  </gco:aName>
                  <gco:attributeType>
                    <gco:TypeName>
                      <gco:aName>
                        <gco:CharacterString>short[865][1081][96]</gco:CharacterString>
                      </gco:aName>
                    </gco:TypeName>
                  </gco:attributeType>
                </gco:MemberName>
              </mrc:sequenceIdentifier>
              <mrc:description>
                <gco:CharacterString>Northward velocity</gco:CharacterString>
              </mrc:description>
              <mrc:name>
                <mcc:MD_Identifier>
                  <mcc:code>
                    <gco:CharacterString>northward_sea_water_velocity</gco:CharacterString>
                  </mcc:code>
                </mcc:MD_Identifier>
              </mrc:name>
              <mrc:units>m∕s</mrc:units>
              <mrc:scaleFactor>
                <gco:Real>0.001</gco:Real>
              </mrc:scaleFactor>
              <mrc:offset>
                <gco:Real>0.0</gco:Real>
              </mrc:offset>
            </mrc:MD_SampleDimension>
          </mrc:attribute>
        </mrc:MD_AttributeGroup>
      </mrc:attributeGroup>
    </mrc:MD_CoverageDescription>
  </mdb:contentInfo>
  <mdb:resourceLineage>
    <mrl:LI_Lineage>
      <mrl:source>
        <mrl:LI_Source>
          <mrl:description>
            <gco:CharacterString>IBI-MFC (PdE Production Center)</gco:CharacterString>
          </mrl:description>
        </mrl:LI_Source>
      </mrl:source>
    </mrl:LI_Lineage>
  </mdb:resourceLineage>
  <mdb:metadataScope>
    <mdb:MD_MetadataScope>
      <mdb:resourceScope>
        <mcc:MD_ScopeCode codeList="(…snip…)#MD_ScopeCode" codeListValue="dataset">Dataset</mcc:MD_ScopeCode>
      </mdb:resourceScope>
    </mdb:MD_MetadataScope>
  </mdb:metadataScope>
</mdb:MD_Metadata>
{{< / highlight >}}
