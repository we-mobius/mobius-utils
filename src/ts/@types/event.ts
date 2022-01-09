
// Q: Why put event related generics in independent @types instead of just put it along with event helpers in external?
// A: Because the rest part of the codebase other than external will use these generics.

export type SynthesizeEvent<Patch> = Event & { target: Patch }
export type EventHandler<Target extends EventTarget | null = EventTarget | null> = (event: SynthesizeEvent<Target>) => void
