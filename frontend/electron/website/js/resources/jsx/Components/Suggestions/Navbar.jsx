import React from "react";

export default class Navbar extends React.Component {
	render() {
		return (
			<nav className="blue" role="navigation">
		        <div className="nav-wrapper container">
		            <a id="logo-container" href="#" className="brand-logo">
						<img src="images/inlinewhite.png" width="16%" style={{ padding: "12px" }} />
					</a>
		            <ul className="right hide-on-med-and-down">
		                <li><a href="#">Home</a></li>
		                <li><a href="#">Suggestions</a></li>
		            </ul>
		            <a href="#" data-activates="nav-mobile" className="button-collapse"><i className="material-icons">menu</i></a>
		        </div>
		    </nav>
		);
	}
}
