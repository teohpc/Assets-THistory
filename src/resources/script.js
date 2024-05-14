/*
*/

let contextService;
let APIService;
const filename = 'history.json';
let jsonObj = [];

async function init() {
    try {

        console.log('init');

        contextService = await AssetsClientSdk.AssetsPluginContext.get();
        APIService = await AssetsClientSdk.AssetsApiClient.fromPluginContext(contextService);

        const context = contextService.context;
        //console.log(context);

        document.getElementById("info").style.display = "none";
        document.getElementById("main").style.display = "block";

        let assets = null;
        if (context.activeTab.assetSelection.length === 0) {
            // Triggered from Folder Context Menu
            let result = await APIService.search({
                q: 'ancestorPaths:"' + context.activeTab.folderSelection[0].assetPath
                    + '"',
                metadataToReturn: '',
                num: 10000
            });
            assets = result.hits;
        } else {
            assets = context.activeTab.assetSelection;
        };
        //console.log(assets);

        // Add events
        document.getElementById("getJSON").addEventListener("click", getJSON);

        document.getElementById("filename").addEventListener("change", () => {
            filename = document.getElementById("filename").value + '.json';
        });

        document.getElementById("filename").addEventListener("click", () => {
            document.getElementById("filename").placeholder = "";
        });

        const service = '/services/asset/history';

        for (let idx = 0; idx < assets.length; idx++) {
            let request = await contextService.fetch(service, {
                method: 'POST',
                body: {
                    id: assets[idx].id
                }
            });
            jsonObj.push(request.hits);
        };
        //console.log(jsonObj);

        if (Object.keys(jsonObj).length === 0) {
            document.getElementById('error').innerHTML = "Nothing to download";
            document.getElementById("getJSON").disabled = true;
            document.getElementById("getJSON").style.backgroundColor = "gray";
        } else {
            document.getElementById('message').innerHTML = "Number of assets: " + jsonObj.length;
        };
    } catch (error) {
        console.log(error);
        document.getElementById("getJSON").disabled = true;
        document.getElementById("getJSON").style.backgroundColor = "gray";
        document.getElementById('error').innerHTML = error;
    }
}


async function getJSON() {
    let blob = new Blob([JSON.stringify(jsonObj, null, 2)], { type: "application/json;charset=utf-8" });

    let url = window.URL || window.webkitURL;
    let a = document.createElement("a");
    //console.log(filename);

    a.download = filename;
    a.href = url.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    url.revokeObjectURL(url);

    contextService.close();
}