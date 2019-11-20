<template>
  <div class="home">
    <el-container>
      <el-header>
        <div class="logo"></div>
        <div class="title">
          <h1>电商后台管理系统</h1>
        </div>
        <div class="logout">
          欢迎你，xxx <a href="javascript:;" @click="logout">退出</a>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <!--
            el-mune > el-submenu > el-menu-item
            el-menu: 整个菜单组件
              属性： default-active: 默认高亮，对应index属性
              el-submenu: 子菜单
                需要通过插槽来指定子菜单显示内容

                el-menu-item-group： 菜单项的分组
                  el-menu-item： 一个菜单项
           -->
          <el-menu
            router
            unique-opened
            :default-active="defaultActive"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b">
            <el-submenu :index="subMenu.path" v-for="subMenu in menuList" :key="subMenu.id">
              <template v-slot:title>
                <i class="el-icon-location"></i>
                <span>{{subMenu.authName}}</span>
              </template>
              <el-menu-item :index="item.path" v-for="item in subMenu.children" :key="item.id">
                <i class="el-icon-menu"></i>
                <span slot="title">{{item.authName}}</span>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <!-- 子路由的出口 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data () {
    return {
      menuList: []
    }
  },
  async created () {
    const { meta, data } = await this.$axios.get('menus')
    if (meta.status === 200) {
      this.menuList = data
    }
  },
  methods: {
    async logout () {
      try {
        await this.$confirm('你确定要退出吗?', '温馨提示', {
          type: 'warning'
        })
        // 只要能执行到这，说明一定成功
        this.$router.push('/login')
        localStorage.removeItem('token')
        this.$message.success('退出成功')
      } catch {
        this.$message.info('取消删除')
      }
    }
  },
  computed: {
    defaultActive () {
      return this.$route.path.slice(1)
    }
  }
}
</script>

<style lang="less" scoped>
// scoped: 只要style添加了scoped属性，那么当前组件中写的样式只会影响当前组件
// 原理：
// 只要添加scoped
// 1. 会给当前组件所有写的样式都自动添加一个属性选择器
// 2. 给当前组件的template中所有的元素添加一个自定义属性
// div[data-v-5a90ec03] {
//     background-color: red;
// }
.home {
  height: 100%;

  > .el-container {
    height: 100%;
  }
  .el-header {
    background-color: #b3c1cd;
    display: flex;
    line-height: 60px;
    .logo,
    .logout {
      width: 180px;
    }

    .logo {
      // 100px 100px
      // 100% 100%
      // cover contain
      background: url('../assets/logo.png') no-repeat center center/contain;
    }

    .title {
      flex: 1;
      text-align: center;
      h1 {
        color: #fff;
        font-size: 32px;
      }
    }

    .logout {
      text-align: right;
      font-weight: 700;
      a {
        color: orange;
      }
    }
  }
  .el-aside {
    background: #545c64;
    .el-submenu {
      width: 200px;
    }
  }
  .el-main {
    background-color: #eaeef1;
  }
}
</style>
