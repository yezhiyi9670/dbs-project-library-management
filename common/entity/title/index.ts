import Entity from "../Entity";
import { TitleValidation } from "./validation";

export default class Title implements Entity {
  __hasDerivatives: boolean = false
  public total: number = -1
  public borrowed: number = -1
  public deprecated: number = -1
  public deprecated_and_borrowed: number = -1

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
    public to_purchase_amount: number = 0,
  ) {
    if(this.book_number != '') {
      this.validate_()
    }
  }

  normal_and_unborrowed() {
    return this.total - this.borrowed - this.deprecated + this.deprecated_and_borrowed
  }
  normal_and_borrowed() {
    return this.total - this.deprecated
  }
  normal() {
    return this.total - this.deprecated
  }

  static withDerivatives() {
    const ret = new Title()
    ret.__hasDerivatives = true
    return ret
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
    TitleValidation.validateDescription_(this.description)
    TitleValidation.validateToPurchaseAmount_(this.to_purchase_amount)
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

  derivativeFields(): string[] {
    return [
      'total', 'borrowed', 'deprecated', 'deprecated_and_borrowed'
    ]
  }
}
