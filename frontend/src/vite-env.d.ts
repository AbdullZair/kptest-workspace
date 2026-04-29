/// <reference types="vite/client" />

/**
 * Environment variables type definition
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_2FA: string
  readonly VITE_ENABLE_CHAT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * SVG module declaration for importing SVG files
 */
declare module '*.svg' {
  import * as React from 'react'
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >
  const src: string
  export default src
}

/**
 * Image module declarations
 */
declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

/**
 * CSS module declarations
 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

/**
 * Global `jest` alias for Vitest's `vi`
 * Allows existing Jest-style tests to work without rewriting.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace, no-var
  var jest: typeof import('vitest').vi
  namespace jest {
    type Mock<T = unknown, P extends unknown[] = unknown[]> = import('vitest').Mock<P, T>
    type MockedFunction<T extends (...args: unknown[]) => unknown> =
      import('vitest').MockedFunction<T>
  }
}

export {}
