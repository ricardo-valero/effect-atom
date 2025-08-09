import { describe, expect, it } from "@effect/vitest"
import { createSignal } from "solid-js"

describe("atom-solid basic", () => {
  it("should have window defined in test environment", () => {
    expect(typeof window).toBe("object")
  })

  it("should be able to create solid signals", () => {
    const [count, setCount] = createSignal(0)
    expect(count()).toBe(0)
    setCount(1)
    expect(count()).toBe(1)
  })

  it("should be able to import primitives", async () => {
    const { createAtom, createAtomValue } = await import("../src/index.js")
    expect(typeof createAtom).toBe("function")
    expect(typeof createAtomValue).toBe("function")
  })
})
