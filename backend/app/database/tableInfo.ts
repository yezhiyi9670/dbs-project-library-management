import globalConfig from "../config/globalConfig";
import { SqlEscape } from "./SqlEscape";

const schemaData = {
  'dataver_journal': {
    'dataver': 'int not null primary key'
  },
  'users': {
    'username': 'varchar(250) not null primary key',
    'password': 'varchar(250) not null',
    'email': 'text not null',
    'display_name': 'text not null',
    'role': 'text not null',
    'can_reset': 'bool not null',
    'enabled': 'bool not null',
    'private_key': 'text not null',
    'public_key': 'text not null'
  },
  'users_session': {
    'username': 'varchar(250) not null , foreign key(username) references [users](username) on delete cascade on update cascade',
    'password': 'varchar(250) not null',
    'session': 'varchar(250) not null primary key',
    'secret': 'varchar(250) not null',
    'expire': 'bigint not null'
  },
  'users_password_reset': {
    'username': 'varchar(250) not null primary key , foreign key(username) references [users](username) on delete cascade on update cascade',
    'password': 'varchar(250) not null',
    'secret': 'varchar(250) not null'
  },
  'titles': {
    'book_number': 'varchar(250) not null primary key',
    'title': 'text not null',
    'author': 'text not null',
    'publisher': 'text not null',
    'year': 'int not null',
    'place': 'text not null',
    'url': 'text not null',
    'price_milliunit': 'bigint not null',
    'description': 'text not null',
    'to_purchase_amount': 'int not null'
  },
  'stocks': {
    'book_number': 'varchar(250) not null , foreign key(book_number) references [titles](book_number) on delete cascade on update cascade',
    'barcode': 'varchar(250) not null primary key',
    'deprecated': 'bool not null',
    'stock_notes': 'text not null'
  },
  'borrows': {
    'uuid': 'varchar(250) not null primary key',
    'barcode': 'varchar(250) not null , foreign key(barcode) references [stocks](barcode) on delete cascade on update cascade',
    'username': 'varchar(250) not null , foreign key(username) references [users](username) on delete cascade on update cascade',
    'borrow_time': 'bigint not null',
    'due_time': 'bigint not null',
    'returned': 'bool not null',
    'return_time': 'bigint not null',
    'borrow_notes': 'text not null'
  }
}

export type TableName = (keyof typeof schemaData)
export type TableOrViewName = TableName | 'stocks_view_borrowed' | 'titles_view_stats' | 'users_view_stats' | 'borrows_view_overdue'

class TableInfo {
  __addPrefix(name: string) {
    return globalConfig.tableNamespace() + '__' + name
  }
  name(name: TableOrViewName) {
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
  idList(): TableName[] {
    return Object.keys(schemaData).map(item => item as TableName)
  }
}

const tableInfo = new TableInfo()
export default tableInfo
