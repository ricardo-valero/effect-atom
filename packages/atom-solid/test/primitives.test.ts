import * as Atom from "@effect-atom/atom/Atom"
import * as Registry from "@effect-atom/atom/Registry"
import { createAtom, createAtomValue } from "../src/index.js"
import { describe, expect, it } from "@effect/vitest"

describe("atom-solid primitives", () => {
  it("createAtomValue should return a signal with the atom value", () => {
    const countAtom = Atom.make(42)
    const registry = Registry.make()

    const countSignal = createAtomValue(countAtom, registry)

    expect(countSignal()).toBe(42)
  })

  it("createAtom should return a signal and setter", () => {
    const countAtom = Atom.make(0)
    const registry = Registry.make()

    const [count, setCount] = createAtom(countAtom, registry)

    expect(count()).toBe(0)

    // Test direct value setting
    setCount(5)
    expect(count()).toBe(5)
    expect(registry.get(countAtom)).toBe(5)

    // Test function-based setting
    setCount((prev: number) => prev + 1)
    expect(count()).toBe(6)
    expect(registry.get(countAtom)).toBe(6)
  })

  it("should work with derived atoms", () => {
    const baseAtom = Atom.make(2)
    const doubledAtom = Atom.map(baseAtom, (x: number) => x * 2)
    const registry = Registry.make()

    const base = createAtomValue(baseAtom, registry)
    const doubled = createAtomValue(doubledAtom, registry)

    expect(base()).toBe(2)
    expect(doubled()).toBe(4)

    registry.set(baseAtom, 3)
    expect(base()).toBe(3)
    expect(doubled()).toBe(6)
  })
})
