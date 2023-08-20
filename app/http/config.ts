
export interface HttpOptions {
  method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE',
  body?: object,
  withToken?: boolean,
  needErrHandle?: boolean,
}

export interface HttpReturn {
  code: number,
  errMsg:string,
  data?: any
}


export type HttpRequest = (url:string, httpOptions:HttpOptions) => Promise<HttpReturn>

