<template>
  <div class="flex-between-top height-100 margin-left-15">
    <div class="flex-direction-column-left"
         style="width: 400px;">
      <a-radio-group :value="type"
                     class="width-100 flex-start margin-bottom-15"
                     @change="handleChange">
        <a-radio-button value="test">
          测试
        </a-radio-button>
        <a-radio-button value="list">
          用户列表
        </a-radio-button>
      </a-radio-group>
      <a-table v-if="type === 'list'"
               class="width-100"
               :columns="columns"
               :rowKey="rowKey"
               :data-source="userList">
        <span slot="action"
              slot-scope="text, record">
          <a @click="changeHandle(record)">修改</a>
          <a @click="deleteHandle(record)">删除</a>
        </span>
      </a-table>
      <div v-else>{{test}}</div>
    </div>
    <a-tabs default-active-key="activeTab"
            v-model="activeTab"
            class="login-form text-align-left"
            @change="changeTab">
      <a-tab-pane key="register"
                  tab="注册">
        <a-form-model ref="ruleForm"
                      :model="form"
                      :rules="rules"
                      class="login-form"
                      :label-col="{ span: 5 }"
                      :wrapper-col="{ span: 12 }">
          <a-form-model-item label="用户名"
                             prop="username">
            <a-input v-model="form.username" />
          </a-form-model-item>
          <a-form-model-item label="密码"
                             prop="password">
            <a-input v-model="form.password" />
          </a-form-model-item>
          <a-form-model-item :wrapper-col="{ span: 12, offset: 5 }">
            <div class="flex-end">
              <a-button type="primary"
                        class="margin-right-15"
                        html-type="submit"
                        @click="registerSubmit">
                注册
              </a-button>
            </div>
          </a-form-model-item>
        </a-form-model>
      </a-tab-pane>
      <a-tab-pane key="login"
                  tab="登录"
                  force-render>
        <a-form-model ref="ruleForm"
                      :model="form"
                      :rules="rules"
                      :label-col="{ span: 5 }"
                      :wrapper-col="{ span: 12 }">
          <a-form-model-item label="用户名"
                             prop="username">
            <a-input v-model="form.username" />
          </a-form-model-item>
          <a-form-model-item label="密码"
                             prop="password">
            <a-input v-model="form.password" />
          </a-form-model-item>
          <a-form-model-item :wrapper-col="{ span: 12, offset: 5 }">
            <div class="flex-end">
              <a-button type="primary"
                        html-type="submit"
                        @click="loginSubmit">
                登录
              </a-button>
            </div>
          </a-form-model-item>
        </a-form-model>
      </a-tab-pane>
    </a-tabs>
    <a-modal title="修改用户"
             :visible="changeUserVisible"
             :confirm-loading="confirmLoading"
             @ok="updateUser"
             @cancel="changeUserVisible = false;"
             ok-text="确认"
             cancel-text="取消">
      <a-form-model ref="ruleForm"
                    :model="currentUser"
                    :rules="rules"
                    class="login-form"
                    :label-col="{ span: 5 }"
                    :wrapper-col="{ span: 12 }">
        <a-form-model-item label="用户名"
                           prop="username">
          <a-input v-model="currentUser.username" />
        </a-form-model-item>
        <a-form-model-item label="密码"
                           prop="password">
          <a-input v-model="currentUser.password" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { ApiService } from '@/api';
import _ from 'lodash';
export default {
  data () {
    return {
      test: '',
      type: 'list',
      activeTab: 'register',
      changeUserVisible: false,
      confirmLoading: false,
      currentUser: {
        username: '',
        password: ''
      },
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名!' }],
        password: [{ required: true, message: '请输入密码!' }]
      },
      columns: [
        {
          title: '用户id',
          dataIndex: 'userId',
          key: 'userId',
          ellipsis: true
        },
        {
          title: '用户名',
          dataIndex: 'username',
          key: 'username',
          ellipsis: true
        },
        {
          title: '密码',
          dataIndex: 'password',
          key: 'password',
          ellipsis: true
        },
        {
          title: 'Action',
          key: 'action',
          width: 130,
          scopedSlots: { customRender: 'action' },
        }
      ],
      userList: []
    };
  },
  computed: {
    rowKey () {
      return (record, index) => index
    }
  },
  methods: {
    changeTab () {
      this.$refs.ruleForm.resetFields();
    },
    handleChange (e) {
      let that = this;
      that.type = e.target.value;
      switch (e.target.value) {
        case 'test': {
          that.testSubmit();
          break;
        }
        case 'list': {
          that.getUserList();
          break;
        }
      }
    },
    /**
     * 测试 
     *
     */
    testSubmit () {
      let that = this;
      ApiService.test().then(res => {
        console.log(res)
        that.test = res;
      }).catch(err => {
        console.log(err);
      })
    },
    /**
     * 获取用户列表
     * 
     */
    getUserList () {
      let that = this;
      ApiService.getUserList().then(res => {
        that.userList = res.data;
      }).catch(err => {
        console.log(err);
      })
    },
    /**
     * 注册用户
     * 
     * @param username
     * @param password
     */
    registerSubmit () {
      let that = this;
      that.$refs.ruleForm.validate(valid => {
        if (valid) {
          ApiService.register({ username: that.form.username, password: that.form.password }).then(res => {
            console.log(res.data)
            if (res.data.code === 200) {
              that.$message.success('注册成功！');
              that.getUserList();
              that.activeTab = 'login';
            } else {
              that.$message.error(res.data.msg);
            }
          }).catch(err => {
            console.log(err);
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    /**
     * 登录用户
     * 
     * @param username
     * @param password
     */
    loginSubmit () {
      let that = this;
      that.$refs.ruleForm.validate(valid => {
        if (valid) {
          ApiService.login({ username: that.form.username, password: that.form.password }).then(res => {
            if (res.data.code === 200) {
              that.$message.info('登录成功！');
            } else {
              that.$message.error(res.data.msg);
            }
          }).catch(err => {
            console.log(err);
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    /**
     * 修改
     */
    changeHandle (item) {
      let that = this;
      that.changeUserVisible = true;
      that.currentUser = _.cloneDeep(item);
    },
    /**
     * 修改submit
     */
    updateUser () {
      let that = this;
      that.confirmLoading = true;
      ApiService.updateUser(that.currentUser.id, that.currentUser).then(res => {
        console.log(res)
        if (res.code == 200) {
          that.getUserList();
          that.$message.success('修改用户成功！');
        } else {
          that.$message.error('修改用户失败！');
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        that.confirmLoading = false;
        that.changeUserVisible = false;
      })
    },
    /**
     * 删除
     */
    deleteHandle (item) {
      let that = this;
      console.log(item);
      ApiService.deleteUser(item.id).then(res => {
        console.log(res)
        if (res.code == 200) {
          that.getUserList();
          that.$message.success('删除成功！');
        } else {
          that.$message.error('删除用户失败！');
        }
      }).catch(err => {
        console.log(err);
      })
    }
  },
  created () {
    this.getUserList();
  }
};
</script>
<style lang="less" scoped>
.login-form {
  width: 500px;
}
</style>

