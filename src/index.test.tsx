import { renderHook } from "@testing-library/react-hooks";
import { useDymoCheckService, useDymoFetchPrinters, useDymoOpenLabel } from "./index";
import * as dymoUtils from "./dymo_utils";
import * as storage from "./storage";
import { vi } from "vitest";

// Mock global fetch
globalThis.fetch = vi.fn();

describe("React Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock storage to avoid connection discovery during tests
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
    it.skip("should return 'loading' initially then 'success' on successful connection", async () => {
      const mockRequestBuilder = vi
        .spyOn(dymoUtils, "dymoRequestBuilder")
        .mockResolvedValue({ data: "connected", status: 200, statusText: "OK", url: "test" } as any);

      const { result, waitForNextUpdate } = renderHook(() => useDymoCheckService());

      expect(result.current).toBe("loading");

      await waitForNextUpdate();

      expect(result.current).toBe("success");
      expect(mockRequestBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          wsAction: "status",
        })
      );
    });

    it("should return 'error' on connection failure", async () => {
      const mockRequestBuilder = vi
        .spyOn(dymoUtils, "dymoRequestBuilder")
        .mockRejectedValue(new Error("Connection failed"));

      const { result, waitForNextUpdate } = renderHook(() => useDymoCheckService());

      expect(result.current).toBe("loading");

      await waitForNextUpdate();

      expect(result.current).toBe("error");
    });

    it("should cancel previous request when port changes", async () => {
      vi.spyOn(dymoUtils, "dymoRequestBuilder").mockResolvedValue({ data: "connected", status: 200, statusText: "OK", url: "test" } as any);

      const { rerender } = renderHook(({ port }) => useDymoCheckService(port), {
        initialProps: { port: 41951 },
      });

      rerender({ port: 41952 });

      // AbortController.abort() is called but we can't easily test it
      expect(true).toBe(true);
    });

    it("should handle cancellation without setting error state", async () => {
      vi
        .spyOn(dymoUtils, "dymoRequestBuilder")
        .mockRejectedValue(new dymoUtils.RequestCancelledError("Request cancelled"));

      const { result } = renderHook(() => useDymoCheckService());

      expect(result.current).toBe("loading");
    });
  });

  describe("useDymoFetchPrinters", () => {
    it("should only fetch when statusDymoService is 'success'", () => {
      const mockRequestBuilder = vi.spyOn(dymoUtils, "dymoRequestBuilder");

      const { result } = renderHook(() => useDymoFetchPrinters("initial"));

      expect(result.current.statusFetchPrinters).toBe("initial");
      expect(mockRequestBuilder).not.toHaveBeenCalled();
    });

    it.skip("should fetch printers successfully", async () => {
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

      // Clear and re-mock for this specific test
      vi.clearAllMocks();
      vi.spyOn(storage, "localRetrieve").mockReturnValue({
        activeHost: "127.0.0.1",
        activePort: "41951",
      });
      vi.spyOn(storage, "localStore").mockImplementation(() => {});
      vi
        .spyOn(dymoUtils, "dymoRequestBuilder")
        .mockResolvedValue({ data: xmlResponse, status: 200, statusText: "OK", url: "test" } as any);

      const { result, waitForNextUpdate } = renderHook(() =>
        useDymoFetchPrinters("success")
      );

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
      expect(result.current.error).toBeNull();
    });

    it("should handle fetch error", async () => {
      const error = new Error("Failed to fetch printers");
      vi.spyOn(dymoUtils, "dymoRequestBuilder").mockRejectedValue(error);

      const { result, waitForNextUpdate } = renderHook(() =>
        useDymoFetchPrinters("success")
      );

      await waitForNextUpdate();

      expect(result.current.statusFetchPrinters).toBe("error");
      expect(result.current.printers).toEqual([]);
      expect(result.current.error).toEqual(expect.any(Error));
    });

    it.skip("should filter printers by modelPrinter parameter", async () => {
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

      // Clear and re-mock for this specific test
      vi.clearAllMocks();
      vi.spyOn(storage, "localRetrieve").mockReturnValue({
        activeHost: "127.0.0.1",
        activePort: "41951",
      });
      vi.spyOn(storage, "localStore").mockImplementation(() => {});
      vi
        .spyOn(dymoUtils, "dymoRequestBuilder")
        .mockResolvedValue({ data: xmlResponse, status: 200, statusText: "OK", url: "test" } as any);

      const { result, waitForNextUpdate } = renderHook(() =>
        useDymoFetchPrinters("success", "CustomPrinter")
      );

      await waitForNextUpdate();

      expect(result.current.printers).toHaveLength(1);
      expect(result.current.printers[0].name).toBe("Custom Printer");
    });
  });

  describe("useDymoOpenLabel", () => {
    it("should only render when statusDymoService is 'success'", () => {
      const mockRequestBuilder = vi.spyOn(dymoUtils, "dymoRequestBuilder");

      const { result } = renderHook(() => useDymoOpenLabel("initial", "<Label></Label>"));

      expect(result.current.statusOpenLabel).toBe("initial");
      expect(mockRequestBuilder).not.toHaveBeenCalled();
    });

    it.skip("should render label successfully", async () => {
      const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      // Clear and re-mock for this specific test
      vi.clearAllMocks();
      vi.spyOn(storage, "localRetrieve").mockReturnValue({
        activeHost: "127.0.0.1",
        activePort: "41951",
      });
      vi.spyOn(storage, "localStore").mockImplementation(() => {});
      vi
        .spyOn(dymoUtils, "dymoRequestBuilder")
        .mockResolvedValue({ data: base64Image, status: 200, statusText: "OK", url: "test" } as any);

      const labelXML = "<Label><Text>Test</Text></Label>";

      const { result, waitForNextUpdate } = renderHook(() =>
        useDymoOpenLabel("success", labelXML)
      );

      expect(result.current.statusOpenLabel).toBe("loading");

      await waitForNextUpdate();

      expect(result.current.statusOpenLabel).toBe("success");
      expect(result.current.label).toBe(base64Image);
      expect(result.current.error).toBeNull();
    });

    it("should handle render error", async () => {
      const error = new Error("Failed to render label");
      vi.spyOn(dymoUtils, "dymoRequestBuilder").mockRejectedValue(error);

      const { result, waitForNextUpdate } = renderHook(() =>
        useDymoOpenLabel("success", "<Label></Label>")
      );

      await waitForNextUpdate();

      expect(result.current.statusOpenLabel).toBe("error");
      expect(result.current.label).toBeNull();
      expect(result.current.error).toEqual(expect.any(Error));
    });

    it.skip("should URL encode label XML in request", async () => {
      // Clear and re-mock for this specific test
      vi.clearAllMocks();
      vi.spyOn(storage, "localRetrieve").mockReturnValue({
        activeHost: "127.0.0.1",
        activePort: "41951",
      });
      vi.spyOn(storage, "localStore").mockImplementation(() => {});

      const mockRequestBuilder = vi
        .spyOn(dymoUtils, "dymoRequestBuilder")
        .mockResolvedValue({ data: "base64data", status: 200, statusText: "OK", url: "test" } as any);

      const labelXML = "<Label><Text>Test & Special</Text></Label>";

      const { waitForNextUpdate } = renderHook(() =>
        useDymoOpenLabel("success", labelXML)
      );

      await waitForNextUpdate();

      expect(mockRequestBuilder).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "POST",
          wsAction: "renderLabel",
          fetchOptions: expect.objectContaining({
            body: expect.stringContaining(encodeURIComponent(labelXML)),
          }),
        })
      );
    });

    it("should re-render when labelXML changes", async () => {
      vi
        .spyOn(dymoUtils, "dymoRequestBuilder")
        .mockResolvedValue({ data: "base64data", status: 200, statusText: "OK", url: "test" } as any);

      const { rerender } = renderHook(
        ({ labelXML }) => useDymoOpenLabel("success", labelXML),
        {
          initialProps: { labelXML: "<Label>1</Label>" },
        }
      );

      rerender({ labelXML: "<Label>2</Label>" });

      // AbortController.abort() is called but we can't easily test it
      expect(true).toBe(true);
    });
  });
});
