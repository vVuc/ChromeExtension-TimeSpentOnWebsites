//Porque os imports estão em js sendo que os arquivos são ts?
import { addNewSiteTimeSpent, getStoredTimeSpentData, getStoredTempData, setStoredTempData } from "./storage.js";
import { getMainDomain } from "./utils/url.js";

import type { TimeSpentData } from "./types.js";

// Listener para quando a aba ativa mudar
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    // Recuperar os sites com tempo gasto armazenados
    const SitesWhereSpentTime: TimeSpentData[] = await getStoredTimeSpentData();
    // Recuperar os dados temporarios armazenados
    const { lastActiveUrl, lastActiveSiteTabId, timeSpentOnWebsites } = await getStoredTempData();
    // Recuperar os dados da aba ativa
    let tab = await chrome.tabs.get(activeInfo.tabId);
    // Se a url ou o favIconUrl estiverem undefined, não prosseguir. Possivelmente a aba ainda não carregou completamente.
    //TODO: Caso a aba não tenha carregado, eu preciso salvar o tabId e quando o onUpdated for chamado eu recupero estes dados
    if (!tab.url || !tab.favIconUrl) {
        console.log("A pagina não carregou os dados basicos");
        return
    }
    // Extrair o dominio principal da URL da aba
    const tabUrl = getMainDomain(tab.url) ?? "Url Indefinida";
    // Extrair o ícone da aba
    const icon = tab.favIconUrl;
    // Criar o objeto de dados do site
    const dataSite:TimeSpentData = { site: { url: tabUrl, icon: icon }, timeSpent: 0, tabId: activeInfo.tabId };
    // TODO: Está função tem duas responsabilidades, adicionar tempo ao site anterior e adicionar um novo site. Refatorar.
    await addNewSiteTimeSpent(SitesWhereSpentTime, dataSite, lastActiveUrl, timeSpentOnWebsites);

    setStoredTempData({
        lastActiveUrl: tabUrl,
        lastActiveSiteTabId: activeInfo.tabId,
        timeSpentOnWebsites: new Date().getTime()
    });

});

// chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
//     console.log(`changeInfo`, changeInfo);
//     console.log(`tab`, tab);
//     console.log("tabId", tabId);

// });

// chrome.tabs.onActivated.addListener(async (activeInfo) => {
//     let tab = await chrome.tabs.get(activeInfo.tabId);
//     console.log("Activated tab:", tab);
// });