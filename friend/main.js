//  保留两位小数函数
function toDecimal2(x) {
	var f = parseFloat(x);
	if (isNaN(f)) {
		return false;
	}
	var f = Math.round(x*100)/100;
	var s = f.toString();
	var rs = s.indexOf('.');
	if (rs < 0) {
		rs = s.length;
		s += '.';
	}
	while (s.length <= rs + 2) {
		s += '0';
	}
	return s;
}

//定义一个控件类
function ZoomControl() {
	this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
	this.defaultOffset = new BMapGL.Size(30, 30)
}
//通过JavaScript的prototype属性继承于BMap.Control
ZoomControl.prototype = new BMapGL.Control();

//自定义控件必须实现自己的initialize方法，并且将控件的DOM元素返回
//在本方法中创建个div元素作为控件的容器，并将其添加到地图容器中
ZoomControl.prototype.initialize = function(map) {
 //创建一个dom元素
var div = document.createElement('div');
//给中心点控件加class属性
div.className = "center_control";
var img = document.createElement('div');
// 设置中心点定位的div样式
div.style.width = "39px";
div.style.height = "40.5px";
div.style.borderRadius = "1px";
div.style.backgroundColor = "#fff";
div.style.marginRight="-7.5px";
div.style.marginBottom="81px";
div.style.boxShadow="0 10px 20px #ccc";
//设置中心点定位内部图片样式
img.style.width = "26px";
img.style.height = "26px";
img.style.backgroundImage = "url(./img/center.png)";
img.style.margin = "0 auto";
img.style.marginTop = "7px";
div.append(img);
// 绑定事件,点击回到中心点并将缩放等级调回16
div.onclick = function(e){
	map.panTo(dw_point);
	map.centerAndZoom(dw_point,16);
}
// 添加DOM元素到地图中
map.getContainer().appendChild(div);
// 将DOM元素返回
return div;
}

//地图上的用户标记
// 定义自定义覆盖物的构造函数
function SquareOverlay(center, head,id){
	this._center = center;
	this._head = head;
	this._id = id;
}
// 继承API的BMap.Overlay
SquareOverlay.prototype = new BMapGL.Overlay();
// 实现初始化方法
SquareOverlay.prototype.initialize = function(map){
	// 保存map对象实例
	this._map = map;
	// 创建div元素，作为自定义覆盖物的容器
	var div = document.createElement("div");
	div.className = "marker_bj";
	div.style.position = "absolute";
	// 可以根据参数设置元素外观
	div.style.width = "40px";
	div.style.height = "40px";
	div.style.backgroundImage = "url(../img/bj_wt.png)";
	var img = document.createElement("div");
	img.style.width = "21px";
	img.style.height = "21px";
	img.style.backgroundImage = "url(/img/head/"+this._head+")";
	img.style.backgroundSize = "100% 100%";
	img.style.borderRadius = "21px";
	img.style.marginLeft = "9px";
	img.style.marginTop = "4px";
	div.append(img);
	// 将div添加到覆盖物容器中
	map.getPanes().markerPane.appendChild(div);
	// 保存div实例
	this._div = div;
	// 需要将div元素作为方法的返回值，当调用该覆盖物的show、
	// hide方法，或者对覆盖物进行移除时，API都将操作此元素。
	return div;
}
// 实现绘制方法
SquareOverlay.prototype.draw = function(){
// 根据地理坐标转换为像素坐标，并设置给容器
	var position = this._map.pointToOverlayPixel(this._center);
	this._div.style.left = position.x - (40 / 2)+"px";
	this._div.style.top = position.y - (40 /2)+"px";
}

// 实现显示方法
SquareOverlay.prototype.show = function(){
	if (this._div){
		this._div.style.display = "";
	}
}
// 实现隐藏方法
SquareOverlay.prototype.hide = function(){
	if (this._div){
		this._div.style.display = "none";
	}
}

// 添加自定义方法
SquareOverlay.prototype.toggle = function(){
	if (this._div){
		if (this._div.style.display == ""){
			this.hide();
		}
		else {
			this.show();
		}
	}
}

var map = new BMapGL.Map("container");//创建地图实例
var dw_point = new BMapGL.Point(119.11970299167945,33.55640377634258);
//处理定位后的信息
function showLocation(r){
    if(this.getStatus() == BMAP_STATUS_SUCCESS){//定位成功
        //新建中心点 并将地图中心移动过去
        var centerPoint = new BMapGL.Point(r.longitude,r.latitude);
        map.panTo(centerPoint);
        map.setCenter(centerPoint);
		dw_point = centerPoint;
		//保存定位点
		saveUserGPS(r.longitude,r.latitude);

		//获取地图上的所有的标注
		var allOverlay = map.getOverlays();
		for(var i = 0;i<allOverlay.length;i++){
			var id = allOverlay[i]._id;//获取所有标记的Id
			if(id == hd_id){
				map.removeOverlay(allOverlay[i]);
			}
		}
		//自己的地图标记不需要循环
		var mySquare = new SquareOverlay(dw_point,hd_head,hd_id);
		map.addOverlay(mySquare);
    }else {
    	//定位失败后就随机在默认中心点附近定位，直到下一次定位成功
		randomGPS();
    	//定位失败弹窗
    	layer.open({
			content:'定位失败,(原因可能是未获取定位权限或浏览器不支持定位,可以重新刷新浏览器再次获取定位)',
			btn:['重新刷新','算了'],
			shadeClose:false,
			yes:function (index){
				layer.close(index);
				location.reload();
			}
		});
    }       
}

//页面聊天框适应
function websocketText(){
	//获取聊天框里的内容
	var text = $(".websocket_li_to_text_wz").text();
	//获取聊天框高度
	var height = $(".websocket_li_to_text_wz").height();
	//聊天框一行只能放15个字
	if(text.length > 15 || height > 51){
		$(".websocket_li_to_text_wz").css("text-align","left");
		$(".websocket_li_to_text_wz").css("line-height","1.6");
	}else{
		$(".websocket_li_to_text_wz").css("text-align","center");
		$(".websocket_li_to_text_wz").css("line-height","0.53rem");
	}
}

//聊天记录始终保持在最新的一条（滚动条处于底部）
function scrollWebscoket(){
	$(".websocket_jl_div").scrollTop($(".websocket_jl_div").height());
}

//加载系统自带的头像
function loadDefaultHead(){
	$(".head_select_bigDiv").empty();
	for(var i=1;i<=18;i++){
		var row = '<div class="head_select_li" style="background-image: url(/img/head/'+i+'.png)" img-name="'+i+'.png"></div>';
		$(".head_select_bigDiv").append(row);
	}
}

//图像上传
function selectImg(file) {
	if (!file.files || !file.files[0]){
		return;
	}
	var reader = new FileReader();
	reader.onload = function (evt) {
		var replaceSrc = evt.target.result;
		//更换cropper的图片
		$('#tailoringImg').cropper('replace', replaceSrc,false);//默认false，适应高度，不失真
	}
	reader.readAsDataURL(file.files[0]);
}

//关闭裁剪框
function closeTailor() {
	$(".tailoring-container").toggle();
}

//获取session中的用户信息
var hd_head;
var hd_id;
function getSession(){
	$.ajax({
		type:'POST',
		url:'getSession',
		async:true,
		success:function (user){
			//先判断如果user是空的则表示用户压根都还没登录
			if(user.user_id == null){
				layer.open({
					content:'抱歉，请先登录',
					btn:'我知道了',
					yes:function (){
						location.href="login.html";
					}
				});
			}else {
				//判断用户登录后是否需要弹出头像选择窗口
				if(user.user_head ==null || user.user_head ==''){
					$(".head_img_div").show();
				}else {
					$(".head_img_div").hide();
				}
				//判断用户登录后是否需要弹出性别选择框
				if(user.user_sex ==null){
					$(".sex_select_div").show();
				}else {
					$(".sex_select_div").hide();
				}
				//判断用户登录后是否需要弹出年龄选择框
				if(user.user_age ==null){
					$(".age_select_div").show();
				}else {
					$(".age_select_div").hide();
					loadMap();
					loadSelf();
					//websocket连接
					conectWebSocket(user.user_id);
					hd_head = user.user_head;
					hd_id = user.user_id;
				}
			}
		},
		error:function (){
			layer.open({
				content:'抱歉，请先登录',
				btn:'我知道了',
				yes:function (){
					location.href="login.html";
				}
			});
		}
	});

	//任务大厅筛选框的地区输入框值
	//通过用户的经纬度信息解析获取发布任务的地址
	var demand_city = "";
	var gc = new BMapGL.Geocoder();
	gc.getLocation(dw_point,function (rs) {
		demand_city += rs.addressComponents.province + rs.addressComponents.city;
		$("#demand_city").val(demand_city);
	});
}

//地图加载
function loadMap(){
	//地图加载中的弹窗
	let map_open = layer.open({
		type: 2
		,content: '地图加载中'
		,time:5//超时自动关闭
		,shadeClose: false
	});

	//初始化地图 默认加载淮安市政府，当定位失败后默认中心点位为淮安市政府
	var point = new BMapGL.Point(119.11970299167945,33.55640377634258);
	map.centerAndZoom(point,16);//初始化地图，point为中心点，缩放级别为15
	//地图具备缩放功能
	map.enableScrollWheelZoom(true);

	//地图加载完毕关闭加载弹窗
	map.addEventListener('tilesloaded', function () {
		layer.close(map_open);
	});

	//地图缩放控件
	var zoomCtrl = new BMapGL.ZoomControl();
	map.addControl(zoomCtrl);


	//自定义的回到自己的位置的控件
	var myZoomCtrl = new ZoomControl();
	//添加到地图中
	map.addControl(myZoomCtrl);

	if(navigator.geolocation){
		var geolocation = new BMapGL.Geolocation();//创建定位实例
		// 开启SDK辅助定位
		geolocation.enableSDKLocation();
		geolocation.getCurrentPosition(showLocation,{enableHighAccuracy: true});//enableHighAccuracy 要求浏览器获取最佳结果
	}else{
		map.addControl(new BMapGL.GeolocationControl());//添加定位控件 支持定位
	}
}

//保存定位位置
function saveUserGPS(longitude,dimension){
	$.ajax({
		type:'POST',
		url:'saveUserPosition',
		data:{longitude:longitude,dimension:dimension},
		dataType:'json',
		async:true,
		success:function (msg){
			if(msg == 0){
				layer.open({
					content:'定位保存失败',
					btn:'我知道了'
				});
			}
		}
		,error:function (){
			layer.open({
				content:'定位保存失败',
				btn:'我知道了'
			});
		}
	});
}

//定位失败后随机定位
function randomGPS(){
	//经度截取
	var str = "119.11970299167945";
	var arry = str.split(".");
	var longitude = arry[1];
	//维度截取
	var str2 = "33.55640377634258";
	var arry2 = str2.split(".");
	var dimension = arry2[1];
	//随机 0 - 10000000
	var rand = parseInt(Math.random() * 10000001);
	var rand2 = parseInt(Math.random() * 10000001);
	//随机 0 - 1，如果是0，则表示加、1则表示减
	var sign = parseInt(Math.random() * 2);
	if(sign == 0){
		//随机过后的经度
		longitude = "119." + Number(longitude) + Number(rand);
		//随机后的维度
		dimension = "33." + Number(dimension) + Number(rand2);
		saveUserGPS(longitude,dimension);
		console.log(longitude+','+dimension);
	}else if(sign == 1){
		//随机过后的经度
		longitude ="119." + Number(longitude) - Number(rand);
		//随机后的维度
		dimension ="33." + Number(dimension) - Number(rand2);
		saveUserGPS(longitude,dimension);
	}
}

//主动定位
function setTimeOutGPS(){
	if(navigator.geolocation){
		var geolocation = new BMapGL.Geolocation();//创建定位实例
		// 开启SDK辅助定位
		geolocation.enableSDKLocation();
		geolocation.getCurrentPosition(showLocation,{enableHighAccuracy: true});//enableHighAccuracy 要求浏览器获取最佳结果
	}else{
		map.addControl(new BMapGL.GeolocationControl());//添加定位控件 支持定位
	}
}

//加载附近的人
function onlineUser(){
	$.ajax({
		type:'POST',
		url:'listonlineUser',
		async:true,
		success:function (hashMap){
			$(".friends_list_ul").empty();
			if(hashMap.userList[0] == null){
				var div = '<div style="width: 100%;height: 0.4rem;text-align: center;line-height: 0.4rem;color: #c2c2c2;font-size: 0.12rem;">抱歉，未找到附近用户！</div>';
				$(".friends_list_ul").append(div);
			}else {
				$(hashMap.userList).each(function (i,u){
					//加载距离自己10公里以内的用户
					var range=map.getDistance(new BMapGL.Point(hashMap.me.user_location_lnt,hashMap.me.user_location_lat),new BMapGL.Point(u.user_location_lnt,u.user_location_lat)).toFixed(2);
					if(Number(range <= 100000)){
						<!--好友-->
						var div = '<div class="friends_list_li">';
						<!--用户Id-->
						div += '<input type="hidden" class="user_id" value="'+u.user_id+'" />';
						<!--头像-->
						if(u.head_select == 1){//系统头像
							div += '<div class="friends_list_li_img" style="background-image: url(/img/head/'+u.user_head+')"></div>';
						}else {//用户上传头像
							div += '<div class="friends_list_li_img"></div>';
						}
						<!--用户名，性别，年龄-->
						div += '<div class="friends_list_li_right">';
						<!--用户名-->
						div += '<div class="friends_list_li_user">'+u.user_name+'</div>';
						<!--性别和年龄-->
						div += '<div class="friends_list_li_age">';
						<!--性别-->
						if(u.user_sex == 1){
							div += '<div class="friends_sex" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_man.png);"></div>';
						}else {
							div += '<div class="friends_sex" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_woman.png);"></div>';
						}
						<!--年龄-->
						div += '<div class="friends_age">'+u.user_age+'</div>';
						div += '</div>';
						<!--消息-->
						div += '<div class="friends_message">'+u.user_qm+'</div>';
						div += '</div>';
						div += '</div>';

						$(".friends_list_ul").append(div);

						// 添加自定义覆盖物
						var mySquare = new SquareOverlay(new BMapGL.Point(u.user_location_lnt,u.user_location_lat), u.user_head,null);
						map.addOverlay(mySquare);
					}
				});
			}
		}
	});
}

//加载好友列表
function friendList(){
	$.ajax({
		type:'POST',
		url:'listFriend',
		async:true,
		success:function (userList){
			$(".friends_list_ul").empty();
			if(userList[0] == null){
				var div = '<div style="width: 100%;height: 0.4rem;text-align: center;line-height: 0.4rem;color: #c2c2c2;font-size: 0.12rem;">抱歉，你还没有好友！</div>';
				$(".friends_list_ul").append(div);
			}else {
				$(userList).each(function (i,u){
					<!--好友-->
					var div = '<div class="friends_list_li">';
					<!--用户Id-->
					div += '<input type="hidden" class="user_id" value="'+u.user_id+'" />';
					<!--头像-->
					if(u.head_select == 1){//系统头像
						div += '<div class="friends_list_li_img" style="background-image: url(/img/head/'+u.user_head+')">';
						if(u.user_state == 2){
							div += '<div style="width: 100%;height: 100%;background-color: rgba(0,0,0,0.4);border-radius: 0.04rem"></div>';
						}
						div += '</div>';
					}else {//用户上传头像
						div += '<div class="friends_list_li_img"></div>';
					}
					<!--用户名，性别，年龄-->
					div += '<div class="friends_list_li_right">';
					<!--用户名-->
					if(u.user_state == 2){
						div += '<div class="friends_list_li_user" style="color: #999999;">'+u.user_name+'</div>';
					}else{
						div += '<div class="friends_list_li_user">'+u.user_name+'</div>';
					}
					<!--性别和年龄-->
					div += '<div class="friends_list_li_age">';
					<!--性别-->
					if(u.user_sex == 1){
						div += '<div class="friends_sex" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_man.png);"></div>';
					}else {
						div += '<div class="friends_sex" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_woman.png);"></div>';
					}
					<!--年龄-->
					div += '<div class="friends_age">'+u.user_age+'</div>';
					div += '</div>';
					<!--消息-->
					div += '<div class="friends_message">'+u.user_qm+'</div>';
					div += '</div>';
					div += '</div>';

					$(".friends_list_ul").append(div);
				});
			}
		}
	});
}

//加载用户信息
function loadUserMessage(user_id){
	$.ajax({
		type:'POST',
		url:'queryUserMessage',
		data:{user_id:user_id},
		dataType:'json',
		success:function (userMessage){
			//用户Id
			$(".hide_user_id").val(userMessage.user.user_id);
			//发消息界面存放用户信息
			$("#toUser").val(userMessage.user.user_id);//Id
			$("#toUser").attr("head-img",userMessage.user.user_head);//头像
			$("#toUser").attr("head-select",userMessage.user.head_select);//选择
			//头像
			if(userMessage.user.head_select == 1){//系统默认头像
				$(".big_head_img").css("background-image","url(/img/head/"+userMessage.user.user_head+")");
			}else {//用户上传头像
				$(".big_head_img").css("background-image","url(/img/head.png)");
			}
			//用户名
			$(".user_message_right_name").text(userMessage.user.user_name);
			//性别
			if(userMessage.user.user_sex == 1){//男
				$(".user_message_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_man.png)");
			}else {
				$(".user_message_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_woman.png)");
			}
			//年龄
			$(".user_message_age").text(userMessage.user.user_age);
			//签名
			if(userMessage.user.user_qm == null || userMessage.user.user_qm == ''){
				$(".user_message_qm").text("这个人很懒，什么都没有留下");
			}else {
				$(".user_message_qm").text(userMessage.user.user_qm);
			}
			//需求信息
			// if(userMessage.demand == null){
			// 	$(".demand_div").css("opacity","0");
			// 	//接单按钮隐藏
			// 	$(".jd_btn").css("display","none");
			// 	//加好友按钮显示
			// 	$(".left_btn").css("display","inline-block");
			// 	if(userMessage.ifFriend == 0){//不是好友
			// 		$(".left_btn").text("加好友");
			// 	}else {
			// 		$(".left_btn").text("待派单");
			// 	}
			// }else {
			// 	$(".demand_div").css("opacity","1");
			// 	//需求
			// 	$(".demand_content").text("需求："+userMessage.demand.demand_content);
			// 	//佣金
			// 	$(".demand_money_text>span").text(toDecimal2(userMessage.demand.demand_money));
			// 	//发布时间
			// 	$(".demand_action_time>span").text(userMessage.demand.action_time);
			// 	//结束时间
			// 	$(".demand_over_time>span").text(userMessage.demand.over_time);
			// 	//接单按钮显示
			// 	$(".jd_btn").css("display","inline-block");
			// 	//加好友按钮隐藏
			// 	$(".left_btn").css("display","none");
			// }
		}
	});
}

//加载自己的信息
function loadSelf(){
	$.ajax({
		type:'POST',
		url:'querySelf',
		success:function (userMessage){
			//自己的信息(发消息用)
			$("#formUser").val(userMessage.user.user_id);
			$("#formUser").attr("head-img",userMessage.user.user_head);//头像
			$("#formUser").attr("head-select",userMessage.user.head_select);//选择
			//头像
			if(userMessage.user.head_select == 1){//系统默认头像
				$(".side_head_div").css("background-image","url(/img/head/"+userMessage.user.user_head+")");
				$(".friend_side_me_div_head").css("background-image","url(/img/head/"+userMessage.user.user_head+")");
			}else {//用户上传头像
				$(".side_head_div").css("background-image","url(/img/head.png)");
				$(".friend_side_me_div_head").css("background-image","url(/img/head/"+userMessage.user.user_head+")");
			}
			//用户名
			$(".side_user_name").text(userMessage.user.user_name);
			$(".friend_side_me_div_center_name").text(userMessage.user.user_name);
			//签名
			$(".side_qm_div>span").text(userMessage.user.user_qm);
			$(".friend_side_me_div_center_qm").text(userMessage.user.user_qm);
			//年龄
			$(".side_user_age").text(userMessage.user.user_age);
			$(".friend_side_me_div_center_age").text(userMessage.user.user_age);
			//性别
			if(userMessage.user.user_sex == 1){
				$(".side_user_sex_age").css("background-color","#55CAF9");
				$(".friend_side_me_div_center_sex_age").css("background-color","#55CAF9");
				$(".side_user_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_man.png)");
				$(".friend_side_me_div_center_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_man.png)");
			}else {
				$(".side_user_sex_age").css("background-color","#F3ADEE");
				$(".friend_side_me_div_center_sex_age").css("background-color","#F3ADEE");
				$(".side_user_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_woman.png)");
				$(".friend_side_me_div_center_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_woman.png)");
			}
		}
	});
}

//连接websocket
var websocket = null;
function conectWebSocket(userId){
	//判断当前浏览器是否支持WebSocket
	if ('WebSocket'in window) {
		websocket = new WebSocket("ws://192.168.0.107:8888/websocket/"+userId);//用户Id
	} else {
		alert('Not support websocket')
	}
	//连接发生错误的回调方法
	websocket.onerror = function() {
		console.log("websocket连接发生错误！");
	};
	//连接成功建立的回调方法
	websocket.onopen = function(event) {
		console.log("websocket连接已成功建立！");
	}
	//接收到消息的回调方法
	websocket.onmessage = function(event) {
		//setMessageInnerHTML(event.data);
		//把接收到的消息回显
		messageEcho(event.data);
	}
	//连接关闭的回调方法
	websocket.onclose = function() {
		console.log("websocket连接已关闭！");
	}
	//监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
	window.onbeforeunload = function() {
		websocket.close();
	}
}
//websocket发送消息
function send() {
	var message = $(".message_fs_div_input").html();//发送的消息
	var toUser = $("#toUser").val();//消息接收方
	var socketMsg = {msg:message,toUser:toUser};
	if(toUser == ''){
		//群聊.
		socketMsg.type = 0;
	}else{
		//单聊.
		socketMsg.type = 1;
	}
	websocket.send(JSON.stringify(socketMsg));
	//websocket.send(message);
}

//自己发送消息然后显示保存
function meSendMessage(message,head_img,user_id){
	//聊天(自己)
	var row = '<div class="websocket_li_to">';
	//头像
	row += '<div class="websocket_li_to_head" style="background-image: url(/img/head/'+head_img+')"></div>';
	//聊天
	row += '<div class="websocket_li_to_text">';
	//角
	row += '<div class="websocket_li_to_text_jiao"></div>';
	//文字
	row += '<div class="websocket_li_to_text_wz">'+message+'</div>';
	row += '</div>';
	row += '</div>';
	$(".websocket_jl_div").append(row);

	$.ajax({
		type:'POST',
		url:'saveMessage',
		data:{to_user:user_id,form_content:message},
		dataType:'json',
		async:true,
		success:function (msg){
			if(msg == 0){
				layer.open({content:'聊天记录保存失败',btn:'我知道了'});
			}
		},
		error:function (){
			layer.open({content:'聊天记录保存失败',btn:'我知道了'});
		}
	});
}
//接收到的消息回显
function messageEcho(message){
	var head_img = $("#toUser").attr("head-img");
	//聊天(对方)
	var row = '<div class="websocket_li_form">';
	//头像
	row += '<div class="websocket_li_form_head" style="background-image: url(/img/head/'+head_img+')"></div>';
	//聊天
	row += '<div class="websocket_li_form_text">';
	//角
	row += '<div class="websocket_li_form_text_jiao"></div>';
	//文字
	row += '<div class="websocket_li_form_text_wz">'+message+'</div>';
	row += '</div>';
	row += '</div>';
	$(".websocket_jl_div").append(row);
}

//好友申请列表加载
function loadApplyList(){
	$.ajax({
		type:'POST',
		url:'listFriendApply',
		async:true,
		success:function (applyLists){
			$(".div-ul>ul").empty();
			$(applyLists).each(function (i,a){
				var row = '<li>';
				row += '<input type="hidden" value="'+a.apply_id+'" class="hd_apply_id">';
				row += '<div class="user-img">';
				if(a.head_select == 1){//系统默认
					row += '<img src="/img/head/'+a.user_head+'" width="100%" height="100%" />';
				}else {//用户上传
					row += '<img src="/img/head.png" width="100%" height="100%" />';
				}
				row += '</div>';
				row += '<div class="user-info">';
				row += '<input type="hidden" value="'+a.user_id+'" class="hd_user_id">';
				row += '<span class="name">'+a.user_name+'</span>';
				if(a.user_sex == 1){
					row += '<div class="sex-div man">';
				}else {
					row += '<div class="sex-div woman">';
				}
				row += '<div></div><span>'+a.user_age+'</span>';
				row += '</div>';
				row += '<span>对方留言：<span>'+a.apply_content+'</span></span>';
				row += '</div>';
				if(a.apply_state ==1){
					row += '<span class="btn agree">同意</span>';
					row += '<span class="btn refuse">拒绝</span>';
				}else if(a.apply_state ==2){
					row += '<span class="btn agreed">已同意</span>';
				}else if(a.apply_state ==3){
					row += '<span class="btn rejected">已拒绝</span>';
				}
				row += '</li>';

				$(".div-ul>ul").append(row);
			});
		}
	});
}

//地图缩放事件
map.addEventListener(  "zoomend"  , function(evt){
	var zoom = map.getZoom();
	var len = $(".marker_bj").length;

});

//点击需求发布后加载用户的信息
function loadUserForTask(){
	$.ajax({
		type:'POST',
		url:'queryUserForTaskOpen',
		async:true,
		success:function (u){
			if(u.head_select == 1){//系统头像
				$(".top_demand_open_user_div_head").css("background-image","url(/img/head/"+u.user_head+")");
			}else {//用户自选
				$(".top_demand_open_user_div_head").css("background-image","url(/img/head.png)");
			}
			$(".top_demand_open_user_div_message_name").text(u.user_name);//用户名
			if(u.user_sex == 1){//男生
				$(".top_demand_open_user_div_message_sexAge").css("background-color","#53CAFA");
				$(".top_demand_open_user_div_message_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_man.png)");
			}else {//女生
				$(".top_demand_open_user_div_message_sexAge").css("background-color","#F3ADEE");
				$(".top_demand_open_user_div_message_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_woman.png)");
			}
			$(".top_demand_open_user_div_message_age").text(u.user_age);//年龄
			$(".top_demand_open_user_div_qm>span").text(u.user_qm);//签名
			$(".right_span").text(u.user_yb);//元宝
		}
	});
}

//元宝充值界面查询出用户的信息
function loadUserMessageForRecharge(tel){
	$.ajax({
		type:'POST',
		url:'userMessageForRecharge',
		data:{tel:tel},
		dataType:'json',
		async:true,
		success:function (u){
			if(u == null){
				layer.open({
					content: '对不起，未找到对应号码的用户！'
					,btn: '我知道了'
					,yes:function (index){
						loadUserMessageForRecharge();
						layer.close(index);
					}
				});
			}else {
				if(u.head_select == 1){//系统头像
					$(".ingotRecharge_div_user_message_head").css("background-image","url(/img/head/"+u.user_head+")");
				}else {//用户自选
					$(".ingotRecharge_div_user_message_head").css("background-image","url(/img/head.png)");
				}
				$(".ingotRecharge_div_user_message_center_name").text(u.user_name);//用户名
				if(u.user_sex == 1){//男生
					$(".ingotRecharge_div_user_message_center_sexAge").css("background-color","#53CAFA");
					$(".ingotRecharge_div_user_message_center_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_man.png)");
				}else {//女生
					$(".ingotRecharge_div_user_message_center_sexAge").css("background-color","#F3ADEE");
					$(".ingotRecharge_div_user_message_center_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_woman.png)");
				}
				$(".ingotRecharge_div_user_message_center_age").text(u.user_age);//年龄
				$(".ingotRecharge_div_user_message_center_yb_sum").text(u.user_yb);//元宝
				$(".user_friend_tel_div_bottom_div_input>input").val(u.user_tel);//电话
			}
		},error:function (){
			layer.open({
				content:'没有找到对应的用户，抱歉',
				shadeClose:false,
				btn:'我知道了'
			});
		}
	});
}

//计算任务记录界面里的任务列表ul的高度
function loadHeightToTaskDemandUl(){
	var zong_height = $(".taskRecord_div").height();//界面的高度
	var ul_height = zong_height - $(".taskRecord_div_topTitle").height() - 18 - $(".taskRecord_div_btns").height() - 20;
	$(".taskRecord_div_ul").css("height",ul_height/100 + "rem");

	//计算任务详情包裹div的高度
	var detail_height = $(".taskRecord_detail_div").height();//界面的高度
	var bg_div = detail_height - $(".taskRecord_detail_div_topTitle").height() - 18;
	$(".taskRecord_detail_div_bg").css("height",bg_div/100 + "rem");

	//计算我接取的任务记录的详细界面的高度
	var interceptHeight = $(".interceptDemand_detail_div").height() - $(".taskRecord_div_topTitle").height();
	$(".interceptDemand_detail_zong").css("height", interceptHeight /100 + "rem");
}

//加载出用户自己发布的任务
function loadOnSelfDemand(){
	$.ajax({
		type:'POST',
		url:'listOneselfDemand',
		async:true,
		success:function (demandList){
			$(".taskRecord_div_ul").empty();
			if(demandList[0] == null){
				var row = "<div style='width: 100%;height: 0.45rem;text-align: center;line-height: 0.45rem;font-size: 0.18rem;color: #c2c2c2;'>抱歉，您还未发布过需求任务</div>";
				$(".taskRecord_div_ul").append(row);
			}else {
				$(demandList).each(function (i,d){
					var row = '<div class="taskRecord_div_li">';
					//隐藏的任务Id
					row += '<input type="hidden" class="taskRecord_div_li_id" value="'+d.demand_id+'" />';
					//隐藏的任务状态
					row += '<input type="hidden" class="taskRecord_div_li_state" value="'+d.demand_state+'" />';
					row += '<div class="taskRecord_div_li_img"></div>';
					row += '<div class="taskRecord_div_li_message">';
					row += '<div class="taskRecord_div_li_message_top">发布时间：<span>'+d.action_time+'</span></div>';
					row += '<div class="taskRecord_div_li_message_center">任务介绍：'+d.demand_content+'</div>';
					row += '<div class="taskRecord_div_li_money">';
					row += '<div class="taskRecord_div_li_money_left">花费元宝：</div>';
					row += '<div class="taskRecord_div_li_money_center">'+d.demand_money+'</div>';
					row += '<div class="taskRecord_div_li_money_right"></div>';
					row += '</div>';
					row += '</div>';
					row += '<div class="taskRecord_div_li_state">';
					if(d.demand_state == 1){
						row += '<div class="taskRecord_div_li_state_img" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/rw_djd.png)"></div>';
					}else if(d.demand_state == 2){
						row += '<div class="taskRecord_div_li_state_img" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/rw_yjd.png)"></div>';
					}else if(d.demand_state == 3 || d.demand_state == 4){
						row += '<div class="taskRecord_div_li_state_img" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/rw_ywc.png)"></div>';
					}else if(d.demand_state == 5){
						row += '<div class="taskRecord_div_li_state_img" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/rw_yqx.png)"></div>';
					}else if(d.demand_state == 7){
						row += '<div class="taskRecord_div_li_state_img" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/rw_ygq.png)"></div>';
					}
					row += '</div>';
					row += '</div>';

					$(".taskRecord_div_ul").append(row);
				});
			}
		},
		error:function (){
			var row = "<div style='width: 100%;height: 0.45rem;text-align: center;line-height: 0.45rem;font-size: 0.18rem;color: #c2c2c2;'>抱歉，系统发生故障</div>";
			$(".taskRecord_div_ul").append(row);
		}
	});
}

//加载出用户自己接取的任务
function loadInterceptDemand(){
	$.ajax({
		type:'POST',
		url:'listInterceptDemand',
		async:true,
		success:function (map){
			$(".taskRecord_div_ul").empty();
			if(map.demandList[0] == null){
				var row = "<div style='width: 100%;height: 0.45rem;text-align: center;line-height: 0.45rem;font-size: 0.18rem;color: #c2c2c2;'>抱歉，您还未接过任何一单需求</div>";
				$(".taskRecord_div_ul").append(row);
			}else {
				$(map.demandList).each(function (i,d){
					var row = '<div class="taskRecord_div_li2" data-id="'+d.demand_id+'">';
					//图标
					row += '<div class="taskRecord_div_li2_img"></div>';
					//左边任务的部分信息
					row += '<div class="taskRecord_div_li2_left_taskMessage">';
					//接单时间
					row += '<div class="taskRecord_div_li2_left_taskMessage_time">接单时间:<span>'+d.jq_time+'</span>，最晚完成时间:';
					if(d.jq_over_time == null){
						row += '<span>暂无</span></div>';
					}else {
						row += '<span>'+d.jq_over_time+'</span></div>';
					}
					//任务类型
					if(d.demand_type == 1){
						row += '<div class="taskRecord_div_li2_left_taskMessage_type">任务类型:<span>单人任务</span>，接单人数：<span>1/1</span></div>';
					}else {
						row += '<div class="taskRecord_div_li2_left_taskMessage_type">任务类型:<span>多人任务</span>，接单人数：<span>'+d.jd_sum+'/'+d.demand_num+'</span></div>';
					}
					//任务赏金
					row += '<div class="taskRecord_div_li2_left_taskMessage_sj">';
					//前部分文字
					row += '<div class="taskRecord_div_li2_left_taskMessage_sj_leftText">可赚取赏金：</div>';
					//赏金
					row += '<div class="taskRecord_div_li2_left_taskMessage_sj_centerMoney">'+d.jq_money+'</div>';
					//元宝图标
					row += '<div class="taskRecord_div_li2_left_taskMessage_sj_rightImg"></div>';
					row += '</div>';
					row += '</div>';
					//右边任务状态图标
					row += '<div class="taskRecord_div_li2_right_taskState">';
					if(d.demand_state == 1){
						row += '<div class="taskRecord_div_li2_right_taskState_img" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/jq_ddz.png)"></div>';
					}else if(d.demand_state == 2){
						row += '<div class="taskRecord_div_li2_right_taskState_img" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/jq_jxz.png)"></div>';
					}else if(d.demand_state == 3){
						row += '<div class="taskRecord_div_li2_right_taskState_img" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/jq_ywc.png)"></div>';
					}else if(d.demand_state == 4){
						row += '<div class="taskRecord_div_li2_right_taskState_img" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/jq_ycs.png)"></div>';
					}else if(d.demand_state == 7){
						row += '<div class="taskRecord_div_li2_right_taskState_img" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/jq_ygq.png)"></div>';
					}else {
						row += '<div class="taskRecord_div_li2_right_taskState_img" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/jq_yqx.png)"></div>';
					}
					row += '</div>';
					//任务介绍
					row += '<div class="taskRecord_div_li2_bottom_centent">任务介绍：<span>'+d.demand_content+'</span></div>';
					row += '</div>';

					$(".taskRecord_div_ul").append(row);
				});
			}
		}
	});
}

//加载任务记录里的任务详情(自己发布的)
function loadDemandDetailForDemandRecording(demand_id){
	$.ajax({
		type:'POST',
		url:'queryDetailForDemandRecording',
		data:{demand_id:demand_id},
		dataType:'json',
		async:true,
		success:function (map){
			$("#hd_taskRecord_detail_id").val(map.demand.demand_id);
			//任务类型
			if(map.demand.demand_type == 1){
				$(".taskRecord_detail_div_content_demandType>span").text("单人任务");
			}else {
				$(".taskRecord_detail_div_content_demandType>span").text("多人任务");
			}
			//任务人数
			$(".taskRecord_detail_div_content_demandSum>span").text(map.demand.demand_num);
			//任务发布时间
			$(".taskRecord_detail_div_content_demandTime>span").text(map.demand.action_time);
			//任务完成天数
			$(".taskRecord_detail_div_content_demandDay>span").text(map.demand.demand_day);
			//任务花费的元宝
			$(".taskRecord_detail_div_content_demandMoney>span").text(map.demand.demand_money);
			//已接单人数
			$(".taskRecord_detail_div_content_demandJD_Sum>span").text(map.demand.jd_sum+"/"+map.demand.demand_num);
			//任务介绍
			$(".taskRecord_detail_div_content_demandContent>span").text(map.demand.demand_content);
			//任务状态
			if(map.demand.demand_state == 1){
				$(".taskRecord_detail_div_content_demandJD_State>span").text("等待用户接单中");
			}else if(map.demand.demand_state == 2){
				$(".taskRecord_detail_div_content_demandJD_State>span").text("订单已被接取，等待用户完成中");
			}else if(map.demand.demand_state == 3){
				$(".taskRecord_detail_div_content_demandJD_State>span").text("订单已完成");
			}else if(map.demand.demand_state == 4){
				$(".taskRecord_detail_div_content_demandJD_State>span").text("订单已超时");
			}else if(map.demand.demand_state == 5){
				$(".taskRecord_detail_div_content_demandJD_State>span").text("订单已取消");
			}else if(map.demand.demand_state == 7){
				$(".taskRecord_detail_div_content_demandJD_State>span").text("订单无人接取，已超时自动取消");
			}
			//取消任务按钮
			if(map.demand.demand_state != 1){
				$("#taskRecord_detail_div_content_btn_return").css("background-color","#c2c2c2");
			}
			//发布地点
			$(".taskRecord_detail_div_content_demandJD_city>span").text(map.demand.demand_city);
			//接单人员信息
			$(".taskRecord_detail_div_ul").empty();
			if(map.orderClerkMessageList[0] !=null){
				$(map.orderClerkMessageList).each(function (i,o){
					var row = '<div class="taskRecord_detail_div_li">';
					//头像
					if(o.head_select == 1){//系统头像
						row += '<div class="taskRecord_detail_div_li_head" style="background-image: url(/img/head/'+o.user_head+')"></div>';
					}else {//用户自选
						row += '<div class="taskRecord_detail_div_li_head"></div>';
					}
					//接单员信息
					row += '<div class="taskRecord_detail_div_li_message">';
					//用户名
					row += '<div class="taskRecord_detail_div_li_message_name">'+o.user_name+'</div>';
					//性别、年龄
					if(o.user_sex == 1){//男
						row += '<div class="taskRecord_detail_div_li_message_sexAge" style="background-color: #00b8f5;">';
						row += '<div class="taskRecord_detail_div_li_message_sex" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_man.png)"></div>';
					}else {
						row += '<div class="taskRecord_detail_div_li_message_sexAge" style="background-color: #F3ACEC;">';
						row += '<div class="taskRecord_detail_div_li_message_sex" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_woman.png)"></div>';
					}
					row += '<div class="taskRecord_detail_div_li_message_age">'+o.user_age+'</div>';
					row += '</div>';
					//信用
					if(o.user_xy>=90 && o.user_xy <=100){
						row += '<div class="taskRecord_detail_div_li_xy" style="background-color: #00a5ec;">信用优秀</div>';
					}else if(o.user_xy>=80 && o.user_xy <90){
						row += '<div class="taskRecord_detail_div_li_xy" style="background-color: #00e0c0">信用良好</div>';
					}else if(o.user_xy>=60 && o.user_xy <80){
						row += '<div class="taskRecord_detail_div_li_xy" style="background-color: #95e003">信用中等</div>';
					}else if(o.user_xy>=40 && o.user_xy <60){
						row += '<div class="taskRecord_detail_div_li_xy" style="background-color: #ee6800">信用偏差</div>';
					}else if(o.user_xy>=0 && o.user_xy <40){
						row += '<div class="taskRecord_detail_div_li_xy" style="background-color: #ff0000">信用极差</div>';
					}
					//接单信息
					row += '<div class="taskRecord_detail_div_li_jd_message">总接单次数:<span>'+o.zong_jd_sum+'</span>次,已完成：<span>'+o.ywc_jd_sum+'</span>次,超时:<span>'+o.cs_jq_sum+'</span>次,进行中:<span>'+o.jxz_jd_sum+'</span>次,取消:<span>'+o.qx_jd_sum+'</span>次</div>';
					row += '</div>';
					row += '</div>';

					$(".taskRecord_detail_div_ul").append(row);
				});
			}
		},
		error:function (){
			layer.open({content:'系统错误',btn:'我知道了',shadeClose:false});
		}
	});
}

//加载任务记录里的任务详情（自己接取的）
function loadDemandDetailMe(demand_id){
	$.ajax({
		type:'POST',
		url:'queryDemandDetailMe',
		data:{demand_id:demand_id},
		dataType:'json',
		async:true,
		success:function (map){
			//任务ID,任务状态
			$(".interceptDemand_detail_div").attr("data-id",map.missionHall.demand_id);
			$(".interceptDemand_detail_div").attr("data-state",map.missionHall.demand_state);
			//发布任务的用户的头像
			$(".taskRecordDemand_userHead_div").css("background-image","url(/img/head/"+map.missionHall.user_head+")");
			//发布任务的用户的用户名
			$(".taskRecordDemand_userMessage_userName").text(map.missionHall.user_name);
			//用户性别
			if(map.missionHall.user_sex == 1){//男
				$(".taskRecordDemand_userMessage_sexAge").css("background-color","#53CAFA");
				$(".taskRecordDemand_userMessage_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_man.png)");
			}else {//女
				$(".taskRecordDemand_userMessage_sexAge").css("background-color","#F3ACEC");
				$(".taskRecordDemand_userMessage_sex").css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_woman.png)");
			}
			$(".taskRecordDemand_userMessage_age").text(map.missionHall.user_age);
			//信用
			if(map.missionHall.user_xy>=90 && map.missionHall.user_xy <=100){
				$(".taskRecordDemand_userMessage_xy").css("background-color","#00a5ec").text("信用优秀");
			}else if(map.missionHall.user_xy>=80 && map.missionHall.user_xy <90){
				$(".taskRecordDemand_userMessage_xy").css("background-color","#00e0c0").text("信用良好");
			}else if(map.missionHall.user_xy>=60 && map.missionHall.user_xy <80){
				$(".taskRecordDemand_userMessage_xy").css("background-color","#95e003").text("信用中等");
			}else if(map.missionHall.user_xy>=40 && map.missionHall.user_xy <60){
				$(".taskRecordDemand_userMessage_xy").css("background-color","#ee6800").text("信用偏差");
			}else if(map.missionHall.user_xy>=0 && map.missionHall.user_xy <40){
				$(".taskRecordDemand_userMessage_xy").css("background-color","#ff0000").text("信用极差");
			}
			//任务标题
			$(".taskRecordDemand_demand_typeTitle_div_title").text(map.missionHall.demand_title);
			if(map.missionHall.demand_type == 1){
				$(".taskRecordDemand_demand_typeTitle_div_type").text("单人任务");
			}else {
				$(".taskRecordDemand_demand_typeTitle_div_type").text("多人任务");
			}
			//任务介绍
			$(".interceptDemand_demand_present_div").text(map.missionHall.demand_content);
			//任务结束时间
			if(map.jqDemand == null){
				$(".interceptDemand_demand_overTime_div>span").text("任务还未开始");
			}else {
				$(".interceptDemand_demand_overTime_div>span").text(map.jqDemand.jq_over_time);
			}
			//剩余时间
			$(".interceptDemand_demand_shenyuTime_div>span").text(map.sy_time);
			//接单员信息
			$(".orders_user_message_ul").empty();
			$(map.missionHallList).each(function (i,m){
				var row = '<div class="orders_user_message_li"';
				if(map.user.user_id = m.user_id){
					row += 'style="border: 0.01rem solid #FF3300;padding:0.04rem 0.04rem;" >';
				}else {
					row += '>';
				}
				row += '<div class="jd_userHead_div" style="background-image: url(/img/head/'+m.user_head+')"></div>';
				row += '<div class="jd_userMessage_div">';
				if(map.user.user_id = m.user_id){
					row += '<div class="jd_userMessage_userName">我自己</div>';
				}else {
					row += '<div class="jd_userMessage_userName">'+m.user_name+'</div>';
				}
				if(m.user_sex == 1){
					row += '<div class="jd_userMessage_sexAge" style="background-color: #53CAFA">';
					row += '<div class="jd_userMessage_sex" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_man.png)"></div>';
				}else {
					row += '<div class="jd_userMessage_sexAge" style="background-color: #F3ACEC">';
					row += '<div class="jd_userMessage_sex" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_woman.png)"></div>';
				}
				row += '<div class="jd_userMessage_age">'+m.user_age+'</div>';
				row += '</div>';
				//信用
				if(m.user_xy>=90 && m.user_xy <=100){
					row += '<div class="jd_userMessage_xy" style="background-color: #00a5ec;">信用优秀</div>';
				}else if(m.user_xy>=80 && m.user_xy <90){
					row += '<div class="jd_userMessage_xy" style="background-color: #00e0c0">信用良好</div>';
				}else if(m.user_xy>=60 && m.user_xy <80){
					row += '<div class="jd_userMessage_xy" style="background-color: #95e003">信用中等</div>';
				}else if(m.user_xy>=40 && m.user_xy <60){
					row += '<div class="jd_userMessage_xy" style="background-color: #ee6800">信用偏差</div>';
				}else if(m.user_xy>=0 && m.user_xy <40){
					row += '<div class="jd_userMessage_xy" style="background-color: #ff0000">信用极差</div>';
				}
				row += '</div>';
				row += '</div>';

				$(".orders_user_message_ul").append(row);
			});

			//最底下的按钮组
			$(".jd_userMessage_btns").empty();
			if(map.missionHall.demand_state == 2){
				if(map.state == 1){
					var row = '<button data-state="1" class="demand_submit">提交任务</button>';
					$(".jd_userMessage_btns").append(row);
				}else {
					var row = '<button data-state="2" style="background-color: #FF6666;" class="demand_submit">超时提交任务</button>';
					$(".jd_userMessage_btns").append(row);
				}
			}
		},
		error:function (){
			layer.open({content:'系统错误',btn:'我知道了',shadeClose:false});
		}
	});
}

//任务大厅加载任务
function loadCanTakeOrdersDemand(){
	var p = $("#filter_form").serializeArray();
	var type = $("#hd_filtet_type").val();
	//单人任务
	$.ajax({
		type:'POST',
		url:'listMissionHall',
		data:p,
		dataType:'json',
		async:true,
		success:function (map){
			$(".taskAccess_div_ul").empty();
			if(map.missionHallList[0] == null){
				if(type == 1){
					var row = '<div style="width: 100%;height: 0.35rem;text-align: center;line-height: 0.35rem;font-size: 0.2rem;color: #999999;">抱歉，暂时没有可接单的单人任务！</div>';
					$(".taskAccess_div_ul").append(row);
				}else {
					var row = '<div style="width: 100%;height: 0.35rem;text-align: center;line-height: 0.35rem;font-size: 0.2rem;color: #999999;">抱歉，暂时没有可接单的多人任务！</div>';
					$(".taskAccess_div_ul").append(row);
				}
			}else {
				$(map.missionHallList).each(function (i,m){
					var row = '<div class="taskAccess_div_li">';
					<!--发布任务的用户的头像-->
					if(m.head_select == 1){//系统头像
						row += '<div class="taskAccess_div_li_head_img" style="background-image: url(/img/head/'+m.user_head+')"></div>';
					}else {//用户自选
						row += '<div class="taskAccess_div_li_head_img" style="background-image: url(/img/head.png"></div>';
					}
					<!--发布任务的用户信息-->
					row += '<div class="taskAccess_div_li_userMessage">';
					<!--用户名-->
					row += '<div class="taskAccess_div_li_name">'+m.user_name+'</div>';
					<!--性别、年龄-->
					if(m.user_sex == 1){
						row += '<div class="taskAccess_div_li_sexAge" style="background-color: #53CAFA">';
						<!--性别-->
						row += '<div class="taskAccess_div_li_sex" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_man.png)"></div>';
						<!--年龄-->
						row += '<div class="taskAccess_div_li_Age">'+m.user_age+'</div>';
						row += '</div>';
					}else {
						row += '<div class="taskAccess_div_li_sexAge" style="background-color: #F3ACEC">';
						<!--性别-->
						row += '<div class="taskAccess_div_li_sex" style="background-image: url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/sex_woman.png)"></div>';
						<!--年龄-->
						row += '<div class="taskAccess_div_li_Age">'+m.user_age+'</div>';
						row += '</div>';
					}
					<!--信用-->
					if(m.user_xy>=90 && m.user_xy <=100){
						row += '<div class="taskAccess_div_li_credit" style="background-color: #00a5ec;">信用优秀</div>';
					}else if(m.user_xy>=80 && m.user_xy <90){
						row += '<div class="taskAccess_div_li_credit" style="background-color: #00e0c0">信用良好</div>';
					}else if(m.user_xy>=60 && m.user_xy <80){
						row += '<div class="taskAccess_div_li_credit" style="background-color: #95e003">信用中等</div>';
					}else if(m.user_xy>=40 && m.user_xy <60){
						row += '<div class="taskAccess_div_li_credit" style="background-color: #ee6800">信用偏差</div>';
					}else if(m.user_xy>=0 && m.user_xy <40){
						row += '<div class="taskAccess_div_li_credit" style="background-color: #ff0000">信用极差</div>';
					}
					row += '</div>';
					<!--隐藏的任务Id和隐藏的任务标题-->
					row += '<input type="hidden" value="'+m.demand_id+'" class="hd_taskDemand_id" data-tel="'+m.user_tel+'" data-title="'+m.demand_title+'" />';
					<!--接单按钮-->
					row += '<div class="taskAccess_div_li_jd_btn">接 单</div>';
					<!--任务发布时间-->
					row += '<div class="taskAccess_div_li_demand_actionTime">发布时间：<span>'+m.action_time+'</span></div>';
					<!--完成时间-->
					if(type == 1){
						row += '<div class="taskAccess_div_li_demand_wc_day">完成时间：<span class="missionHall_day">'+m.demand_day+'</span>天</div>';
						<!--任务赏金-->
						row += '<div class="taskAccess_div_li_demand_money">任务赏金：<span class="jq_bounty">'+m.demand_money+'</span>元宝&nbsp;<span style="color: #515151;">地点：'+m.demand_city+'</span></div>';
					}else{
						row += '<div class="taskAccess_div_li_demand_wc_day">完成时间：<span class="missionHall_day">'+m.demand_day+'</span>天&nbsp;<span style="color: #e08600;">已接单人数：<span><span class="yjd_sum">'+m.orderReceivedSum+'</span>/<span class="zong_jd_sum">'+m.demand_num+'</span></span></span></div>';
						<!--任务赏金-->
						row += '<div class="taskAccess_div_li_demand_money">任务赏金：<span class="jq_bounty">'+m.demand_money+'</span>元宝/人&nbsp;<span style="color: #515151;">地点：'+m.demand_city+'</span></div>';
					}
					<!--任务介绍-->
					row += '<div class="taskAccess_div_li_demand_message">任务介绍：<span></span>'+m.demand_content+'</div>';
					row += '</div>';

					$(".taskAccess_div_ul").append(row);
				});
			}
		}
	});
}

$(document).ready(function(){
	//读取session
	getSession();
	//页面初始化
	loadDefaultHead();

	onlineUser();
	
	websocketText();
	scrollWebscoket();

	//每隔五分钟主动刷新一次页面
	setInterval(setTimeOutGPS,300000);

	loadHeightToTaskDemandUl();

	//点击好友列表弹出好友界面
	$(".btn-primary").on("tap",function (e){
		e.preventDefault();
		$(".friend_side_div").hide();
		$(".side_div").hide();
		if($(this).hasClass("fujin_btn")){
			if($(this).attr("data-state") == "0"){
				$(".me_btn").attr("data-state","0");
				$(".me_btn").animate({bottom:'0.27rem'},200);
				$(this).attr("data-state","1");
				$(this).animate({bottom:'0.37rem'},200);
				$(".friend_side_div").velocity('transition.' + 'swoopIn');
			}else {
				$(this).attr("data-state","0");
				$(this).animate({bottom:'0.27rem'},200);
				$(".friend_side_div").hide();
			}
		}else if($(this).hasClass("me_btn")){
			if($(this).attr("data-state") == "0"){
				$(".fujin_btn").attr("data-state","0");
				$(".fujin_btn").animate({bottom:'0.27rem'},200);
				$(this).attr("data-state","1");
				$(this).animate({bottom:'0.37rem'},200);
				$(".side_div").velocity('transition.' + 'swoopIn');
			}else {
				$(this).attr("data-state","0");
				$(this).animate({bottom:'0.27rem'},200);
				$(".side_div").hide();
			}
		}
	});

	//点击用户打开用户信息界面
	$(document).on("tap",".friends_list_li",function (){
		//获取用户Id
		var user_id = $(this).find(".user_id").val();
		loadUserMessage(user_id);
		$(".friend_side_div").hide();
		$(".user_open_div").animate({bottom:"0"},260);
	});
	
	//用户信息界面向下滑动收回界面
	touch.on(".user_open_div","swipedown",function(){
		//用户信息界面收回
		$(".user_open_div").animate({bottom:"-56%"},260,function (){
			$(".friend_side_div").velocity('transition.' + 'swoopIn');
		});
	});
	
	//点击发消息按钮关闭用户信息界面，打开消息界面
	$(".right_btn").on("tap",function(){
		//用户信息界面收回
		$(".user_open_div").animate({bottom:"-56%"},260,function(){
			//聊天界面打开
			$(".user_websocket_div").animate({bottom:"0"},260);
		});
	});
	
	//用户消息界面向下滑动收回界面
	touch.on(".user_websocket_div","swipedown",function(){
		//用户消息界面收回
		$(".user_websocket_div").animate({bottom:"-76%"},260,function(){
			//用户信息界面弹出
			$(".user_open_div").animate({bottom:"0"},260);
		});
	});
	
	//用户在聊天界面翻动聊天记录时销毁下滑回收界面
	touch.on(".websocket_jl_div","swiping",function(){
		//阻止父事件冒泡
		event.stopImmediatePropagation();
	});
	//用户在聊天界面翻动聊天记录时销毁下滑回收界面
	touch.on(".websocket_jl_div","swipedown",function(){
		//阻止父事件冒泡
		event.stopImmediatePropagation();
	});
	
	
	//移动端键盘监听事件
	var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
	$(window).on('resize', function (e) {
	    var nowClientHeight = document.documentElement.clientHeight || document.body.clientHeight;
	    if (clientHeight > nowClientHeight) {
	        //键盘弹出的事件处理
			$(".top_message_div").css("bottom","0.3rem");
	    }
	    else {
	        //键盘收起的事件处理
	        $(".top_message_div").css("bottom","0");
	    } 
	});

	//点击默认头像选择系统自带的头像
	var head_img = '';
	$(".head_select_li").on("tap",function (){
		$(".head_select_li").css("border-color","#c2c2c2");
		$(this).css("border-color","#00aff3");
		head_img = $(this).attr("img-name");
	});

	//点击确定按钮确定上传选中的系统自带头像
	$(".head_select_btn").on("tap",function (){
		if(head_img == ''){
			layer.open({
				content: '抱歉，您还未选择头像！',
				btn:'我知道了'
			});
		}else {
			$.ajax({
				type:'POST',
				url: 'selectHeadImg',
				data: {head_name:head_img},
				dataType: 'json',
				async:true,
				success:function (msg){
					if(msg == 1){
						//头像窗口关闭
						$(".head_img_div").hide();
						//性别选择窗口弹出
						$(".sex_select_div").show();
					}
				}
			});
		}
	});

	//性别选择切换
	var sex_check = 0;
	$(".sex_li").on("tap",function (){
		$(".sex_li>.sex_checked").hide();
		$(this).find(".sex_checked").show();
		sex_check = $(this).attr("sex-val");
	});

	//点击性别弹窗的确定按钮
	$(".sex_select_btn").on("tap",function (){
		if(sex_check == 0){
			layer.open({
				content:'抱歉，您暂时还没有选择性别！',
				btn:'我知道了'
			});
		}else {
			$.ajax({
				type:'POST',
				url: 'selectSex',
				data: {sex:sex_check},
				dataType: 'json',
				async:true,
				success:function (msg){
					if(msg == 1){
						//性别窗口关闭
						$(".sex_select_div").hide();
						//年龄选择窗口弹出
						$(".age_select_div").show();
					}
				}
			});
		}
	});

	//性别窗口点击右按钮增加年龄
	var age = 0;
	$(".age_select_right").on("tap",function (){
		if(age == 99){
			layer.open({
				content:'抱歉，年龄不能再往上调了！',
				btn:'我知道了'
			});
		}else {
			age++;
		}
		$(".age_select_center").text(age);
	});
	//性别窗口向左滑动增加年龄
	touch.on(".age_select_div","swipeleft",function(){
		if(age == 99){
			layer.open({
				content:'抱歉，年龄不能再往上调了！',
				btn:'我知道了'
			});
		}else {
			age++;
		}
		$(".age_select_center").text(age);
	});
	//性别窗口点击左按钮减少年龄
	$(".age_select_left").on("tap",function (){
		if(age == 0){
			layer.open({
				content:'抱歉，年龄不能再往下调了！',
				btn:'我知道了'
			});
		}else {
			age--;
		}
		$(".age_select_center").text(age);
	});
	//性别窗口向右滑动增加年龄
	touch.on(".age_select_div","swiperight",function(){
		if(age == 0){
			layer.open({
				content:'抱歉，年龄不能再往下调了！',
				btn:'我知道了'
			});
		}else {
			age--;
		}
		$(".age_select_center").text(age);
	});
	//点击年龄设置的确定按钮
	$(".age_select_btn").on("tap",function (){
		var age_val = $(".age_select_center").text();
		$.ajax({
			type:'POST',
			url: 'settingAge',
			data: {age:age_val},
			dataType: 'json',
			async:true,
			success:function (msg){
				if(msg == 1){
					//年龄选择窗口关闭
					$(".age_select_div").hide();
					loadMap();
				}
			}
		});
	});

	//点击退出按钮退出系统
	touch.on(".return_sys_btn","tap",function (){
		layer.open({
			content: '您确定要退出吗？'
			,btn: ['退出', '不要']
			,yes: function(index){
				layer.close(index);
				//销毁存储的电话号码和密码
				localStorage.removeItem("tel");
				localStorage.removeItem("pwd");
				$.ajax({
					type:'POST',
					url:'signOut',
					async:true,
					success:function (msg){
						if(msg == 1){
							location.href="login.html";
						}else {
							layer.open({
								content:'退出登录失败！',
								btn:'我知道了'
							});
						}
					}
				});
			}
		});
	});

	//点击加好友按钮
	var apply_content = '';
	touch.on(".left_btn","tap",function (){
		var text = $(this).text();
		if(text == '加好友'){
			layer.open({
				content:'好友申请留言：<bt/><input type="text" class="apply_content_input" style="width: 80%;height: 0.35rem;outline: none;border: 0.01rem solid #c2c2c2;" />',
				shadeClose:false,
				btn:['确定','取消'],
				yes:function (index){
					layer.close(index);
					var user_id = $(".hide_user_id").val();
					$.ajax({
						type:'POST',
						url:'friendApply',
						data:{user_id:user_id,apply_content:apply_content},
						dataType:'json',
						success:function (msg){
							if(msg == 1){
								layer.open({content:'好友申请已发送',btn:'我知道了'});
							}else if(msg == 2){
								layer.open({content:'好友申请已发送过，不需要重新申请',btn:'我知道了'});
							}else if(msg == 3){
								layer.open({content:'对方已向你提交好友申请',btn:'我知道了',yes:function (index){layer.close(index);loadApplyList();$("#all").animate({bottom:"0"},260)}});
							}
							else {
								layer.open({content:'好友申请发送失败',btn:'我知道了'});
							}
						},
						error:function (){
							layer.open({content:'系统错误',btn:'我知道了'});
						}
					});
				}
			});
		}
	});

	//由于layer获取不到输入框的值，只能通过输入事件把值存到变量中
	$(document).on("input propertychange",".apply_content_input",function (){
		apply_content = $(this).val();
	});

	//点击消息发送按钮
	$(".message_fs_btn").on("tap",function (){
		var message = $(".message_fs_div_input").html();//消息
		var head =  $("#formUser").attr("head-img");
		var toUser = $("#toUser").val();
		if(message != ''){
			send();
			meSendMessage(message,head,toUser);
			//清空发送
			$(".message_fs_div_input").html("");
		}
	});

	//点击好友申请
	$("#friend_apply").on("tap",function (){
		loadApplyList();
		//好友申请列表出现
		$("#all").animate({bottom:"0"},260);
	});

	//点击好友申请列表的同意按钮
	$(document).on("tap",".agree",function (){
		var apply_id = $(this).parents("li").find(".hd_apply_id").val();
		var user_id = $(this).parents("li").find(".hd_user_id").val();
		$.ajax({
			type:'POST',
			url:'agreeOrrefuseFriendApply',
			data:{apply_id:apply_id,state:2,friend_user:user_id},
			dataType:'json',
			async:true,
			success:function (msg){
				if(msg == 1){
					layer.open({content:'你们已经是好友了，快去聊天吧！',btn:'我知道了',yes:function (index){loadApplyList();layer.close(index);}});
				}else {
					layer.open({content:'发生未知错误',btn:'我知道了',yes:function (){loadApplyList();}});
				}
			},error:function (){
				layer.open({content:'发生未知错误',btn:'我知道了',yes:function (){loadApplyList();}});
			}
		});
	});

	//点击好友申请列表的拒绝按钮
	$(document).on("tap",".refuse",function (){
		var apply_id = $(this).parents("li").find(".hd_apply_id").val();
		var user_id = $(this).parents("li").find(".hd_user_id").val();
		$.ajax({
			type:'POST',
			url:'agreeOrrefuseFriendApply',
			data:{apply_id:apply_id,state:3,friend_user:user_id},
			dataType:'json',
			async:true,
			success:function (msg){
				if(msg == 1){
					layer.open({content:'你已拒绝该用户的好友申请！',btn:'我知道了',yes:function (index){loadApplyList();layer.close(index);}});
				}else {
					layer.open({content:'发生未知错误',btn:'我知道了',yes:function (){loadApplyList();}});
				}
			},error:function (){
				layer.open({content:'发生未知错误',btn:'我知道了',yes:function (){loadApplyList();}});
			}
		});
	});

	//好友申请列表界面点击返回图标关闭页面
	$(".close_friend").on("tap",function (){
		$(".div-ul>ul").empty();
		$("#all").animate({bottom:"-200%"},260);
	});

	//点击附近的人显示附近人列表
	$(".nearby_div").on("tap",function (){
		onlineUser();
	});

	//点击好友显示好友列表
	$(".friends_div").on("tap",function (){
		friendList();
	});

	//点击区域外关闭
	$(document).on('tap', function(e) {
		var user_open_bottom = $("#user_open_div").css("bottom");
		var user_websocket_bottom = $(".user_websocket_div").css("bottom");
		//用户信息层
		if(user_open_bottom == "0px"){
			var e = e || window.event; //浏览器兼容性
			var elem = e.target || e.srcElement;
			//点击用户信息区域外的地方关闭用户信息界面
			while (elem) { //循环判断至跟节点，防止点击的是div子元素
				if (elem.id && elem.id == 'user_open_div') {
					return;
				}
				elem = elem.parentNode;
			}
			//用户信息界面消失
			$(".user_open_div").animate({bottom:"-56%"},260,function (){
				$(".friend_side_div").velocity('transition.' + 'swoopIn');
			});
		}
		//用户消息层
		if(user_websocket_bottom == "0px"){
			var e = e || window.event; //浏览器兼容性
			var elem = e.target || e.srcElement;
			//点击用户信息区域外的地方关闭用户信息界面
			while (elem) { //循环判断至跟节点，防止点击的是div子元素
				if (elem.id && elem.id == 'user_websocket_div') {
					return;
				}
				elem = elem.parentNode;
			}
			//用户发消息界面消失
			$(".user_websocket_div").animate({bottom:"-76%"},260,function (){
				//用户信息界面弹起
				$(".user_open_div").animate({bottom:"0"},260);
			});
		}
	});

	//点击选择单人任务还是双人任务
	$(".demand_open_div_task_check_option").on("tap",function (){
		$(".demand_open_div_task_check_option").css("background-color","#fff").css("color","#000");
		$(this).css("background-color","#00b6f3").css("color","#fff");
		var index = $(this).index();
		if(index == 0){//单人任务
			$("#hd_demand_type").val(1);//任务类型
			$("#hd_demand_sum").val(1);//任务人数
			//这里判断是不是天数和金额都已输入
			if($("#hd_demand_day").val() !='' && $("#demand_money").val() !=''){
				var sj = $("#demand_money").val();//赏金
				var demand_sum = $("#hd_demand_sum").val();//人数
				var demand_day = $("#hd_demand_day").val();//天数
				//明细
				//抽成后的赏金平分
				var pf_sj = sj / demand_sum;
				var row = parseInt(pf_sj) + "元宝/人,任务人数:" +demand_sum+ ",任务时间：" +demand_day+"天";
				$(".demand_open_div_mx>span").text(row);
			}
		}else if(index == 1){//多人任务
			$("#hd_demand_type").val(2);
			//弹出人数选择层
			$(".multiplayer_order_select_big_div").animate({bottom:'0'},260);
		}
	});

	//点击多人任务人数选择层的取消按钮
	$(".multiplayer_order_select_div_return_btn").on("tap",function (){
		//人数选择层消失
		$(".multiplayer_order_select_big_div").animate({bottom:'-200%'},260,function (){
			$("#hd_demand_type").val("");//任务类型变为空
			$(".demand_open_div_task_check_option:last-child").css("background-color","#fff").css("color","#000");
		});
	});

	//点击选择人数
	var sum;
	$(".multiplayer_order_select_option").on("tap",function (){
		sum = $(this).attr("data-sum");//获取选择的人数
		$(".multiplayer_order_select_option").css("background-color","#fff").css("color","#000");
		$(this).css("background-color","#00aaee").css("color","#fff");
	});

	//点击多人任务人数选择层确定按钮
	$(".multiplayer_order_select_div_ok_btn").on("tap",function (){
		$("#hd_demand_sum").val(sum);//任务人数
		//人数选择层消失
		$(".multiplayer_order_select_big_div").animate({bottom:'-200%'},260);
		//判断天数和赏金是否为空
		if($("#hd_demand_day").val() !='' && $("#demand_money").val() !=''){
			var sj = $("#demand_money").val();//赏金
			var demand_sum = $("#hd_demand_sum").val();//人数
			var demand_day = $("#hd_demand_day").val();//天数
			//明细
			//抽成后的赏金平分
			var pf_sj = sj / demand_sum;
			var row = parseInt(pf_sj) + "元宝/人,任务人数:" +demand_sum+ ",任务时间：" +demand_day+"天";
			$(".demand_open_div_mx>span").text(row);
		}
	});

	//点击选择需求完成时间
	$(".demand_open_div_time").on("tap",function (){
		$(".demand_day_select").empty();
		for(var i=1;i<=30;i++){
			var row = '<div class="demand_day_select_option" data-day="'+i+'">'+i+'天</div>';
			$(".demand_day_select").append(row);
		}
		$(".demand_day_select_div").animate({bottom:'0'},260);
	});

	//点击天数选择
	var day;
	$(document).on("tap",".demand_day_select_option",function (){
		day = $(this).attr("data-day");
		$(".demand_day_select_option").css("background-color","#fff").css("color","#000");
		$(this).css("background-color","#00aaee").css("color","#fff");
	});

	//点击天数选择的取消按钮
	$(".demand_day_select_return_btn").on("tap",function (){
		//天数选择层消失
		$(".demand_day_select_div").animate({bottom:'-200%'},260);
	});

	//点击天数选择的确定按钮
	$(".demand_day_select_ok_btn").on("tap",function (){
		$("#hd_demand_day").val(day);
		$("#wc_day").text(day);
		//人数选择层消失
		$(".demand_day_select_div").animate({bottom:'-200%'},260);
		//判断人数和赏金是否为空
		if($("#hd_demand_sum").val() !='' && $("#demand_money").val() !=''){
			var sj = $("#demand_money").val();//赏金
			var demand_sum = $("#hd_demand_sum").val();//人数
			var demand_day = $("#hd_demand_day").val();//天数
			//明细
			//抽成后的赏金平分
			var pf_sj = sj / demand_sum;
			var row = parseInt(pf_sj) + "元宝/人,任务人数:" +demand_sum+ ",任务时间：" +demand_day+"天";
			$(".demand_open_div_mx>span").text(row);
		}
	});

	//点击任务发布按钮弹出需求发布弹窗
	$("#ru_fb").on("tap",function (){
		loadUserForTask();
		//先收起左侧边菜单栏
		$(".side_div").hide();
		$(".side_div").attr("data-state","0");
		$(".demand_open_div").animate({bottom:'0'},260);
	});

	//需求发布页面向下滑动收起
	$(".demand_open_div").on("swipedown",function (){
		//先将需求发布层收起
		$(".demand_open_div").animate({bottom:'-200%'},260,function (){
			//再将左侧菜单栏拉出
			$(".side_div").attr("data-state","1");
			$(".side_div").velocity('transition.' + 'swoopIn');
		});
	});

	//赏金金额输入事件
	$('#demand_money').bind('input propertychange', function() {
		var zong_money = $(".right_span").text();//用户剩余赏金
		var sj = $(this).val();
		if(Number(zong_money) == 1){//用户元宝只有1个的时候
			layer.open({
				content:'抱歉，您的剩余元宝不足，请充值！',
				shadeClose:false,
				btn:['确定','取消'],
				yes:function (index){
					layer.close(index);
					//拉起元宝充值界面
					loadUserMessageForRecharge();
					$(".ingotRecharge_div").animate({bottom:'0'},260);
				},
				no:function (index){
					layer.close(index);
					$("#demand_money").val("");
				}
			});
		}else if(sj % 1 !=0){//先判断用户输入的赏金是不是整数
			$("#demand_money").val("");
		}else if(Number(sj) <= 0){
			$("#demand_money").val("");
		}else if(Number(sj) > Number(zong_money)){//如果发布任务所需的赏金大于用户剩余赏金，则需要弹出充值提示
			layer.open({
				content:'抱歉，您的剩余元宝不足，请充值！',
				shadeClose:false,
				btn:['确定','取消'],
				yes:function (index){
					layer.close(index);
					//拉起元宝充值界面
					loadUserMessageForRecharge();
					$(".ingotRecharge_div").animate({bottom:'0'},260);
				},
				no:function (index){
					layer.close(index);
					$("#demand_money").val("");
				}
			});
		}else {
			//算出赏金明细
			var demand_sum = $("#hd_demand_sum").val();//人数
			var demand_day = $("#hd_demand_day").val();//天数
			//如果人数是空的则表示用户还没有选择任务类型,不是空则直接给出明细
			if(demand_sum != '' && demand_day !=''){
				//抽成后的赏金平分
				var pf_sj = sj / demand_sum;
				var row = parseInt(pf_sj) + "元宝/人,任务人数:" +demand_sum+ ",任务时间：" +demand_day+"天";

				$(".demand_open_div_mx>span").text(row);
			}
		}

	});

	//点击需求发布界面的确定按钮发布任务
	$("#demand_open_div_btn_ok").on("tap",function (){
		var demand_title = $("#demand_title").val();//任务标题
		var demand_type = $("#hd_demand_type").val();//任务类型
		var demand_sum = $("#hd_demand_sum").val();//任务人数
		var demand_day = $("#hd_demand_day").val();//任务天数
		var demand_content = $(".demand_open_div_textarea>textarea").val();//任务详细
		//通过用户的经纬度信息解析获取发布任务的地址
		var demand_city = "";
		var gc = new BMapGL.Geocoder();
		gc.getLocation(dw_point,function (rs){
			demand_city +=rs.addressComponents.province+rs.addressComponents.city+rs.addressComponents.district;
			$("#hd_demand_city").val(demand_city);

			//判断表单是不是填写完整
			if(demand_type == '' || demand_sum == '' || demand_day == '' || demand_content == '' || demand_title == ''){
				layer.open({content:'任务单未填写完整',shadeClose:false,btn:'我知道了'});
			}else {
				//提示用户发布任务首先会扣除一元宝的发布费用
				layer.open({
					content:'任务需求发布需要花费1元宝的发布费用，您确定要继续发布此任务吗？',
					btn:['确定','取消'],
					shadeClose:false,
					yes:function (index){
						layer.close(index);
						//提交表单
						var p = $("#postTask_Form").serializeArray();
						$.ajax({
							type:'POST',
							url:'demandRelease',
							data:p,
							dataType:'json',
							async:true,
							success:function (msg){
								if(msg == 1){
									layer.open({content:'需求已发布，等待其他用户接单',btn:'我知道了',yes:function (index){
											layer.close(index);
											//重置表单
											$("#postTask_Form")[0].reset();
											//隐藏域清空
											$("#hd_demand_type").val("");
											$("#hd_demand_sum").val("");
											$("#hd_demand_day").val("");
											//任务选择按钮恢复默认
											$(".demand_open_div_task_check_option").css("background-color","#fff").css("color","#000");
											//任务完成事件恢复默认
											$("#wc_day").text("?");
											//赏金明细清空
											$(".demand_open_div_mx>span").text("");
											//任务需求发布弹窗关闭，左侧边菜单栏弹出
											$(".demand_open_div").animate({bottom:'-200%'},260,function (){
												//再将左侧菜单栏拉出
												$(".side_div").attr("data-state","1");
												$(".side_div").velocity('transition.' + 'swoopIn');
											});
										}
									});
								}else if(msg == 2){
									layer.open({content:'您的任务发布已达上限，请等待已发布的任务完成后再来发布新的吧',btn:'我知道了',shadeClose:false});
								}else {
									layer.open({content:'需求发布失败',btn:'我知道了'});
								}
							},error:function (){
								layer.open({content:'系统错误',btn:'我知道了'});
							}
						});
					}
				});
			}
		});
	});

	//点击需求发布界面的取消按钮取消发布任务
	$("#demand_open_div_btn_return").on("tap",function (){
		//重置表单
		$("#postTask_Form")[0].reset();
		//隐藏域清空
		$("#hd_demand_type").val("");
		$("#hd_demand_sum").val("");
		$("#hd_demand_day").val("");
		//任务选择按钮恢复默认
		$(".demand_open_div_task_check_option").css("background-color","#fff").css("color","#000");
		//任务完成事件恢复默认
		$("#wc_day").text("?");
		//赏金明细清空
		$(".demand_open_div_mx>span").text("");
		//任务需求发布弹窗关闭，左侧边菜单栏弹出
		$(".demand_open_div").animate({bottom:'-200%'},260,function (){
			//再将左侧菜单栏拉出
			$(".side_div").attr("data-state","1");
			$(".side_div").velocity('transition.' + 'swoopIn');
		});
	});

	//点击左侧边菜单里的任务记录弹出任务记录界面
	$("#taskRecord").on("tap",function (){
		loadOnSelfDemand();
		//先关闭左侧边菜单栏
		$(".side_div").hide();
		$(".side_div").attr("data-state","0");
		$(".taskRecord_div").animate({bottom:"0"},260);
	});

	//点击任务记录里的我发布的和我接取的按钮
	$(".taskRecord_div_btn").on("tap",function (){
		//特效
		$(".taskRecord_div_btn").css("border-bottom-width","0").css("color","#c2c2c2");
		$(this).css("border-bottom","0.04rem solid #40AFFE").css("color","#000");
		var index = $(this).index();
		if(index == 0){
			loadOnSelfDemand();
		}else {
			loadInterceptDemand();
		}
	});

	//点击任务记录里的返回按钮关闭任务记录界面
	$(".taskRecord_div_topTitle_img").on("tap",function (){
		//先关闭任务记录界面
		$(".taskRecord_div").animate({bottom:"-200%"},260,function (){
			$(".taskRecord_div_btn").css("border-bottom-width","0").css("color","#c2c2c2");
			$(".taskRecord_div_btn").eq(0).css("border-bottom","0.04rem solid #40AFFE").css("color","#000");
			$(".side_div").attr("data-state","1");
			$(".side_div").velocity('transition.' + 'swoopIn');
		});
	});

	//点击任务列表里的任务弹出任务详情界面
	$(document).on("tap",".taskRecord_div_li",function (){
		var demand_id = $(this).find(".taskRecord_div_li_id").val();
		loadDemandDetailForDemandRecording(demand_id);
		$(".taskRecord_detail_div").animate({bottom:'0'},260);
	});

	//点击任务列表里的任务详细界面的确定按钮关闭详细界面
	$("#taskRecord_detail_div_content_btn_ok").on("tap",function (){
		$(".taskRecord_detail_div").animate({bottom:'-200%'},260);
	});

	//点击任务记录中的我接取的任务的任务列表弹出任务详情
	$(document).on("tap",".taskRecord_div_li2",function (){
		var id = $(this).attr("data-id");
		loadDemandDetailMe(id);
		$(".interceptDemand_detail_div").animate({bottom:'0'},260);
	});

	//点击筛选按钮弹出任务大厅的筛选框
	var filter_pull = true;
	$(".missionHall_filter_div_pull_div").on("tap",function (){
		if(filter_pull){
			filter_pull = false;
			$(".missionHall_filter_div").animate({right:'0'},260);
		}else if(filter_pull == false){
			filter_pull = true;
			$(".missionHall_filter_div").animate({right:'-1.4rem'},260);
		}
	});

	//点击左侧边栏接取任务弹出任务大厅
	$("#jq_demand").on("tap",function (){
		loadCanTakeOrdersDemand();
		//先收回左侧边菜单栏再打开任务大厅界面
		$(".side_div").hide();
		$(".side_div").attr("data-state","0");
		$(".taskAccess_div").animate({bottom:'0'},260);
	});

	//任务大厅返回按钮点击
	$(".taskAccess_div_Title_img").on("tap",function (){
		//先将任务大厅收回，再打开左侧边菜单栏
		$(".taskAccess_div").animate({bottom:'-200%'},260,function (){
			$(".side_div").attr("data-state","1");
			$(".side_div").velocity('transition.' + 'swoopIn');
		});
	});

	//点击换一批按钮
	$(".hyp_btn").on("tap",function (){
		loadCanTakeOrdersDemand();
	});

	//点击筛选界面里的确定按钮
	$("#filter_btn_ok").on("tap",function (){
		loadCanTakeOrdersDemand();
	});

	//点击筛选界面里的重置按钮
	$("#filter_btn_reset").on("tap",function (){
		$(".filter_form_day_input_div input").val("");
		var demand_city = "";
		var gc = new BMapGL.Geocoder();
		gc.getLocation(dw_point,function (rs) {
			demand_city += rs.addressComponents.province + rs.addressComponents.city;
			$("#demand_city").val(demand_city);
		});
		loadCanTakeOrdersDemand();
	});

	//点击接单按钮
	$(document).on("tap",".taskAccess_div_li_jd_btn",function (){
		var that = this;
		layer.open({
			content:'是否接取该需求？恶意接单会扣除个人信誉！',
			btn:['确定','取消'],
			yes:function (open_index){
				layer.close(open_index);
				var demand_id = $(that).prev().val();//任务Id
				var demand_title = $(that).prev().attr("data-title");//任务标题
				var user_tel = $(that).prev().attr("data-tel");//任务标题
				var sj_money = $(that).siblings(".taskAccess_div_li_demand_money").find(".jq_bounty").text();//赏金
				var demand_type = $("#hd_filtet_type").val();//任务类型
				var missionHall_day = $(that).parents(".taskAccess_div_li").find(".missionHall_day").text();//任务完成天数
				var yjd_sum = $(that).parents(".taskAccess_div_li").find(".yjd_sum").text();//已接单人数
				var sum = 1;//默认单人任务
				if(demand_type == 2){//如果是多人任务
					sum = $(that).parents(".taskAccess_div_li").find(".zong_jd_sum").text();
				}
				var jqDemand = {
					jq_demand:demand_id,
					demend_title:demand_title,
					user_tel:user_tel,
					demand_type:demand_type,
					jq_money:sj_money,
					demand_sum:sum,
					demand_day:missionHall_day,
					jd_sum:yjd_sum
				}
				$.ajax({
					type:'POST',
					url:'takeOverDemand',
					data:jqDemand,
					dataType:'json',
					async:true,
					success:function (msg){
						if(msg == 1){
							layer.open({content:"你已成功接取了一个单人任务单，请在规定时间内完成",btn:'我知道了',shadeClose:false,yes:function (index){
									layer.close(index);
									loadCanTakeOrdersDemand();
								}});
						}else if(msg == 2){
							layer.open({content:'你已超过接单上限，请先完成已接下的任务，恶意接单或超时完成会影响您的信誉分哦！',btn:'我知道了',shadeClose:false,yes:function (index){
									layer.close(index);
									loadCanTakeOrdersDemand();
								}});
						}else if(msg == 3){
							layer.open({content:'你已成功接取了一个多人任务，请耐心等待其他用户接取该任务',btn:'我知道了',shadeClose:false,yes:function (index){
									layer.close(index);
									loadCanTakeOrdersDemand();
								}});
						}else if(msg == 4){
							layer.open({content:'你已成功接取了一个多人任务，请在规定时间内完成',btn:'我知道了',shadeClose:false,yes:function (index){
									layer.close(index);
									loadCanTakeOrdersDemand();
								}});
						}else {
							layer.open({content:'任务接取失败,系统错误',btn:'我知道了',shadeClose:false,yes:function (index){
									layer.close(index);
									loadCanTakeOrdersDemand();
								}});
						}
					},error:function (){
						layer.open({content:'系统错误',btn:'我知道了',shadeClose:false,yes:function (index){
								layer.close(index);
								loadCanTakeOrdersDemand();
							}});
					}
				});
			}
		});
	});

	//点击任务大厅单人任务和多人任务按钮切换任务
	$(".taskAccess_div_btn").on("tap",function (){
		//点击特效
		$(".taskAccess_div_btn").css("border-bottom-width","0");
		$(this).css("border-bottom","0.04rem solid #40AFFE");
		var index = $(this).index();
		$("#hd_filtet_type").val(Number(index) + 1);
		loadCanTakeOrdersDemand();
	});

	//点击任务详情按钮退出任务详情页面
	$(".taskRecord_detail_div_topTitle_img").on("tap",function (){
		$(".taskRecord_detail_div").animate({bottom:'-200%'},260);
		$(".interceptDemand_detail_div").animate({bottom:'-200%'},260);
	});

	//点击任务详情界面的取消任务按钮
	$("#taskRecord_detail_div_content_btn_return").on("tap",function (){
		var demand_id = $("#hd_taskRecord_detail_id").val();
		if($(this).css("background-color") == "rgb(255, 84, 0)"){
			layer.open({
				content:'你确定要取消这个订单吗？',
				btn:['确定','取消'],
				yes:function(index){
					layer.close(index);
					$.ajax({
						type:'POST',
						url:'drivingCancelDemand',
						data:{demand_id:demand_id},
						dataType:'json',
						async:true,
						success:function (msg){
							if(msg == 1){
								layer.open({content:'已成功取消任务订单',btn:'我知道了',yes:function(index){
										layer.close(index);
										loadDemandDetailForDemandRecording(demand_id);
										loadOnSelfDemand();
									}});
							}else {
								layer.open({content:'取消任务订单失败',btn:'我知道了',yes:function(index){
										layer.close(index);
										loadDemandDetailForDemandRecording(demand_id);
										loadOnSelfDemand();
									}});
							}
						},error:function (){
							layer.open({content:'系统错误',btn:'我知道了',yes:function(index){
									layer.close(index);
									loadDemandDetailForDemandRecording(demand_id);
									loadOnSelfDemand();
								}});
						}
					});
				}
			});
		}
	});

	//点击我接取的任务的任务详情中的任务提交按钮
	$(document).on("tap",".demand_submit",function (){
		if($(this).attr("data-state") == 1){//未超时

		}else if($(this).attr("data-state") == 2){//超时
			layer.open({
				content:'该任务您已超时'+$(".interceptDemand_demand_shenyuTime_div>span").text()+",任务提交后会扣除相应的罚金和信誉分，望知晓！"
				,btn:'提交任务'
				,shadeClose:false
			});
		}
	});

	//点击左侧边元宝充值按钮弹出元宝充值界面
	$("#yb_cz").on("tap",function (){
		loadUserMessageForRecharge();
		//左侧边菜单栏消失
		$(".side_div").hide();
		$(".side_div").attr("data-state","0");
		//元宝充值界面弹出
		$(".ingotRecharge_div").animate({bottom:'0'},260);
	});

	//点击元宝充值界面里的返回图标
	$(".ingotRecharge_div_topTitle_img").on("tap",function (){
		//这里需要判断任务发布界面是否已经弹出，如果弹出了则表示充值界面是在需求发布里打开的，返回的还是需求发布界面，如果没打开则弹出菜单栏
		if($("#demand_open_div").css("bottom") == "0px"){
			//元宝充值界面消失
			$(".ingotRecharge_div").animate({bottom:'-200%'});
		}else {
			//元宝充值界面消失
			$(".ingotRecharge_div").animate({bottom:'-200%'},260,function (){
				//左侧边菜单栏弹出
				$(".side_div").attr("data-state","1");
				$(".side_div").velocity('transition.' + 'swoopIn');
			});
		}
	});

	//点击充值选择的方块选择充值金额
	$(".ingotRecharge_div_cz_div_li").on("tap",function (){
		$(".ingotRecharge_div_cz_div_li").css("border","0.01rem solid #999999").css("color","#999999");
		$(this).css("border","0.01rem solid #00a2ff").css("color","#00a2ff");
		$(".ingotRecharge_div_cz_btn").attr("pay-money",$(this).attr("data-money"));
	});

	//点击给其他用户充值按钮弹出输入框
	$(".ingotRecharge_div_user_friend").on("tap",function (){
		$(".user_friend_tel_div").animate({bottom:'0'},260);
	});

	//点击输入充值的确定按钮
	$(".user_friend_tel_div_bottom_div_btn").on("tap",function (){
		var tel = $(".user_friend_tel_div_bottom_div_input>input").val();
		if(tel == ''){
			layer.open({
				content:'你还没有输入充值账号',
				shadeClose:false,
				btn:'我知道了'
			});
		}else {
			loadUserMessageForRecharge(tel);
			//关闭输入充值账号弹窗
			$(".user_friend_tel_div").animate({bottom:'-200%'},260);
		}
	});

	//点击充值界面遮罩层让充值输入界面消失
	$(".user_friend_tel_div").on("tap",function (){
		$(this).animate({bottom:'-200%'},260);
	});

	//阻止点击充值输入的遮罩内的内容区域也让充值输入界面消失
	$(".user_friend_tel_div_bottom_div").on("tap",function (e){
		e.stopPropagation();
	});

	//点击左侧菜单栏里的元宝提现
	$("#yb_tx").on("tap",function (){
		//左侧边菜单栏消失
		$(".side_div").hide();
		$(".side_div").attr("data-state","0");
		$(".yb_withdraw_div").animate({bottom:'0'},260);
	});

	//点击元宝提现中的微信提现按钮
	$(".withdraw_type_div").on("tap",function (){
		$(".withdraw_type_div").css("background-image","");
		$(this).css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/qd_g_ico.png)");
	});

	//点击元宝提现中的提现金额
	$(".yb_withdraw_div_tx_div_li").on("tap",function (){
		$(".yb_withdraw_div_tx_div_li").css("background-image","");
		$(this).css("background-image","url(https://cdn.jsdelivr.net/gh/zhouxiang1999/Image/friend/tx_je_check.png)");
		if($(this).attr("data-money") == ''){//如果点击的时候值是空的，则表示是自定义提现金额
			$(this).text("");
			$(".yb_withdraw_div_tx_bottom_text>span").text(0);
		}else {
			$(".yb_withdraw_div_tx_div_li:last-child").text("自定义");
			//扣除手续费
			let tx_money = $(this).attr("data-money");
			tx_money = Math.round(Number(tx_money*100) + Number((tx_money*100*0.015)));//四舍五入
			$(".yb_withdraw_div_tx_bottom_text>span").text(tx_money);
		}
	});

	//自定义提现金额失去焦点
	$(".yb_withdraw_div_tx_div_li:last-child").on("blur",function (){
		let val = $(this).text();
		if(val != ''){
			if((/^(\+|-)?\d+$/.test( val ))&&val>0){
				//扣除手续费
				val = Math.round(Number(val*100) + Number((val*100*0.015)));//四舍五入
				$(".yb_withdraw_div_tx_bottom_text>span").text(val);
			}else {
				layer.open({
					content:'请输入一个正整数',
					btn:'我知道了',
					shadeClose:false,
					yes:function (index){
						layer.close(index);
						$(".yb_withdraw_div_tx_div_li:last-child").text("自定义");
						$(".yb_withdraw_div_tx_bottom_text>span").text("0");
					}
				});
			}
		}
	});

	//点击元宝提现界面返回按钮
	$(".yb_withdraw_div_topTitle_img").on("tap",function (){
		//元宝充值界面消失
		$(".yb_withdraw_div").animate({bottom:'-200%'},260,function (){
			//左侧边菜单栏弹出
			$(".side_div").attr("data-state","1");
			$(".side_div").velocity('transition.' + 'swoopIn');
		});
	});

	//点击确认充值按钮弹出微信充值和支付宝充值两个选项
	$(".ingotRecharge_div_cz_btn").on("tap",function (){
		var money = $(this).attr("pay-money");
		if(money == 0){
			layer.open({
				content: '您还没有选择充值金额！'
				,skin: 'msg'
				,time: 1.8 //2秒后自动关闭
			});
		}else {
			if($(".ingotRecharge_div_cz_btn").attr("data-state") == "0"){
				layer.open({
					content: '请选择您要选择的充值方式'
					,btn: ['微信充值', '支付宝充值']
					,skin: 'footer'
					,yes: function(index){//微信

					}
					,no:function (index){//支付宝
						layer.close(index);
						$(".ingotRecharge_div_cz_btn").attr("data-state","1");
						$.ajax({
							type:'POST',
							url:'aliPay',
							data:{amount:money},
							async:true,
							success:function (o){
								if(o != null || o != ''){
									$("#aliPayForm").empty();
									$("#aliPayForm").html(o);
									$("#aliPayForm>form").submit();
								}else {
									layer.open({
										content: '支付宝支付拉起失败！'
										,skin: 'msg'
										,time: 1.8 //2秒后自动关闭
									});
								}
							}
							,error:function (){
								layer.open({
									content: '系统错误！'
									,skin: 'msg'
									,time: 1.8 //2秒后自动关闭
								});
							}
						});
					}
				});
			}else {
				layer.open({
					content: '不要重复点击充值按钮！'
					,skin: 'msg'
					,time: 1.8 //2秒后自动关闭
				});
			}
		}
	});

	//弹出框水平垂直居中
	(window.onresize = function () {
		var win_height = $(window).height();
		var win_width = $(window).width();
		if (win_width <= 768){
			$(".tailoring-content").css({
				"top": (win_height - $(".tailoring-content").outerHeight())/2,
				"left": 0
			});
		}else{
			$(".tailoring-content").css({
				"top": (win_height - $(".tailoring-content").outerHeight())/2,
				"left": (win_width - $(".tailoring-content").outerWidth())/2
			});
		}
	})();

	//点击相机图标
	$(".take_div").on("tap",function (){
		//$(".tailoring-container").toggle();
		layer.open({
			content: '自由选择头像功能马上出现，请耐心等待'
			,btn: '我知道了'
		});
	});

	//cropper图片裁剪
	$('#tailoringImg').cropper({
		aspectRatio: 1/1,//默认比例
		preview: '.previewImg',//预览视图
		guides: false,  //裁剪框的虚线(九宫格)
		autoCropArea: 0.5,  //0-1之间的数值，定义自动剪裁区域的大小，默认0.8
		movable: false, //是否允许移动图片
		dragCrop: true,  //是否允许移除当前的剪裁框，并通过拖动来新建一个剪裁框区域
		movable: true,  //是否允许移动剪裁框
		resizable: true,  //是否允许改变裁剪框的大小
		zoomable: false,  //是否允许缩放图片大小
		mouseWheelZoom: false,  //是否允许通过鼠标滚轮来缩放图片
		touchDragZoom: true,  //是否允许通过触摸移动来缩放图片
		rotatable: true,  //是否允许旋转图片
		crop: function(e) {
			// 输出结果数据裁剪图像。
		}
	});
	//旋转
	$(".cropper-rotate-btn").on("tap",function () {
		$('#tailoringImg').cropper("rotate", 45);
	});
	//复位
	$(".cropper-reset-btn").on("tap",function () {
		$('#tailoringImg').cropper("reset");
	});
	//换向
	var flagX = true;
	$(".cropper-scaleX-btn").on("tap",function () {
		if(flagX){
			$('#tailoringImg').cropper("scaleX", -1);
			flagX = false;
		}else{
			$('#tailoringImg').cropper("scaleX", 1);
			flagX = true;
		}
		flagX != flagX;
	});

	//裁剪后的处理
	$("#sureCut").on("tap",function () {
		if ($("#tailoringImg").attr("src") == null ){
			return false;
		}else{
			var cas = $('#tailoringImg').cropper('getCroppedCanvas');//获取被裁剪后的canvas
			var base64url = cas.toDataURL('image/png'); //转换为base64地址形式
			//$("#finalImg").prop("src",base64url);//显示为图片的形式
			//将base64头像传到后台
			$.ajax({
				type:'POST',
				url:'selectHeadImg',
				data:{head_img:base64url},
				dataType:'json',
				async:true,
				success:function (){

				}
			});

			//关闭裁剪框
			closeTailor();
		}
	});
	
});