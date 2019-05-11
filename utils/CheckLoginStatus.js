const app = getApp()
//检查用户登录状态
var CheckLoginStatus = {
  checksession: function (callBack) {
    console.log("减肥的顺口溜")
    wx.checkSession({
      success: function (ret) {
        console.log(ret)
        if (wx.getStorageSync('SessionUserID')) {
          callBack && callBack()
        }else {
          app.loginwx(callBack)
        }
      },
      fail: function (err) {
        console.log(err)
        //登录态过期
        app.loginwx(callBack)
      }
    })
  }
}
module.exports = {
  checksession: CheckLoginStatus.checksession
}