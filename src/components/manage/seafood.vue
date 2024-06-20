<template lang="pug">
.home
  el-form(:inline="true" :model="queryParams" @keyup.enter.native="getDataList()")
    el-form-item
      el-input(v-model="queryParams.queryKey" placeholder="请输入要查询的内容" clearable)
    el-form-item(style="width:15%")
      el-input(v-model="queryParams.minPrice" placeholder="最低价格" clearable)
    el-form-item(style="width:15%")
      el-input(v-model="queryParams.maxPrice" placeholder="最高价格" clearable)
    el-form-item
      el-select(v-model="queryParams.queryKind" placeholder="请选择查询类型")
        el-option(v-for="item in selects" :key="item.value" :label="item.label" :value="item.value" style="width:50%")
    el-form-item
      el-button(@click="getDataList()") 查询
      el-button(@click="add()") 添加海鲜
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
        el-button(type="text",size="middle",@click="update(scope.row.id)") 修改
        el-button(type="text",size="middle",@click="deleteSeafood (scope.row.id)") 删除
  el-pagination(
            @size-change="sizeChangeHandle",
            @current-change="currentChangeHandle",
            :current-page="Number(this.params.pageNum)"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="Number(this.params.pageSize)"
            :total="totalPage"
            layout="total, sizes, prev, pager, next, jumper")
  el-dialog(
    :title="!updateId ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible"
    append-to-body=true
  )
    el-form(:model="dataForm" ref="dataForm" label-width="120px" :rules="dataRule")
      el-form-item(label="海鲜名" prop="name")
        el-input(v-model="dataForm.name")
      el-form-item(label="供应商" prop="provider")
        el-input(v-model="dataForm.provider")
      el-form-item(label="价格" prop="price")
        el-input(v-model="dataForm.price")
      el-form-item(label="种类" prop="kind")
        el-input(v-model="dataForm.kind")
      el-form-item(label="销量" prop="sales")
        el-input(v-model="dataForm.sales")
      el-form-item(label="库存" prop="stock")
        el-input(v-model="dataForm.stock")
      el-form-item(label="图片路径" prop="imgPath")
        el-input(v-model="dataForm.imgPath")
    span(slot="footer" class="dialog-footer")
      el-button(@click="visible=false") 取消
      el-button(@click="submit()" type="primary") 确定

</template>
    
<script>
import { post, get, setItem, getItem, remItem } from "@/utils/com";
import { mapGetters } from "vuex";
export default {
  components: {},
  data() {
    return {
      visible: false,
      updateId: '',
      selects:[
        {value:'seafood_name',label:'海鲜名'},
        {value:'provider',label:'供应商'},
        {value:'kind',label:'海鲜种类'},
      ],
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
      queryParams:{
        pageNum:"1",
        pageSize:"10",
        minPrice:null,
        maxPrice:null,
        queryKind:"",
        queryKey:""
      },
      dataForm:{
        id:'',
        name: '',
        provider: '',
        price: '',
        kind: '',
        sales: '',
        stock: '',
        imgPath: ''
      },
      dataRule: {
        name: [
          { required: true, message: "不能为空", trigger: "blur" }
        ],
        provider: [
          { required: true, message: "不能为空", trigger: "blur" }
        ],
        price: [
          { required: true, message: "不能为空", trigger: "blur" }
        ],
        kind: [
          { required: true, message: "不能为空", trigger: "blur" }
        ],
        sales: [
          { required: true, message: "不能为空", trigger: "blur" }
        ],
        stock: [
          { required: true, message: "不能为空", trigger: "blur" }
        ],
        imgPath: [
          { required: true, message: "不能为空", trigger: "blur" }
        ],
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
        get("seafood/list", this.queryParams)
          .then((res) => {
            if (res && res.code == 200) {
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
      this.queryParams.pageSize = val;
      this.queryParams.pageNum = 1;
      this.getDataList();
    },
    currentChangeHandle(val) {
      this.queryParams.pageNum = val;
      this.getDataList();
    },
    add(){
      this.updateId = undefined;
      if(this.$refs["dataForm"])
        this.$refs["dataForm"].resetFields();
      // this.dataForm = {
      //   id:'',
      //   name: '',
      //   provider: '',
      //   price: '',
      //   kind: '',
      //   sales: '',
      //   stock: '',
      //   imgPath: ''
      // }
      this.visible = true;
    },
    update(id)
    {
      this.updateId = id;
      this.visible = true;
      return new Promise((resolve, reject) => {
          get(`seafood/get/${this.updateId}`)
            .then((res) => {
              if (res && res.code == 200) {
                  console.log('dataForm:',this.dataForm);
                  if(this.$refs["dataForm"])
                    this.$refs["dataForm"].resetFields();
                  this.dataForm = res.data
                  console.log('dataForm:',this.dataForm);
              }
              resolve(res);
            })
            .catch((error) => {
              reject(error);
            });
        });
    },
    deleteSeafood(id){
      console.log('delete')
      this.$confirm('是否删除此海鲜?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            new Promise((resolve, reject) => {
                get(`seafood/delete/${id}`,this.params)
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
    submit(){
      this.$refs["dataForm"].validate(valid => {
          if (valid) {
            if (this.updateId){
              console.log('this.update:',this.updateId)
              return new Promise((resolve, reject) => {
                post(`seafood/update`,this.dataForm)
                  .then((res) => {
                    console.log("res:",res);
                    if (res && res.code == 200) {
                        console.log("修改成功");
                        this.$message({
                          type:'success',
                          message:'修改成功'
                        })
                        this.visible = false;
                        this.getDataList();
                    }else{
                      this.$message({
                          type:'error',
                          message:'修改失败'
                        })
                    }
                    resolve(res);
                  })
                  .catch((error) => {

                    reject(error);
                  });
              });
            }else{
              return new Promise((resolve, reject) => {
                post(`seafood/add`,this.dataForm)
                  .then((res) => {
                    console.log("res:",res);
                    if (res && res.code == 200) {
                        console.log("添加成功");
                        this.$message({
                          type:'success',
                          message:'添加成功'
                        })
                        this.visible = false;
                        this.getDataList();
                    }else{
                      this.$message({
                          type:'error',
                          message:'添加失败'
                        })
                    }
                    resolve(res);
                  })
                  .catch((error) => {

                    reject(error);
                  });
              });
            }
          }
        }
      )
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
    