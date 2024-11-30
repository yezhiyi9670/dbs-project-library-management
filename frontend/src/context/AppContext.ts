import { inject, InjectionKey, Ref } from "vue"
import User from '@library-management/common/entity/user'
import ToastManager from "./ToastManager"
import { Api } from "../api/Api"
import { UserRole } from "@library-management/common/entity/user/role"

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
  canManageUserOfRole(role: UserRole) {
    if(!this.data.user) {
      return false
    }
    const myRole = this.data.user.role
    if(myRole == UserRole.Root) {
      return role != UserRole.Root
    }
    if(myRole == UserRole.Admin) {
      return role != UserRole.Root && role != UserRole.Admin
    }
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
    const display_name = this.data.user.display_name
    if('' == display_name) {
      return this.getUsername()
    }
    return display_name
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

  private __putIntent(intent: any) {
    sessionStorage[this.data.config.cookiePrefix + '__' + 'intent'] = JSON.stringify(intent)
  }
  private __getIntent() {
    try {
      return JSON.parse(sessionStorage[this.data.config.cookiePrefix + '__' + 'intent'])
    } catch(err) {
      return null
    }
  }

  putIntent(intent: any) {
    this.__putIntent(intent)
    if(null != globalIntentTimeout) {
      clearTimeout(globalIntentTimeout)
    }
    // globalIntentTimeout = setTimeout(() => {
    //   this.__putIntent(null)
    //   globalIntentTimeout = null
    // }, 30000)
  }

  getIntent() {
    const bak = this.__getIntent()
    if(null != globalIntentTimeout) {
      clearTimeout(globalIntentTimeout)
    }
    this.__putIntent(null)
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
