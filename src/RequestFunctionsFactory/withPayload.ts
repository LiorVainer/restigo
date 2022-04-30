import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { WithPayloadHTTPMethods } from "../types/methods.types";
import { defaultOnErrorFunction } from "../types/onError";
import { Key } from "../types/payload";
import { BaseParamType, Route } from "../types/route";
import { ServiceConfig, ServiceFunction } from "../types/service.types";
import { mergeRequestConfig } from "../utils/config";
import { onSuccessHandle } from "../utils/onSuccess.utils";
import { payloadBuilder } from "../utils/payload";
import { routeBuilder, routeBuilderWithParam } from "../utils/route";
import { payloadValidationHandle } from "../utils/validation.utils";

export interface WithPayloadRequestFactoryProps {
  axios: AxiosInstance;
  prefix: string;
  method: WithPayloadHTTPMethods;
  serviceConfig?: ServiceConfig;
}

type DataPayload<T> = T | { [key in Key]: T };

/**
 * Util Method For Sending HTTP Requests
 * @param axios - Axios Instance
 * @param prefix - Request Route Prefix
 * @param method - HTTP Method with Payload
 * @param serviceConfig - Upper Level Multiple Methods Service Configuration
 * @returns - Request Function of selected method with route: "prefix/route"
 */
export const withPayloadRequest =
  ({ axios, prefix, method, serviceConfig }: WithPayloadRequestFactoryProps) =>
  <ResponseDataType = any, PayloadType = ResponseDataType>(
    route?: Route,
    key?: Key,
    config?: AxiosRequestConfig,
    serviceFunction?: ServiceFunction
  ): ((data: PayloadType) => Promise<AxiosResponse<ResponseDataType>>) => {
    return async (data: PayloadType) => {
      const metadata = { serviceConfig, serviceFunction };

      payloadValidationHandle(data, metadata);

      return axios[method]<DataPayload<PayloadType>, AxiosResponse<ResponseDataType>>(
        routeBuilder(prefix, route),
        payloadBuilder(data, key ? key : serviceConfig?.payloadKey),
        mergeRequestConfig(axios.defaults, serviceConfig?.requestConfig, config)
      )
        .then((res) => onSuccessHandle(res, metadata))
        .catch(serviceConfig?.onError ?? defaultOnErrorFunction);
    };
  };

/**
 * Util Method For Sending HTTP Requests
 * @param axios - Axios Instance
 * @param prefix - Request Route Prefix
 * @param method - HTTP Method with Payload
 * @param serviceConfig - Upper Level Multiple Methods Service Configuration
 * @returns - Request Function of selected method with route: "prefix/route"
 */
export const withPayloadRequestByParam =
  ({ axios, prefix, method, serviceConfig }: WithPayloadRequestFactoryProps) =>
  <ResponseDataType = any, PayloadType = ResponseDataType, ParamType extends BaseParamType = string>(
    route?: Route,
    key?: Key,
    config?: AxiosRequestConfig,
    serviceFunction?: ServiceFunction
  ): ((param: ParamType, data: PayloadType) => Promise<AxiosResponse<ResponseDataType>>) => {
    return async (param: ParamType, data: PayloadType) => {
      const metadata = { serviceConfig, serviceFunction };

      payloadValidationHandle(data, metadata);

      return axios[method]<DataPayload<PayloadType>, AxiosResponse<ResponseDataType>>(
        routeBuilderWithParam(prefix, param, route),
        payloadBuilder(data, key ? key : serviceConfig?.payloadKey),
        mergeRequestConfig(axios.defaults, serviceConfig?.requestConfig, config)
      )
        .then((res) => onSuccessHandle(res, metadata))
        .catch(serviceConfig?.onError ?? defaultOnErrorFunction);
    };
  };