const { sequelize } = require('../../core/db')
const { Sequelize, Model } = require('sequelize')
const dayjs = require('dayjs')
const axios = require('axios')
const util = require('util')

class AccessToken extends Model {
  // 记录token
  static async createToken(token){
    try {
      return await AccessToken.create({token})
    } catch (error) {
      throw new global.customError.ServiceError(error.message)
    }
  }

  // 获取有效的token
  static async getEffectiveToken(){
    try{
      let res = await AccessToken.findOne({
        order: [['created_at', 'DESC']]
      })
      if(!res) throw new global.customError.ServiceError('暂无内容')
      let diff = dayjs(res.created_at).diff(dayjs(), 'second')
      if((7200 + diff) > 800) return res
      let token = await getTokenFromWx()
      let result = await AccessToken.createToken(token.access_token)
      return result
    }catch(error){
      throw new global.customError.ServiceError(error.message)
    }
  }

  // 主动刷新token
  static async refreshToken(){
    try {
      let token = await getTokenFromWx()
      let result = await AccessToken.createToken(token.access_token)
      return result
    } catch (error) {
      throw new global.customError.ServiceError(error.message)
    }
  }
}

AccessToken.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: Sequelize.STRING(1024),
}, {
    sequelize,
    tableName: 'wx_access_token'
  }
)

module.exports = {
  AccessToken
}

// 获取token，如果token过期了，则去生成新的token
async function getTokenFromWx(){
  const wxmp = global.config.wxmp
  const url = util.format(wxmp.accessTokenUrl, wxmp.appid, wxmp.secret) 
  let res = await axios.get(url)
  if(res.status != 200) throw new global.customError.ServiceError()
  if(res.data.hasOwnProperty('errcode')){
    throw new global.customError.ServiceError(`errcode: ${res.data.errcode}, errmsg: ${res.data.errmsg}`)
  }
  return res.data
}