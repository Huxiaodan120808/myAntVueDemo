import Vue from 'vue';
import axios from 'axios';
// import router from '@/router/index';
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  // timeout: 25000 // request timeout 50000
  timeout: 50000 // request timeout 50000
});
// 同一个请求取最后一个请求
let pending = [];
let CancelToken = axios.CancelToken;
let cancelPending = (config) => {
  pending.forEach((item, index) => {
    if (config) {
      if (item.UrlPath === config.url) {
        item.Cancel({ iscancel: true }); // 取消请求
        pending.splice(index, 1); // 移除当前请求记录
      }
    } else {
      item.Cancel({ iscancel: true }); // 取消请求
      pending.splice(index, 1); // 移除当前请求记录
    }
  });
};

// http request 拦截器
service.interceptors.request.use(
  config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';
    let authToken = localStorage.adminToken;
    if (authToken) {
      config.headers.Authorization = authToken;
    }
    // 如果要求改请求是单例的，则先把上次请求cancel，再取最新的请求作为结果
    if (config.single) {
      cancelPending(config);
      config.cancelToken = new CancelToken(res => {
        pending.push({ 'UrlPath': config.url, 'Cancel': res });
      });
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);
// http response 拦截器
service.interceptors.response.use(response => {
  if (response.data) {
    if (response.data.responseStatus === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminPermissions');
      // router.push('/');
    }
  }
  return response;
}, err => {
  let errMessage = '';
  let isCancelRequest = false;
  if (err && err.response) {
    switch (err.response.status) {
      case 400:
        errMessage = '错误请求';
        break;
      case 401:
        errMessage = '未授权，请重新登录';
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminPermissions');
        // router.push('/');
        break;
      case 403:
        errMessage = '拒绝访问';
        break;
      case 404:
        errMessage = '请求错误,未找到该资源';
        break;
      case 405:
        errMessage = '请求方法未允许';
        break;
      case 408:
        errMessage = '请求超时';
        break;
      case 500:
        // errMessage = '微服务故障, 请稍后再试';
        break;
      case 501:
        errMessage = '网络未实现';
        break;
      case 502:
        errMessage = '网络错误';
        break;
      case 503:
        errMessage = '服务不可用';
        break;
      case 504:
        errMessage = '网络超时';
        break;
      case 505:
        errMessage = 'http版本不支持该请求';
        break;
      default:
        errMessage = `连接错误`;
    }
  } else {
    console.log(err);
    // errMessage = "连接到服务器失败";
    if (err.message.iscancel) {
      isCancelRequest = true;
    } else {
      errMessage = "您已经在其他地方登录，请确认！";
      setTimeout(() => {
        // parent.location.href = '/';
      }, 1000);
    }
  }
  // console.log(err.response);
  if (!isCancelRequest) {
    if (errMessage) {
      Vue.prototype.$notify.error(errMessage);
    } else {
      Vue.prototype.$notify.error(err.response.data.message);
    }
  }
  return Promise.reject(err.response); //reject 错误在catch输出， resolve 在then输出
});
export default service;