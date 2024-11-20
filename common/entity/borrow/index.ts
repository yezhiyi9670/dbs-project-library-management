import Entity from "../Entity";
import { BorrowValidation } from "./validation";

export default class Borrow implements Entity {
  constructor(
    public seq: number = -1,
    public barcode: string = '',
    public username: string = '',
    public borrow_time: number = 0,
    public due_time: number = 0,
    public return_time: number = 0,
    public notes: string = ''
  ) {
    if(this.seq != -1) {
      this.validate_()
    }
  }

  validate_() {
    BorrowValidation.validateSeq_(this.seq)
    BorrowValidation.validateBarcode_(this.barcode)
    BorrowValidation.validateUsername_(this.username)
    BorrowValidation.validateTime_(this.borrow_time)
    BorrowValidation.validateTime_(this.due_time)
    BorrowValidation.validateTime_(this.return_time)
    BorrowValidation.validateNotes_(this.notes)
  }

  sensitiveFields(isManageApi: boolean) {
    if(isManageApi) {
      return []
    } else {
      return [
        'notes'
      ]
    }
  }
}
