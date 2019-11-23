<template>
  <div class="categories">
    <el-button @click="showAddDialog" class="addBtn" type="success" plain>添加分类</el-button>
    <!-- 渲染表格 -->
    <el-table
      element-loading-text="拼命加载中..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.9)"
      v-loading="isShow"
      row-key="cat_id"
      :data="categoryList">
      <el-table-column label="分类名称" prop="cat_name"></el-table-column>
      <el-table-column label="是否有效">
        <template v-slot="{ row }">
          {{ row.cat_deleted ? '否' : '是' }}
        </template>
      </el-table-column>
      <el-table-column label="层级" prop="cat_level"></el-table-column>
      <el-table-column label="操作">
        <el-button size="mini" plain icon="el-icon-edit" circle type="primary"></el-button>
        <el-button size="mini" plain icon="el-icon-delete" circle type="danger"></el-button>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[5, 10, 15, 20, 25]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 添加对话框 -->
    <el-dialog
      title="添加商品分类"
      :visible.sync="dialogVisible"
      width="35%">

      <el-form ref="form" :rules="rules" :model="form" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="form.cat_name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="父级名称" prop="cat_pid">
          <!-- v-model 和 form 中的属性绑定, 将来可以获取到选中的内容的 id -->
          <el-cascader
            clearable
            v-model="form.cat_pid"
            :props="props"
            :options="options"></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button @click="addCategory" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      categoryList: [],
      pagenum: 1, // 当前页
      pagesize: 5, // 每页条数
      total: 0, // 总条数
      isShow: false,
      dialogVisible: false,
      form: {
        cat_name: '', // 分类名称
        cat_pid: [], // 将来选择的id, 存放到数组中
        cat_level: ''
      },
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: ['blur', 'change'] }
        ]
      },
      options: [],
      props: {
        value: 'cat_id', // 将来用于提交的id值
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      }
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList () {
      this.isShow = true
      // 发送ajax获取全部的分类数据, get请求, 参数要放在 params中
      const { meta, data } = await this.$axios.get('categories', {
        params: {
          type: 3,
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      if (meta.status === 200) {
        this.categoryList = data.result
        this.total = data.total
        console.log(this.categoryList)
        console.log(this.total)
      } else {
        this.$message.error(meta.msg)
      }
      this.isShow = false
    },
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagesize = val
      this.pagenum = 1
      this.getCategoryList()
    },
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.pagenum = val
      this.getCategoryList()
    },
    async showAddDialog () {
      this.dialogVisible = true
      // 显示对话框的同时, 发送ajax请求, 获取二级的分类信息, 进行展示
      const { meta, data } = await this.$axios.get('categories?type=2')
      if (meta.status === 200) {
        this.options = data
        console.log(this.options)
      } else {
        this.$message.error(meta.msg)
      }
    },
    async addCategory () {
      try {
        // 1. 先校验
        // 2. 校验通过, 发送添加的 ajax 请求
        await this.$refs.form.validate()
        // 只要能够到下面, 说明校验成功, 发送ajax请求
        // 所谓获取分类父级id, 其实就是拿 cat_pid 数组的最后一项
        // 默认值, 这边给 0, 可以告诉后台, 此时添加的是一级, 没有父级id
        const { meta } = await this.$axios.post(`categories`, {
          cat_name: this.form.cat_name, // 分类名称
          cat_pid: this.form.cat_pid[this.form.cat_pid.length - 1] || 0,
          cat_level: this.form.cat_pid.length
        })
        if (meta.status === 201) {
          this.$message.success(meta.msg)
          // 隐藏对话框
          this.dialogVisible = false
          this.$refs.form.resetFields()
          this.getCategoryList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.addBtn {
  margin-bottom: 10px;
}
</style>
