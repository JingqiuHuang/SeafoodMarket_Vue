<template lang="pug">
.home
  el-form(:inline="true" :model="queryParams" @keyup.enter.native="getDataList()")
    el-form-item
      el-input(v-model="queryParams.queryKey" placeholder="请输入要查询的内容" clearable)
    el-form-item
      el-select(v-model="queryParams.queryKind" placeholder="请选择查询类型")
        el-option(v-for="item in selects" :key="item.value" :label="item.label" :value="item.value" style="width:50%")
    el-form-item
      el-button(@click="getDataList()") 查询
  el-table(
    :data="dataList",
    border,
    v-loading="dataListLoading",
    style="width: 100%"
  )
    el-table-column(
      prop="orderId",
      header-align="center",
      align="center",
      label="订单号"
    )
    el-table-column(
      prop="createTime",
      header-align="center",
      align="center",
      label="订单创建时间"
      :formatter="dateFormatter"
    )
    el-table-column(
      prop="totalMoney",
      header-align="center",
      align="center",
      label="订单总价"
    )
    el-table-column(
      prop="status",
      header-align="center",
      align="center",
      label="订单状态"
    )
      template(slot-scope="scope")
        span {{scope.row.status===0?'已下单':'已发货'}}
    el-table-column(
      fixed="right",
      header-align="center",
      align="center",
      width="150",
      label="操作"
    )
      template(slot-scope="scope")
        el-button(type="text", @click="detail(scope.row.orderId)") 查看详情
        el-button(type="text", @click="remove(scope.row.orderId)") 删除
        el-button(type="text", @click="push(scope.row.orderId)" v-if="!scope.row.status") 发货
  el-dialog(title="详细信息",:visible.sync="dialogVisible",width="60%",:append-to-body="true")
    el-table(:data="details")
      el-table-column(
          prop="name",
          header-align="center",
          align="center",
          label="海鲜名"
        )
      el-table-column(
        prop="provider",
        header-align="center",
        align="center",
        label="供应商"
      )
      el-table-column(
        prop="price",
        header-align="center",
        align="center",
        label="海鲜单价"
      )
      el-table-column(
        prop="count",
        header-align="center",
        align="center",
        label="数量"
      )
  el-pagination(
    @size-change="sizeChangeHandle",
    @current-change="currentChangeHandle",
    :current-page="Number(this.queryParams.pageNum)",
    :page-sizes="[10, 20, 50, 100]",
    :page-size="Number(this.queryParams.pageSize)",
    :total="totalPage",
    layout="total, sizes, prev, pager, next, jumper"
  )
</template>
        
    <script>
import { post, get, setItem, getItem, remItem } from "@/utils/com";
import { mapGetters } from "vuex";
export default {
  components: {},

  data() {
    return {
      selects:[
        {value:'order_id',label:'订单号'},
        {value:'create_time',label:'创建时间'},
        {value:'status',label:'订单状态'},
      ],
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
        queryKind: "order_id",
        queryKey: "",
      },
      dataForm: {
      },
      dataRule: {
        username: [{ required: true, message: "不能为空", trigger: "blur" }],
        password: [{ required: true, message: "不能为空", trigger: "blur" }],
        email: [{ required: true, message: "不能为空", trigger: "blur" }],
        role: [{ required: true, message: "不能为空", trigger: "blur" }],
      },
      details:[],
    };
  },
  mounted() {
    this.getDataList();
  },
  computed: {
    ...mapGetters(["getInfo"]),
  },
  methods: {
    toQueryString(obj) {
      return Object.keys(obj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
    },
    getDataList() {
      this.dataListLoading = true;
      //请求查询当前分类下的所有商品，catId为0时查询所有分类的所有商品
      return new Promise((resolve, reject) => {
        var params = {
          userId: localStorage.getItem("userId"),
          password: localStorage.getItem("password"),
        }
        let combinedObj = { ...params, ...this.queryParams };
        get(`order/listAll`, combinedObj)
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
    push(id){
      this.$confirm("是否确定发货?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          new Promise((resolve, reject) => {
            get(`order/push/${id}`, this.params)
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
            message: "发货成功!",
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消发货",
          });
        });
    },
    deleteUser(id) {
      console.log("delete");
      this.$confirm("是否删除此订单?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          new Promise((resolve, reject) => {
            get(`order/delete/${id}`, this.params)
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
    dateFormatter(row, column, cellValue) {
      // 创建一个Date对象
      const date = new Date(cellValue);
      
      // 获取各个部分
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要加1
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      // 格式化成yyyy-mm-dd hh:mm:ss
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    detail(id){
      this.dialogVisible = true;
      console.log('id:',id);
      return new Promise((resolve, reject) => {
        get(`order/details/${id}`, this.params)
          .then((res) => {
            if (res && res.code == 200) {
              this.details = res.data;
            }
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },remove(id){
      console.log('delete')
      this.$confirm('是否删除此订单?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            new Promise((resolve, reject) => {
                get(`order/remove/${id}`,this.params)
                    .then((res) => {
                        if (res && res.code == 200) {
                            this.getDataList()
                            resolve(res);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            })
            this.$message({
                type: 'success',
                message: '删除成功!'
            });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
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
        
