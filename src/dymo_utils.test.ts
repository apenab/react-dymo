import { vi } from "vitest";
import axios from "axios";
import { dymoUrlBuilder, getDymoPrintersFromXml, printLabel, dymoRequestBuilder } from "./dymo_utils";
import { WS_ACTIONS } from "./constants";
import * as storage from "./storage";

vi.mock("axios");
const mockedAxios = axios as any;

describe("dymo_utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("dymoUrlBuilder", () => {
    it("should construct correct URL", () => {
      const url = dymoUrlBuilder("https://", "127.0.0.1", 41951, "DYMO/DLS/Printing", "status");
      expect(url).toBe("https://127.0.0.1:41951/DYMO/DLS/Printing/StatusConnected");
    });

    it("should use correct action values from WS_ACTIONS", () => {
      const url = dymoUrlBuilder("https://", "localhost", 41952, "DYMO/DLS/Printing", "getPrinters");
      expect(url).toContain(WS_ACTIONS.getPrinters);
    });

    it("should handle different protocols", () => {
      const url = dymoUrlBuilder("http://", "127.0.0.1", 41951, "DYMO/DLS/Printing", "status");
      expect(url).toBe("http://127.0.0.1:41951/DYMO/DLS/Printing/StatusConnected");
    });
  });

  describe("getDymoPrintersFromXml", () => {
    it("should parse XML and convert to printer objects", () => {
      const xml = `
        <Printers>
          <LabelWriterPrinter>
            <Name>DYMO LabelWriter 450</Name>
            <ModelName>LabelWriter 450</ModelName>
            <IsLocal>True</IsLocal>
            <IsTwinTurbo>False</IsTwinTurbo>
            <IsConnected>True</IsConnected>
          </LabelWriterPrinter>
        </Printers>
      `;

      const printers = getDymoPrintersFromXml(xml, "LabelWriterPrinter");

      expect(printers).toHaveLength(1);
      expect(printers[0]).toEqual({
        name: "DYMO LabelWriter 450",
        modelName: "LabelWriter 450",
        isLocal: true,
        isTwinTurbo: false,
        isConnected: true,
      });
    });

    it("should convert boolean strings to actual booleans", () => {
      const xml = `
        <Printers>
          <LabelWriterPrinter>
            <Name>Test Printer</Name>
            <ModelName>Test Model</ModelName>
            <IsLocal>False</IsLocal>
            <IsTwinTurbo>True</IsTwinTurbo>
            <IsConnected>False</IsConnected>
          </LabelWriterPrinter>
        </Printers>
      `;

      const printers = getDymoPrintersFromXml(xml, "LabelWriterPrinter");

      expect(printers[0].isLocal).toBe(false);
      expect(printers[0].isTwinTurbo).toBe(true);
      expect(printers[0].isConnected).toBe(false);
      expect(typeof printers[0].isLocal).toBe("boolean");
    });

    it("should handle multiple printers", () => {
      const xml = `
        <Printers>
          <LabelWriterPrinter>
            <Name>Printer 1</Name>
            <ModelName>Model 1</ModelName>
            <IsLocal>True</IsLocal>
            <IsTwinTurbo>False</IsTwinTurbo>
            <IsConnected>True</IsConnected>
          </LabelWriterPrinter>
          <LabelWriterPrinter>
            <Name>Printer 2</Name>
            <ModelName>Model 2</ModelName>
            <IsLocal>False</IsLocal>
            <IsTwinTurbo>True</IsTwinTurbo>
            <IsConnected>False</IsConnected>
          </LabelWriterPrinter>
        </Printers>
      `;

      const printers = getDymoPrintersFromXml(xml, "LabelWriterPrinter");

      expect(printers).toHaveLength(2);
      expect(printers[0].name).toBe("Printer 1");
      expect(printers[1].name).toBe("Printer 2");
    });

    it("should handle empty XML", () => {
      const xml = "<Printers></Printers>";
      const printers = getDymoPrintersFromXml(xml, "LabelWriterPrinter");
      expect(printers).toHaveLength(0);
    });

    it("should convert PascalCase XML tags to camelCase properties", () => {
      const xml = `
        <Printers>
          <LabelWriterPrinter>
            <Name>Test</Name>
            <ModelName>Test Model</ModelName>
            <IsLocal>True</IsLocal>
            <IsTwinTurbo>False</IsTwinTurbo>
            <IsConnected>True</IsConnected>
          </LabelWriterPrinter>
        </Printers>
      `;

      const printers = getDymoPrintersFromXml(xml, "LabelWriterPrinter");

      expect(printers[0]).toHaveProperty("name");
      expect(printers[0]).toHaveProperty("modelName");
      expect(printers[0]).toHaveProperty("isLocal");
      expect(printers[0]).not.toHaveProperty("Name");
      expect(printers[0]).not.toHaveProperty("IsLocal");
    });
  });

  describe("printLabel", () => {
    it("should encode parameters correctly", async () => {
      const mockResponse = { data: "success", config: { url: "https://127.0.0.1:41951/test" } };

      mockedAxios.create.mockReturnValue({
        request: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: { use: vi.fn() },
        },
      } as any);

      vi.spyOn(storage, "localRetrieve").mockReturnValue({
        activeHost: "127.0.0.1",
        activePort: "41951",
      });

      const printerName = "My Printer";
      const labelXml = "<Label>Test</Label>";
      const labelSetXml = "<LabelSet></LabelSet>";

      await printLabel(printerName, labelXml, labelSetXml);

      const axiosInstance = mockedAxios.create();
      expect(axiosInstance.request).toHaveBeenCalled();

      const callArgs = (axiosInstance.request as any).mock.calls[0][0];
      expect(callArgs.data).toContain(encodeURIComponent(printerName));
      expect(callArgs.data).toContain(encodeURIComponent(labelXml));
      expect(callArgs.data).toContain(labelSetXml);
    });

    it("should handle optional labelSetXml parameter", async () => {
      const mockResponse = { data: "success", config: { url: "https://127.0.0.1:41951/test" } };

      mockedAxios.create.mockReturnValue({
        request: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: { use: vi.fn() },
        },
      } as any);

      vi.spyOn(storage, "localRetrieve").mockReturnValue({
        activeHost: "127.0.0.1",
        activePort: "41951",
      });

      await printLabel("My Printer", "<Label>Test</Label>");

      const axiosInstance = mockedAxios.create();
      const callArgs = (axiosInstance.request as any).mock.calls[0][0];
      expect(callArgs.data).toContain("labelSetXml=");
    });
  });

  describe("dymoRequestBuilder", () => {
    it("should make request with stored connection params", async () => {
      const mockResponse = { data: "success", config: { url: "https://127.0.0.1:41951/test" } };

      mockedAxios.create.mockReturnValue({
        request: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: { use: vi.fn() },
        },
      } as any);

      vi.spyOn(storage, "localRetrieve").mockReturnValue({
        activeHost: "127.0.0.1",
        activePort: "41951",
      });

      const response = await dymoRequestBuilder({
        method: "GET",
        wsAction: "status",
      });

      expect(response.data).toBe("success");
      expect(mockedAxios.create).toHaveBeenCalled();
    });

    it("should discover connection if params not stored", async () => {
      const mockSuccessResponse = {
        data: "connected",
        config: { url: "https://127.0.0.1:41951/DYMO/DLS/Printing/StatusConnected" },
      };

      let retrieveCallCount = 0;
      vi.spyOn(storage, "localRetrieve").mockImplementation(() => {
        retrieveCallCount++;
        if (retrieveCallCount === 1) return null;
        return { activeHost: "127.0.0.1", activePort: "41951" };
      });

      vi.spyOn(storage, "localStore").mockImplementation(() => {});

      mockedAxios.get.mockResolvedValue(mockSuccessResponse);
      mockedAxios.create.mockReturnValue({
        request: vi.fn().mockResolvedValue(mockSuccessResponse),
        interceptors: {
          response: { use: vi.fn() },
        },
      } as any);

      await dymoRequestBuilder({
        method: "GET",
        wsAction: "status",
      });

      expect(mockedAxios.get).toHaveBeenCalled();
      expect(storage.localStore).toHaveBeenCalled();
    });

    it("should throw error if unable to connect to service", async () => {
      vi.spyOn(storage, "localRetrieve").mockReturnValue(null);
      mockedAxios.get.mockRejectedValue(new Error("Connection failed"));

      await expect(
        dymoRequestBuilder({
          method: "GET",
          wsAction: "status",
        })
      ).rejects.toThrow("Unable to connect to DYMO web service");
    });
  });
});
