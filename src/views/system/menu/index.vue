<template>
  <div style="padding: 30px;">
    <el-table :data="menus" row-key="id" :row-class-name="rowClassName">
      <el-table-column align="center" prop="name" label="名称" />
      <el-table-column align="center" prop="permission" label="标识" />
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'MenuManage',
  data() {
    return {
      menus: [
        {
          id: 1,
          name: 'test1',
          permission: 'test:1',
          children: [
            {
              id: 11,
              name: 'test11',
              permission: 'test:11'
            },
            {
              id: 12,
              name: 'test12',
              permission: 'test:12'
            }
          ]
        },
        {
          id: 2,
          name: 'test2',
          permission: 'test:2',
          children: [
            {
              id: 21,
              name: 'test21',
              permission: 'test:21'
            }
          ]
        },
        {
          id: 3,
          name: 'test3',
          permission: 'test:3'
        }
      ]
    }
  },
  computed: {

  },
  methods: {
    rowClassName({ row, rowIndex }) {
      // console.log(row.children)
      if (row.children) {
        return 'parent-row'
      }
      return ''
    }
  }
}
</script>
<style>
.el-table .parent-row {
  background: #f0f9eb;
}
</style>
