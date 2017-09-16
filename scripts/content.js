chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
		var gMessageList = [];
		
		var native_element = "<embed id=\"hello_tutorial\" width=0 height=0 src=\"http://localhost:5103/part1/hello_tutorial.nmf\" type=\"application/x-pnacl\" />";
		document.body.insertAdjacentHTML( 'beforeend', native_element );
		
		function CheckIfInList(cur_node)
		{
			var found = false;
			for(var i = 0; !found && i < gMessageList.length; i++)
			{
				if (cur_node.hash == gMessageList[i].hash)
				{
					found = true;
				}
			}
			return found;
		}
		
		function hashCode (str)
		{
			var hash = 0;
			if (str.length == 0) 
				return hash;
			for (i = 0; i < str.length; i++) 
			{
				char = str.charCodeAt(i);
				hash = ((hash<<5)-hash)+char;
				hash = hash & hash; // Convert to 32bit integer
			}
			return hash;
		}
		
		function GetMsgData()
		{
			try
			{
				var HelloTutorialModule = document.getElementById('hello_tutorial');
				HelloTutorialModule.postMessage('hello');
				 
				chatbox_obj = document.getElementById("chatbox");
				if (null != chatbox_obj)
				{
					var items = chatbox_obj.getElementsByTagName("LI");
					for (var i = 0; i < items.length; ++i) {
					    var cur_item = items[i];
						for (var j=0; j < cur_item.children.length; j++)
						{
							if (cur_item.children[j].className == "chat-body clearfix")
							{
								var header_obj = cur_item.children[j].children[0];
								var strong_obj = header_obj.children[0];
								var span_obj = strong_obj.children[0];
								
								var payload_obj = cur_item.children[j].children[1];
								var paragraph_obj = payload_obj.children[0];
								
								var cur_node = new Object();
								cur_node.author = span_obj.innerText;
								cur_node.msg = paragraph_obj.innerText;
								cur_node.hash = hashCode(span_obj.innerText + paragraph_obj.innerText);
								if (!CheckIfInList(cur_node))
								{
									gMessageList[gMessageList.length] = cur_node;
									console.log(cur_node.author + " " + cur_node.msg);
								}
							}
						}
					}
				}
				else
					console.log("chatbox is null");
			}
			catch (err)
			{ 
				console.log(err);
			}
		}
		 setInterval(GetMsgData, 10000);
    sendResponse({data: {}, success: true});
});
