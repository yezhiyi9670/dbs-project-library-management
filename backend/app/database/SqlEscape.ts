import mysql from 'mysql'

export namespace SqlEscape {
  export function escape(str: any) {
    return mysql.escape(str)
  }
  export function escapeId(id: string) {
    return mysql.escapeId(id)
  }
  export function addSlashes(str: string) {
    return str.replace(/(\%|\_|\\)/g, (char) => {
      return {'%': '\\%', '_': '\\_', '/': '\\'}[char] ?? char
    })
  }
  export function escapeLikePattern(str: string) {
    const add_slashes_str = addSlashes(str)
    return `${mysql.escape(add_slashes_str)}`
  }
  export function escapeLikeContains(str: string) {
    const add_slashes_str = '%' + addSlashes(str) + '%'
    return mysql.escape(add_slashes_str)
  }
}
