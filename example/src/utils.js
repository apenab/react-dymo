export function generateXmlExample(dymoName = "Your name") {
  var labelXml = `<?xml version="1.0" encoding="utf-8"?>
  <DieCutLabel Version="8.0" Units="twips">
    <PaperOrientation>Landscape</PaperOrientation>
    <Id>Small30336</Id>
    <IsOutlined>false</IsOutlined>
    <PaperName>30336 1 in x 2-1/8 in</PaperName>
    <DrawCommands>
      <RoundRectangle X="0" Y="0" Width="1440" Height="3060" Rx="180" Ry="180" />
    </DrawCommands>
    <ObjectInfo>
      <TextObject>
        <Name>TEXT</Name>
        <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
        <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
        <LinkedObjectName />
        <Rotation>Rotation0</Rotation>
        <IsMirrored>False</IsMirrored>
        <IsVariable>False</IsVariable>
        <GroupID>-1</GroupID>
        <IsOutlined>False</IsOutlined>
        <HorizontalAlignment>Center</HorizontalAlignment>
        <VerticalAlignment>Middle</VerticalAlignment>
        <TextFitMode>ShrinkToFit</TextFitMode>
        <UseFullFontHeight>True</UseFullFontHeight>
        <Verticalized>False</Verticalized>
        <StyledText>
          <Element>
            <String xml:space="preserve">${dymoName}</String>
            <Attributes>
              <Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" />
              <ForeColor Alpha="255" Red="0" Green="0" Blue="0" HueScale="100" />
            </Attributes>
          </Element>
        </StyledText>
      </TextObject>
      <Bounds X="130" Y="300" Width="2846" Height="720" />
    </ObjectInfo>
  </DieCutLabel>`;
  return labelXml;
}
