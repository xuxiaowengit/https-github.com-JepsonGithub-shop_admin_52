<template>
  <div class="users">
    <el-breadcrumb separator-class="el-icon-right">
      <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-input class="search" placeholder="请输入内容" v-model="query">
      <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
    </el-input>
    <el-button type="success" plain @click="showAdd">添加用户</el-button>
    <!--
      el-table:表格组件
         :data:给表格组件提供数据

         el-table-column ：指定表格的一列
          labe: 指定列表名
          prop: 指令列应该显示的数据 对应的对象中某个属性

          el-table-column：可以通过prop属性控制列默认显示的内容
          也可以在el-table-column中自己提供需要显示的内容
    -->
    <el-table
      :data="userList"
      style="width: 100%">
      <el-table-column
        prop="username"
        label="姓名">
      </el-table-column>
      <el-table-column
        prop="email"
        label="邮箱">
      </el-table-column>
      <el-table-column
        prop="mobile"
        label="电话">
      </el-table-column>
      <el-table-column
        label="用户状态">
        <!-- v-slot:插槽名字 = "obj" -->
        <!-- 组件在插槽提供了数据 row， column， $index ， store-->
        <template v-slot="{row}">
          <el-switch
            v-model="row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="changeUser(row)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column
        label="用户状态">
        <template v-slot="{row}">
          <el-button type="primary" icon="el-icon-edit" circle plain size="mini" @click="showEdit(row)"></el-button>
          <!-- @click="del" 默认会有参数：事件对象  @click="del(item.id, $event)" -->
          <el-button type="danger" icon="el-icon-delete" circle plain size="mini" @click="del(row.id, $event)"></el-button>
          <el-button
            type="success"
            icon="el-icon-edit"
            round
            plain
            size="mini"
            @click="showAssign(row)"
          >分配角色</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--
      el-pagination: 分页组件
      total: 总条数
      current-page 当前页： 1
      每页的条数： 10
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
     -->
    <el-pagination
      background
      layout="total, sizes,  prev, pager, next, jumper"
      :total="total"
      :page-sizes="[5, 10, 15, 20]"
      :current-page="pagenum"
      :page-size="pagesize"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
    </el-pagination>
    <el-dialog title="添加用户" :visible.sync="addVisible" width="35%">
      <el-form :model="form" label-width="80px" :rules="rules" ref="form" status-icon>
        <el-form-item label="用户名" prop="username">
          <el-input placeholder="请输入用户名" v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" prop="password">
          <el-input placeholder="请输入用户密码" v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input placeholder="请输入用户邮箱" v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input placeholder="请输入手机号码" v-model="form.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改用户" :visible.sync="editVisible" width="35%">
      <el-form :model="editForm" label-width="80px" :rules="rules" ref="editForm" status-icon>
        <el-form-item label="用户名">
          <!-- <el-input placeholder="请输入用户名" v-model="editForm.username" disabled></el-input> -->
          <el-tag type="info">{{editForm.username}}</el-tag>
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input placeholder="请输入用户邮箱" v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input placeholder="请输入手机号码" v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="分配角色" :visible.sync="assignVisible" width="35%">
      <el-form :model="assignForm" label-width="80px" :rules="rules" ref="assignForm" status-icon>
        <el-form-item label="用户名">
          <!-- <el-input placeholder="请输入用户名" v-model="editForm.username" disabled></el-input> -->
          <el-tag type="info">{{assignForm.username}}</el-tag>
        </el-form-item>
        <el-form-item label="角色列表" prop="rid">
          <el-select v-model="assignForm.rid" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assignVisible = false">取 消</el-button>
        <el-button type="primary" @click="assign">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      userList: [],
      roleList: [],
      query: '',
      pagenum: 1,
      pagesize: 5,
      total: 0,
      // 添加的对话框，默认隐藏
      addVisible: false,
      editVisible: false,
      assignVisible: false,
      form: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {
        id: '',
        email: '',
        mobile: '',
        username: ''
      },
      assignForm: {
        id: '',
        rid: '',
        username: ''
      },
      rules: {
        username: [
          // username的校验规则
          { required: true, message: '用户名不能为空', trigger: ['change', 'blur'] },
          { min: 3, max: 10, message: '用户名只能是3-10位', trigger: ['change', 'blur'] }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: ['change', 'blur'] },
          { min: 6, max: 12, message: '密码只能是6-12位', trigger: ['change', 'blur'] }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: ['blur', 'change'] }
        ],
        rid: [
          { required: true, message: '角色不能为空', trigger: ['change', 'blur'] }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      // 发送ajax请求，获取用户列表数据
      const { meta, data } = await this.$axios.get('users', {
        params: {
          query: this.query,
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      if (meta.status === 200) {
        console.log(data)
        this.userList = data.users
        this.total = data.total
        console.log(this.userList)
      }
    },
    async del (id, e) {
      try {
        await this.$confirm('你确定要删除吗', '温馨提示', { type: 'warning' })
        // 发送ajax请求
        const { meta } = await this.$axios.delete(`users/${id}`)
        if (meta.status === 200) {
          this.$message.success('删除成功了')
          this.getUserList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch {
        this.$message.info('取消删除')
      } finally {
        // 无论报不报错，都会执行的叫做finally
        // if (e.target.nodeName === 'I')
        // {e.target.blur()}
        // e.target.parentNode.blur()
        if (e.target.nodeName === 'I') {
          e.target.parentNode.blur()
        } else {
          e.target.blur()
        }
      }
    },
    async changeUser ({ id, mg_state: mgState }) {
      const { meta } = await this.$axios.put(`users/${id}/state/${mgState}`)
      if (meta.status === 200) {
        this.$message.success(meta.msg)
        this.getUserList()
      } else {
        this.$message.error(meta.msg)
      }
    },
    handleCurrentChange (index) {
      // console.log(index)
      this.pagenum = index
      this.getUserList()
    },
    handleSizeChange (val) {
      // console.log(val)
      this.pagenum = 1
      this.pagesize = val
      this.getUserList()
    },
    search () {
      this.pagenum = 1
      this.getUserList()
    },
    showAdd () {
      this.addVisible = true
    },
    async add () {
      try {
        await this.$refs.form.validate()
        // 一定校验成功了
        const { meta } = await this.$axios.post('users', this.form)
        console.log(meta)
        if (meta.status === 201) {
          // 提示消息
          this.$message.success(meta.msg)
          // 重置表单
          this.$refs.form.resetFields()
          // 隐藏模态框
          this.addVisible = false
          // 重新渲染 第一页
          // 手动计算最后一页，修改pagenum
          this.total++
          this.pagenum = Math.ceil(this.total / this.pagesize)
          this.getUserList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch {
        return false
      }
    },
    showEdit (row) {
      this.editVisible = true
      // console.log(row)
      // this.editForm.id = row.id
      // this.editForm.username = row.username
      // this.editForm.email = row.email
      // this.editForm.mobile = row.mobile
      // this.editForm = row
      this.editForm = { ...row }
    },
    async edit () {
      // 让整个表单参与校验
      try {
        await this.$refs.editForm.validate()
        // 发送ajax请求
        const { id, email, mobile } = this.editForm
        const { meta } = await this.$axios.put(`users/${id}`, { email, mobile })
        if (meta.status === 200) {
          this.$message.success(meta.msg)
          this.$refs.editForm.resetFields()
          this.editVisible = false
          this.getUserList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch {
        return false
      }
    },
    async showAssign (row) {
      // console.log(row)
      this.assignVisible = true
      // 数据回显
      this.assignForm.id = row.id
      this.assignForm.username = row.username
      // console.log(row)
      // this.assignForm.rid =
      const { meta, data } = await this.$axios.get(`users/${row.id}`)
      if (meta.status === 200) {
        if (data.rid === -1) {
          this.assignForm.rid = ''
        } else {
          this.assignForm.rid = data.rid
        }
      }

      // 发送请求，获取所有的角色列表
      const res = await this.$axios.get('roles')
      if (res.meta.status === 200) {
        this.roleList = res.data
      }
      console.log(this.roleList)
    },
    async assign () {
      // 1. 表单校验
      // if (!this.assignForm.rid) {
      //   return this.$message.error('请选择角色')
      // }
      try {
        const { id, rid } = this.assignForm
        await this.$refs.assignForm.validate()
        const { meta } = await this.$axios.put(`users/${id}/role`, { rid })
        if (meta.status === 200) {
          this.$message.success(meta.msg)
          // 隐藏模块框
          this.assignVisible = false
          // 重置表单
          // this.$refs.assignForm.resetFields()
          // 重新渲染
          this.getUserList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch {
        return false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.search {
  width: 300px;
  margin: 10px 10px 10px 0;
}
</style>
