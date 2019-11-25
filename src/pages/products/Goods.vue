<template>
  <div class="goods">
    <el-button @click="goAdd" type="success" plain>添加商品</el-button>
    <!-- 渲染表格 -->
    <el-table :data="goodList">
      <el-table-column type="index" :index="indexMethod"></el-table-column>
      <el-table-column label="商品名称" prop="goods_name"></el-table-column>
      <el-table-column label="商品价格" prop="goods_price"></el-table-column>
      <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
      <!-- {{ msg | time }} -->
      <el-table-column label="创建时间">
        <template v-slot="{ row }">
          <p>{{ row.add_time | time }}</p>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="{ row }">
          <el-button icon="el-icon-edit" plain size="mini" circle type="primary"></el-button>
          <el-button icon="el-icon-delete" plain size="mini" circle type="danger"></el-button>
        </template>
      </el-table-column>
    </el-table>

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
  created () {
    this.getGoodList()
  },
  data () {
    return {
      pagenum: 1,
      pagesize: 5,
      total: 0,
      goodList: []
    }
  },
  methods: {
    async getGoodList () {
      const { meta, data } = await this.$axios.get('goods', {
        params: {
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      if (meta.status === 200) {
        this.goodList = data.goods
        this.total = data.total
        console.log(this.goodList)
        console.log(this.total)
      } else {
        this.$message.error(meta.msg)
      }
    },
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagesize = val
      this.pagenum = 1
      this.getGoodList()
    },
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.pagenum = val
      this.getGoodList()
    },
    indexMethod (index) {
      return index + 1 + (this.pagenum - 1) * this.pagesize
    },
    goAdd () {
      // 路由跳转
      this.$router.push('/goods-add')
    }
  }
}
</script>

<style>

</style>
