import { inject, InjectionKey, Ref } from "vue"
import User from '@library-management/common/entity/user'
import ToastManager from "./ToastManager"
import { Api } from "../api/Api"

export type AppContextData = {
  version: string,
  config: {
    cookiePrefix: string,
    maxBorrowTime: number,
    maxBorrowCount: number,
    allowPasswordReset: false,
  },
  session: string | null,
  user: User | null
}

// A hack - routes should not pass message like this
let globalIntentTimeout: NodeJS.Timeout | null = null
let globalIntent: any = undefined

export class AppContext {
  toastManager: ToastManager

  constructor(
    private data: AppContextData
  ) {
    this.toastManager = new ToastManager()
  }

  isLoggedIn() {
    return this.data.user != null
  }
  canManageBooks() {
    return this.data.user && this.data.user.role != 'Reader'
  }
  canManageUsers() {
    return this.data.user && (this.data.user.role == 'Root' || this.data.user.role == 'Admin')
  }
  getUsername() {
    if(!this.data.user) {
      return ''
    }
    return this.data.user.username
  }
  getUserDisplayName() {
    if(!this.data.user) {
      return ''
    }
    return this.data.user.display_name
  }

  setUser(user: User | null) {
    this.data.user = user
  }
  setUserAndSession(user: User | null, session: string | null) {
    this.data.user = user
    this.data.session = session
  }

  showToast(toast: string, timeout: number = 2000) {
    this.toastManager.show(toast, timeout)
  }

  async post(path: string, data: Object = {}) {
    return await Api.post(path, { ...data, __session: this.data.session })
  }

  putIntent(intent: any) {
    globalIntent = intent
    if(null != globalIntentTimeout) {
      clearTimeout(globalIntentTimeout)
    }
    globalIntentTimeout = setTimeout(() => {
      globalIntent = undefined
      globalIntentTimeout = null
    }, 2000)
  }

  getIntent() {
    const bak = globalIntent
    if(null != globalIntentTimeout) {
      clearTimeout(globalIntentTimeout)
    }
    globalIntent = undefined
    return bak
  }
}

export const AppContextInject = Symbol('AppContext') as InjectionKey<Ref<AppContext | undefined>>

export function useAppContext() {
  const ref = inject(AppContextInject)
  if(ref == undefined || ref.value == undefined) {
    throw new TypeError('Attempt to use app context when none is provided.')
  }
  return ref as Ref<AppContext>
}
