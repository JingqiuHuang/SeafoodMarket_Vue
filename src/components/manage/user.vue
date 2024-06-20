<template lang="pug">
.home
  el-form(
    :inline="true",
    :model="queryParams",
    @keyup.enter.native="getDataList()"
  )
    el-form-item
      el-button(@click="add()") 添加用户
  el-table(
    :data="dataList",
    border,
    v-loading="dataListLoading",
    style="width: 100%"
  )
    el-table-column(
      prop="username",
      header-align="center",
      align="center",
      label="用户名"
    )
    el-table-column(
      prop="password",
      header-align="center",
      align="center",
      label="用户密码"
    )
    el-table-column(
      prop="email",
      header-align="center",
      align="center",
      label="用户邮箱"
    )
    el-table-column(
      prop="role",
      header-align="center",
      align="center",
      label="用户角色"
    )
      template(slot-scope="scope")
        span {{scope.row.role===0?'管理员':'普通用户'}}
    el-table-column(
      fixed="right",
      header-align="center",
      align="center",
      width="150",
      label="操作"
    )
      template(slot-scope="scope")
        el-button(type="text", size="middle", @click="update(scope.row.id)") 修改
        el-button(
          type="text",
          size="middle",
          @click="deleteUser(scope.row.id)"
        ) 删除
  el-pagination(
    @size-change="sizeChangeHandle",
    @current-change="currentChangeHandle",
    :current-page="Number(this.params.pageNum)",
    :page-sizes="[10, 20, 50, 100]",
    :page-size="Number(this.params.pageSize)",
    :total="totalPage",
    layout="total, sizes, prev, pager, next, jumper"
  )
  el-dialog(
    :title="!updateId ? '新增' : '修改'",
    :close-on-click-modal="false",
    :visible.sync="visible",
    append-to-body
  )
    el-form(
      :model="dataForm",
      ref="dataForm",
      label-width="120px",
      :rules="dataRule"
    )
      el-form-item(label="用户名", prop="username")
        el-input(v-model="dataForm.username")
      el-form-item(label="密码", prop="password")
        el-input(v-model="dataForm.password")
      el-form-item(label="用户邮箱", prop="email")
        el-input(v-model="dataForm.email")
      el-form-item(label="角色", prop="role",)
        el-select(v-model="dataForm.role" placeholder="请选择" prop="role")
          el-option(label="普通用户" :value="1" style="width:100%")
          el-option(label="管理员" :value="0" style="width:100%")
    span.dialog-footer(slot="footer")
      el-button(@click="visible = false") 取消
      el-button(@click="submit()", type="primary") 确定
</template>
      
  <script>
import { post, get, setItem, getItem, remItem } from "@/utils/com";
import { mapGetters } from "vuex";
export default {
  components: {},
  data() {
    return {
      visible: false,
      updateId: "",
      totalPage: 0,
      dataListLoading: true,
      dataList: [],
      params: {
        userId: localStorage.getItem("userId"),
        password: localStorage.getItem("password"),
        pageNum: 1,
        pageSize: 10,
      },
      dialogVisible: false,
      updateNum: 0,
      queryParams: {
        pageNum: "1",
        pageSize: "10",
        minPrice: "0",
        maxPrice: "999",
        queryKind: "",
        queryKey: "",
      },
      dataForm: {
        id: "",
        username: "",
        email: "",
        password: "",
        role: "",
      },
      dataRule: {
        username: [{ required: true, message: "不能为空", trigger: "blur" }],
        password: [{ required: true, message: "不能为空", trigger: "blur" }],
        email: [{ required: true, message: "不能为空", trigger: "blur" }],
        role: [{ required: true, message: "不能为空", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getDataList();
  },
  computed: {
    ...mapGetters(["getInfo"]),
  },
  methods: {
    getDataList() {
      this.dataListLoading = true;
      //请求查询当前分类下的所有商品，catId为0时查询所有分类的所有商品
      return new Promise((resolve, reject) => {
        get("user/list", this.params)
          .then((res) => {
            if (res && res.code == 200) {
              this.dataList = res.data.records;
              this.totalPage = res.data.total;
            }
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
        this.dataListLoading = false;
      });
    },
    sizeChangeHandle(val) {
      this.queryParams.pageSize = val;
      this.queryParams.pageNum = 1;
      this.getDataList();
    },
    currentChangeHandle(val) {
      this.queryParams.pageNum = val;
      this.getDataList();
    },
    add() {
      this.updateId = undefined;
      if(this.$refs["dataForm"])
        this.$refs["dataForm"].resetFields();
      this.visible = true;
    },
    update(id) {
      this.updateId = id;
      this.visible = true;
      return new Promise((resolve, reject) => {
        get(`user/get/${this.updateId}`)
          .then((res) => {
            if (res && res.code == 200) {
              console.log("dataForm:", this.dataForm);
              if(this.$refs["dataForm"])
                this.$refs["dataForm"].resetFields();
              this.dataForm = res.data;
              console.log("dataForm:", this.dataForm);
            }
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    deleteUser(id) {
      console.log("delete");
      this.$confirm("是否删除此用户?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          new Promise((resolve, reject) => {
            get(`user/delete/${id}`,this.params)
              .then((res) => {
                if (res && res.code == 200) {
                  this.getDataList();
                  resolve(res);
                }
              })
              .catch((error) => {
                reject(error);
              });
          });
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    toQueryString(obj) {
      return Object.keys(obj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
    },
    submit() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          if (this.updateId) {
            console.log("this.update:", this.updateId);
            return new Promise((resolve, reject) => {
              var params = this.toQueryString(this.params)
              console.log('`user/update?${params}:`',`user/update${params}`)
              post(`user/update?${params}`, this.dataForm)
                .then((res) => {
                  console.log("res:", res);
                  if (res && res.code == 200) {
                    console.log("修改成功");
                    this.$message({
                      type: "success",
                      message: "修改成功",
                    });
                    this.visible = false;
                    this.getDataList();
                  } else {
                    this.$message({
                      type: "error",
                      message: "修改失败",
                    });
                  }
                  resolve(res);
                })
                .catch((error) => {
                  reject(error);
                });
            });
          } else {
            return new Promise((resolve, reject) => {
              var params = this.toQueryString(this.params)
              console.log('`user/add${params}?:`',`user/add${params}`)
              post(`user/add?${params}`, this.dataForm)
                .then((res) => {
                  console.log("res:", res);
                  if (res && res.code == 200) {
                    console.log("添加成功");
                    this.$message({
                      type: "success",
                      message: "添加成功",
                    });
                    this.visible = false;
                    this.getDataList();
                  } else {
                    this.$message({
                      type: "error",
                      message: "添加失败",
                    });
                  }
                  resolve(res);
                })
                .catch((error) => {
                  reject(error);
                });
            });
          }
        }
      });
    },
  },
};
</script>
      
      <style lang="stylus" scoped>
      ul {
        overflow: hidden;
        border-radius: 4px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        padding: 10px;
        margin-top: 30px;

        li {
          float: left;
          width: 50%;
          color: #555;
          margin: 7px 0;

          &:nth-child(even) {
            width: 20%;
          }
        }
      }
</style>
      