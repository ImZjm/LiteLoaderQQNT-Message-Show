// 运行在 Electron 渲染进程 下的页面脚本

// 同一个人消息连续显示
// 函数复制自 MUKAPP/LiteLoaderQQNT-MSpring-Theme
function concatBubble() {
    const msgList = document.querySelector('#ml-root .ml-list');

    if (msgList) {
        function compareTwoMsg(lower, upper) {
            return new Promise((resolve, reject) => {
                try {
                    // 检查lower是否包含timeStamp, gray-message
                    if (lower.querySelector(".gray-tip-message,.message__timestamp")) {
                        resolve();
                        return;
                    }
                    // 检查upper和lower是否包含撤回, 检测message-container
                    if (!lower.querySelector(".message-container") || !upper.querySelector(".message-container")) {
                        resolve();
                        return;
                    }
                    const avatarLower = lower.querySelector("span.avatar-span");
                    const avatarUpper = upper.querySelector("span.avatar-span");
                    // const usernameNodeLower = lower.querySelector("span.avatar-span");
                    const usernameNodeLower = lower.querySelector("div.user-name");
                    const usernameLower = avatarLower.getAttribute("aria-label");
                    const usernameUpper = avatarUpper.getAttribute("aria-label");
                    const containerLower = lower.querySelector("div.msg-content-container")
                    if (usernameLower === usernameUpper) {
                        const bubbleLower = lower.querySelector("div.msg-content-container");
                        // 删除upper message的paddingBottom
                        upper.style.paddingBottom = "0";
                        // 删除upper message-container的paddingBottom
                        upper.querySelector("div.message-container").style.paddingBottom = "0";
                        // upper message-container的paddingTop为4px
                        upper.querySelector("div.message-container").style.paddingTop = "4px";
                        // lower message-container的paddingTop为4px
                        lower.querySelector("div.message-container").style.paddingTop = "4px";
                        // lower头像调透明
                        avatarLower.style.opacity = "0";
                        // lower的username 不显示
                        if (usernameNodeLower && usernameNodeLower.style) {
                            usernameNodeLower.style.marginBottom = "0";
                            usernameNodeLower.style.display = "none";
                        }

                    }
                    resolve();
                } catch (error) {
                    log("compareMessage Error", error)
                    // log("lower", lower.innerHTML)
                    // log("upper", upper.innerHTML)
                    // 不reject, 避免影响其他任务
                    resolve();
                }
            });
        }

        let lastMessageNodeList = Array.from(msgList.querySelectorAll("div.message"));

        const observer = new MutationObserver(async function () {
            // 比对两轮的msgList
            let currMessageNodeList = Array.from(msgList.querySelectorAll("div.message"));
            let lastMessageNodeSet = new Set(lastMessageNodeList);

            let tasks = [];
            for (let i = 0; i < currMessageNodeList.length - 1; i++) {
                let currMsg = currMessageNodeList[i];
                if (!lastMessageNodeSet.has(currMsg)) {
                    tasks.push(compareTwoMsg(currMessageNodeList[i], currMessageNodeList[i + 1]));
                }
            }
            // 提速
            Promise.all(tasks).then(() => {
                // log("Promise all complete")
            }).catch(() => {
                log("Promise not complete all")
            });

            lastMessageNodeList = currMessageNodeList;
        });
        const config = { childList: true };
        observer.observe(msgList, config);
    }
}

function observeElement(selector, callback, callbackEnable = true, interval = 100, timeout = 5000) {
    let elapsedTime = 0;
    const timer = setInterval(function () {
        const element = document.querySelector(selector);
        if (element) {
            if (callbackEnable) {
                callback();
            }
            clearInterval(timer);
        }

        elapsedTime += interval;
        if (elapsedTime >= timeout) {
            clearInterval(timer);
            log('超时', selector, "未出现");
        }
    }, interval);
}

function msgSelfToLeft() {
    const style = document.createElement('style');
    style.textContent = `
    .message-container--align-right{
        grid-template-areas:
            "checkbox avatar . nickname nickname nickname"
            "checkbox avatar . content status ."
            "checkbox avatar . tips tips tips" !important;
        grid-template-columns: auto var(--avatar_size_2) 8px auto calc(var(--avatar_size_2) + 8px) 1fr !important;
        justify-content: start !important;
        justify-items: start !important;
    }
    
    .message-container--align-right .user-name{
        padding: 0 calc(var(--avatar_size_2) + 8px) 0 0 !important;
    }
    
    .message-container .user-name--selfRole {
        flex-direction: initial !important;
    }
    `;

    document.head.appendChild(style);

}

// 页面加载完成时触发
function onLoad() {
    observeElement('#ml-root .ml-list', concatBubble);

    msgSelfToLeft();
}


// 打开设置界面时触发
function onConfigView(view) {

}


// 这两个函数都是可选的
export {
    onLoad
}