<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import { storeToRefs } from 'pinia';

const router = useRouter();
const Request = axios.create({
    baseURL: '/api',
    timeout: 3000,
    withCredentials: true,
});
const remainQuantitiy = ref(0);
const userId = localStorage.getItem("userId");
const bookId = localStorage.getItem("chooseBookId");
let maxNum = ref(10);
const reciteWord = ref(
    [[
        {
            spell: '',
            meaning: [
                {
                    meaningContent: '',
                    function: ''
                }
            ],
            count: 0,
            notes: [{ content: '' }],
            sentence: [{
                sentenceContent: '',
                sentenceContentMean: ''
            }],
            Synonymous: [{
                mean: {
                    function: [''],
                    meaning: ['']
                },
                spell: ['']
            }],
            derived: [{
                spell: '',
                meaning: [
                    {
                        meaningContent: '',
                        function: ''
                    }
                ],
            }]
        }
    ]]
)
let countFlag = ref([false]);

let len = ref([]);
let nowNum = 1;
let nowSpell = '';
let nowCount = 0;
const question = ref(true);
const tip1Valid = ref(false);
const meaningValid = ref(false);
const deriveWords = ref([{
    spell: '',
    meaning: [
        {
            meaningContent: '',
            function: ''
        }
    ],
}])


onMounted(() => {
    let request = {
        requestType: "getWords",
        userId: userId,
        bookId: bookId,
    };
    Request.post("http://localhost:8080/recite", request).then(
        (res) => {
            console.log(res);
            console.log(111);
            if (res.data.status == "reciteWords") {
                reciteWord.value[0] = res.data.reciteNewWordDates;
                reciteWord.value[1] = res.data.reciteOneWordDates;
                reciteWord.value[2] = res.data.reciteTwoWordDates;
                console.log(reciteWord.value[0]);
                console.log(reciteWord.value[1]);
                console.log(reciteWord.value[2]);
                for (var i = 0; i < 3; i++) {
                    len[i] = reciteWord.value[i].length;
                }
                //明确要背的数量
                if (len[0] + len[1] + len[2] < 10) {
                    maxNum.value = len[0] + len[1] + len[2];
                }
                nowSpell = reciteWord.value[0][0].spell;
                nowCount = reciteWord.value[0][0].count;
               // handleDerive(reciteWord.value[0][0].Derived);
                console.log(reciteWord.value[0][0].derived);
                handleCount(nowCount);
                handleShow();
            }
            else {
                ElMessage({
                    type: "error",
                    message: "出错了",
                    duration: 2000,
                });
            }
        })
})

function handleCount(count) {
    for (var i = 0; i < count; i++) { countFlag.value[i] = true }
}
function handleShow() {
    if (question) {
        if (nowCount == 0) {
            tip1Valid.value = true;
            meaningValid.value = false;
        }
    }
}
// function handleDerive(derives) {
//     for (var i = 0; i < derives.length; i++) 
//     { 
//         deriveWords[i].spell = derives[i]
//      }
// }
</script>
<template>
    <div>
        <div class="top">
            <button class="outButton"><el-icon>
                    <ArrowLeft />
                </el-icon></button>
            <div class="reciteNum">
                <span>{{ remainQuantitiy }}</span><span>/</span><span>{{ maxNum }}</span>
            </div>
            <div class="functionButton">
                <button>收藏</button>
                <button>标熟</button>
            </div>
        </div>
        <div class="mid">
            <div class="share">
                <div class="spell_count">
                    <span>{{ nowSpell }}</span>
                    <ul>
                        <li class="point" :class="{ 'grey': !countFlag[2], 'green': countFlag[2] }"></li>
                        <li class="point" :class="{ 'grey': !countFlag[1], 'green': countFlag[1] }"></li>
                        <li class="point" :class="{ 'grey': !countFlag[0], 'green': countFlag[0] }"></li>
                    </ul>
                </div>
                <div v-show="meaningValid">
                    <ul>
                        <li>
                            <span>词性</span><span>释义</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="question">
                <span v-show="tip1Valid">先回想词义再选择，想不起来「看答案」</span>
                <ul>
                    <li >释义选项</li>
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
            <button v-show="!question">
                <span>下一词</span>
            </button>
            <button v-show="!question">
                <span>记错了</span>
            </button>
            <button v-show="question">
                <span>认识</span>
            </button>
            <button v-show="question">
                <span>不认识</span>
            </button>
        </div>


    </div>
</template>
<style scoped>
@import './learn.css';
</style>
