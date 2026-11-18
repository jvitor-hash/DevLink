export interface ServiceRequestInterface<T = any> {
  success: boolean;
  data: T | null;
  errors: any;
}
