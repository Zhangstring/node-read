// 初始化 pm2 deploy ecosystem.config.js production setup
// 服务器拉下git代码，并安装依赖 pm2 deploy production --force
// 执行命令 pm2 deploy production exec "pm2 start app.js"
module.exports = {
  apps : [{
    name: 'API',
    script: 'app.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      watch: true,
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : 'ubuntu',
      host : '118.25.109.253',
      ref  : 'origin/master',
      repo : 'https://github.com/Zhangstring/node-read.git',
      path : '/data/server/node-read',
      'post-deploy' : 'cnpm install && pm2 reload ecosystem.config.js --env production',
    }
  }
};
