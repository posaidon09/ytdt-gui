import { createContext, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";

export const context = createContext();
export const ContextProvider = ({ children }) => {
	const [page, setPage] = useState(0);
    const [lang, setLang] = useLocalStorage("user", "English");
	return (
		<context.Provider value={{ page, setPage, lang, setLang }}>{children}</context.Provider>
	);
};
