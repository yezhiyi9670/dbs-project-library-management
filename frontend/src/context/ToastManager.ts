import { RandomToken } from '@library-management/common/crypto/RandomToken'

export default class ToastManager {
  text: string = ''
  activeToastToken: string = ''
  showing: boolean = false

  schedulePhaseout(token: string, timeout: number) {
    setTimeout(() => {
      if(this.activeToastToken != token) return
      this.hide()
    }, timeout)
  }

  hide() {
    if(!this.showing) {
      return
    }
    this.showing = false
    this.activeToastToken = ''
  }

  show(text: string, timeout: number) {
    const token = this.activeToastToken = RandomToken.alphanum(24)
    if(!this.showing) {
      this.text = text
      this.showing = true
      this.schedulePhaseout(token, timeout)
    } else {
      this.showing = false
      setTimeout(() => {
        if(token != this.activeToastToken) return
        this.text = text
        this.showing = true
        this.schedulePhaseout(token, timeout)
      }, 200)
    }
  }
}
