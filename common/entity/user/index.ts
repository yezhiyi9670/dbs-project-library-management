import Entity from "../Entity";
import { UserRole } from "./role";
import { UserValidation } from "./validation";

export default class User implements Entity {
  __hasDerivatives: boolean = false
  public borrows: number = 0
  public active_borrows: number = 0
  public overdue_records: number = 0

  constructor(
    public username: string = '',
    public password: string = '',
    public email: string = '',
    public display_name: string = '',
    public role: UserRole = UserRole.Reader,
    public can_reset: boolean = false,
    public enabled: boolean = false,
    public private_key: string = '',
    public public_key: string = '',
  ) {
    if(username != '') {  // Do not validate if this is a dummy call
      this.validate_()
    }
  }

  static withDerivatives() {
    const ret = new User()
    ret.__hasDerivatives = true
    return ret
  }

  validate_() {
    UserValidation.validateUsername_(this.username)
    UserValidation.validateEmail_(this.email)
    UserValidation.validateDisplayName_(this.display_name)
    UserValidation.validateRole_(this.role)
    UserValidation.validatePrivateKey_(this.private_key)
    UserValidation.validatePublicKey_(this.public_key)
  }

  sensitiveFields(isManageApi: boolean) {
    if(isManageApi) {
      return ['password']
    } else {
      return ['password', 'private_key', 'public_key']
    }
  }

  derivativeFields() {
    return [
      'borrows', 'active_borrows', 'overdue_records'
    ]
  }
}
