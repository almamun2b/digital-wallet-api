interface TErrorSources {
  path: string;
  message: string;
}

interface TGenericErrorResponse {
  statusCode: number;
  message: string;
  errorSources?: TErrorSources[];
}

export { TErrorSources, TGenericErrorResponse };
