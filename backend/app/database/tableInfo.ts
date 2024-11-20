import globalConfig from "../config/globalConfig";
import { SqlEscape } from "./SqlEscape";

const schemaData = {
  'dataver_journal': {
    'dataver': 'int primary key'
  },
  'users': {
    'username': 'varchar(250) primary key',
    'password': 'varchar(250)',
    'email': 'text',
    'display_name': 'text',
    'role': 'text',
    'can_reset': 'int',
    'enabled': 'int',
    'private_key': 'text',
    'public_key': 'text'
  },
  'users_session': {
    'username': 'varchar(250) , foreign key(username) references [users](username) on delete cascade on update cascade',
    'password': 'varchar(250)',
    'session': 'varchar(250) primary key',
    'secret': 'varchar(250)',
    'expire': 'bigint'
  },
  'users_password_reset': {
    'username': 'varchar(250) primary key , foreign key(username) references [users](username) on delete cascade on update cascade',
    'password': 'varchar(250)',
    'secret': 'varchar(250)'
  },
  'titles': {
    'book_number': 'varchar(250) primary key',
    'title': 'text',
    'author': 'text',
    'publisher': 'text',
    'year': 'int',
    'place': 'text',
    'url': 'text',
    'price_milliunit': 'bigint',
    'description': 'text',
    'to_purchase_amount': 'int'
  },
  'stocks': {
    'book_number': 'varchar(250) , foreign key(book_number) references [titles](book_number) on delete cascade on update cascade',
    'barcode': 'varchar(250) primary key',
    'deprecated': 'bool',
    'notes': 'text'
  },
  'borrows': {
    'seq': 'bigint primary key auto_increment',
    'barcode': 'varchar(250) , foreign key(barcode) references [stocks](barcode) on delete cascade on update cascade',
    'username': 'varchar(250) , foreign key(username) references [users](username) on delete cascade on update cascade',
    'borrow_time': 'bigint',
    'due_time': 'bigint',
    'return_time': 'bigint',
    'notes': 'text'
  }
}

export type TableName = keyof typeof schemaData

class TableInfo {
  __addPrefix(name: string) {
    return globalConfig.tableNamespace() + '__' + name
  }
  name(name: TableName) {
    return this.__addPrefix(name)
  }
  schema(name: TableName) {
    return schemaData[name]
  }
  schemaText(name: TableName) {
    const schema = this.schema(name)
    return Object.keys(schema).map(key => {
      return `${key} ${(schema as any)[key]}`.replace(/\[(.*?)\]/g, (text) => {
        const tableName = text.substring(1, text.length - 1)
        return SqlEscape.escapeId(this.__addPrefix(tableName))
      })
    }).join(', ')
  }
  idList(): (TableName)[] {
    return Object.keys(schemaData).map(item => item as TableName)
  }
}

const tableInfo = new TableInfo()
export default tableInfo
