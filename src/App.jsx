import "./App.css";
import { useContext } from "react";
import Root from "./pages/Root.jsx";
import { context } from "./lib/Context.jsx";

function App() {
	const { page } = useContext(context);
	function getPage() {
		if (page == 0) return <Root />;
		return <Root />;
	}
	return <div>{getPage()}</div>;
}

export default App;
