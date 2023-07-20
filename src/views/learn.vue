<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "../stores/User"
import { ElMessage } from "element-plus";

const store = useUserStore();
const router = useRouter();
const Request = axios.create({
    baseURL: '/api',
    timeout: 3000,
    withCredentials: true,
});
const remainQuantitiy = ref(0);
const { _userId, _bookId } = storeToRefs(useUserStore());
const reciteWord = ref(
    [
        {
            spell: '',
            meaning: [
                {
                    meaningContent: '',
                    function: ''
                }
            ],
            count: 0,
            notes: [''],
            sentence: [{
                sentenceContent: '',
                sentenceContentMean: ''
            }],
            Synonymous:[{
                mean:{
                    function:[''],
                    meaning:['']
                },
                spell:['']
            }],
            Derived:[{
                spell:'',
                meaning: [
                {
                    meaningContent: '',
                    function: ''
                }
            ],
            }]
        }
    ]
)
// const meanings = ref([
//     {
//         meaningContent: '',
//         function: ''
//     }
// ]);
// const sentences= ref([{
//                 sentenceContent: '',
//                 sentenceContentMean: ''
//             }]);
onMounted(() => {
    let request = {
        requestType: "getWords",
        userId: _userId.value,
        bookId: _bookId.value,

    };
    Request.post("http://localhost:8080/chooseBook", request).then(
        (res) => {
            console.log(res);
            if (res.data.stauts == "reciteWords") {
               reciteWord.value = res.data.reciteNewWordDates ;
               console.log(reciteWord.value);
            }
            else{
                ElMessage({
                        type: "error",
                        message: "出错了",
                        duration: 2000,
                    });
            }
        })
})
</script>
<template>
    <div>
        <div class="top">
            <button>返回</button>
            <div>
                <span>{{ remainQuantitiy }}</span><span>/</span><span>10</span>
            </div>
            <div>
                <button>收藏</button>
                <button>标熟</button>
            </div>
        </div>
        <div class="mid">
            <div class="share">
                <div>
                    <span>拼写</span>
                    <ul>
                        <li>答对几次</li>
                    </ul>
                    <ul>
                        <li>
                            <span>
                                词性
                            </span>
                            <span>
                                释义
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="question">
                <span>tip1</span>
                <ul>
                    <li>释义选项</li>
                </ul>
                <span>
                    英文例句
                </span>
                <button>提示一下</button>
                <span>tip2</span>
            </div>

            <div class="answer">
                <span>

                </span>

                <div>
                    <span>例句</span>
                    <span>释义</span>
                </div>
                <div>
                    <ul>
                        <li>
                            派生内容
                        </li>
                        <li>
                            近义内容
                        </li>
                        <li>
                            笔记内容
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <button>
                                派生按钮
                            </button>
                        </li>
                        <li>
                            <button>
                                近义按钮
                            </button>
                        </li>
                        <li>
                            <button>
                                笔记按钮
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="buttom">
            <button>
                <span>看答案</span>
            </button>
            <button>
                <span>下一词</span>
            </button>
            <button>
                <span>记错了</span>
            </button>
            <button>
                <span>认识</span>
            </button>
            <button>
                <span>不认识</span>
            </button>
        </div>


    </div>
</template>
<style scoped></style>