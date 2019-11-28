var api = require('../config/api.js');
var app = getApp();

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = "GET") {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'X-Litemall-Token': wx.getStorageSync('token'),
        'Cookie': '.ASPXAUTH=D1AD7334A61E7AB6423CEC6B8CE1EC5DA20E664362D1A1DCD10A960B93E62B7DDFCD30EFE15D317480B5CE2C11DEFA1A8087F14B10B81CCACB0B7457364FB3AA875A710EB71CE65AB00647C6E948DBC6A7ACC6800CF27063C79B02B1BDF7A54EB24044478FDAF5E5E2934634A69087C894BF9772604C5E639EE9E9DE0CD1939A3336325BB7A917D5175B9240F0CD45ADFB68B8397BB51C56C7FE578A02E7E4A7; Nop.customer=e18423dd-0a60-4887-84a0-d148034dbb18; __jsluid_h=f109c6d4ec4115b28e3e97031ec84670'
      },
      success: function (res) {

        if (res.statusCode == 200) {

          if (res.data.errno == 501) {
            // 清除登录相关内容
            try {
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('token');
            } catch (e) {
              // Do something when catch error
            }
            // 切换到登录页面
            wx.navigateTo({
              url: '/pages/auth/login/login'
            });
          } else {
            resolve(res.data);
          }
        } else {
          reject(res.errMsg);
        }

      },
      fail: function (err) {
        reject(err)
      }
    })
  });
}

function redirect(url) {

  //判断页面是否需要登录
  if (false) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  } else {
    wx.redirectTo({
      url: url
    });
  }
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast
}