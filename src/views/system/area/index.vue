<template>
  <div style="padding: 30px;">
    <el-button v-permission="['sys:area:edit']" type="primary" size="medium" @click="addArea">添加区域</el-button>
    <el-table :data="areas" row-key="id" border>
      <el-table-column align="center" prop="name" label="名称" />
      <el-table-column align="center" prop="code" label="编码" />
      <el-table-column align="center" prop="type" label="类型">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 1">国家</span>
          <span v-if="scope.row.type === 2">省/直辖市</span>
          <span v-if="scope.row.type === 3">地市</span>
          <span v-if="scope.row.type === 4">区县</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="remarks" label="备注" />
      <el-table-column v-permission="['sys:area:edit']" align="center" prop="handle" label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="medium" @click.native="editArea(scope.row)">编辑</el-button>
          <el-button type="text" size="medium" @click.native="delArea(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-permission="['sys:area:edit']" v-loading="dialogLoading" :title="dialogTextMap[dialogStatus]" :visible.sync="dialogVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="70px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="层级" prop="type">
          <el-select v-model="temp.type" @change="levelChange(temp.type)">
            <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <!--省/直辖市-->
        <el-form-item v-show="temp.type === 2" label="父级" prop="parentId">
          <el-select v-model="temp.parentId">
            <el-option v-for="item in areas" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <!--地市-->
        <el-form-item v-show="temp.type === 3" label="父级" prop="parentId">
          <el-select v-model="temp.parentId">
            <el-option-group v-for="group in areas" :key="group.id" :label="group.name" :value="group.id">
              <el-option v-for="item in group.children" :key="item.id" :label="item.name" :value="item.id" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <!--区县-->
        <el-form-item v-show="temp.type === 4" label="父级" prop="parentIds">
          <el-cascader v-model="temp.parentIds" :options="cascade" :props="{label:'name',value: 'id'}" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="temp.code" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="temp.remarks" type="textarea" :row="3" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveArea()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import { areaData, saveArea, delArea } from '@/api/system/area'
import { MessageBox, Message } from 'element-ui'
import permission from '@/directive/permission/index'

export default {
  name: 'AreaManage',
  directives: { permission },
  data() {
    return {
      areas: [],
      province: [],
      cities: [],
      cascade: [],
      temp: {
        id: undefined,
        name: '',
        type: 1,
        code: '',
        parentId: '',
        parentIds: [],
        remarks: ''
      },
      // 1：国家；2：省份、直辖市；3：地市；4：区县
      levels: [
        {
          label: '国家',
          value: 1
        },
        {
          label: '省份/直辖市',
          value: 2
        },
        {
          label: '地市',
          value: 3
        },
        {
          label: '区县',
          value: 4
        }
      ],
      dialogVisible: false,
      dialogLoading: false,
      dialogTextMap: {
        create: '新增区域',
        update: '编辑区域'
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
          { max: 10, message: '长度不得超过10', trigger: 'blur' }
        ],
        remarks: [{ max: 200, message: '长度不得超过200', trigger: 'blur' }]
      }
    }
  },
  computed: {
  },
  created() {
    // 获取区域
    this.getArea()
  },
  methods: {
    getArea() {
      areaData().then(response => {
        if (response.code === 0) {
          this.areas = response.data
          this.cascade = JSON.parse(JSON.stringify(response.data))
          this.cascade.forEach(a => {
            if (a.children && a.children.length > 0) {
              a.children.forEach(b => {
                if (b.children && b.children.length > 0) {
                  b.children.forEach(c => delete c.children)
                }
              })
            }
          })
        }
      })
    },
    addArea() {
      this.dialogStatus = 'create'
      this.dialogVisible = true
      this.resetTemp()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    editArea(row) {
      this.temp = Object.assign({}, row)
      this.temp.parentIds = this.temp.parentIds.split(',')
      delete this.temp.children
      this.dialogStatus = 'update'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    delArea(row) {
      MessageBox.confirm('将删除该区域及下属区域,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        closeOnPressEscape: false
      }).then(() => {
        delArea({ id: row.id }).then(response => {
          if (response.code === 0) {
            Message.success('删除成功')
            this.getArea()
          } else if (response.code === 1) {
            Message.error(response.msg)
          }
        })
      })
    },
    saveArea() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.dialogLoading = true
          if (this.temp.type === 4) {
            this.temp.parentId = this.temp.parentIds[this.temp.parentIds.length - 1]
          }
          delete this.temp.parentIds
          saveArea(this.temp).then(response => {
            if (response.code === 0) {
              Message.success('保存成功')
              this.getArea()
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
      if (level === 2 && this.areas.length > 0) {
        this.temp.parentId = this.areas[0].id
        this.temp.parentIds = [this.temp.parentId]
      } else if (level === 3 && this.areas.length > 0 && this.areas[0].children && this.areas[0].children.length > 0) {
        this.temp.parentId = this.areas[0].children[0].id
        this.temp.parentIds = this.areas[0].children[0].parentIds.split(',')
      } else if (level === 4 && this.areas.length > 0 && this.areas[0].children && this.areas[0].children.length > 0 && this.areas[0].children[0].children && this.areas[0].children[0].children.length > 0) {
        this.temp.parentId = this.areas[0].children[0].children[0].id
        this.temp.parentIds = this.areas[0].children[0].children[0].parentIds.split(',')
        this.temp.parentIds.push(this.temp.parentId)
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
