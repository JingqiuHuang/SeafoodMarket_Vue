<template lang="pug">
.layout
  .left(:style="{ backgroundColor: bgColor }", :class="{ 'l-close': coll }")
    .menu
      el-menu.el-menu-demo(
        :default-active="act",
        :collapse="coll",
        :unique-opened="true",
        :collapse-transition="false"
      )
        template(v-for="it in menuList")
          el-menu-item(
            :index="it.index",
            v-if="!it.child&&it.isShow",
            @click="tabClick(it)",
            v-waves
          )
            i.el-icon-help
            span {{ it.title }}
          el-submenu(:index="it.index", v-if="it.child&&it.isShow")
            template(slot="title")
              i.el-icon-help
              span {{ it.title }}
            template(v-for="item in it.child")
              el-menu-item(
                :index="item.index",
                @click="tabClick(item)",
                v-waves
              )
                i.el-icon-help
                span {{ item.title }}

  .right(:class="{ 'r-close': coll }")
    .view-head
      i(
        @click="coll = !coll",
        :class="!coll ? 'el-icon-s-fold' : 'el-icon-s-unfold'"
      )
      span 首页
      .userbox
        .avatar
        .userName(v-if="getInfo") {{ getInfo.userName }}
        .dropdown
          p(@click="(dialogVisible = true), (t = 1)") 修改密码
          p(@click="(dialogVisible = true), (t = 2)") 退出登录
    .view-nav
      el-tabs(
        v-model="act",
        type="card",
        closable,
        @tab-click="clickTab",
        @tab-remove="clickRemove"
      )
        el-tab-pane(
          v-for="(item, inx) in tabList",
          :key="item.name",
          :label="item.title",
          :name="item.name"
        )
    .view-con
      transition(name="display")
        router-view
  //- 提示框
  el-dialog(
    :title="t == 1 ? '修复登录密码' : '提示'",
    :visible.sync="dialogVisible",
    width="25%",
    :close-on-click-modal="false"
  )
    span(v-if="t == 2") 确定是否退出登录?
    el-form(label-width="90px", v-else,ref="dataForm",@keyup.enter.native="confirm()")
      el-form-item(label="原密码")
        el-input(
          v-model="option.lodpwd",
          placeholder="请输入原密码",
          clearable,
          type="password",
          show-password
        )
      el-form-item(label="新密码")
        el-input(
          v-model="option.newpwd",
          placeholder="请输入新密码",
          clearable,
          type="password",
          show-password
        )
      el-form-item(label="确认新密码")
        el-input(
          v-model="option.confirmpwd",
          placeholder="请确认新密码",
          clearable,
          type="password",
          show-password
        )
    span.dialog-footer(slot="footer")
      el-button(@click="dialogVisible = false") 取 消
      el-button(
        type="primary",
        @click="dialogVisible = false; $store.dispatch('clearAll')",
        v-if="t == 2"
      ) 确 定
      el-button(type="primary", v-else,@click="confirm()") 确 定
</template>

<script>
import { mapGetters } from "vuex";
import { post, get, setItem, getItem, remItem, auth } from "@/utils/com";
export default {
  components: {},
  data() {
    return {
      auth: 0,
      coll: false,
      menuList: [
        {
          index: "home",
          title: "首页",
          path: "home",
          isShow: 1
        },
        {
          index: "cart",
          title: "我的购物车",
          path: "cart",
          isShow: 1
        },
        {
          index: "order",
          title: "我的订单",
          path: "order",
          isShow: 1
        },
        {
          index: "manage",
          title: "后台管理",
          isShow: auth(localStorage.getItem('userId')),
          child: [
            {
              index: "manage/seafood",
              title: "海鲜管理",
              path: "manage/seafood",
            },
            {
              index: "manage/user",
              title: "用户管理",
              path: "manage/user",
            },
            {
              index: "manage/order",
              title: "订单管理",
              path: "manage/order",
            },
          ],
        }
        ,
      ],
      act: "/home",
      tabList: this.$getItem("tabList") ? this.$getItem("tabList") : [],
      routePath: this.$route.path,
      dialogVisible: false,
      t: 1,
      option: {
        lodpwd: "",
        newpwd: "",
        confirmpwd: "",
      },
    };
  },
  mounted() {
    this.filterMenu();
  },
  methods: {
    tabClick(it) {
      console.log('this.auth:',this.auth);
      this.$link("/" + it.path);
      this.tabList.push({
        title: it.title,
        name: it.path,
      });
      this.tabList = this.sort(this.tabList);
      this.$setItem("tabList", this.tabList);
    },
    filterMenu() {
      this.act = this.routePath.substring(1, this.routePath.length);
    },
    clickTab(targetName) {
      this.$link("/" + targetName.name);
    },
    clickRemove(targetName) {
      let el = this.tabList.length;
      this.tabList.forEach((item, inx) => {
        if (item.name == targetName && inx > 0) {
          if (this.act == targetName) {
            this.act = this.tabList[inx - 1].name;
            this.$link("/" + this.act);
          }
          this.tabList.splice(inx, 1);
          this.$setItem("tabList", this.tabList);
        }
      });
    },
    // 对象去重
    sort(arr) {
      let temp = arr.map((item) => {
        return JSON.stringify(item);
      });
      temp = Array.from(new Set(temp));
      return temp.map((item) => {
        return JSON.parse(item);
      });
    },
    toQueryString(obj) {
      return Object.keys(obj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
    },
    confirm() {
        if(this.option.newpwd !== this.option.confirmpwd){
            this.$message({
                type:'error',
                message:'两次密码不一样'
              })
              return
        }
      var params = {
        userId: localStorage.getItem("userId"),
        password: this.option.lodpwd
      }
      var user = {
        id: params.userId,
        username: undefined,
        email: undefined,
        password: this.option.confirmpwd,
        role: undefined,
      }
      return new Promise((resolve, reject) => {
        post(`user/update?${this.toQueryString(params)}`,user)
          .then((res) => {
            if (res && res.code == 200) {
              this.dialogVisible = false;
              this.$message({
                type:'success',
                message:'修改成功'
              })
              localStorage.setItem("password",user.password)
            }else{
                this.$message({
                    type:'error',
                    message:'原密码不正确'
                })
            }
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
  computed: {
    ...mapGetters(["bgColor", "getInfo"]),
  },
  watch: {
    $route(to, from, next) {
      this.routePath = to.path;
      this.filterMenu();
    },
    dialogVisible(newValue,oldValue){
        if(newValue === false)
            this.option = {
                lodpwd: "",
                newpwd: "",
                confirmpwd: "",
            }
    }
  },
};
</script>

<style lang="stylus"></style>
