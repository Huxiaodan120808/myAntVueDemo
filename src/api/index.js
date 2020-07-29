import request from './request';
export const ApiService = {
  /**
   * 注册
   * @param{
   * username
   * password
   * }
   */
  register: (params) => {
    return request.post('/user/register', params).then(res => res);
  },
  /**
  * 登录
  * @param{
  * username
  * password
  * }
  */
  login: (params) => {
    return request.post('/user/login', params).then(res => res);
  },
  /**
  * 测试
  */
  test: (params) => {
    return request.get('/user/test', params).then(res => res.data);
  },
  /**
  * 获取用户列表
  */
  getUserList: (params) => {
    return request.get('/user/list', params).then(res => res.data);
  },
  /**
  * 删除用户
  * @param userId String 删除的用户Id
  */
  deleteUser: (userId, params) => {
    return request.delete(`/user/${userId}`, params).then(res => res.data);
  },
  /**
  * 更新用户
  * @param userId String 修改的用户Id
  * @param user Object 修改的用户对象
  */
  updateUser: (userId, params) => {
    return request.put(`/user/${userId}`, params).then(res => res.data);
  }
}