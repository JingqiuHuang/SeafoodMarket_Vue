<template lang="pug">
.home
  el-button(type="primary",size="small", @click="buyCart") 结账
  el-button(type="primary",size="small",@click="cleanCart") 清空购物车

  div(style="height:10px")
  el-table(
    :data="dataList",
    border,
    v-loading="dataListLoading",
    style="width: 100%"
  )
    el-table-column(
      prop="name",
      header-align="center",
      align="center",
      label="海鲜名"
    )
    el-table-column(
      prop="kind",
      header-align="center",
      align="center",
      label="海鲜种类"
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
      label="价格(元/kg)"
    )
    el-table-column(
      prop="count",
      header-align="center",
      align="center",
      label="数量"
    )
    el-table-column(
      prop="totalPrice"
      header-align="center",
      align="center",
      label="总价"
    )
    el-table-column(
      fixed="right",
      header-align="center",
      align="center",
      width="150",
      label="操作"
    )
      template(slot-scope="scope")
        el-button(type="text", @click="removeCart(scope.row.id)") 删除
        el-button(type="text" @click="updateCart(scope.row.seafoodId,scope.row.count)") 修改数量
  el-pagination(
    @size-change="sizeChangeHandle",
    @current-change="currentChangeHandle",
    :current-page="Number(this.params.pageNum)",
    :page-sizes="[10, 20, 50, 100]",
    :page-size="Number(this.params.pageSize)",
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
      totalPage: 0,
      dataListLoading: true,
      dataList: [],
      params: {
        userId: localStorage.getItem('userId'),
        password: localStorage.getItem('password'),
        pageNum: 1,
        pageSize: 10
      },
      dialogVisible: false,
      updateNum: 0,
      cartItemId: '',
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
        get("cart/list", this.params)
          .then((res) => {
            if (res && res.code == 200) {
              console.log('cart:',res);
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
      this.params.pageSize = val;
      this.params.pageNum = 1;
      this.getDataList();
    },
    currentChangeHandle(val) {
      this.params.pageNum = val;
      this.getDataList();
    },
    removeCart(id) {
      return new Promise((resolve, reject) => {
        // let user = {
        //     "userId":this.params.userId,
        //     "password":this.params.password
        // };
        post(`cart/remove/${id}`,this.params)
            .then((res) => {
                if (res && res.code == 200) {
                console.log(res);
                this.$message({
                    type: "success",
                    message: "删除成功",
                });
                }
                this.getDataList();
                resolve(res);
            })
            .catch((error) => {
                reject(error);
                this.$message({
                type: "error",
                message: "删除失败",
                });
            });
        this.dataListLoading = false;
      });
    },
    updateCart(seafood_id,count){
        this.$prompt('请输入修改数量', '修改',{
            inputPlaceholder:count
        }).then(({ value }) => {
            new Promise((resolve, reject) => {
                post(`cart/update/${seafood_id}/${value}`,this.params)
                    .then((res) => {
                        console.log('res:',res)
                        if (res && res.code == 200) {
                            this.$message({
                                type: 'success',
                                message: '你要修改的数量的是: ' + value
                            });
                            this.getDataList()
                            resolve(res);
                        }
                    })
                    .catch((error) => {
                        this.$message({
                            type: 'error',
                            message: '修改失败'
                        });   
                        reject(error);
                    });
            })
        })
    },
    cleanCart(){
        this.$confirm('此操作将清空购物车, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            new Promise((resolve, reject) => {
                post(`cart/clean`,this.params)
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
                message: '清空成功!'
            });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消清空'
          });          
        });
    },
    buyCart()
    {
        this.$confirm('是否结账购物车?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            new Promise((resolve, reject) => {
                get(`cart/buy/${this.params.userId}`)
                    .then((res) => {
                        if (res && res.code == 200) {
                            this.getDataList();
                            resolve(res);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            })
            this.$message({
                type: 'success',
                message: '结账成功!'
            });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消结账'
          });          
        });
    }
  }
}
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
    