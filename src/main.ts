//Porque os imports estão em js sendo que os arquivos são ts?
import { addNewSiteTimeSpent, getStoredTimeSpentData, getStoredTempData, setStoredTempData } from "./storage.js";
import { getMainDomain } from "./utils/url.js";

import type { TimeSpentData } from "./types.js";
import { getCurrentFocusTab } from "./tabs.js";
//TODO: Adicionar verificação para quando a extensão For iniciada pois preciso armazenar o tempo gasto no site anterior mesmo que a troca de abas não tenha ocorrido
//TODO: Não depender exclusivamente do onActivated, pois o usuario pode fechar o navegador ou a aba sem ativar outra aba necessariamente
//TODO: Não necessariamente a troca de aba significa que o usuario mudou de site, ele pode ter trocado para uma aba que já estava aberta no mesmo site (Eu esqueço disso as vezes o__ô)

//TODO: Verificar comportamente dos logs sempre que o lister é ativo os logs são duplicados
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
    // Criar o objeto de dados do site Atual 
    const currentWebsiteData: TimeSpentData = { site: { url: tabUrl, icon: icon }, timeSpent: 0, tabId: activeInfo.tabId };
    // Adicionar o novo site ao array de sites ou atualiza o tempo gasto caso ja exista
    // TODO: Está função tem duas responsabilidades, adicionar tempo ao site anterior e adicionar um novo site. Refatorar.
    await addNewSiteTimeSpent(SitesWhereSpentTime, currentWebsiteData, lastActiveUrl, timeSpentOnWebsites);
    // Armazenar os dados temporarios atualizados
    await setStoredTempData(
        tabUrl,
        activeInfo.tabId,
        new Date().getTime()
    );
});
let debugCount = 0;
//TODO: Qual sera melhor para a experiência do usuario? onCommitted ou onDOMContentLoaded?
// Listener para quando a navegação ocorrer em uma aba (quando o usuario muda de site na mesma aba)
chrome.webNavigation.onDOMContentLoaded.addListener(async (details) => {
    if (details.frameId !== 0) return;
    let tab = await getCurrentFocusTab();
    if (!tab) return;
    if (tab.id !== details.tabId) return;
    // Recuperar dados temporarios armazenados 
    const SitesWhereSpentTime: TimeSpentData[] = await getStoredTimeSpentData();

    const { lastActiveUrl, lastActiveSiteTabId, timeSpentOnWebsites } = await getStoredTempData();
    // Extrair o dominio principal da URL da aba
    if (!tab.url || !tab.favIconUrl) {
        console.log("A pagina não carregou os dados basicos");
        return
    }


    const tabUrl = getMainDomain(tab.url) ?? "Url Indefinida";
    // Extrair o ícone da aba
    const icon = tab.favIconUrl;

    const currentWebsiteData: TimeSpentData = { site: { url: tabUrl, icon: icon }, timeSpent: 0, tabId: details.tabId };

    await addNewSiteTimeSpent(SitesWhereSpentTime, currentWebsiteData, lastActiveUrl, timeSpentOnWebsites);
    // Armazenar os dados temporarios atualizados
    await setStoredTempData(
        tabUrl,
        details.tabId,
        new Date().getTime()
    );
    debugCount++;
    console.log(`onDOMContentLoaded chamado ${debugCount} vezes`);
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