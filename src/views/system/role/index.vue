<template>
  <div style="padding: 30px;">
    <el-button v-permission="['sys:role:edit']" type="primary" size="medium" @click="addRole">添加角色</el-button>
  </div>
</template>

<script>

import { roleData } from '@/api/system/role'
// import { roleData, saveRole, delRole } from '@/api/system/role'
// import { MessageBox, Message } from 'element-ui'

export default {
  name: 'RoleManage',
  data() {
    return {
      roles: [],
      temp: {
        id: undefined,
        name: '',
        enname: ''
      }
    }
  },
  created() {
    // 获取角色
    this.getRoles()
  },
  methods: {
    getRoles() {
      roleData().then(response => {
        if (response.code === 0) {
          this.roles = response.data
        }
      })
    },
    addRole() {

    }
  }
}
</script>

<style scoped>

</style>
