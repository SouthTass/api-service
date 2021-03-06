const Router = require('koa-router')
const requireDirectory = require('require-directory')

class InitManager{
  static initCore(app){
    InitManager.app = app
    InitManager.initLoadRouters()
    InitManager.importGlobalError()
    InitManager.loadConfig()
  }

  static loadConfig(path = ''){
    const configPath = path || `${process.cwd()}/config/config.js`
    const config = require(configPath)
    global.config = config
  }

  static initLoadRouters(){
    const wxDirectory = `${process.cwd()}/app/wx`
    requireDirectory(module, wxDirectory, {
      visit: whenLoadModule
    })
    
    function whenLoadModule(obj){
      if(obj instanceof Router){
        InitManager.app.use(obj.routes())
      }
    }
  }

  static importGlobalError(){
    const errorFile = require('../core/httpException')
    global.customError = errorFile
  }
}

module.exports = InitManager