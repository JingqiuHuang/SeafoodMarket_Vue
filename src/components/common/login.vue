<template lang="pug">
.login
    .model
        .box
            h3 欢迎登录海鲜市场批发交易系统
            el-form(:model="ruleForm",:rules="rules",ref="ruleForm",@keyup.enter.native="submitForm('ruleForm')")
                el-form-item(prop="username")
                    el-input(v-model="ruleForm.username",placeholder="请输入用户名",clearable)
                        template(slot="prepend")
                            i.el-icon-user
                el-form-item(prop="password")
                    el-input(v-model="ruleForm.password",type="password",placeholder="请输入密码",clearable,show-password)
                        template(slot="prepend")
                            i.el-icon-unlock
                el-form-item
                    el-button(type="primary",:loading="loading",v-waves,@click="submitForm('ruleForm')") 登录
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
                ruleForm: {
                    username: null,
                    password: null,
                    id: '',
                    email: '',
                    role: ''
                },
                rules: {
                    userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
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
            register(){
                this.$link('/register')
            },
            submitForm(formName){
                this.$refs[formName].validate((valid) => {
                    if(valid){
                        this.loading = true;
                        // 以下仅本地测试
                        // this.getInfoes.userName = this.ruleForm.userName;
                        // this.$setItem('getInfo', this.getInfoes);
                        // this.$store.commit('SET_GETINFO', this.getInfoes);
                        // this.loading = false;
                        // this.$link('/home');

                        // 以下正式操作
                        this.$store.dispatch('Login', this.ruleForm).then(res =>{
                            if(res&&res.code == 200){
                                this.$toast.center('登录成功');
                                // this.$store.dispatch('MenuList',{userId: res.data}).then(res =>{})
                                this.$link('/home')
                                localStorage.setItem('userId', res.data);
                                localStorage.setItem('password', this.ruleForm.password);
                                new Promise((resolve, reject) => {
                                    get(`/user/auth/${res.data}`)
                                    .then((res) => {
                                        if (res && res.code == 200) {
                                            localStorage.setItem('auth', 1);
                                        }
                                        resolve(res);
                                    })
                                    .catch((error) => {
                                        localStorage.setItem('auth', 0);
                                        reject(error);
                                    });
                                });

                            }else{
                                this.$message({
                                    type:'error',
                                    message:'用户名或密码错误'
                                })
                                this.loading = false;
                                return false;
                            }
                        }).catch(res =>{
                            this.loading = false;
                        })
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
