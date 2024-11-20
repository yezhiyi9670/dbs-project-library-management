import { Validation } from "@library-management/common/entity/Validation"
import { SqlEscape } from "./SqlEscape"
import tableInfo, { TableName } from "./tableInfo"

export namespace SqlClause {
  export function whereClauseFromDict(dict: Object) {
    let clause = ''
    for(let key in dict) {
      if(clause != '') {
        clause += ' and '
      }
      clause += SqlEscape.escapeId(key) + '=' + SqlEscape.escape((dict as any)[key])
    }
    return 'Where ' + clause
  }

  export function selectAnything(table: TableName) {
    return 'SELECT * from ' + SqlEscape.escapeId(tableInfo.name(table))
  }
  export function selectAnythingWhereDict(table: TableName, dict: Object) {
    return `${selectAnything(table)} ${whereClauseFromDict(dict)}`
  }

  export function deleteAnything(table: TableName) {
    return 'DELETE from ' + SqlEscape.escapeId(tableInfo.name(table))
  }
  export function deleteAnythingWhereDict(table: TableName, dict: Object) {
    return `${deleteAnything(table)} ${whereClauseFromDict(dict)}`
  }

  export function updateAnythingFromDict(table: TableName, dict: Object) {
    let clause = ''
    for(let key in dict) {
      if(clause != '') {
        clause += ', '
      }
      clause += SqlEscape.escapeId(key) + '=' + SqlEscape.escape((dict as any)[key])
    }
    return `UPDATE ${SqlEscape.escapeId(tableInfo.name(table))} set ${clause}`
  }
  export function updateAnythingFromDictWhereDict(table: TableName, set: Object, where: Object) {
    return `${updateAnythingFromDict(table, set)} ${whereClauseFromDict(where)}`
  }

  export function insertFromDict(table: TableName, dict: Object) {
    let keys_clause = ''
    let values_clause = ''
    for(let key in dict) {
      if(keys_clause != '') {
        keys_clause += ', '
      }
      if(values_clause != '') {
        values_clause += ', '
      }
      keys_clause += SqlEscape.escapeId(key)
      values_clause += SqlEscape.escape((dict as any)[key])
    }
    return `INSERT into ${SqlEscape.escapeId(tableInfo.name(table))}(${keys_clause}) values(${values_clause})`
  }

  export function paginationClause(pn: unknown, rn: unknown) {
    if(rn == null) {
      return ''
    }
    if(pn == null) {
      pn = 1
    }
    if(typeof pn != 'number' || typeof rn != 'number') {
      throw TypeError('Expected pn and rn to be nullable numbers')
    }
    return `Limit ${(Math.max(0, pn - 1)) * rn}, ${rn}`
  }

  export function whereClauseFromAnd(conditions: string[]) {
    if(conditions.length == 0) {
      return ''
    }
    let clause = ''
    for(let item of conditions) {
      if(clause != '') {
        clause += ' and '
      }
      clause += '(' + item + ')'
    }
    return 'Where ' + clause
  }

  export function containsCondition(column: string, values: unknown[]) {
    if(values.length == 0) {
      return '1=0'
    }
    let clause = ''
    for(let item of values) {
      if(clause != '') {
        clause += ' or '
      }
      clause += `${SqlEscape.escapeId(column)}=${SqlEscape.escape(item)}`
    }
    return clause
  }
}
