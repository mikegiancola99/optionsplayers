// JavaScript source code
var gMessageList = [];

function CheckIfInList(cur_node) {
    var found = false;
    for (var i = 0; !found && i < gMessageList.length; i++) {
        if (cur_node.hash == gMessageList[i].hash) {
            found = true;
        }
    }
    return found;
}

function hashCode(str) {
    var hash = 0;
    if (str.length == 0)
        return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function GetMsgData() {
    try {
        chatbox_obj = WebView.getElementsByTagName("UL")[0];
        foo = WebView.firstChild();
        bar = WebView.id;
        //chatbox_obj = document.getElementById("chatbox");
        if (null != chatbox_obj) {
            var items = chatbox_obj.getElementsByTagName("LI");
            for (var i = 0; i < items.length; ++i) {
                var cur_item = items[i];
                for (var j = 0; j < cur_item.children.length; j++) {
                    if (cur_item.children[j].className == "chat-body clearfix") {
                        var header_obj = cur_item.children[j].children[0];
                        var strong_obj = header_obj.children[0];
                        var span_obj = strong_obj.children[0];

                        var payload_obj = cur_item.children[j].children[1];
                        var paragraph_obj = payload_obj.children[0];

                        var cur_node = new Object();
                        cur_node.author = span_obj.innerText;
                        cur_node.msg = paragraph_obj.innerText;
                        cur_node.hash = hashCode(span_obj.innerText + paragraph_obj.innerText);
                        if (!CheckIfInList(cur_node)) {
                            gMessageList[gMessageList.length] = cur_node;
                            console.log(cur_node.author + " " + cur_node.msg);
                            console.log("hello mikeg: " + this.localFolder.path);

                            let filepath = this.localFolder.createFileAsync("test2.txt")
                                 .then(msgFile => Windows.Storage.FileIO.appendTextAsync(msgFile, "bacon"))
                            .done(function () {

                                console.log("success!:");
                            }, function (error) { console.log("error:" + error) });
                        }
                    }
                }
            }
        }
        else
            console.log("chatbox is null");
    }
    catch (err) {
        console.log(err);
    }
}

function ChatMessageNotifyHandler(name)
{
    console.log(name.value);
}

function ErrorHandler(error)
{
    console.log(error);
}

function HandleStartSaveClick()
{
    var javascriptcode; 
    javascriptcode = "function GetMsgData()";
    javascriptcode += "{";
    javascriptcode +=     "chatbox_obj = document.getElementById(\"chatbox\");";
    javascriptcode +=     "if (null != chatbox_obj)";
    javascriptcode +=     "{";
    javascriptcode +=         "var items = chatbox_obj.getElementsByTagName(\"LI\");";
    javascriptcode +=         "for (var i = 0; i < items.length; ++i) {";
    javascriptcode +=             "var cur_item = items[i];";
    javascriptcode +=             "for (var j=0; j < cur_item.children.length; j++)";
    javascriptcode +=             "{";
    javascriptcode +=                 "if (cur_item.children[j].className == \"chat-body clearfix\")";
    javascriptcode +=                 "{";
    javascriptcode +=                     "var header_obj = cur_item.children[j].children[0];";
    javascriptcode +=                     "var strong_obj = header_obj.children[0];";
    javascriptcode +=                     "var span_obj = strong_obj.children[0];";
    javascriptcode +=                     " var payload_obj = cur_item.children[j].children[1];";
    javascriptcode +=                     " var paragraph_obj = payload_obj.children[0];";
    javascriptcode +=                     " var full_msg = span_obj.innerText + \": \" + paragraph_obj.innerText;";
    javascriptcode +=                     " window.external.notify(full_msg);";
    javascriptcode +=                 "}"; // if
    javascriptcode +=             "}"; // for
    javascriptcode +=         "}"; // for
    javascriptcode +=     "}"; // if
    javascriptcode += "}"; // function
    javascriptcode += "GetMsgData();"

    //var javascriptcode = "window.external.notify(\"mikeg\");";
    var injectedJavascript = WebView.invokeScriptAsync('eval', javascriptcode);
    injectedJavascript.error = ErrorHandler;
    injectedJavascript.start();
}


browser.on("init", function () {
    "use strict";

    this.webview.addEventListener("MSWebViewScriptNotify", ChatMessageNotifyHandler);
    // Show the refresh button
    this.showRefresh = () => {
        this.stopButton.classList.remove("stopButton");
        this.stopButton.classList.add("refreshButton");
        this.stopButton.title = "Refresh the page";
    };

    // Show the stop button
    this.showStop = () => {
        this.stopButton.classList.add("stopButton");
        this.stopButton.classList.remove("refreshButton");
        this.stopButton.title = "Stop loading";
    };

    // Listen for the stop/refresh button to stop navigation/refresh the page
    this.stopButton.addEventListener("click", () => {
        if (this.loading) {
            this.webview.stop();
            this.toggleProgressRing(false);
            this.showRefresh();
        }
        else {
            this.webview.refresh();
        }
    });

    // Update the navigation state
    this.updateNavState = () => {
        //this.backButton.disabled = !this.webview.canGoBack;
        this.forwardButton.disabled = !this.webview.canGoForward;
    };

    // Listen for the back button to navigate backwards
    this.backButton.addEventListener("click", () => HandleStartSaveClick());

    // Listen for the forward button to navigate forwards
    this.forwardButton.addEventListener("click", () => this.webview.goForward());
});
