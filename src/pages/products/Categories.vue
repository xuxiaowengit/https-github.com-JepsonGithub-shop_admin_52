<template>
  <div class="categories">
    <el-button class="addBtn" type="success" plain>添加分类</el-button>
    <!-- 渲染表格 -->
    <el-table :data="categoryList">
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
  </div>
</template>

<script>
export default {
  data () {
    return {
      categoryList: [],
      pagenum: 1, // 当前页
      pagesize: 5, // 每页条数
      total: 0 // 总条数
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList () {
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
    }
  }
}
</script>

<style lang="less" scoped>
.addBtn {
  margin-bottom: 10px;
}
</style>
