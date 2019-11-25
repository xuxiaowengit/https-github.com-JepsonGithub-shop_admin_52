<template>
  <div class="goods-add">
    <el-steps :active="active" finish-status="success">
      <el-step title="步骤 1" description="基本信息"></el-step>
      <el-step title="步骤 2" description="商品图片"></el-step>
      <el-step title="步骤 3" description="商品内容"></el-step>
    </el-steps>

    <!-- tabs标签页 -->
    <el-tabs v-model="activeTab" tab-position="left" @tab-click="handleClick">
      <el-tab-pane name="0" label="基本信息">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="商品名称">
            <el-input v-model="form.goods_name" placeholder="请输入商品名称"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="form.goods_price" placeholder="请输入商品价格"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="form.goods_weight" placeholder="请输入商品重量"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input v-model="form.goods_number" placeholder="请输入商品数量"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
              <el-cascader
                :props="props"
                v-model="form.goods_cat"
                :options="options"></el-cascader>
          </el-form-item>
          <el-form-item label="是否促销">
            <el-radio-group v-model="form.isSellGood">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <el-button @click="next" type="primary" >下一步</el-button>

      </el-tab-pane>
      <el-tab-pane name="1" label="商品图片">
        <!-- 1. action 提交图片的接口地址, 这个图片上传, 是没有走 axios的, 不能自动拼接路径 (需要完整路径)-->
        <!-- 2. headers 请求头, 由于图片上传, 没有走axios, 需要自己添加请求头 -->
        <!-- 3. name 配置上传文件时的字段 -->
        <el-upload
          :on-success="handleSuccess"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"

          :headers="headers"
          name="file"
          action="http://localhost:8888/api/private/v1/upload"
          list-type="picture-card">
          <i class="el-icon-plus"></i>
        </el-upload>

        <el-button @click="next" type="primary">下一步</el-button>

      </el-tab-pane>
      <el-tab-pane name="2" label="商品内容">
        <quill-editor v-model="form.goods_introduce"></quill-editor>
        <el-button type="primary" @click="addProduct">添加</el-button>
      </el-tab-pane>
    </el-tabs>

    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    return {
      dialogVisible: false,
      dialogImageUrl: '',
      active: 0,
      activeTab: '0',
      form: {
        goods_name: '',
        goods_cat: [], // 级联的分类
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        goods_introduce: '',
        pics: [],
        isSellGood: 1
      },
      options: [],
      props: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      headers: {
        Authorization: localStorage.getItem('token')
      }
    }
  },
  methods: {
    handleClick (tab, event) {
      // console.log(tab.index)
      this.active = +tab.index
    },
    next () {
      // 控制步骤条
      this.active++
      // 控制tab栏, 同步显示
      this.activeTab = this.active + ''
    },
    // 只要上传成功, 会自动调用 handleSuccess 函数
    handleSuccess (response, file, fileList) {
      // response 是 后台返回的结果
      // console.log(response)
      const { meta, data } = response
      if (meta.status === 200) {
        this.form.pics.push({
          pic: data.tmp_path
        })
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 处理删除
    handleRemove (file, fileList) {
      // 触发函数, 表示用户要删除某张图片,
      // 同时, 我们需要将 pics 数组中对应的那张图也删掉
      // console.log(file, fileList)
      // 1. 获取删除的图片路径
      // 2. 根据图片路径, 从 pics 中删除对应的项 (保留不是该path的所有项)
      const path = file.response.data.tmp_path
      this.form.pics = this.form.pics.filter(item => item.pic !== path)
    },
    // 处理预览
    handlePictureCardPreview (file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    async addProduct () {
      // 发送添加的ajax
      const { meta } = await this.$axios.post('goods', {
        ...this.form,
        goods_cat: this.form.goods_cat.join(',')
      })
      if (meta.status === 201) {
        this.$message.success(meta.msg)
        this.$router.push('/goods')
      } else {
        this.$message.error(meta.msg)
      }
    }
  },
  async created () {
    const { meta, data } = await this.$axios.get('categories?type=3')
    if (meta.status === 200) {
      this.options = data
      console.log(this.options)
    } else {
      this.$message.error(meta.msg)
    }
  }
}
</script>

<style lang="less" scoped>
// 这里的样式, 只作用于当前模板

</style>

<style lang="less" scoped>
// 去掉了 scoped, 就可以向下渗透, 影响到其他组件, (只要满足类名即可)
// scoped 的样式, 只能作用于当前 模板中 的内容
// scoped 的样式, 无法渗透到子组件中去的
.quill-editor {
  background-color: #fff;

  /deep/ .ql-editor {
    min-height: 400px;
  }
}
</style>
