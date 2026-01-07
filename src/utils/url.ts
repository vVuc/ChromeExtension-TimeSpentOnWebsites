import { parse } from "psl";
/**
 * Pega o domínio principal de uma URL fornecida.
 * Exemplo: Para "https://sub.example.co.uk/path", retorna "example.co.uk".
 * 
 * https://www.youtube.com/watch?v=XSXEaikz0Bc, retornará "youtube.com"
 */
export function getMainDomain(url: string): string | null {
    try {
        const hostname = new URL(url).hostname;
        const parsed = parse(hostname);

        if ("domain" in parsed) {
            return parsed.domain;
        }
        console.error("Erro ao analisar o domínio:", parsed.error.message);
        return null;
    } catch (error) {
        console.error("Erro ao analisar a URL:", error);
        return null;
    }
}
