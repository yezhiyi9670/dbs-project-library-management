export default interface Entity {
  /**
   * Contains proper derivative fields
   */
  __hasDerivatives: boolean
  /**
   * Validate the fields
   */
  validate_(): void
  /**
   * The fields that should not be displayed in API
   */
  sensitiveFields(isManageApi: boolean): string[]
  /**
   * The fields that should not be stored to DB
   */
  derivativeFields(): string[]
}
