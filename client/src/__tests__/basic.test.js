// Simple test to verify Jest setup
describe("Jest Setup", () => {
  test("Jest is working correctly", () => {
    expect(1 + 1).toBe(2);
  });

  test("Can test basic functions", () => {
    const sum = (a, b) => a + b;
    expect(sum(2, 3)).toBe(5);
  });

  test("Can test arrays", () => {
    const fruits = ["apple", "banana", "orange"];
    expect(fruits).toHaveLength(3);
    expect(fruits).toContain("banana");
  });

  test("Can test objects", () => {
    const user = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    };

    expect(user).toHaveProperty("name");
    expect(user.name).toBe("John Doe");
  });

  test("Can test promises", async () => {
    const promise = Promise.resolve("Hello World");
    const result = await promise;
    expect(result).toBe("Hello World");
  });
});
