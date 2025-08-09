import * as Atom from "@effect-atom/atom/Atom"
import * as Registry from "@effect-atom/atom/Registry"
import { createAtom, createAtomValue } from "../src/index.js"
import { describe, expect, it } from "@effect/vitest"
import { createRoot } from "solid-js"

describe("atom-solid", () => {
  it("basic registry functionality works", () => {
    const countAtom = Atom.make(0)
    const registry = Registry.make()
    
    expect(registry.get(countAtom)).toBe(0)
    
    registry.set(countAtom, 5)
    expect(registry.get(countAtom)).toBe(5)
  })

  it("createAtom - basic functionality without JSX", () => {
    const countAtom = Atom.make(0)
    const registry = Registry.make()

    createRoot(() => {
      const [count, setCount] = createAtom(countAtom, registry)
      
      expect(count()).toBe(0)
      expect(registry.get(countAtom)).toBe(0)
      
      // Test direct value setting
      setCount(1)
      console.log("After setCount(1):", count(), "registry:", registry.get(countAtom))
      expect(registry.get(countAtom)).toBe(1)
      expect(count()).toBe(1)
      
      // Test function-based setting
      setCount((c: number) => c + 1)
      console.log("After setCount(c => c + 1):", count(), "registry:", registry.get(countAtom))
      expect(registry.get(countAtom)).toBe(2)
      expect(count()).toBe(2)
    })
  })

  it("createAtomValue - read-only access without JSX", () => {
    const countAtom = Atom.make(5)
    const registry = Registry.make()

    createRoot(() => {
      const count = createAtomValue(countAtom, registry)
      
      expect(count()).toBe(5)
      
      registry.set(countAtom, 10)
      console.log("After registry.set(10):", count(), "registry:", registry.get(countAtom))
      expect(registry.get(countAtom)).toBe(10)
      expect(count()).toBe(10)
    })
  })

  it("derived atoms work correctly without JSX", () => {
    const baseAtom = Atom.make(2)
    const doubledAtom = Atom.map(baseAtom, (x: number) => x * 2)
    const registry = Registry.make()

    createRoot(() => {
      const [base, setBase] = createAtom(baseAtom, registry)
      const doubled = createAtomValue(doubledAtom, registry)
      
      expect(base()).toBe(2)
      expect(doubled()).toBe(4)
      
      setBase(3)
      console.log("After setBase(3):", base(), doubled(), "registry:", registry.get(baseAtom), registry.get(doubledAtom))
      expect(registry.get(baseAtom)).toBe(3)
      expect(base()).toBe(3)
      expect(doubled()).toBe(6)
    })
  })
})
