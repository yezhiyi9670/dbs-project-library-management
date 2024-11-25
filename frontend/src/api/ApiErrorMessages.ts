import { Api } from "./Api"

export function fieldName(name: string) {
  switch(name) {
    case 'email':
      return `电子邮箱`
    case 'password':
      return `密码`
    case 'book_numbers': case 'book_number': case 'old_book_number':
      return `书号`
    case 'barcodes': case 'barcode': case 'barcode_prefix':
      return `条码`
    case 'users': case 'username': case 'old_username':
      return `用户名`
    case 'uuid':
      return `UUID`
    case 'borrow_notes': case 'stock_notes':
      return `注记`
    case 'title':
      return `书名`
    case 'author':
      return `作者`
    case 'publisher':
      return `出版社`
    case 'year_min': case 'year_max': case 'year':
      return `年份`
    case 'overdue_min':
      return `逾期次数`
    case 'search_key':
      return `搜索关键字`
    case 'roles':
      return `权限等级`
    case 'display_name':
      return `显示名称`
    case 'private_key':
      return `卡密私钥`
    case 'public_key':
      return `卡密公钥`
    case 'place':
      return `线下藏书地点`
    case 'url':
      return `在线阅读网址`
    case 'price_milliunit': case 'price_min': case 'price_max':
      return `价格`
    case 'description':
      return `描述文字`
    case 'to_purchase_amount':
      return `待采购数量`
  }
  return name
}

export function fieldInvalidMessage(name: string) {
  switch(name) {
    case 'email':
      return `电子邮箱必须含有恰好一个 @ 字符`
    case 'password':
      return `密码不能为空`
    case 'book_numbers': case 'book_number': case 'old_book_number':
      return `书号只能包含字母、数字和 _-$`
    case 'barcodes': case 'barcode': case 'barcode_prefix':
      return `条码只能包含字母、数字和 _-$`
    case 'users': case 'username': case 'old_username':
      return `用户名只能包含字母、数字和 _-$`
    case 'uuid':
      return `UUID 必须符合格式规范，包括连字符`
    case 'year_min': case 'year_max': case 'year':
      return `年份必须是整数`
    case 'overdue_min':
      return `逾期次数必须是整数`
    case 'price_milliunit': case 'price_min': case 'price_max':
      return `价格必须是千分之一的倍数`
    case 'to_purchase_amount':
      return `待采购数量必须是整数`
  }
  return `${fieldName(name)}的格式不正确`
}

export function apiErrorMessage(error: Api.Error, isForm: boolean = false) {
  const args = error.args
  switch(error.code) {
    case 'improper_role':
      return `当前权限等级 ${args[0]} 不能操作权限等级 ${args[1]}`
    case 'invalid_credentials':
      return `用户名或密码错误`
    case 'login_required':
      return `此功能需要登录才能使用`
    case 'old_password_required':
      return `需要正确的原密码才能修改${fieldName(args[0])}`
    case 'permission_denied':
      return `权限不够`
    case 'user_disabled':
      return `此用户已被禁止登录`
    case 'already_borrowed':
      return `书本 ${args[0]} 已被借阅，不能重复借阅`
    case 'already_overdue':
      return `书本 ${args[0]} 已经逾期，不能续借。请先归还再重新借阅。`
    case 'max_borrow_reached':
      return `你已达到借阅数量上限`
    case 'not_borrowed_by_you':
      return `书本 ${args[0]} 并非由你借阅`
    case 'not_on_library_terminal':
      return `此操作只能在图书馆借阅终端上完成`
    case 'stock_deprecated':
      return `书本 ${args[0]} 即将淘汰，不能借阅`
    case 'already_exists':
      return `实体 ${args[0]} 已存在，不能重复创建`
    case 'bad_sorting':
      return `排序条件 ${args[0]} 不在数据库内`
    case 'not_found':
      return `实体 ${args[0]} 不存在，无法读取`
    case 'malformed_response':
      return `服务端返回了无法解析的数据`
    case 'network_error':
      return `网络错误，无法连接至服务器`
    case 'action_not_found':
      return `API 动作不存在`
    case 'malformed_data':
      return `应用发送了服务端无法解析的数据`
    case 'unknown_error':
      return `服务器出现了未知错误`
    case 'field_invalid':
      return fieldInvalidMessage(args[0])
    case 'field_too_long':
      if(!isForm) {
        return `${fieldName(args[0])}超过了长度限制 ${args[1]}`
      } else {
        return `长度上限为 ${args[1]}`
      }
    case 'no_data':
      return `应用没有发送必要的数据`
  }
  return error.code + '(' + error.args.map(v => JSON.stringify(v)).join(', ') + ')'
}
