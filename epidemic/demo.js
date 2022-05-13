
initDemo ();

function initDemo () {
    console.log("hello word!");
    /*****引入cordova**/
    window.onload = function () {
        /**
         * 识别设备终端，获取app相关信息
         */
        window.terminal =  (function() {
            var u = navigator.userAgent;//app = navigator.appVersion;
            return {//浏览器版本信息
                trident : u.indexOf('Trident') > -1,
                presto : u.indexOf('Presto') > -1,
                webKit : u.indexOf('AppleWebKit') > -1,
                gecko : u.indexOf('Gecko') > -1 && u.indexOf('KHTML') > -1,
                mobile : !! u.match(/AppleWebKit.*Mobile.*/),
                ios : !! u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
                android : u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
                iPhone : u.indexOf('iPhone') > -1,
                iPad : u.indexOf('iPad') > -1,
                webApp : u.indexOf('Safari') > -1,
                weixin: u.indexOf('MicroMessenger') > -1 && u.replace(/.*(MicroMessenger\/[^\s]*).*/, "$1").replace("MicroMessenger/", "") || false,
                appVersion: u.indexOf('bocapp(') > -1 ?  u.match(/bocapp\(\S+\)/)[0].slice(7, -1) : '3.0.0'
            };
        })()
        /**
         * APP版本号比较方法
         * @param (String) version1 版本号1，当前版本号
         * @param (String) version2 版本号2，要求最低版本号
         * @returns {Number} 判断版本号1是否高于版本号2，高于为1,等于为0,低于为-1
         */
        // APP当前版本号获取方法：window.terminal.appVersion
        window.versionCompare = function(version1, version2){
            var v1 = version1.split('.');
            var v2 = version2.split('.');
            for (var i = 0; i < v1.length; i++) {
                if (v1[i]*1 > v2[i]*1) {
                    return 1;  // 当前版本号大于要求最低版本号
                } else if(v1[i]*1 < v2[i]*1){
                    return -1; // 当前版本号小于要求最低版本号
                }
            }
            return 0; // 当前版本号等于要求最低版本号
        }
        /**
         * 引入cordova
         */
        var script = document.createElement('script')
        var pth = "https://ebsnew.boc.cn/bocphone/BocMerchant/" // 生产环境
        // 外网环境直接引用生产地址即可，若需新增cordova方法，另行提供DMZ区地址
        if (window.terminal.iPhone) {
            script.src = pth + 'paylib/ios.js'
        } else if (window.terminal.android) {
            script.src = pth + 'paylib/android.js'
        } else {
            alert('无法识别终端类型')
        }
        document.getElementsByTagName('head')[0].appendChild(script)

        /**
         * 绑定事件---调用cordova
         */
        document.addEventListener('deviceready', function (){
            /*******返回首页********/
            document.getElementById("back").onclick = function () {
                alert('即将返回手机银行频道页');
                window.c_plugins.merchantBridge.goToNative(function () {
                    alert('关闭商户H5页面，返回手机银行');
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {page: '0'})
            };
            /*******判断是否登录********/
            document.getElementById("judge").onclick = function () {
                alert('即将判断登录');
                window.c_plugins.merchantBridge.judgeLogin(function (data) {
                    alert('登录结果'+JSON.stringify(data));
                    // “yes”登录;“no”未登录
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {})
            };
            /*******跳转登录********/
            document.getElementById("login").onclick = function () {
                alert('即将跳转登录页面');
                window.c_plugins.merchantBridge.continueAfterLogin(function () {
                    alert('登录成功后执行代码');
                    // 需再获取一遍客户信息
                    // 跳转前如点击支付，则调起支付控件；
                    // 跳转前如点击交易记录，则跳转交易记录；
                    // 跳转前如点击优惠券，则跳转优惠券
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {})
            };

            /*******获取客户信息(欧飞加油卡专用，其他商户请勿使用)********/
            document.getElementById("getCustomerInfo").onclick = function() {
                alert('加油卡调用获取用户信息方法');
                window.c_plugins.merchantBridge.getBocCustomerInfo(function (data) {
                    alert('加油卡客户信息已获取'+JSON.stringify(data));
                })
            };
            /*******获取客户全量信息（其他商户用）********/
            document.getElementById("getCustomerAllInfo").onclick = function() {
                alert('调用获取用户信息方法');
                window.c_plugins.merchantBridge.getBocCustomerAllInfo(function (data) {
                    alert('客户信息已获取'+JSON.stringify(data));
                })
            };
            /*******取票（易商体系商户专用）********/
            document.getElementById("ticket").onclick = function() {
                alert('调用取票方法');
                window.c_plugins.merchantBridge.getRedirectTicket(function (data) {
                    alert('票信息：'+JSON.stringify(data));
                })
            };
            /*******调起支付控件********/
            var setting = {
                // 下述数据仅为示例，实际数据上送格式请参考cordova接口文档的描述
                merchantNo: '123456', // 商户号
                version: 'V1.1', // 版本号
                messageId: '654321', // 交易码
                security: 'P7', // 签名方法
                message: 'abc', // 请求报文明文信息
                signature: 'cba' // 请求报文签名信息
            };
            document.getElementById("payment").onclick = function () {
                alert('即将调起支付组件');
                window.c_plugins.merchantBridge.callPaymentControl(function (data) {
                    // 下述内容为点击左上角<后执行
                    alert('已调起支付控件');
                    if (data.isCancelPay === '1'){
                        // 客户取消了支付
                    } else {
                        if (data.orderStatus === '1') {
                            // 支付成功的回调方法，可写返回后逻辑
                        } else {
                            // 支付失败的回调方法 ，可写返回后逻辑
                        }
                    }

                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                },setting)
            };
            /*******返回频道页********/
            document.getElementById("back-left").onclick = function () {
                alert("左上返回");
                window.c_plugins.merchantBridge.goToNative(function () {
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {page: '0'})
            };
            /*******OAuth2.0 仅采用OAuth对接方式的商户需使用，SAP组专用********/
            document.getElementById("loginGetCustomerInfo").onclick = function () {
                window.c_plugins.merchantBridge.loginGetCustomerInfo(function (data) {
                    alert('OAuth2.0：'+JSON.stringify(data));
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {})
            };
            /*******微信分享********/
            document.getElementById("weiXinShare").onclick = function () {
                alert('调用微信分享');
                window.c_plugins.merchantBridge.weixinShare(function () {
                    alert('suc')
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {
                    url: 'www.boc.cn',
                    title:'中国银行',
                    description:'中国银行网银客户端',
                    img:''
                })
            };
            /*******打开微信小程序********/
            document.getElementById("weiXinOpenMini").onclick = function () {
                alert('调用微信分享');
                window.c_plugins.merchantBridge.weixinOpenMiniProgram(function () {
                    alert('suc')
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {
                    userName: 'gh_09aa16bda457',
                    path:'pages/changeReward/changeReward'
                })
            };
            /*******活动管理平台取票********/
            document.getElementById("getPsnActivity").onclick = function () {
                alert('活动管理平台取票');
                window.c_plugins.merchantBridge.getPsnActivityInfoQuery(function (data) {
                    alert(JSON.stringify(data));
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {})
            };
            /*******获取当前定位信息********/
            document.getElementById("getLocationInfo").onclick = function () {
                alert('获取当前定位信息');
                window.c_plugins.merchantBridge.getLocationInfo(function (data) {
                    alert(JSON.stringify(data));
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {})
            };
            /*******调摄像头，获取本地影像文件********/
            document.getElementById("getLocalImage").onclick = function () {
                alert('调摄像头，获取本地影像文件');
                document.getElementById("temImg").style.display = 'block';
                window.c_plugins.merchantBridge.getLocalImage(function (data) {
                    alert(JSON.stringify(data.imgStr));
                    //生成图片
                    var newXX = document.getElementById("temImg");
                    newXX.innerHTML = '<img class="inImg" src=' + "data:image/jpeg;base64," + data.imgStr + '>';
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {})
            };
            /*******OCR调摄像头获取指定信息（银行卡、身份证等）-身份证-正面********/
            document.getElementById("getInfoByCamera").onclick = function () {
                alert('OCR调摄像头获取身份证信息--正面');
                document.getElementById("temImg").style.display = 'block';
                window.c_plugins.merchantBridge.getInfoByCamera(function (data) {
                    alert(JSON.stringify(data));
                    //生成图片-如果身份证正面存在则显示证明，反之则反面
                    temIDImg= data.IDCardImgFace ? data.IDCardImgFace : data.IDCardImgBack ;
                    var newXX = document.getElementById("temImg");
                    alert(temIDImg);
                    newXX.innerHTML = '<img class="inImg" src=' + "data:image/png;base64," + temIDImg + '>';
                }, function (err) {
                    alert('开始进入错误回调-正面');
                    if(err.code === "identifying_infomation_erro"){
                        alert(err.message || "请识别正确的卡面")
                    }else{
                        alert(err.message || err || '网络错误，请检查网络连接');
                    }
                }, {
                    functionCode: '1'//识别类型  0：获取银行卡信息；1：获取身份证正面信息 2：获取身份证背面信息
                })
            };
            /*******OCR调摄像头获取指定信息（银行卡、身份证等）-身份证-反面面********/
            document.getElementById("getInfoByCameraBack").onclick = function () {
                alert('OCR调摄像头获取身份证信息--反面');
                document.getElementById("temImg").style.display = 'block';
                window.c_plugins.merchantBridge.getInfoByCamera(function (data) {
                    alert(JSON.stringify(data));
                    //生成图片-如果身份证正面存在则显示证明，反之则反面
                    temIDImg= data.IDCardImgFace ? data.IDCardImgFace : data.IDCardImgBack ;
                    var newXX = document.getElementById("temImg");
                    alert(temIDImg);
                    newXX.innerHTML = '<img class="inImg" src=' + "data:image/png;base64," + temIDImg + '>';
                }, function (err) {
                    alert('开始进入错误回调-反面');
                    if(err.code === "identifying_infomation_erro"){
                        alert(err.message || "请识别正确的卡面")
                    }else{
                        alert(err.message || err || '网络错误，请检查网络连接');
                    }
                }, {
                    functionCode: '2'//识别类型  0：获取银行卡信息；1：获取身份证正面信息 2：获取身份证背面信息
                })
            };
            /*******OCR调摄像头获取指定信息（银行卡、身份证等）-银行卡********/
            document.getElementById("getInfoByCameraCard").onclick = function () {
                alert('OCR调摄像头获取银行卡信息');
                window.c_plugins.merchantBridge.getInfoByCamera(function (data) {
                    alert(JSON.stringify(data));
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {
                    functionCode: '0'//识别类型  0：获取银行卡信息；1：获取身份证正面信息 2：获取身份证背面信息
                })
            };
            /*******生成二维码********/
            document.getElementById("generateQrCode").onclick = function () {
                alert('生成二维码');
                document.getElementById("temImg").style.display = 'block';
                window.c_plugins.merchantBridge.generateQrCode(function (data) {
                    alert(JSON.stringify(data));
                    //生成图片
                    var newXX = document.getElementById("temImg");
                    newXX.innerHTML = '<img class="inImg" src=' + "data:image/png;base64," + data.qrBase64Data + '>';
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {
                    qrLogoBase64Data:'',//二维码logo图片base64值  可谓空
                    qrValue: 'ldjlfajdlfjal'//需要生成二维码的数据
                })
            };
            /*******识别二维码********/
            document.getElementById("decoderQrCodeH5").onclick = function () {
                alert('识别二维码-H5');
                window.c_plugins.merchantBridge.decoderQrCode(function (data) {
                    alert(JSON.stringify(data));
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {
                    qrType:'2',//识别二维码方式  1：打开App扫码功能（里面带有扫描，付款，收款，相册识别），2：H5传递二维码
                    qrBase64Data:temCodeImg//二维码图的base64值
                })
            };
            /*******识别二维码********/
            document.getElementById("decoderQrCodeAPP").onclick = function () {
                alert('识别二维码-APP');
                window.c_plugins.merchantBridge.decoderQrCode(function (data) {
                    alert(JSON.stringify(data));
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {
                    qrType:'1',//识别二维码方式  1：打开App扫码功能（里面带有扫描，付款，收款，相册识别），2：H5传递二维码
                    qrBase64Data:temCodeImg//二维码图的base64值
                })
            };
            /*******监听加速度********/
            document.getElementById("getSensorOfAccelerometer").onclick = function () {
                alert('监听加速度');
                window.c_plugins.merchantBridge.getSensorOfAccelerometer(function (data) {
                    alert('suc');
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {})
            };
            /*******拨打电话********/
            document.getElementById("actionCallUp").onclick = function () {
                alert('拨打电话');
                window.c_plugins.merchantBridge.actionCallUp(function () {
                    alert('suc');
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {
                    phoneNumber: '15901402866'//拨打电话号码
                })
            };
            /*******打开其他APP********/
            document.getElementById("actionOpenApp").onclick = function () {
                alert('打开APP');
                window.c_plugins.merchantBridge.actionOpenApp(function () {
                    alert('suc');
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {
                    appUrl: 'www.baidu.cn'//打开其他App（精确至功能的）Url
                })
            };
            /*******跳转应用市场********/
            document.getElementById("gotoMarket").onclick = function () {
                alert('跳转应用市场');
                window.c_plugins.merchantBridge.gotoMarket(function () {
                    alert('suc');
                }, function (err) {
                    alert(err.message || err || '网络错误，请检查网络连接');
                }, {
                    appUrl: 'www.baidu.com'//打开其他App（精确至功能的）Url
                })
            };
            //关闭图片
            document.getElementById("temImg").onclick = function () {
                //生成图片
                var newXX = document.getElementById("temImg");
                newXX.innerHTML = '';
                document.getElementById("temImg").style.display = 'none';
            };
        })

        var temCodeImg = "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AACAAIEOAAAAAQIdAAAAAgQ6AAAABAh0AAAACBDoAAAAECDQAQAAIECgAwAAQIBABwAAgACBDgAAAAECHQAAAAIEOgAAAAQIdAAAAAgQ6AAAABAg0AEAACBAoAMAAECAQAcAAIAAgQ4AAAABAh0AAAACBDoAAAAECHQAAAAIEOgAAAAQINABAAAgQKADAABAgEAHAACAAIEOAAAAAQIdAAAAAgQ6AAAABAh0AAAACBDoAAAAECDQAQAAIECgAwAAQIBABwAAgACBDgAAAAECHQAAAAIEOgAAAAQIdAAAAAgQ6AAAABAg0AEAACBAoAMAAECAQAcAAIAAgQ4AAAABAh0AAAACBDoAAAAECHQAAAAIEOgAAAAQINABAAAgQKADAABAgEAHAACAAIEOAAAAAQIdAAAAAgQ6AAAABAh0AAAACBDoAAAAECDQAQAAIECgAwAAQIBABwAAgACBDgAAAAECHQAAAAIEOgAAAAQIdAAAAAgQ6AAAABAg0AEAACBAoAMAAECAQAcAAIAAgQ4AAAABAh0AAAACBDoAAAAECHQAAAAIEOgAAAAQINABAAAgQKADAABAgEAHAACAAIEOAAAAAQIdAAAAAgQ6AAAABAh0AAAACPgvEI8C6xrD4R0AAAAASUVORK5CYII="

    }
}
