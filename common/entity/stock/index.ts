import Entity from "../Entity";
import { EntityUtils } from "../EntityUtils";
import Title from "../title";
import { StockValidation } from "./validation";

export default class Stock implements Entity {
  __hasDerivatives: boolean = false
  public $title: Title | null = null
  public borrowed: boolean = false
  public borrowed_by: string = ''
  public borrowed_due: number = -1
  public borrowed_overdue: boolean = false

  constructor(
    public book_number: string = '',
    public barcode: string = '',
    public deprecated: boolean = false,
    public stock_notes: string = '',
  ) {
    if(this.barcode != '') {
      this.validate_()
    }
  }

  static fromExtBaseDict(dict: any) {
    if(dict == null) {
      return null
    }
    const ret = new Stock()
    EntityUtils.fromDict(ret, dict, false)
    ret.$title = new Title()
    EntityUtils.fromDict(ret.$title, dict, false)
    return ret
  }
  static fromExtDict(dict: any) {
    if(dict == null) {
      return null
    }
    const ret = Stock.withDerivative()
    EntityUtils.fromDict(ret, dict, false)
    ret.$title = new Title()
    EntityUtils.fromDict(ret.$title, dict, false)
    return ret
  }
  static fromExtDicts(dicts: any[]) {
    return dicts.map(dict => Stock.fromExtDict(dict))
  }

  static withDerivative() {
    const ret = new Stock()
    ret.__hasDerivatives = true
    return ret
  }

  validate_() {
    StockValidation.validateBookNumber_(this.book_number)
    StockValidation.validateBarcode_(this.barcode)
    StockValidation.validateNotes_(this.stock_notes)
  }

  sensitiveFields(isManageApi: boolean) {
    if(isManageApi) {
      return []
    } else {
      return [
        'stock_notes'
      ]
    }
  }

  derivativeFields() {
    return [ 'borrowed', 'borrowed_due', 'borrowed_by', 'borrowed_overdue' ]
  }
}
