/**
 * @since 1.0.0
 */
import type * as Atom from "@effect-atom/atom/Atom"
import type * as AtomRef from "@effect-atom/atom/AtomRef"
import * as Registry from "@effect-atom/atom/Registry"
import type * as Result from "@effect-atom/atom/Result"
import { Effect } from "effect"
import * as Cause from "effect/Cause"
import { globalValue } from "effect/GlobalValue"
import { createSignal, onCleanup } from "solid-js"
import type { Accessor } from "solid-js"

/**
 * @since 1.0.0
 * @category registry
 */
export const defaultRegistry: Registry.Registry = globalValue(
  "@effect-atom/atom-solid/defaultRegistry",
  () => Registry.make(),
)

/**
 * @since 1.0.0
 * @category primitives
 */
export const createAtom = <R, W>(
  atom: Atom.Writable<R, W>,
  registry: Registry.Registry = defaultRegistry,
): readonly [Accessor<R>, (newValue: W | ((prev: R) => W)) => void] => {
  const [value, setValue] = createSignal<R>(registry.get(atom))

  // Set up subscription immediately and update the signal when atom changes
  const update = () => {
    const nextValue = registry.get(atom)
    setValue(() => nextValue)
  }

  // The registry.subscribe method will call update() when the atom changes
  const unsub = registry.subscribe(atom, update)

  // Call update once to ensure we have the latest value
  update()

  onCleanup(unsub)

  const setAtom = (newValue: W | ((prev: R) => W)) => {
    if (typeof newValue === "function") {
      registry.set(atom, (newValue as Function)(registry.get(atom)))
    } else {
      registry.set(atom, newValue)
    }
  }

  return [value, setAtom]
}

/**
 * @since 1.0.0
 * @category primitives
 */
export const createAtomValue = <A>(
  atom: Atom.Atom<A>,
  registry: Registry.Registry = defaultRegistry,
): Accessor<A> => {
  const [value, setValue] = createSignal<A>(registry.get(atom))

  // Set up subscription immediately and update the signal when atom changes
  const update = () => {
    const nextValue = registry.get(atom)
    setValue(() => nextValue)
  }

  // The registry.subscribe method will call update() when the atom changes
  const unsub = registry.subscribe(atom, update)

  // Call update once to ensure we have the latest value
  update()

  onCleanup(unsub)

  return value
}

/**
 * @since 1.0.0
 * @category primitives
 */
export const createAtomSetter = <R, W>(
  atom: Atom.Writable<R, W>,
  registry: Registry.Registry = defaultRegistry,
): ((value: W | ((prev: R) => W)) => void) => {
  const dispose = registry.mount(atom)
  onCleanup(dispose)

  return (newValue: W | ((prev: R) => W)) => {
    if (typeof newValue === "function") {
      registry.set(atom, (newValue as Function)(registry.get(atom)))
    } else {
      registry.set(atom, newValue)
    }
  }
}

/**
 * @since 1.0.0
 * @category primitives
 */
export const createAtomMount = <A>(
  atom: Atom.Atom<A>,
  registry: Registry.Registry = defaultRegistry,
): void => {
  const dispose = registry.mount(atom)
  onCleanup(dispose)
}

/**
 * @since 1.0.0
 * @category primitives
 */
export const createAtomRefresh = <A>(
  atom: Atom.Atom<A>,
  registry: Registry.Registry = defaultRegistry,
): (() => void) => {
  createAtomMount(atom, registry)
  return () => {
    registry.refresh(atom)
  }
}

/**
 * @since 1.0.0
 * @category primitives
 */
export const createAtomSubscribe = <A>(
  atom: Atom.Atom<A>,
  callback: (_: A) => void,
  options?: { readonly immediate?: boolean },
  registry: Registry.Registry = defaultRegistry,
): void => {
  const dispose = registry.subscribe(atom, callback, options)
  onCleanup(dispose)
}

/**
 * @since 1.0.0
 * @category primitives
 */
export const createAtomRef = <A>(ref: AtomRef.ReadonlyRef<A>): Accessor<A> => {
  const [value, setValue] = createSignal<A>(ref.value)

  const dispose = ref.subscribe((nextValue) => {
    setValue(() => nextValue)
  })
  onCleanup(dispose)

  return value
}

/**
 * @since 1.0.0
 * @category primitives
 */
export const createAtomRefProp = <A, K extends keyof A>(
  ref: AtomRef.AtomRef<A>,
  prop: K,
): AtomRef.AtomRef<A[K]> => {
  return ref.prop(prop)
}

/**
 * @since 1.0.0
 * @category primitives
 */
export const createAtomRefPropValue = <A, K extends keyof A>(
  ref: AtomRef.AtomRef<A>,
  prop: K,
): Accessor<A[K]> => {
  const propRef = createAtomRefProp(ref, prop)
  return createAtomRef(propRef)
}

/**
 * @since 1.0.0
 * @category primitives
 */
export const createAtomSuspense = <A, E>(
  atom: Atom.Atom<Result.Result<A, E>>,
  options?: {
    readonly suspendOnWaiting?: boolean | undefined
    readonly includeFailure?: boolean | undefined
  },
  registry: Registry.Registry = defaultRegistry,
): Accessor<Result.Success<A, E> | Result.Failure<A, E>> => {
  const [value, setValue] = createSignal<Result.Result<A, E>>(
    registry.get(atom),
  )

  const update = () => {
    const result = registry.get(atom)
    setValue(() => result)
  }

  const dispose = registry.subscribe(atom, update)
  onCleanup(dispose)

  return () => {
    const result = value()
    if (
      result._tag === "Initial" ||
      (options?.suspendOnWaiting && result.waiting)
    ) {
      throw Effect.runPromise(
        Registry.getResult(registry, atom, {
          suspendOnWaiting: options?.suspendOnWaiting ?? false,
        }),
      )
    }
    if (result._tag === "Failure" && !options?.includeFailure) {
      throw Cause.squash(result.cause)
    }
    return result
  }
}
