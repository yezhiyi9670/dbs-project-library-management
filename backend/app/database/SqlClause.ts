import { Validation } from "@library-management/common/entity/Validation"
import { SqlEscape } from "./SqlEscape"
import tableInfo, { TableOrViewName } from "./tableInfo"

export type TableOrViewNameOrJoins = TableOrViewName | TableOrViewName[]

class JoinPresets {
  users: TableOrViewNameOrJoins = ['users', 'users_view_stats']
  titles: TableOrViewNameOrJoins = ['titles', 'titles_view_stats']
  stocks: TableOrViewNameOrJoins = ['stocks', 'stocks_view_borrowed']
  stocks_ext: TableOrViewNameOrJoins = ['titles', 'stocks', 'stocks_view_borrowed']
  borrows: TableOrViewNameOrJoins = ['borrows', 'borrows_view_overdue']
  borrows_ext: TableOrViewNameOrJoins = ['titles', 'stocks', 'borrows', 'borrows_view_overdue']
}
export const joinPresets = new JoinPresets()

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

  export function escapeIdOrJoins(table: TableOrViewNameOrJoins) {
    if(!Array.isArray(table)) {
      return SqlEscape.escapeId(tableInfo.name(table))
    }
    if(table.length == 0) {
      throw new Error('Cannot query from a join of zero tables.')
    }
    return table.map(item => SqlEscape.escapeId(tableInfo.name(item))).join(' natural join ')
  }
  export function selectAnything(table: TableOrViewNameOrJoins) {
    return 'SELECT * from ' + escapeIdOrJoins(table)
  }
  export function selectAnythingWhereDict(table: TableOrViewNameOrJoins, dict: Object) {
    return `${selectAnything(table)} ${whereClauseFromDict(dict)}`
  }

  export function deleteAnything(table: TableOrViewName) {
    return 'DELETE from ' + SqlEscape.escapeId(tableInfo.name(table))
  }
  export function deleteAnythingWhereDict(table: TableOrViewName, dict: Object) {
    return `${deleteAnything(table)} ${whereClauseFromDict(dict)}`
  }

  export function updateAnythingFromDict(table: TableOrViewName, dict: Object) {
    let clause = ''
    for(let key in dict) {
      if(clause != '') {
        clause += ', '
      }
      clause += SqlEscape.escapeId(key) + '=' + SqlEscape.escape((dict as any)[key])
    }
    return `UPDATE ${SqlEscape.escapeId(tableInfo.name(table))} set ${clause}`
  }
  export function updateAnythingFromDictWhereDict(table: TableOrViewName, set: Object, where: Object) {
    return `${updateAnythingFromDict(table, set)} ${whereClauseFromDict(where)}`
  }

  export function insertFromDict(table: TableOrViewName, dict: Object) {
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
    if(rn < 0) {  // The datatable component use -1 to represent all.
      return ''
    }
    return `Limit ${SqlEscape.escape((Math.max(0, pn - 1)) * rn)}, ${SqlEscape.escape(rn)}`
  }
  export function sortingClause(sort_by: unknown, sort_dir: unknown) {
    // 注意：目前实现的排序有不致命的安全隐患——数据库中不允许用户查看的域也能用来排序
    if(sort_by == null) {
      return ''
    }
    if(sort_dir == null) {
      sort_dir = 'asc'
    }
    if(typeof sort_by != 'string' || (sort_dir != 'asc' && sort_dir != 'desc')) {
      return ''
    }
    if(sort_by.indexOf('.') != -1) {
      sort_by = sort_by.substring(sort_by.lastIndexOf('.') + 1)
    }
    if(typeof sort_by != 'string') {
      return ''
    }
    return `Order by ${SqlEscape.escapeId(sort_by)} ${sort_dir}`
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

  export function orCondition(conditions: string[]) {
    if(conditions.length == 0) {
      return '1=0'
    }
    let clause = ''
    for(let condition of conditions) {
      if(clause != '') {
        clause += ' or '
      }
      clause += '(' + condition + ')'
    }
    return clause
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
