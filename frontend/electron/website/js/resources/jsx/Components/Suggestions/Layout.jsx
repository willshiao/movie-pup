import React from "react";

import Body from "./Body.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default class Layout extends React.Component {
	render() {
		return (
			<div>
				<Navbar />
				<Body />
				<Footer />
			</div>
		);
	}
}
