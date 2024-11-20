import Entity from "../Entity";
import { StockValidation } from "./validation";

export default class Stock implements Entity {
  constructor(
    public book_number: string = '',
    public barcode: string = '',
    public deprecated: boolean = false,
    public notes: string = ''
  ) {
    if(this.barcode != '') {
      this.validate_()
    }
  }

  validate_() {
    StockValidation.validateBookNumber_(this.book_number)
    StockValidation.validateBarcode_(this.barcode)
    StockValidation.validateNotes_(this.notes)
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
