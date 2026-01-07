import { DEBUG_MODE } from "./config.js";
import type { TimeSpentData } from "./types.js";

let dataName = "timeSpentData";

if (DEBUG_MODE) {
    console.log("Debug mode is ON");
    dataName = "DebugTimeSpentData";
}

chrome.storage.local.set({ [dataName]: [] });

/**
 * Recupera os dados temporarios armazenados na sessão do Chrome
 * 
 * {LastActiveUrl}: URL do ultimo site ativo
 * 
 * {LastActiveSiteTabId}: ID da aba do ultimo site ativo
 * 
 * {TimeSpentOnWebsites}: Timestamp de quando o usuario mudou para outro site
 * 
 */
export async function getStoredTempData() {
    let {
        tempData
    } = await chrome.storage.session.get<{ tempData: { lastActiveUrl: string, lastActiveSiteTabId: number, timeSpentOnWebsites: number } }>("tempData");

    if (!tempData) {
        tempData = {
            lastActiveUrl: "",
            lastActiveSiteTabId: 0,
            timeSpentOnWebsites: new Date().getTime()
        };
    }
    const { lastActiveUrl, lastActiveSiteTabId, timeSpentOnWebsites } = tempData;
    return { lastActiveUrl, lastActiveSiteTabId, timeSpentOnWebsites };
}

// Validação dupla
// no livro programador pragmático tem um trecho que fala sobre validação dupla 
// Isto não é uma boa prática, caso um problema isto sera apenas um sintoma de um problema maior e um possivel segundo ponto de refatoração
export async function setStoredTempData(tempData: { lastActiveUrl: string, lastActiveSiteTabId: number, timeSpentOnWebsites: number }) {
    const { lastActiveSiteTabId, lastActiveUrl, timeSpentOnWebsites } = tempData;
    if (!tempData) return;

    if (!lastActiveUrl) return console.error("lastActiveUrl is undefined");
    if (!lastActiveSiteTabId) return console.error("lastActiveSiteTabId is undefined");
    if (!timeSpentOnWebsites) return console.error("timeSpentOnWebsites is undefined");

    await chrome.storage.session.set({ tempData });
}

export async function addNewSiteTimeSpent(arrObj: TimeSpentData[], params: TimeSpentData, lastActiveUrl: string, timeSpentOnWebsites: number) {
    //Fazer um filter para não adicionar sites repetidos
    //Neste trecho eu verifico se o site já existe no array
    // const existingSite = arrObj.find(obj => tab.id && obj.tabId === tab.id);
    const lastActiveSite = arrObj.find(obj => obj.site.url === lastActiveUrl);

    if (lastActiveSite) {
        console.log("Site já existe no array, não adicionando novamente.");
        lastActiveSite.timeSpent += (new Date().getTime() - timeSpentOnWebsites);
    } else {
        arrObj.push(params);

    }

    chrome.storage.local.set({ [dataName]: arrObj });
}

export async function getStoredTimeSpentData(): Promise<TimeSpentData[]> {
    const data = await chrome.storage.local.get<{ [dataName]: TimeSpentData[] }>(dataName);
    if (!data[dataName]) {
        await chrome.storage.local.set({ [dataName]: [] });
        return [];
    }
    console.log(data);

    return data[dataName] || [];
}