'use strict';const _0x39240e=_0x4a9f;(function(_0x3e13ec,_0x2c99a5){const _0x5f296d=_0x4a9f,_0x5dfb7f=_0x3e13ec();while(!![]){try{const _0x4fff94=-parseInt(_0x5f296d(0xfa))/0x1*(parseInt(_0x5f296d(0x115))/0x2)+parseInt(_0x5f296d(0x10d))/0x3+parseInt(_0x5f296d(0xec))/0x4*(parseInt(_0x5f296d(0x116))/0x5)+-parseInt(_0x5f296d(0x101))/0x6*(-parseInt(_0x5f296d(0xf3))/0x7)+parseInt(_0x5f296d(0x112))/0x8+-parseInt(_0x5f296d(0x106))/0x9+-parseInt(_0x5f296d(0x100))/0xa;if(_0x4fff94===_0x2c99a5)break;else _0x5dfb7f['push'](_0x5dfb7f['shift']());}catch(_0x937c36){_0x5dfb7f['push'](_0x5dfb7f['shift']());}}}(_0x495b,0x3b9da));function _0x4a9f(_0x6468c7,_0x38bfc7){const _0x495bf2=_0x495b();return _0x4a9f=function(_0x4a9fbe,_0x46d5b2){_0x4a9fbe=_0x4a9fbe-0xe9;let _0x1cbe05=_0x495bf2[_0x4a9fbe];return _0x1cbe05;},_0x4a9f(_0x6468c7,_0x38bfc7);}Object[_0x39240e(0xf6)](exports,'__esModule',{'value':!![]}),exports['cliBootstrap']=exports[_0x39240e(0xee)]=exports['isProd']=void 0x0;const net_1=require(_0x39240e(0x10b)),config_1=require(_0x39240e(0xf1)),core_1=require(_0x39240e(0x111)),swagger_1=require(_0x39240e(0xf7)),nestjs_pino_1=require(_0x39240e(0xf4)),serverBootstrap=async _0x411561=>{const _0x533585=_0x39240e,_0x51d0e0={'JIZFC':_0x533585(0xf2),'nsFZo':_0x533585(0xeb),'JBDGV':_0x533585(0x102),'tKIMa':_0x533585(0xea)},_0x4eb60f=await core_1[_0x533585(0xf9)][_0x533585(0xfe)](_0x411561),_0x13b3e8=_0x4eb60f[_0x533585(0xf0)](config_1[_0x533585(0xef)]),_0x5217ea=_0x13b3e8[_0x533585(0xf0)](_0x51d0e0[_0x533585(0x10c)]),{appPort:_0xa1b441,apiPrefix:_0x47587e}=_0x13b3e8[_0x533585(0xf0)](_0x51d0e0[_0x533585(0xed)]);_0x4eb60f['setGlobalPrefix'](_0x47587e);const _0x113d48=_0x4eb60f[_0x533585(0xf0)](nestjs_pino_1[_0x533585(0xfc)]);_0x4eb60f[_0x533585(0x113)](_0x113d48);const _0x3374a=new swagger_1[(_0x533585(0x104))]()[_0x533585(0x109)](_0x51d0e0[_0x533585(0x105)])[_0x533585(0x10f)](_0x51d0e0[_0x533585(0xfd)])[_0x533585(0xe9)]()[_0x533585(0x117)](_0x5217ea)['build'](),_0x4a5b35=swagger_1[_0x533585(0xff)][_0x533585(0x108)](_0x4eb60f,_0x3374a);swagger_1[_0x533585(0xff)][_0x533585(0x110)](_0x47587e+'/apidocs',_0x4eb60f,_0x4a5b35,{'swaggerOptions':{'persistAuthorization':!![]}}),await _0x4eb60f['listen'](_0xa1b441),_0x113d48[_0x533585(0x114)](_0x5217ea+'\x20start\x20at\x20'+_0xa1b441);};exports[_0x39240e(0xee)]=serverBootstrap;const cliBootstrap=async _0x409e96=>{const _0x1fb769=_0x39240e,_0x544e0a=await core_1[_0x1fb769(0xf9)]['createApplicationContext'](_0x409e96);await _0x544e0a[_0x1fb769(0xf5)]();const _0x1b6442=_0x544e0a[_0x1fb769(0xf0)](config_1[_0x1fb769(0xef)]),_0x55ded5=_0x1b6442[_0x1fb769(0xf0)](_0x1fb769(0xf2)),_0x5681da=_0x544e0a[_0x1fb769(0xf0)](nestjs_pino_1[_0x1fb769(0xfc)]);_0x544e0a[_0x1fb769(0x113)](_0x5681da),_0x5681da[_0x1fb769(0x114)](_0x55ded5+_0x1fb769(0x10a)),(0x0,net_1['createServer'])()[_0x1fb769(0x107)]();};function _0x495b(){const _0x2b6bc0=['net','JIZFC','930030QytyXC','env.appDeployment','setVersion','setup','@nestjs/core','3748440oshHYT','useLogger','log','15094KmLjgA','2401610RZZINS','addTag','addBearerAuth','1.0','env.bootstrap','4dyebfk','nsFZo','serverBootstrap','ConfigService','get','@nestjs/config','env.appInstance','21kXSPuG','nestjs-pino','init','defineProperty','@nestjs/swagger','LdhjG','NestFactory','6yKgwwx','cliBootstrap','Logger','tKIMa','create','SwaggerModule','13060200VeODET','753258NGLWdk','Backend\x20API','isProd','DocumentBuilder','JBDGV','360252eStqcV','listen','createDocument','setTitle','\x20app\x20start'];_0x495b=function(){return _0x2b6bc0;};return _0x495b();}exports[_0x39240e(0xfb)]=cliBootstrap;const isProd=_0x436c55=>{const _0x17ecf5=_0x39240e,_0x33d7eb={'LdhjG':'prod'},_0x1e657a=_0x436c55['get'](_0x17ecf5(0x10e));return _0x1e657a===_0x33d7eb[_0x17ecf5(0xf8)];};exports[_0x39240e(0x103)]=isProd;
//# sourceMappingURL=app.helper.js.map