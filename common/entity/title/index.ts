import Entity from "../Entity";
import { TitleValidation } from "./validation";

export default class Title implements Entity {
  constructor(
    public book_number: string = '',
    public title: string = '',
    public author: string = '',
    public publisher: string = '',
    public year: number = 1970,
    public place: string = '',
    public url: string = '',
    public price_milliunit: number = 0,
    public description: string = '',
    public to_purchase_amount: number = 0
  ) {
    if(this.book_number != '') {
      this.validate_()
    }
  }

  validate_() {
    TitleValidation.validateBookNumber_(this.book_number)
    TitleValidation.validateTitle_(this.title)
    TitleValidation.validateAuthor_(this.author)
    TitleValidation.validatePublisher_(this.publisher)
    TitleValidation.validateYear_(this.year)
    TitleValidation.validatePlace_(this.place)
    TitleValidation.validateUrl_(this.url)
    TitleValidation.validatePrice_(this.price_milliunit)
    TitleValidation.validateDescription(this.description)
    TitleValidation.validateToPurchaseAmount(this.to_purchase_amount)
  }

  sensitiveFields(isManageApi: boolean) {
    if(isManageApi) {
      return []
    } else {
      return [
        'to_purchase_amount'
      ]
    }
  }
}
