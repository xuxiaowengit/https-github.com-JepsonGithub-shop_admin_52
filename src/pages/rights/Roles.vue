<template>
  <div class="roles">
    <el-breadcrumb separator-class="el-icon-right">
      <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加按钮 -->
    <el-button type="success" plain>添加角色</el-button>

    <!-- 表格 -->
    <el-table :data="roleList">
      <el-table-column type="expand">
        <!-- row是一行的数据, 就是一个角色, row.children 就是他有的所有一级权限 -->
        <template v-slot="{ row }">
          <!-- <el-tag v-for="item in row.children" :key="item.id">{{ item.authName }}</el-tag> -->
          <!-- 每个一级权限, 应该是一行 -->
          <el-row class="l1" v-for="l1 in row.children" :key="l1.id">
            <el-col :span="4">
              <el-tag @close="delRight(row, l1.id)" closable>{{ l1.authName }}</el-tag>
            </el-col>
            <el-col :span="20">
              <!-- 每个二级权限, 都应该是一行 -->
              <el-row class="l2" v-for="l2 in l1.children" :key="l2.id">
                <el-col :span="4">
                  <el-tag @close="delRight(row, l2.id)" closable type="success">{{ l2.authName }}</el-tag>
                </el-col>
                <el-col :span="20">
                  <!-- 每个三级权限, 直接用 el-tag渲染即可 -->
                  <el-tag @close="delRight(row, l3.id)" class="l3" closable type="warning" v-for="l3 in l2.children" :key="l3.id">{{ l3.authName }}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色名称"  prop="roleName"></el-table-column>
      <el-table-column label="描述"  prop="roleDesc"></el-table-column>
      <el-table-column label="操作">
        <template v-slot="{ row }">
          <el-button icon="el-icon-edit"  plain size="mini" circle type="primary"></el-button>
          <el-button icon="el-icon-delete"  plain size="mini" circle type="danger"></el-button>
          <el-button @click="showAssignDialog(row)" icon="el-icon-edit"  plain size="mini" round type="success">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分配的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="assignVisible"
      width="40%">

      <el-tree
        ref="tree"
        node-key="id"
        default-expand-all
        show-checkbox
        :data="data"
        :props="defaultProps"></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="assignVisible = false">取 消</el-button>
        <el-button @click="assignRights" type="primary">分 配</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      assignVisible: false,
      roleList: [],
      data: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      roleId: ''
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      // 发送ajax获取所有的角色列表
      const { meta, data } = await this.$axios.get('roles')
      if (meta.status === 200) {
        this.roleList = data
        console.log(this.roleList)
      } else {
        this.$message.error(meta.msg)
      }
    },
    async delRight (row, rightId) {
      // console.log(roleId, rightId)
      // 根据 id 发送ajax请求, 让后台删除对应的权限
      // data 就是删除完成之后, 该用户剩余的权限
      const { data, meta } = await this.$axios.delete(`roles/${row.id}/rights/${rightId}`)

      if (meta.status === 200) {
        this.$message.success(meta.msg)
        // 这里是重新获取全部的角色列表 => 效果: 整个表格都更新了
        // 我们需要更新的只是某一个角色即可
        // this.getRoleList()
        // 目标: 将返回的剩余权限, 赋值给当前row.children, 用以修改当前角色的权限
        row.children = data
      } else {
        this.$message.error(meta.msg)
      }
    },
    async showAssignDialog (row) {
      this.roleId = row.id
      this.assignVisible = true
      // 一显示对话框, 就应该发送ajax请求, 获取全部的权限列表数据, 用于展示(树形的)
      const { meta, data } = await this.$axios.get(`rights/tree`)
      if (meta.status === 200) {
        // 获取全部的用户展示的数据, 完成之后, 进行已有权限的回显
        this.data = data
        // console.log(this.data)
        // console.log(row.children)

        // 设置一级选中, 会全部选中二级和三级
        // 设置二级选中, 会全部选中三级 (不太合理)
        // 正确: 设置三级即可, 如果真的全部三级被选了, 对应的二级和一级也会自动被选中
        // this.$refs.tree.setCheckedKeys([103])

        // 需求: 需要拿到该角色, 所有的三级权限的 id, 进行设置
        const ids = []
        row.children.forEach(l1 => {
          l1.children.forEach(l2 => {
            l2.children.forEach(l3 => {
              ids.push(l3.id)
            })
          })
        })
        this.$refs.tree.setCheckedKeys(ids)
      } else {
        this.$message.error(meta.msg)
      }
    },
    async assignRights () {
      // 1. 获取到已经分配的全部权限 id
      // 需要获取到是 全选(钩) 和 半选(横杠) 的 id
      const ids = this.$refs.tree.getCheckedKeys() // 全选的(钩)
      const halfs = this.$refs.tree.getHalfCheckedKeys() // 半选的(横杠)
      const rids = [...ids, ...halfs].join(',')

      // 2. 根据拿到的 id 发送 ajax 请求
      const { meta } = await this.$axios.post(`roles/${this.roleId}/rights`, { rids })
      if (meta.status === 200) {
        this.$message.success(meta.msg)
        // 关闭对话框
        this.assignVisible = false
        // 重新渲染
        this.getRoleList()
      } else {
        this.$message.error(meta.msg)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.l1 {
  margin-bottom: 10px;
  border-bottom: 1px dashed #ccc;
}
.l2 {
  margin-bottom: 10px;
}
.l3 {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
