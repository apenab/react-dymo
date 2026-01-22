import { localStore, localRetrieve } from "./storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("localStore", () => {
    it("should store data in localStorage correctly", () => {
      const testData = { foo: "bar", count: 42 };
      localStore("test-key", testData);

      const stored = localStorage.getItem("test-key");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.data).toEqual(testData);
      expect(parsed.expiration).toBeNull();
    });

    it("should store data with expiration timestamp", () => {
      const testData = { value: "test" };
      const timeout = 60; // 60 seconds
      const beforeStore = Date.now();

      localStore("test-key", testData, timeout);

      const stored = localStorage.getItem("test-key");
      const parsed = JSON.parse(stored!);

      expect(parsed.expiration).toBeGreaterThan(beforeStore);
      expect(parsed.expiration).toBeLessThanOrEqual(Date.now() + timeout * 1000);
    });

    it("should handle null timeout by setting expiration to null", () => {
      const testData = { value: "test" };
      localStore("test-key", testData, null);

      const stored = localStorage.getItem("test-key");
      const parsed = JSON.parse(stored!);

      expect(parsed.expiration).toBeNull();
    });
  });

  describe("localRetrieve", () => {
    it("should retrieve data before expiration", () => {
      const testData = { foo: "bar" };
      const futureExpiration = Date.now() + 60000; // 60 seconds in future

      localStorage.setItem(
        "test-key",
        JSON.stringify({ data: testData, expiration: futureExpiration })
      );

      const result = localRetrieve("test-key");
      expect(result).toEqual(testData);
    });

    it("should return default value after expiration", () => {
      const testData = { foo: "bar" };
      const pastExpiration = Date.now() - 1000; // 1 second ago
      const defaultValue = { default: true };

      localStorage.setItem(
        "test-key",
        JSON.stringify({ data: testData, expiration: pastExpiration })
      );

      const result = localRetrieve("test-key", defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it("should remove expired items from localStorage", () => {
      const testData = { foo: "bar" };
      const pastExpiration = Date.now() - 1000;

      localStorage.setItem(
        "test-key",
        JSON.stringify({ data: testData, expiration: pastExpiration })
      );

      localRetrieve("test-key");

      expect(localStorage.getItem("test-key")).toBeNull();
    });

    it("should return default value when key does not exist", () => {
      const defaultValue = { default: "value" };
      const result = localRetrieve("non-existent-key", defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it("should return null when key does not exist and no default provided", () => {
      const result = localRetrieve("non-existent-key");
      expect(result).toBeNull();
    });

    it("should handle JSON parse errors gracefully", () => {
      localStorage.setItem("test-key", "invalid json {");

      const defaultValue = { safe: true };
      const result = localRetrieve("test-key", defaultValue);

      expect(result).toEqual(defaultValue);
    });

    it("should retrieve data with null expiration (never expires)", () => {
      const testData = { persistent: "data" };

      localStorage.setItem(
        "test-key",
        JSON.stringify({ data: testData, expiration: null })
      );

      const result = localRetrieve("test-key");
      expect(result).toEqual(testData);
    });

    it("should handle data stored without expiration field", () => {
      const testData = { value: "test" };
      // Simulate old format or corrupted data
      localStorage.setItem("test-key", JSON.stringify({ data: testData }));

      const result = localRetrieve<{ value: string }>("test-key");
      expect(result).toEqual(testData);
    });

    it("should handle empty data correctly", () => {
      localStorage.setItem(
        "test-key",
        JSON.stringify({ data: null, expiration: null })
      );

      const defaultValue = { default: "value" };
      const result = localRetrieve("test-key", defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });

  describe("integration tests", () => {
    it("should store and retrieve data correctly", () => {
      const testData = { name: "John", age: 30 };
      localStore("user", testData);

      const retrieved = localRetrieve("user");
      expect(retrieved).toEqual(testData);
    });

    it("should handle complete expiration flow", () => {
      jest.useFakeTimers();

      const testData = { value: "test" };
      const timeout = 5; // 5 seconds

      localStore("test-key", testData, timeout);

      // Before expiration
      let result = localRetrieve("test-key");
      expect(result).toEqual(testData);

      // After expiration
      jest.advanceTimersByTime(6000); // Advance 6 seconds

      result = localRetrieve("test-key", { expired: true });
      expect(result).toEqual({ expired: true });

      jest.useRealTimers();
    });
  });
});
