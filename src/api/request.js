import qs from "qs"; //参数编译
import axios from "axios";

import {
  pushPending,
  removePending,
  existInPending,
  createTask,
  handleTask,
} from "./requestMethods";

const getHeaders = { "Content-Type": "application/json" };
const postHeaders = { "Content-Type": "application/x-www-form-urlencoded" };
const fileHeaders = { "Content-Type": "multipart/form-data" };

const baseURL = "http://localhost:3001";

//请求封装
export const request = (
  method,
  url,
  params,
  headers,
  preventRepeat = false,
  uploadFile = false
) => {
  let key = baseURL + url + "?" + qs.stringify(params);
  return new Promise((resolve, reject) => {
    console.log(baseURL + url, " baseURL + url,");
    const instance = axios.create({
      baseURL: baseURL + url,
      headers,
      timeout: 30 * 1000,
    });
    instance.interceptors.request.use(
      (config) => {
        if (preventRepeat) {
          config.cancelToken = new axios.CancelToken((cancelToken) => {
            // 判断是否存在请求中的当前请求 如果有取消当前请求
            if (existInPending(key)) {
              cancelToken();
            } else {
              pushPending({ key });
            }
          });
        }
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    instance.interceptors.response.use(
      (response) => {
        if (preventRepeat) {
          removePending(response.config);
        }
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 请求执行前加入task
    createTask(key, resolve);
    instance(
      Object.assign(
        {},
        { method },
        method === "post" || method === "put"
          ? { data: !uploadFile ? qs.stringify(params) : params }
          : { params }
      )
    )
      .then((response) => {
        // 处理task
        console.log("处理task");
        handleTask(key, response);
      })
      .catch(() => {});
  });
};

// 定义对外Get、Post请求
export default {
  // 单独导出 用于put等非常规请求及需要特殊处理header的请求
  request,
  get(url, data = {}, preventRepeat = true) {
    return request("get", url, data, getHeaders, preventRepeat, false);
  },
  post(url, data = {}, preventRepeat = true) {
    return request("post", url, data, postHeaders, preventRepeat, false);
  },
  file(url, data = {}, preventRepeat = true) {
    return request("post", url, data, fileHeaders, preventRepeat, true);
  },
};
