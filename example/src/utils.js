export function generateXmlExample(dymoName = "Prueba", dymoAddress = "Prueba") {
  var labelXml = `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips" MediaType="Default">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Storage</Id>
  <PaperName>30258 Diskette</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="3060" Height="3960" Rx="370" Ry="370"/>
  </DrawCommands>
  <ObjectInfo>
    <TextObject>
      <Name>Practice name (label)</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
      <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>False</IsVariable>
      <HorizontalAlignment>Left</HorizontalAlignment>
      <VerticalAlignment>Top</VerticalAlignment>
      <TextFitMode>None</TextFitMode>
      <UseFullFontHeight>False</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>${dymoName}</String>
          <Attributes>
            <Font Family="Courier" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False"/>
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="316.7999" Y="129.6" Width="3484.8" Height="230.4"/>
  </ObjectInfo>
  <ObjectInfo>
    <TextObject>
      <Name>Office address where visit happened</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
      <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>False</IsVariable>
      <HorizontalAlignment>Left</HorizontalAlignment>
      <VerticalAlignment>Top</VerticalAlignment>
      <TextFitMode>None</TextFitMode>
      <UseFullFontHeight>False</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>${dymoAddress}</String>
          <Attributes>
            <Font Family="Courier" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False"/>
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="316.7999" Y="360" Width="3484.8" Height="230.4"/>
  </ObjectInfo>
  <ObjectInfo>
    <TextObject>
      <Name>Patient Name</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
      <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>False</IsVariable>
      <HorizontalAlignment>Left</HorizontalAlignment>
      <VerticalAlignment>Top</VerticalAlignment>
      <TextFitMode>None</TextFitMode>
      <UseFullFontHeight>False</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>Jesse I. Fernandez</String>
          <Attributes>
            <Font Family="Courier" Size="10" Bold="True" Italic="False" Underline="False" Strikeout="False"/>
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="316.7999" Y="1046.278" Width="3484.8" Height="259.2"/>
  </ObjectInfo>
  <ObjectInfo>
    <ShapeObject>
      <Name>SHAPE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
      <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>False</IsVariable>
      <ShapeType>HorizontalLine</ShapeType>
      <LineWidth>20</LineWidth>
      <LineAlignment>LeftOrTop</LineAlignment>
      <FillColor Alpha="0" Red="0" Green="0" Blue="0"/>
    </ShapeObject>
    <Bounds X="317.8156" Y="2148.055" Width="3384" Height="144"/>
  </ObjectInfo>
  <ObjectInfo>
    <TextObject>
      <Name>User Dosage Instructions</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
      <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>False</IsVariable>
      <HorizontalAlignment>Left</HorizontalAlignment>
      <VerticalAlignment>Top</VerticalAlignment>
      <TextFitMode>None</TextFitMode>
      <UseFullFontHeight>False</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>This is a test note generated
for the preview of the labe 
          </String>
          <Attributes>
            <Font Family="Courier" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False"/>
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="316.7999" Y="2447.37" Width="3484.8" Height="432"/>
  </ObjectInfo>
  <ObjectInfo>
    <TextObject>
      <Name>Office Phone Number</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
      <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>False</IsVariable>
      <HorizontalAlignment>Left</HorizontalAlignment>
      <VerticalAlignment>Top</VerticalAlignment>
      <TextFitMode>None</TextFitMode>
      <UseFullFontHeight>False</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>(456) 839-7392</String>
          <Attributes>
            <Font Family="Courier" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False"/>
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="310.7999" Y="576" Width="1487.977" Height="201.6"/>
  </ObjectInfo>
  <ObjectInfo>
    <TextObject>
      <Name>Filled by practitioner</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
      <BackColor Alpha="0" Red="255" Green="255" Blue="255"/>
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>False</IsVariable>
      <HorizontalAlignment>Left</HorizontalAlignment>
      <VerticalAlignment>Top</VerticalAlignment>
      <TextFitMode>None</TextFitMode>
      <UseFullFontHeight>False</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>Filled: 25/04/19</String>
          <Attributes>
            <Font Family="Courier" Size="9" Bold="False" Italic="False" Underline="False" Strikeout="False"/>
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0"/>
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <Bounds X="1915.2" Y="576" Width="1872" Height="201.6"/>
  </ObjectInfo>
</DieCutLabel>`;
  return labelXml;
}
