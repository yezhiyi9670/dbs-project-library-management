import { UserRole } from "../../entity/user/role";
import UserCausedError from "../UserCausedError";

export default class ImproperRoleError extends UserCausedError {
  id = 'improper_role'
  msg = ''
  args: unknown[] = []

  constructor(
    current_role: UserRole,
    target_role: UserRole
  ) {
    super()
    this.msg = `Current role ${current_role} cannot manipulate role ${target_role}.`
    this.args = [current_role, target_role]
  }
}
