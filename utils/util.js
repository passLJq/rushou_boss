const app_utils = getApp()
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const http = ({method = "GET", url, data, header, successBack, errorBack, loading_icon = "default"}) => {
  if (loading_icon == "default") {
    app_utils.showLoading("正在加载中...")
  }
  let newHeader = ""
  if(header) {
    newHeader = {
      "Authorization": wx.getStorageSync("sessionkey"),
      "Content-Type": 'application/json; charset=utf-8'
    }
  }
  wx.request({
    url: url,
    method: method,
    data: data,
    header: newHeader,
    success(ret) {
      if (ret.statusCode == 403 ){
        if (wx.getStorageSync('statusCode')) {
          return
        }
        wx.setStorage({
          key: 'statusCode',
          data: '403',
          success: ()=> {
            app_utils.promsg('登录过期，请刷新页面或切换页面')
            app_utils.loginwx(1)
          }
        })
      }else{
        wx.setStorage({
          key: 'statusCode',
          data: '',
          success: () => {
            if (successBack) {
              successBack(ret)
            }
          }
        })

      }
      var timer = setTimeout(function(){
        clearTimeout(timer)
        timer = null
        wx.hideLoading()
        wx.stopPullDownRefresh()
      },500)
      
    },
    fail(err) {
      console.log(err)
      wx.hideLoading()
      if (errorBack) {
        errorBack(err)
      }else {
        if (err.errMsg == 'request:fail ') {
          app_utils.promsg('出错了，请检查网络~')
        } else {
          app_utils.promsg(err.errMsg)
        }
      }
      wx.stopPullDownRefresh()
    }
  })
}
// 购物车数量角标
const cartCounts = ({ callBack = ""})=> {
  http({
    url: app_utils.globalData.siteUrl + '/Main/Shopping/GetCartProCount',
    data: {
      uid: wx.getStorageSync("SessionUserID"),
      ruid: wx.getStorageSync("ruid") || wx.getStorageSync("SessionUserID")
    },
    header: 1,
    loading_icon: 1,
    successBack: (ret) => {
      callBack && callBack(ret)
    },
    fail(err) {
      app_utils.promsg(err)
    }
  })
}
//压缩参数
function diz(pid, formbase, tobase, callBack){
  wx.request({
    url: app_utils.globalData.siteUrl + '/main/WechatApi/BinaryConversionJson',
    data: {
      number: pid,
      frombase: formbase,
      tobase: tobase
    },
    success: function (ret) {
      if (ret.data.nValue == '-1') {
        app.alerts('商品id获取失败01')
        return
      }else{
        callBack && callBack(ret)
      }
    },
    fail: function (err) {
      app_utils.promsg(err)
    }
  })
}
//前往解冻专区
function goopen_pro(){
  wx.navigateTo({
    url: '/pages/jiedong_pro/jiedong_pro'
  })
}

module.exports = {
  formatTime: formatTime,
  http,
  cartCounts,
  diz,
  goopen_pro
}
