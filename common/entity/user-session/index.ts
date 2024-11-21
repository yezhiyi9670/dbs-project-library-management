import Entity from "../Entity";
import { SessionValidation } from "./validation";

export default class UserSession implements Entity {
  __hasDerivatives: boolean = false

  constructor(
    public username: string = '',
    public password: string = '',
    public session: string = '',
    public secret: string = '',
    public expire: number = 0
  ) {
    if(this.username != '') {
      this.validate_()
    }
  }

  validate_() {
    SessionValidation.validateUsername_(this.username)
    SessionValidation.validateSession_(this.session)
  }

  sensitiveFields(isManageApi: boolean) {
    return ['password', 'secret']
  }

  derivativeFields() {
    return []
  }
}
