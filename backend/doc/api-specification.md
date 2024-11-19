## 数据版本 `__dataver_journal`

```plain
dataver int
```

## 用户 `_users`

简单用户系统，角色有 Root、Admin、Librarian 和 Reader。

在智能终端系统上，用户可以借助刷卡完成无密码登录。登录时，用户提供自己的 ID，并使用卡密私钥对服务端提供的质询（有效时间 30s，每 10s 刷新）进行签名，签名验证成功则允许登录。

```plain
username varchar(255) primary key,
password* varchar(255),
email text,
display_name text,
role text,
can_reset int,
enabled int,
private_key? text,  # 存储私钥是不正确的，在此处仅为了演示方便。实际使用时这里的值可以缺失或错误。
public_key? text    # 发卡前为空，用户不能免密登录
```

```plain
/api/user/get-challenge
/api/user/passwordless-login (username, challenge_ans)
/api/user/login (username, password)
/api/user/logout
/api/user/logout-others
/api/user/info
/api/user/update (display_name, old_password?, email?, password?)

/api/user/password-reset/request (username, email)
/api/user/password-reset/confirm (secret, password)

/api/user/manage/list (search_key?)
/api/user/manage/info (username)
/api/user/manage/import (data_csv)
/api/user/manage/update (orig_username?, data...)
/api/user/manage/delete (orig_username)
/api/user/manage/set-enbaled (orig_username)
/api/user/manage/reissue-card (orig_username, public_key?, private_key?)
```

### 附加表：会话 `_users_session`

```plain
username varchar(255),
password*? varchar(255),
session varchar(255) primary key,
secret* varchar(255),
expire bigint
```

注：`password` 是密码哈希，一旦与用户表中的当前密码不再匹配则不生效。用户浏览器仅携带 session 和 secret。无密码登录时 `password` 为空，不校验密码是否匹配。

### 附加表：密码重置信息 `_users_password_reset`

```plain
username varchar(255),
password varchar(255),
secret* varchar(255) primary key
```

注：一个用户只能有一个正在进行的密码重置。~~`password` 是重置前的密码哈希，一旦与用户表中的当前密码不再匹配则不生效。~~

## 书目 `_titles`

```plain
book_number varchar(255) primary key,
title text,
author text,
publisher text,
year int,
place text,
price decimal(18, 2),
description text,
to_purchase_amount int
```

```plain
/api/titles/list (
  search_key?, book_number?, barcode?, year_min?, year_max?, title?, author?, publisher?,
  price_min?, price_max?, status?: (borrowable, borrowed, unavailabe, empty)
)
/api/titles/info (book_number)

/api/titles/manage/import (csv_data)
/api/titles/manage/export-query (
  search_key?, book_number?, barcode?, year_min?, year_max?, title?, author?, publisher?,
  price_min?, price_max?, status?: (borrowable, borrowed, unavailabe, empty)
)
/api/titles/manage/update (book_number, data...)
/api/titles/manage/delete (book_number)
```

## 书籍 `_stocks`

```plain
book_number varchar(255),
barcode varchar(255) primary key,
deprecated int,
notes text
```

```plain
/api/stocks/manage/list (barcode_prefix?)
/api/stocks/manage/import (csv_data)
/api/stocks/manage/export-query (barcode_prefix?)
/api/stocks/manage/enroll (book_number, barcode)
/api/stocks/manage/info (barcode)
/api/stocks/manage/set-notes (barcode, notes)
/api/stocks/manage/deprecate (barcode)
/api/stocks/manage/revive (barcode)
/api/stocks/manage/delete (barcode)
```

## 借阅记录 `_borrows`

```plain
seq bigint primary key,
borrow_time bigint,
due_time bigint,
return_time bigint
```

```plain
/api/borrows/borrow (barcode)
/api/borrows/renew (barcode)
/api/borrows/return (barcode)
/api/borrows/my (barcode_prefix?)
/api/borrows/check (barcode)  # 仅返回“可用”“正在被借阅”“正在被你借阅”“正在被其他人借阅”或者“即将淘汰”

/api/borrows/manage/list (barcode_prefix?, username?, time_from?, time_to?)
/api/borrows/manage/borrow (barcode, username, time, due_time)
/api/borrows/manage/renew (barcode, username, due_time)
/api/borrows/manage/return (barcode)
/api/borrows/manage/delete (seq)
```

## 统计接口

```plain
/api/stats  # 提供馆藏书目数量、书籍数量，以及正在被借阅的数量。如果有图书管理员身份，另外提供待采购数量、待采购总金额和待出库数量。
```
