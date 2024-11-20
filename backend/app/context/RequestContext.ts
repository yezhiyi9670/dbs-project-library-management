import User from '@library-management/common/entity/user';
import express from 'express'
import cookieInfo from './cookieInfo';
import globalConfig from '../config/globalConfig';
import { UserAuth } from '../authentication/UserAuth';
import LoginRequiredError from "@library-management/common/error/authentication/LoginRequiredError"
import PermissionDeniedError from "@library-management/common/error/authentication/PermissionDeniedError"
import ImproperRoleError from "@library-management/common/error/authentication/ImproperRoleError"
import { UserRole } from '@library-management/common/entity/user/role';

export default class RequestContext {
  constructor(
    /**
     * User info of the logged in user
     */
    public user: User | null,
    /**
     * Verified session ID.
     */
    public sessionId: string | null,
  ) {}

  /**
   * Assert that the user has logged in
   */
  checkLoggedIn_() {
    if(this.user == null) {
      throw new LoginRequiredError()
    }
  }

  checkCanManageUsers_() {
    this.checkLoggedIn_()
    if(-1 == [UserRole.Root, UserRole.Admin].indexOf(this.user!.role)) {
      throw new PermissionDeniedError()
    }
  }

  canManipulateRole(target: UserRole) {
    if(!this.user) {
      return false
    }
    if(this.user.role == UserRole.Root) {
      return target != UserRole.Root
    }
    if(this.user.role == UserRole.Admin) {
      return target != UserRole.Root && target != UserRole.Admin
    }
  }

  checkCanManipulateRole_(target: UserRole) {
    this.checkLoggedIn_()
    this.checkCanManageUsers_()
    if(!this.canManipulateRole(target)) {
      throw new ImproperRoleError(this.user!.role, target)
    }
  }
}

async function verifyUserAsync(req: express.Request): Promise<[User | null, string | null]> {
  const cookies = req.cookies ?? {}

  const sessionId = cookies[cookieInfo.name('session_id')]
  const sessionSecret = cookies[cookieInfo.name('session_secret')]
  const reqbody = req.body

  if(typeof sessionId != 'string' || typeof sessionSecret != 'string') {
    return [null, null]
  }

  // Session ID must be reclarified in the request body. This helps prevent CSRF.
  if(Object.keys(reqbody).length > 0 && globalConfig.csrfCheck()) {
    if(reqbody['session'] !== sessionId) {
      return [null, null]
    }
  }

  return await UserAuth.verifySessionAsync(sessionId, sessionSecret)
}

export async function gatherContextAsync(req: express.Request): Promise<RequestContext> {
  const [ user, sessionId ] = await verifyUserAsync(req)

  return new RequestContext(user, sessionId)
}
