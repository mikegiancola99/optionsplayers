// JavaScript source code
var gMessageList = [];

function CheckIfInList(cur_node)
{
    var found = false;
    for (var i = 0; !found && i < gMessageList.length; i++)
    {
        if (cur_node.hash == gMessageList[i].hash)
        {
            found = true;
        }
    }
    return found;
}

function HashString(str2Hash)
{
    var buffUtf8Msg = Windows.Security.Cryptography.CryptographicBuffer.convertStringToBinary(str2Hash, Windows.Security.Cryptography.BinaryStringEncoding.Utf8);
    var objAlgProv = Windows.Security.Cryptography.Core.HashAlgorithmProvider.openAlgorithm("MD5");
    var buffHash = objAlgProv.hashData(buffUtf8Msg);
    var strHashBase64 = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffHash);
    return strHashBase64;
}

function WriteToFile(message2write)
{
    localFolder = Windows.Storage.ApplicationData.current.localFolder;
    localFolder.tryGetItemAsync("test4.txt")
    .then(function (msgFile) 
    { 
        if (null != msgFile) 
        { 
            Windows.Storage.FileIO.appendTextAsync(msgFile, message2write);
        }
    }, function (error)
    {
        localFolder.createFileAsync("test4.txt").then(
        function (msgFile) {
            if (null != msgFile)
                Windows.Storage.FileIO.appendTextAsync(msgFile, message2write);
        });
    });
}

function ChatMessageNotifyHandler(name)
{
    var msgObject = new Object();
    msgObject.msg = name.value;
    msgObject.hash = HashString(name.value);
    if (!CheckIfInList(msgObject))
    {
        gMessageList[gMessageList.length] = msgObject;
        WriteToFile(name.value + "\n");
    }
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
    javascriptcode += "GetMsgData();setInterval(GetMsgData, 10000);"

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

    //this.time_trigger = Windows.ApplicationModel.Background.TimeTrigger(Number(1), Boolean(false))
    //Windows.ApplicationModel.Background.TimeTrigger(Number(1), Boolean(false));
    //var builder = new Windows.ApplicationModel.Background.BackgroundTaskBuilder();
    //builder.Name = "chatUpdateTimer";
    //builder.TaskEntryPoint = HandleStartSaveClick;
    //builder.SetTrigger(time_trigger);
    //var task = builder.Register();

    // Listen for the forward button to navigate forwards
    this.forwardButton.addEventListener("click", () => this.webview.goForward());
});
