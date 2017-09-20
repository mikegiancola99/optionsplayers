// JavaScript source code
var gMessageList = [];
var gMessages2WriteQueue = [];
var gLogFilename = "noname.txt";
var gFoundDupe = false;
var gStartupIntervalHandle = null;

function CheckIfInList(cur_node)
{
    var found = false;
    for (var i = 0; !found && i < gMessageList.length; i++)
    {
        if (cur_node.hash == gMessageList[i].hash)
        {
            found = true;
            gFoundDupe = true;
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

function WriteMsgToFileHandle(msgFile, message2write)
{
    if (null == msgFile)
    { return; }

    Windows.Storage.FileIO.appendTextAsync(msgFile, message2write).then(
    function ()
    {
    },
    function (error)
    {
        WriteToFile(message2write);
    })
}

function WriteToFile(message2write)
{
    localFolder = Windows.Storage.ApplicationData.current.localFolder;
    localFolder.tryGetItemAsync(gLogFilename)
    .then(function (msgFile) 
    { 
        if (null != msgFile)
        {
            WriteMsgToFileHandle(msgFile, message2write);
            msgFile = null;
        }
        else
        {
            localFolder.createFileAsync(gLogFilename).then(
            function (msgFile)
            {
                WriteMsgToFileHandle(msgFile, message2write);
                msgFile = null;
            });
        }
    }, function (error)
    {
        localFolder.createFileAsync(gLogFilename).then(
        function (msgFile) {
            if (null != msgFile)
                WriteMsgToFileHandle(msgFile, message2write);
            msgFile = null;
        });
    });
}

function DrainQueue()
{
    if (gMessages2WriteQueue.length > 0) {
        var cur_msg = gMessages2WriteQueue.shift();
        WriteToFile(cur_msg);
    }
}

function ChatMessageNotifyHandler(name)
{
    var cur_date = new Date();
    var real_month = cur_date.getMonth() + 1;
    gLogFilename = real_month + "_" + cur_date.getDate() + "_" + cur_date.getFullYear() + ".txt";
    var localFolder = Windows.Storage.ApplicationData.current.localFolder
    var file_loc_obj = document.getElementById("file_loc");
    file_loc_obj.innerText = localFolder.path + "\\" + gLogFilename;

    var msgObject = new Object();
    msgObject.hash = HashString(name.value);

    if (!CheckIfInList(msgObject))
    {
        if (gMessageList.length > 100)
            gMessageList.shift();

        gMessageList.push(msgObject);
        var msg2write = real_month + "/" + cur_date.getDate() + "/" + cur_date.getFullYear();
        msg2write += " " + cur_date.getHours() + ":" + cur_date.getMinutes() + ":" + cur_date.getSeconds();
        msg2write += " " + name.value + "\n";

        gMessages2WriteQueue.push(msg2write);
        console.log("queueing: " + name.value);
    }
}

function ErrorHandler(error)
{
    console.log(error);
}

function HandleStartSaveClick()
{
    clearInterval(gStartupIntervalHandle);
    var javascriptcode = ""; 
    javascriptcode += "function GetMsgData()\n";
    javascriptcode += "{ \n";
    javascriptcode += "   try \n";
    javascriptcode += "   {\n";
    javascriptcode += "       var chatbox_obj = document.getElementById(\"chatbox\");\n";
    javascriptcode += "       if (null != chatbox_obj)\n";
    javascriptcode += "       {\n";
    javascriptcode += "           var items = chatbox_obj.getElementsByTagName(\"LI\");\n";
    javascriptcode += "           for (var i = 0; i < items.length; ++i) \n";
    javascriptcode += "           {\n";
    javascriptcode += "               var cur_item = items[i];\n";
    javascriptcode += "                for (var j=0; j < cur_item.children.length; j++)\n";
    javascriptcode += "                {\n";
    javascriptcode += "                    if (cur_item.children[j].className == \"chat-body clearfix\")\n";
    javascriptcode += "                    {\n";
    javascriptcode += "                        var header_obj = cur_item.children[j].children[0];\n";
    javascriptcode += "                        var strong_obj = header_obj.children[0];\n";
    javascriptcode += "                        var span_obj = strong_obj.children[0];\n";
    javascriptcode += "                        var payload_obj = cur_item.children[j].children[1];\n";
    javascriptcode += "                        var paragraph_obj = payload_obj.children[0];\n";
    javascriptcode += "                        var full_msg = span_obj.innerText + \": \" + paragraph_obj.innerText;\n";
    javascriptcode += "                        window.external.notify(full_msg);\n";
    javascriptcode += "                    }\n"; // if
    javascriptcode += "                }\n"; // for
    javascriptcode += "           }\n"; // for
    javascriptcode += "        }\n"; // if
    javascriptcode += "    } \n";
    javascriptcode += "    catch(err) {window.external.notify(err);}\n";
    javascriptcode += "} \n"; // function
    javascriptcode += "GetMsgData();\n"
    javascriptcode += "setInterval(GetMsgData, 10000);\n";

    var injectedJavascript = WebView.invokeScriptAsync('eval', javascriptcode);
    injectedJavascript.error = ErrorHandler;
    injectedJavascript.start();
    this.backButton.disabled = true;
    setInterval(DrainQueue, 1000);
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
        this.backButton.disabled = !this.webview.canGoBack;
        this.forwardButton.disabled = !this.webview.canGoForward;
    };

    // Listen for the back button to navigate backwards
    //this.backButton.addEventListener("click", () => HandleStartSaveClick());
    this.backButton.addEventListener("click", () => this.webview.goBack());

    // Listen for the forward button to navigate forwards
    this.forwardButton.addEventListener("click", () => this.webview.goForward());
    gStartupIntervalHandle = setInterval(HandleStartSaveClick, 30000);
});
