export default interface Entity {
  validate_(): void
  sensitiveFields(isManageApi: boolean): string[]
}
