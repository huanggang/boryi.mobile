var hashMap = {  
  Set : function(key,value){this[key] = value},  
  Get : function(key){return this[key]},  
};

hashMap.Set("101", "用户尚未登录");
hashMap.Set("102", "用户没有权限");
hashMap.Set("103", "缺少必要的参数");
hashMap.Set("104", "不存在");
hashMap.Set("105", "服务器错误");
hashMap.Set("106", "参数相互冲突");
hashMap.Set("107", "写数据库失败");
hashMap.Set("108", "读数据库失败");
hashMap.Set("109", "数据库连接失败");

hashMap.Set("201", "登录密钥错误");
hashMap.Set("202", "用户地理位置不详");
hashMap.Set("203", "用户无权举报");
hashMap.Set("204", "用户已举报此信息");
hashMap.Set("205", "已有多位用户举报");
hashMap.Set("206", "用户所属学校不详，请联系本校就业处");
hashMap.Set("207", "用户已评价此商家，一个月内请勿重复评价同一商家");

hashMap.Set("301", "非法的截止日期");
hashMap.Set("302", "非法的年龄要求");
hashMap.Set("303", "非法的身高要求");
hashMap.Set("304", "非法的月薪");
hashMap.Set("305", "非法的学历要求");
hashMap.Set("306", "非法的经验要求");
hashMap.Set("307", "非法的电话或手机号码");
hashMap.Set("308", "非法的电子邮箱");
hashMap.Set("309", "非法的工作类型");

hashMap.Set("401", "用户信用过低，无法发布信息");
hashMap.Set("402", "用户发布的信息数已超出其信用所允许的数");

hashMap.Set("501", "用户发布非法信息");

hashMap.Set("601", "文件上传失败");
hashMap.Set("602", "上传失败，非法文件");