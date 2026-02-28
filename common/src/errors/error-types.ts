/**
 * Standardized error response types (inspired by barisathi-server)
 */
export interface IErrorSource {
  path: string | number;
  message: string;
}

export interface IErrorResponse {
  statusCode: number;
  message: string;
  errorSources: IErrorSource[];
  stack?: string;
}
