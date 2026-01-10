export async function getCurrentFocusTab() {
    const window = await chrome.windows.getLastFocused({ populate: true });
    const activeTab = window.tabs?.find((tab) => tab.active);
    return activeTab;
}