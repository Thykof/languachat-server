export class CreateSessionDto {
  language: string;

  public toString(): string {
    return `CreateSessionDto(language=${this.language})`;
  }
}
