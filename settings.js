
module.exports = {
  express: {
    port: process.env.PORT || 3000,
    engine: 'ejs',
    views:'/build',
    files:'/build'
  },
  	
	session:{
		secret:'karibou-1234'
	},
	
  mailer: {
    auth: {
      user: 'test@example.com',
      pass: 'secret',
    },
    defaultFromAddress: 'First Last <test@examle.com>'
  },
  
  
  picture:{
  }
};
