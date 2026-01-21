declare module "react-xml-parser" {
  export interface XMLNode {
    name: string;
    value: string;
    attributes: Record<string, string>;
    children: XMLNode[];
    getElementsByTagName(tagName: string): XMLNode[];
  }

  export default class XMLParser {
    parseFromString(xmlString: string): XMLNode;
  }
}
