import Entity from "../Entity";
import { EntityUtils } from "../EntityUtils";
import Stock from "../stock";
import { BorrowValidation } from "./validation";

export default class Borrow implements Entity {
  __hasDerivatives: boolean = false
  public $stock: Stock | null = null
  public overdue: boolean = false

  constructor(
    public uuid: string = '',
    public barcode: string = '',
    public username: string = '',
    public borrow_time: number = 0,
    public due_time: number = 0,
    public returned: boolean = false,
    public return_time: number = 0,
    public borrow_notes: string = '',
  ) {
    if(this.uuid != '') {
      this.validate_()
    }
  }

  static withDerivatives() {
    const ret = new Borrow()
    ret.__hasDerivatives = true
    return ret
  }

  static fromExtDict(dict: any) {
    if(dict == null) {
      return null
    }
    const ret = Borrow.withDerivatives()
    EntityUtils.fromDict(ret, dict, false)
    ret.$stock = Stock.fromExtBaseDict(dict)
    return ret
  }
  static fromExtDicts(dicts: any[]) {
    return dicts.map(dict => Borrow.fromExtDict(dict))
  }

  validate_() {
    BorrowValidation.validateUuid_(this.uuid)
    BorrowValidation.validateBarcode_(this.barcode)
    BorrowValidation.validateUsername_(this.username)
    BorrowValidation.validateTime_(this.borrow_time)
    BorrowValidation.validateTime_(this.due_time)
    BorrowValidation.validateTime_(this.return_time)
    BorrowValidation.validateNotes_(this.borrow_notes)
  }

  sensitiveFields(isManageApi: boolean) {
    if(isManageApi) {
      return []
    } else {
      return [
        'borrow_notes'
      ]
    }
  }

  derivativeFields() {
    return [ 'overdue' ]
  }
}
