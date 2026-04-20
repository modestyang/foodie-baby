/// <reference types="@dcloudio/uni-app/types" />

declare namespace UniApp {
  interface Uni {
    $t: (key: string, params?: Record<string, unknown>) => string
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/*' {
  const value: string
  export default value
}