import { renderHook, act } from "@testing-library/react-hooks";
import { useDymoCheckService, useDymoFetchPrinters, useDymoOpenLabel } from "./index";
import * as dymoUtils from "./dymo_utils";
import * as storage from "./storage";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";

// Mock the dymo_utils module
vi.mock("./dymo_utils", async () => {
  const actual = await vi.importActual("./dymo_utils");
  return {
    ...actual,
    dymoRequestBuilder: vi.fn(),
  };
});

describe("React Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(storage, "localRetrieve").mockReturnValue({
      activeHost: "127.0.0.1",
      activePort: "41951",
    });
    vi.spyOn(storage, "localStore").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("useDymoCheckService", () => {
    it("should return 'loading' initially then 'success' on successful connection", async () => {
      vi.mocked(dymoUtils.dymoRequestBuilder).mockResolvedValue({
        data: "connected",
        status: 200,
        statusText: "OK",
        url: "test",
      });

      const { result, waitForNextUpdate } = renderHook(() => useDymoCheckService());

      expect(result.current).toBe("loading");

      await waitForNextUpdate();

      expect(result.current).toBe("success");
    });

    it("should return 'error' on connection failure", async () => {
      vi.mocked(dymoUtils.dymoRequestBuilder).mockRejectedValue(new Error("Connection failed"));

      const { result, waitForNextUpdate } = renderHook(() => useDymoCheckService());

      expect(result.current).toBe("loading");

      await waitForNextUpdate();

      expect(result.current).toBe("error");
    });

    it("should handle cancellation without setting error state", async () => {
      vi.mocked(dymoUtils.dymoRequestBuilder).mockRejectedValue(
        new dymoUtils.RequestCancelledError("Request cancelled")
      );

      const { result } = renderHook(() => useDymoCheckService());

      expect(result.current).toBe("loading");

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Should still be loading because cancellation doesn't trigger error state
      expect(result.current).toBe("loading");
    });
  });

  describe("useDymoFetchPrinters", () => {
    it("should not fetch when statusDymoService is not 'success'", () => {
      const { result } = renderHook(() => useDymoFetchPrinters("initial"));

      expect(result.current.statusFetchPrinters).toBe("initial");
      expect(dymoUtils.dymoRequestBuilder).not.toHaveBeenCalled();
    });

    it("should fetch printers when statusDymoService is 'success'", async () => {
      const xmlResponse = `
        <Printers>
          <LabelWriterPrinter>
            <Name>Test Printer</Name>
            <ModelName>LabelWriter 450</ModelName>
            <IsLocal>True</IsLocal>
            <IsTwinTurbo>False</IsTwinTurbo>
            <IsConnected>True</IsConnected>
          </LabelWriterPrinter>
        </Printers>
      `;

      vi.mocked(dymoUtils.dymoRequestBuilder).mockResolvedValue({
        data: xmlResponse,
        status: 200,
        statusText: "OK",
        url: "test",
      });

      const { result, waitForNextUpdate } = renderHook(() => useDymoFetchPrinters("success"));

      expect(result.current.statusFetchPrinters).toBe("loading");

      await waitForNextUpdate();

      expect(result.current.statusFetchPrinters).toBe("success");
      expect(result.current.printers).toHaveLength(1);
      expect(result.current.printers[0]).toEqual({
        name: "Test Printer",
        modelName: "LabelWriter 450",
        isLocal: true,
        isTwinTurbo: false,
        isConnected: true,
      });
    });

    it("should handle fetch error", async () => {
      vi.mocked(dymoUtils.dymoRequestBuilder).mockRejectedValue(
        new Error("Failed to fetch printers")
      );

      const { result, waitForNextUpdate } = renderHook(() => useDymoFetchPrinters("success"));

      await waitForNextUpdate();

      expect(result.current.statusFetchPrinters).toBe("error");
      expect(result.current.printers).toEqual([]);
    });

    it("should filter printers by modelPrinter parameter", async () => {
      const xmlResponse = `
        <Printers>
          <CustomPrinter>
            <Name>Custom Printer</Name>
            <ModelName>Custom Model</ModelName>
            <IsLocal>True</IsLocal>
            <IsTwinTurbo>False</IsTwinTurbo>
            <IsConnected>True</IsConnected>
          </CustomPrinter>
        </Printers>
      `;

      vi.mocked(dymoUtils.dymoRequestBuilder).mockResolvedValue({
        data: xmlResponse,
        status: 200,
        statusText: "OK",
        url: "test",
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useDymoFetchPrinters("success", "CustomPrinter")
      );

      await waitForNextUpdate();

      expect(result.current.printers).toHaveLength(1);
      expect(result.current.printers[0].name).toBe("Custom Printer");
    });
  });

  describe("useDymoOpenLabel", () => {
    it("should not render when statusDymoService is not 'success'", () => {
      const { result } = renderHook(() => useDymoOpenLabel("initial", "<Label></Label>"));

      expect(result.current.statusOpenLabel).toBe("initial");
      expect(dymoUtils.dymoRequestBuilder).not.toHaveBeenCalled();
    });

    it("should render label when statusDymoService is 'success'", async () => {
      const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ";

      vi.mocked(dymoUtils.dymoRequestBuilder).mockResolvedValue({
        data: base64Image,
        status: 200,
        statusText: "OK",
        url: "test",
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useDymoOpenLabel("success", "<Label><Text>Test</Text></Label>")
      );

      expect(result.current.statusOpenLabel).toBe("loading");

      await waitForNextUpdate();

      expect(result.current.statusOpenLabel).toBe("success");
      expect(result.current.label).toBe(base64Image);
    });

    it("should handle render error", async () => {
      vi.mocked(dymoUtils.dymoRequestBuilder).mockRejectedValue(
        new Error("Failed to render label")
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        useDymoOpenLabel("success", "<Label></Label>")
      );

      await waitForNextUpdate();

      expect(result.current.statusOpenLabel).toBe("error");
      expect(result.current.label).toBeNull();
    });

    it("should URL encode label XML in request", async () => {
      vi.mocked(dymoUtils.dymoRequestBuilder).mockResolvedValue({
        data: "base64data",
        status: 200,
        statusText: "OK",
        url: "test",
      });

      const labelXML = "<Label><Text>Test & Special</Text></Label>";

      const { waitForNextUpdate } = renderHook(() => useDymoOpenLabel("success", labelXML));

      await waitForNextUpdate();

      expect(dymoUtils.dymoRequestBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          wsAction: "renderLabel",
          fetchOptions: expect.objectContaining({
            body: expect.stringContaining(encodeURIComponent(labelXML)),
          }),
        })
      );
    });
  });
});
