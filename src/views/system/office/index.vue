<template>
  <div style="padding: 30px;">
    <el-button v-permission="['sys:office:edit']" type="primary" size="medium" @click="addOffice">添加机构</el-button>
    <el-table :data="offices" row-key="id" border>
      <el-table-column align="center" prop="name" label="名称" />
      <el-table-column align="center" prop="type" label="类型">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 1">公司</span>
          <span v-if="scope.row.type === 2">一级部门</span>
          <span v-if="scope.row.type === 3">二级部门</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="code" label="机构编码" />
      <el-table-column align="center" prop="zipCode" label="邮政编码" />
      <el-table-column align="center" prop="master" label="负责人" />
      <el-table-column align="center" prop="phone" label="电话" />
      <el-table-column align="center" prop="address" label="联系地址" />
      <el-table-column v-permission="['sys:office:edit']" align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="medium" circle @click.native="editOffice(scope.row)">编辑</el-button>
          <el-button type="text" size="medium" circle @click.native="delOffice(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-permission="['sys:office:edit']" v-loading="dialogLoading" :title="dialogTextMap[dialogStatus]" :visible.sync="dialogVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="70px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="层级" prop="type">
          <el-select v-model="temp.type" @change="levelChange(temp.type)">
            <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <!--部门-->
        <el-form-item v-show="temp.type === 2" label="父级" prop="parentId">
          <el-select v-model="temp.parentId">
            <el-option v-for="item in offices" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <!--小组-->
        <el-form-item v-show="temp.type === 3" label="父级" prop="parentId">
          <el-select v-model="temp.parentId">
            <el-option-group v-for="group in offices" :key="group.id" :label="group.name" :value="group.id">
              <el-option v-for="item in group.children" :key="item.id" :label="item.name" :value="item.id" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="机构编码" prop="code">
          <el-input v-model="temp.code" />
        </el-form-item>
        <el-form-item label="邮政编码" prop="zipCode">
          <el-input v-model="temp.zipCode" />
        </el-form-item>
        <el-form-item label="负责人" prop="master">
          <el-input v-model="temp.master" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>
        <el-form-item label="联系地址" prop="address">
          <el-input v-model="temp.address" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="temp.remarks" type="textarea" :row="3" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOffice()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import { officeData, saveOffice, delOffice } from '@/api/system/office'
import { MessageBox, Message } from 'element-ui'
import permission from '@/directive/permission/index'

export default {
  name: 'OfficeManage',
  directives: { permission },
  data() {
    return {
      offices: [],
      temp: {
        id: undefined,
        name: '',
        type: 1,
        code: '',
        zipCode: '',
        master: '',
        address: '',
        phone: '',
        parentId: '',
        parentIds: [],
        remarks: ''
      },
      levels: [
        {
          label: '公司',
          value: 1
        },
        {
          label: '一级部门',
          value: 2
        },
        {
          label: '二级部门',
          value: 3
        }
      ],
      dialogVisible: false,
      dialogLoading: false,
      dialogTextMap: {
        create: '新增机构',
        update: '编辑机构'
      },
      dialogStatus: '',
      rules: {
        name: [
          { required: true, message: '该项是必填项', trigger: 'blur' },
          { max: 30, message: '长度不得超过30', trigger: 'blur' }
        ],
        parentId: [{ required: true, message: '该项是必填项', trigger: 'blur' }],
        parentIds: [{ required: true, message: '该项是必填项', trigger: 'blur' }],
        code: [
          { required: true, message: '该项是必填项', trigger: 'blur' },
          { max: 100, message: '长度不得超过100', trigger: 'blur' }
        ],
        zipCode: [{ max: 100, message: '长度不得超过100', trigger: 'blur' }],
        master: [{ max: 100, message: '长度不得超过100', trigger: 'blur' }],
        address: [{ max: 255, message: '长度不得超过255', trigger: 'blur' }],
        phone: [{ max: 200, message: '长度不得超过200', trigger: 'blur' }],
        remarks: [{ max: 200, message: '长度不得超过200', trigger: 'blur' }]
      }
    }
  },
  computed: {
  },
  created() {
    // 获取机构
    this.getOffice()
  },
  methods: {
    getOffice() {
      officeData().then(response => {
        if (response.code === 0) {
          this.offices = response.data
        }
      })
    },
    addOffice() {
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.resetTemp()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    editOffice(row) {
      this.temp = Object.assign({}, row)
      this.temp.parentIds = this.temp.parentIds.split(',')
      delete this.temp.children
      this.dialogStatus = 'update'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    delOffice(row) {
      MessageBox.confirm('将删除该机构及下属机构,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        closeOnPressEscape: false
      }).then(() => {
        delOffice({ id: row.id }).then(response => {
          if (response.code === 0) {
            Message.success('删除成功')
            this.getOffice()
          } else if (response.code === 1) {
            Message.error(response.msg)
          }
        })
      })
    },
    saveOffice() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.dialogLoading = true
          delete this.temp.parentIds
          saveOffice(this.temp).then(response => {
            if (response.code === 0) {
              Message.success('保存成功')
              this.getOffice()
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
    levelChange(level) {
      if (level === 2 && this.offices.length > 0) {
        this.temp.parentId = this.offices[0].id
        this.temp.parentIds = [this.temp.parentId]
      } else if (level === 3 && this.offices.length > 0 && this.offices[0].children && this.offices[0].children.length > 0) {
        this.temp.parentId = this.offices[0].children[0].id
        this.temp.parentIds = this.offices[0].children[0].parentIds.split(',')
      } else {
        this.temp.parentId = '0'
        this.temp.parentIds = ['0']
      }
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        type: 1,
        code: '',
        zipCode: '',
        master: '',
        address: '',
        phone: '',
        parentId: '0',
        parentIds: ['0'],
        remarks: ''
      }
    }
  }
}
</script>
<style scoped>

</style>
