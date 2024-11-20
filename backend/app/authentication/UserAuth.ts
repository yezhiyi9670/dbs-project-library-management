import User from '@library-management/common/entity/user';
import dbManager from '../database/dbManager';
import { SqlClause } from '../database/SqlClause';
import { EntityUtils } from '@library-management/common/entity/EntityUtils';
import UserSession from '@library-management/common/entity/user-session'
import { PasswordHash } from '../crypto/PasswordHash';
import { SqlEscape } from '../database/SqlEscape';
import InvalidCredentialsError from "@library-management/common/error/authentication/InvalidCredentialsError"
import UserDisabledError from "@library-management/common/error/authentication/UserDisabledError"
import { RandomToken } from '@library-management/common/crypto/RandomToken';
import globalConfig from '../config/globalConfig';
import RequestContext from '../context/RequestContext';

export namespace UserAuth {
  /**
   * Derive the verified user info and session ID from the current session ID and session secret
   */
  export async function verifySessionAsync(sessionId: string, sessionSecret: string): Promise<[User | null, string | null]> {
    const curTime = Math.floor((+new Date()) / 1000)
  
    // Clear out expired sessions
    await dbManager.queryAsync(
      `${SqlClause.deleteAnything('users_session')} Where expire < ${SqlEscape.escape(curTime)}`
    )
    
    // Gather and verify session
    const session = await dbManager.queryEntityAsync(
      UserSession,
      SqlClause.selectAnythingWhereDict('users_session', {
        session: sessionId
      })
    )
    if(!session) {
      return [null, null]  // Session not found
    }
    if(!PasswordHash.verify(sessionSecret, session.secret)) {
      return [null, null]  // Secret invalid
    }
    const username = session.username
  
    // Gather and verify user
    const user = await dbManager.queryEntityAsync(
      User,
      SqlClause.selectAnythingWhereDict('users', {
        username: username
      })
    )
    if(!user) {
      return [null, sessionId]  // User not found
    }
    if(session.password != '' && user.password != session.password) {
      return [null, sessionId]  // Mismatching password for passwordful login
    }
    if(!user.enabled) {
      return [null, sessionId]  // User is banned
    }
    
    return [user, sessionId]  // Login successful
  }

  /**
   * Logout
   */
  export async function logout(context: RequestContext) {
    if(!context.sessionId) {
      return
    }
    await dbManager.queryAsync(SqlClause.deleteAnythingWhereDict('users_session', {
      session: context.sessionId
    }))
  }

  /**
   * Login to a user using password
   * 
   * Throws UserCausedError on any failure case.
   */
  export async function passwordfulLoginAsync(username: string, password: string): Promise<[User, string, string]> {
    const curTime = Math.floor((+new Date()) / 1000)

    const user = await dbManager.queryEntityAsync(
      User,
      SqlClause.selectAnythingWhereDict('users', {
        username: username
      })
    )
    if(!user) {
      throw new InvalidCredentialsError()  // User not found
    }
    if(!PasswordHash.verify(password, user.password)) {
      throw new InvalidCredentialsError()  // Invalid password
    }
    if(!user.enabled) {
      throw new UserDisabledError(username)  // User disabled
    }

    // Login successful, now create a session
    const sessionId = RandomToken.alphanum(24)
    const sessionSecret = RandomToken.alphanum(64)
    const session = new UserSession(
      username, user.password,
      sessionId, PasswordHash.hash(sessionSecret), curTime + globalConfig.sessionExpireTime()
    )
    await dbManager.queryAsync(
      SqlClause.insertFromDict('users_session', EntityUtils.entityToStoredDict(session))
    )

    return [ user, sessionId, sessionSecret ]
  }
}
