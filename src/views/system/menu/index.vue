<template>
  <div style="padding: 30px;">
    <el-button v-permission="['sys:menu:edit']" type="primary" size="medium" @click="addMenu">添加菜单</el-button>
    <el-table :data="menus" row-key="id" :row-class-name="rowClassName" border>
      <el-table-column align="center" prop="name" label="名称" />
      <el-table-column align="center" prop="href" label="链接" />
      <el-table-column align="center" prop="permission" label="标识" />
      <el-table-column v-permission="['sys:menu:edit']" align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="medium" circle @click.native="editMenu(scope.row)">编辑</el-button>
          <el-button type="text" size="medium" circle @click.native="delMenu(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-permission="['sys:menu:edit']" v-loading="dialogLoading" :title="dialogTextMap[dialogStatus]" :visible.sync="dialogVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="70px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="层级" prop="type">
          <el-select v-model="temp.type" @change="levelChange()">
            <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="temp.type === 2" label="父级" prop="parentId">
          <el-select v-model="temp.parentId">
            <el-option v-for="item in firstLevelMenu" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="temp.type === 3" label="父级" prop="parentId">
          <el-select v-model="temp.parentId">
            <el-option-group v-for="group in firstLevelMenu" :key="group.id" :label="group.name" :value="group.id">
              <el-option v-for="item in group.children" :key="item.id" :label="item.name" :value="item.id" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="链接" prop="href">
          <el-input v-model="temp.href" />
        </el-form-item>
        <el-form-item label="标识" prop="permission">
          <el-input v-model="temp.permission" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMenu()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import { menuData, saveMenu, delMenu } from '@/api/system/menu'
import { MessageBox, Message } from 'element-ui'
import permission from '@/directive/permission/index'

export default {
  name: 'MenuManage',
  directives: { permission },
  data() {
    return {
      menus: [],
      temp: {
        id: undefined,
        name: '',
        type: 1,
        href: '',
        permission: '',
        parentId: ''
      },
      levels: [
        {
          label: '模块',
          value: 1
        },
        {
          label: '功能',
          value: 2
        },
        {
          label: '权限',
          value: 3
        }
      ],
      dialogVisible: false,
      dialogLoading: false,
      dialogTextMap: {
        create: '新增菜单',
        update: '编辑菜单'
      },
      dialogStatus: '',
      rules: {
        name: [
          { required: true, message: '该项是必填项', trigger: 'blur' },
          { max: 20, message: '长度不得超过20', trigger: 'blur' }
        ],
        href: [{ max: 200, message: '长度不得超过200', trigger: 'blur' }],
        permission: [{ max: 200, message: '长度不得超过200', trigger: 'blur' }]
      }
    }
  },
  computed: {
    firstLevelMenu() {
      return this.menus.filter(a => a.type === 1)
    }
  },
  created() {
    // 获取菜单
    this.getMenu()
  },
  methods: {
    rowClassName({ row }) {
      if (row.type === 1) {
        return 'first-level'
      } else if (row.type === 2) {
        return 'second-level'
      }
      return ''
    },
    getMenu() {
      menuData().then(response => {
        if (response.code === 0) {
          this.menus = response.data
        }
      })
    },
    addMenu() {
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.resetTemp()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    editMenu(row) {
      // copy obj
      this.temp = Object.assign({}, row)
      delete this.temp.children
      this.dialogStatus = 'update'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    delMenu(row) {
      MessageBox.confirm('将删除该菜单及其子菜单,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        closeOnPressEscape: false
      }).then(() => {
        delMenu({ id: row.id }).then(response => {
          if (response.code === 0) {
            Message.success('删除成功')
            this.getMenu()
          } else if (response.code === 1) {
            Message.error(response.msg)
          }
        })
      })
    },
    saveMenu() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.dialogLoading = true
          saveMenu(this.temp).then(response => {
            if (response.code === 0) {
              Message.success('保存成功')
              this.getMenu()
              this.dialogVisible = false
              this.dialogLoading = false
              this.resetTemp()
            } else if (response.code === 1) {
              this.dialogLoading = false
              Message.error(response.msg)
            }
          }).catch(() => {
            this.dialogLoading = false
          })
        }
      })
    },
    levelChange() {
      this.temp['parentId'] = ''
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        title: '',
        type: 1,
        href: '',
        permission: '',
        parentId: ''
      }
    }
  }
}
</script>
<style>
.el-table .first-level {
  background: #EBEEF5;
}
.el-table .second-level {
  background: #f0f9eb;
}
</style>
