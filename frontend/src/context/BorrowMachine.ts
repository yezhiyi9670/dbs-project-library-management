import { ref } from "vue"
import { useAppContext } from "./AppContext"
import { Api } from "../api/Api"

export type TaskItem = {
  barcode: string,
  bookTitle: string | null,
  success: boolean | null,
  msg: string | null
}

export function useBorrowMachine(apiBase: 'borrow/' | 'borrow/manage/') {
  const appContext = useAppContext()
  const tasks = ref<TaskItem[]>([])

  async function handleNewItem(action: 'borrow' | 'return' | 'check', barcode: string, extraData: {} = {}) {
    if(tasks.value.filter(item => item.barcode == barcode).length > 0) {
      appContext.value.showToast('这本书已经扫描过，请勿重复扫描')
      return
    }
    const secret = (window as any).__library_terminal_secret ?? ''
    const entry: TaskItem = {
      barcode: barcode,
      bookTitle: null,
      success: null,
      msg: null
    }
    let is_renew = false
    tasks.value = [ entry, ...tasks.value ]
    let result = await appContext.value.post(apiBase + {
      check: 'check',
      borrow: 'borrow',
      return: 'return'
    }[action], { barcode, __secret: secret, ...extraData })
    if(action == 'borrow' && !result.success && result.data.code == 'already_borrowed') {
      result = await appContext.value.post(apiBase + 'renew', {
        barcode, __secret: secret, ...extraData
      }) // Already borrowed, try to renew
      is_renew = true
    }
    if(result.success) {
      entry.bookTitle = result.data.$stock.$title.title
      if(action == 'check') {
        if(result.data.deprecated) {
          entry.msg = '此书将淘汰，不可借阅'
          entry.success = false
        } else {
          entry.success = true
          if(result.data.borrowed) {
            let msg = ''
            if(result.data.borrowed_by_you) {
              msg += '此书正在被你借阅'
            } else {
              msg += appContext.value.isLoggedIn() ? '此书正在被其他人借阅' : '此书正在被借阅'
            }
            msg += '，截止时间 ' + new Date(result.data.borrowed_due * 1000).toLocaleString()
            if((+new Date()) > result.data.borrowed_due * 1000) {
              msg += '，已逾期'
            }
            entry.msg = msg
          } else {
            entry.msg = '此书现在可以借阅'
          }
        }
      } else if(action == 'borrow') {
        entry.success = true
        entry.msg = (is_renew ? '续借成功' : '借阅成功') + '，请在 ' + new Date(result.data.due_time * 1000).toLocaleString() + ' 前归还'
      } else if(action == 'return') {
        entry.success = true
        let msg = '归还成功' + (result.data.return_time > result.data.due_time ? '，已逾期' : '')
        msg += '，请放回 ' + result.data.$stock.$title.place
        entry.msg = msg
      }
      tasks.value = [...tasks.value]  // Vue does not make the task deeply reactive
    } else {
      tasks.value = tasks.value.filter(item => item.barcode != barcode)
      appContext.value.showToast(Api.errorMessage(result.data), 4000)
    }
  }

  return { tasks, handleNewItem }
}
