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

/**
 * 
 * Armazena os dados temporarios na sessão do Chrome
 * 
 * @param lastActiveUrl URL do ultimo site ativo
 * @param lastActiveSiteTabId ID da aba do ultimo site ativo
 * @param timeSpentOnWebsites timestamp que guarda o momento no tempo em unix em que o usuario mudou de site pela ultima vez
 */
export async function setStoredTempData(lastActiveUrl: string, lastActiveSiteTabId: number, timeSpentOnWebsites: number) {
    if (!lastActiveUrl) return console.error("lastActiveUrl is undefined");
    if (!lastActiveSiteTabId) return console.error("lastActiveSiteTabId is undefined");
    if (!timeSpentOnWebsites) return console.error("timeSpentOnWebsites is undefined");

    await chrome.storage.session.set({ tempData: { lastActiveUrl, lastActiveSiteTabId, timeSpentOnWebsites } });
}

// Validação dupla
// no livro programador pragmático tem um trecho que fala sobre validação dupla 
// Isto não é uma boa prática, caso um problema isto sera apenas um sintoma de um problema maior e um possivel segundo ponto de refatoração
/**
 * Adiciona um novo site ao array de sites com tempo gasto
 * @param arrObj Array de objetos TimeSpentData
 * @param params Novo site (objeto TimeSpentData) a ser adicionado ou atualizado caso ja exista
 * @param lastActiveUrl URL do ultimo site ativo
 * @param timeSpentOnWebsites timestamp que guarda o momento no tempo em unix em que o usuario mudou de site pela ultima vez
 */
export async function addNewSiteTimeSpent(arrObj: TimeSpentData[], params: TimeSpentData, lastActiveUrl: string, timeSpentOnWebsites: number) {
    //Fazer um filter para não adicionar sites repetidos
    //Neste trecho eu verifico se o site já existe no array
    // const existingSite = arrObj.find(obj => tab.id && obj.tabId === tab.id);
    const lastActiveSite = arrObj.find(obj => obj.site.url === lastActiveUrl);

    if (lastActiveSite) {
        console.log("Site já existe no array, não adicionando novamente.");
        lastActiveSite.timeSpent += (new Date().getTime() - timeSpentOnWebsites);
    } else {
        console.log("Site não existe no array, adicionando novo site.");
        params.timeSpent += (new Date().getTime() - timeSpentOnWebsites);
        arrObj.push(params);

    }
    console.log("arrObj após adicionar/atualizar site:", arrObj);

    chrome.storage.local.set({ [dataName]: arrObj });
}
/** 
 * Recupera os dados de tempo gasto armazenados localmente 
 * @return Promise<TimeSpentData[]> Array de objetos TimeSpentData
*/
export async function getStoredTimeSpentData(): Promise<TimeSpentData[]> {
    const data = await chrome.storage.local.get<{ [dataName]: TimeSpentData[] }>(dataName);
    if (!data[dataName]) {
        await chrome.storage.local.set({ [dataName]: [] });
        return [];
    }
    console.log(data);

    return data[dataName] || [];
}