<template lang="pug">
.login
    .model
        .box
            h3 欢迎注册海鲜市场批发交易系统
            el-form(:model="ruleForm",:rules="rules",ref="ruleForm")
                el-form-item(prop="username")
                    el-input(v-model="ruleForm.username",placeholder="请输入用户名",clearable)
                        template(slot="prepend")
                            i.el-icon-user
                el-form-item(prop="pwd")
                    el-input(v-model="pre_password",type="password",placeholder="请输入密码",clearable,show-password)
                        template(slot="prepend")
                            i.el-icon-unlock
                el-form-item(prop="password")
                    el-input(v-model="ruleForm.password",type="password",placeholder="请再次输入密码",clearable,show-password)
                        template(slot="prepend")
                            i.el-icon-unlock
                el-form-item(prop="email")
                    el-input(v-model="ruleForm.email",placeholder="请输入邮箱",clearable)
                        template(slot="prepend")
                            i.el-icon-message
                el-form-item
                    el-button(type="primary",@click="toLogin()",:loading="loading",v-waves) 登录
                el-form-item
                    el-button(type="primary",@click="register()",:loading="loading",v-waves,style="margin-top:-30px") 注册

</template>

<script>
    import md5 from 'js-md5'
    import { mapGetters } from 'vuex'
    import { post, get, setItem, getItem, remItem } from '@/utils/com'
    export default {
        components: {

        },
        data () {
            return {
                pre_password: null,
                ruleForm: {
                    username: '',
                    password: '',
                    id: '',
                    email: '',
                    role: ''
                },
                rules: {
                    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                    pre_password:[{ required: true, message: '请输入密码', trigger: 'blur' }],
                    password: [{ required: true, message: '请再次输入密码', trigger: 'blur' }],
                    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
                },
                loading: false,
                getInfoes: {
                    userName: null,
                    loginIp: '192.168.2.45',
                    loginTime: Date.now(),
                    ipAddr: '亚洲'
                }
            }
        },
        mounted(){
            if(this.getInfo&&(/^\/login$/).test(this.$route.path)){
                this.$link('/home')
            }

        },
        computed: {
            ...mapGetters(['getInfo'])
        },
        methods:{
            toLogin()
            {
                this.$link('/home')
            },
            register(){
                this.$refs['ruleForm'].validate((valid) => {
                    if(valid){
                        if(this.pre_password === this.ruleForm.password)
                        {
                            this.loading = true;
                            return new Promise((resolve, reject) => {
                            post(`user/register?`, this.ruleForm)
                                .then((res) => {
                                console.log("res:", res);
                                if (res && res.code == 200) {
                                    this.$message({
                                        type: "success",
                                        message: "注册成功",
                                    });
                                    this.visible = false;
                                    this.$link('/home')
                                } else {
                                    this.$message({
                                        type: "error",
                                        message: "注册失败:"+res.message,
                                    });
                                    this.loading = false;

                                }
                                resolve(res);
                                })
                                .catch((error) => {
                                reject(error);
                                });
                            });
                        }else{
                            this.$message({
                                type:'error',
                                message:'两次密码不一样'
                            })
                        }
                        
                    }else{
                        this.loading = false;
                        return false;
                    }
                });
            }
        }
    }
</script>

<style lang="stylus">

</style>
