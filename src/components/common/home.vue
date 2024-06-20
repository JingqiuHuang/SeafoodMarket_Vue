<template lang="pug">
.home
  el-form(:inline="true" :model="params" @keyup.enter.native="getDataList()")
    el-form-item
      el-input(v-model="params.queryKey" placeholder="请输入要查询的内容" clearable)
    el-form-item(style="width:15%")
      el-input(v-model="params.minPrice" placeholder="最低价格" clearable)
    el-form-item(style="width:15%")
      el-input(v-model="params.maxPrice" placeholder="最高价格" clearable )
    el-form-item
      el-select(v-model="params.queryKind" placeholder="请选择查询类型")
        el-option(v-for="item in selects" :key="item.value" :label="item.label" :value="item.value" style="width:50%")
    el-form-item
      el-button(@click="getDataList()") 查询
  el-table(:data="dataList",border,v-loading="dataListLoading",style="width: 100%")
    el-table-column(prop="imgPath",header-align="center",align="center",label="海鲜图")
        template(slot-scope="scope")
            img(:src="scope.row.imgPath",style="width: 100%;height: 100%;object-fit: cover;")
    el-table-column(prop="name",header-align="center",align="center",label="海鲜名")
    el-table-column(prop="kind",header-align="center",align="center",label="海鲜种类")
    el-table-column(prop="provider",header-align="center",align="center",label="供应商")
    el-table-column(
      prop="price",
      header-align="center",
      align="center",
      label="价格(元/kg)"
    )
    el-table-column(
      prop="sales",
      header-align="center",
      align="center",
      label="销量"
    )
    el-table-column(
      prop="stock",
      header-align="center",
      align="center",
      label="库存"
    )
    el-table-column(
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作"
    )
      template(slot-scope="scope")
        el-button(type="text",size="small",@click="addCart(scope.row.id)") 添加购物车
  el-pagination(
            @size-change="sizeChangeHandle",
            @current-change="currentChangeHandle",
            :current-page="Number(this.params.pageNum)"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="Number(this.params.pageSize)"
            :total="totalPage"
            layout="total, sizes, prev, pager, next, jumper")
</template>

<script>
import { post, get, setItem, getItem, remItem } from '@/utils/com'
import { mapGetters } from "vuex";
export default {
  components: {},
  data() {
    return {
      selects:[
        {value:'seafood_name',label:'海鲜名'},
        {value:'provider',label:'供应商'},
        {value:'kind',label:'海鲜种类'}
      ],
      totalPage: 0,
      dataListLoading: true,
      dataList: [],
      params:{
        pageNum:"1",
        pageSize:"10",
        minPrice:null,
        maxPrice:null,
        queryKind:"",
        queryKey:""
      }
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
        get("seafood/list", this.params)
          .then((res) => {
            if (res && res.code == 200) {
                console.log('this.params:',this.params);
                this.dataList = res.data.records
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
    addCart(id){
        let userId = localStorage.getItem('userId');
        return new Promise((resolve, reject) => {
        get(`cart/add/${id}/${userId}`)
          .then((res) => {
            if (res && res.code == 200) {
                console.log(res);
                this.$message({
                    type:"success",
                    message:"添加成功"
                });
            }
            resolve(res);
          })
          .catch((error) => {
            reject(error);
            this.$message({
                    type:"error",
                    message:"添加失败"
            });
          });
          this.dataListLoading = false;
      });
    }
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
